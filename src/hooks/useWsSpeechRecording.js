import { useState, useRef, useEffect, useCallback } from "react";
import { ensureValidAccessToken } from "../api/axiosClient";
import { resolveWsUrl } from "../lib/wsUrl";

function getSupportedMimeType() {
    const types = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
    ];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return "";
}

function float32ToInt16(buffer) {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        buf[i] = Math.min(1, buffer[i]) * 0x7fff;
    }
    return buf.buffer;
}

export function useWsSpeechRecording({ onError, onWarning } = {}) {
    const [recording, setRecording] = useState(false);
    const [transcript, setTranscriptState] = useState("");
    const [timer, setTimer] = useState(0);
    const [sttSupported, setSttSupported] = useState(true);
    const [speechSummary, setSpeechSummaryState] = useState(null);

    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const sinkNodeRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const finalTranscriptRef = useRef("");
    const pcmBufferRef = useRef([]);
    const transcriptRef = useRef("");
    const speechSummaryRef = useRef(null);
    const stopPromiseResolveRef = useRef(null);
    const stopPromiseTimerRef = useRef(null);
    const pendingWsCloseRef = useRef(false);
    const WS_CHUNK_SAMPLES = 4096;

    useEffect(() => {
        const supported = !!navigator.mediaDevices?.getUserMedia;
        setSttSupported(supported);

        return () => {
            if (stopPromiseTimerRef.current) {
                clearTimeout(stopPromiseTimerRef.current);
            }
        };
    }, []);

    const resolvePendingStop = useCallback((summary = null) => {
        if (stopPromiseTimerRef.current) {
            clearTimeout(stopPromiseTimerRef.current);
            stopPromiseTimerRef.current = null;
        }
        if (stopPromiseResolveRef.current) {
            stopPromiseResolveRef.current(summary);
            stopPromiseResolveRef.current = null;
        }
    }, []);

    const closeWs = useCallback(() => {
        const ws = wsRef.current;
        if (!ws) return;

        if (ws.readyState === WebSocket.CONNECTING) {
            pendingWsCloseRef.current = true;
            return;
        }

        try {
            ws.close();
        } catch (error) {
            console.warn("Failed to close STT websocket cleanly", error);
        } finally {
            if (wsRef.current === ws) {
                wsRef.current = null;
            }
            pendingWsCloseRef.current = false;
        }
    }, []);

    const updateTranscript = useCallback((value) => {
        transcriptRef.current = value;
        setTranscriptState(value);
    }, []);

    const updateSpeechSummary = useCallback((value) => {
        speechSummaryRef.current = value;
        setSpeechSummaryState(value);
    }, []);

    const setTranscript = useCallback(
        (value) => {
            updateTranscript(value);
        },
        [updateTranscript],
    );

    const startRecording = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            onError?.("Trình duyệt của bạn không hỗ trợ ghi âm.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            streamRef.current = stream;
            chunksRef.current = [];
            finalTranscriptRef.current = "";
            pcmBufferRef.current = [];
            pendingWsCloseRef.current = false;
            updateSpeechSummary(null);
            updateTranscript("");
            resolvePendingStop(null);

            const mimeType = getSupportedMimeType();
            const mediaRecorder = new MediaRecorder(
                stream,
                mimeType ? { mimeType } : {},
            );
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            mediaRecorder.start(1000);
            mediaRecorderRef.current = mediaRecorder;

            const token = await ensureValidAccessToken();
            if (!token) {
                throw new Error("Missing access token");
            }
            /* DEVIATION FROM v1, deliberate and worth porting back: v1 built this URL by
               hand — `${httpBase.replace('/api','').replace(/^http/,'ws')}/ws/speaking/stt`
               — which breaks BOTH ways. With the documented `VITE_API_URL=/api` the base
               becomes empty and `new WebSocket('/ws/speaking/stt?token=…')` throws
               `SyntaxError: The URL ... is not valid`, because a relative path is not a
               URL. With an absolute base it produces `ws://` on an https page, which the
               browser blocks as mixed content. `resolveWsUrl` derives the scheme and host
               from `window.location` for the relative case, so neither happens. */
            const wsUrl = resolveWsUrl(`/ws/speaking/stt?token=${encodeURIComponent(token)}`);
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onmessage = (event) => {
                if (ws !== wsRef.current) return;

                try {
                    const data = JSON.parse(event.data);
                    if (import.meta.env.DEV && data.type === "ready") {
                        console.log("[STT] ready");
                    }
                    if (data.type === "transcript") {
                        if (data.final) {
                            finalTranscriptRef.current += data.text + " ";
                            updateTranscript(finalTranscriptRef.current);
                        } else {
                            updateTranscript(
                                finalTranscriptRef.current + data.text,
                            );
                        }
                    } else if (data.type === "speech_summary") {
                        updateSpeechSummary(data);
                        resolvePendingStop(data);
                    } else if (data.type === "error") {
                        console.error("STT error:", data.message);
                        onWarning?.(`Loi nhan dien giong noi: ${data.message}`);
                        resolvePendingStop(null);
                    }
                } catch (e) {
                    console.error("Failed to parse STT WS message", e);
                }
            };

            ws.onerror = () => {
                if (ws !== wsRef.current) return;
                onWarning?.("Loi ket noi nhan dien giong noi.");
                resolvePendingStop(null);
            };

            ws.onopen = async () => {
                if (ws !== wsRef.current || pendingWsCloseRef.current) {
                    try {
                        ws.close();
                    } catch (error) {
                        console.warn(
                            "Failed to close stale STT websocket",
                            error,
                        );
                    } finally {
                        if (wsRef.current === ws) {
                            wsRef.current = null;
                        }
                        pendingWsCloseRef.current = false;
                    }
                    return;
                }

                const AudioContextClass =
                    window.AudioContext || window.webkitAudioContext;
                const audioContext = new AudioContextClass({
                    sampleRate: 16000,
                });
                audioContextRef.current = audioContext;
                await audioContext.resume();

                const workletCode = `
                    class PcmCaptureProcessor extends AudioWorkletProcessor {
                        process(inputs) {
                            const ch = inputs[0]?.[0];
                            if (ch) this.port.postMessage(ch.buffer, [ch.buffer]);
                            return true;
                        }
                    }
                    registerProcessor('pcm-capture-processor', PcmCaptureProcessor);
                `;
                const blobUrl = URL.createObjectURL(
                    new Blob([workletCode], { type: "application/javascript" }),
                );

                try {
                    await audioContext.audioWorklet.addModule(blobUrl);
                } finally {
                    URL.revokeObjectURL(blobUrl);
                }

                const workletNode = new AudioWorkletNode(
                    audioContext,
                    "pcm-capture-processor",
                );
                processorRef.current = workletNode;
                let firstChunkLogged = false;

                workletNode.port.onmessage = (e) => {
                    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

                    const incoming = new Float32Array(e.data);
                    if (!firstChunkLogged && import.meta.env.DEV) {
                        firstChunkLogged = true;
                        console.log("[STT] first PCM chunk captured", {
                            samples: incoming.length,
                        });
                    }
                    pcmBufferRef.current.push(...incoming);

                    if (pcmBufferRef.current.length >= WS_CHUNK_SAMPLES) {
                        const chunk = new Float32Array(
                            pcmBufferRef.current.splice(0, WS_CHUNK_SAMPLES),
                        );
                        wsRef.current.send(float32ToInt16(chunk));
                    }
                };

                const source = audioContext.createMediaStreamSource(stream);
                sourceNodeRef.current = source;

                // Keep the worklet in an active rendering graph without audible output.
                const silentGain = audioContext.createGain();
                silentGain.gain.value = 0;
                sinkNodeRef.current = silentGain;

                source.connect(workletNode);
                workletNode.connect(silentGain);
                silentGain.connect(audioContext.destination);
            };

            setTimer(0);
            timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
            setRecording(true);
        } catch (err) {
            console.error("Recording error:", err);
            if (
                err.name === "NotAllowedError" ||
                err.name === "PermissionDeniedError"
            ) {
                onError?.("Chưa cấp quyền truy cập microphone.");
            } else if (err.name === "NotFoundError") {
                onError?.(
                    "Không tìm thấy microphone. Vui lòng kết nối microphone và thử lại.",
                );
            } else {
                onError?.(
                    "Không thể truy cập microphone: " +
                        (err.message || err.name),
                );
            }
        }
    }, [
        onError,
        onWarning,
        resolvePendingStop,
        updateSpeechSummary,
        updateTranscript,
    ]);

    const teardownCapture = useCallback(() => {
        if (
            pcmBufferRef.current.length > 0 &&
            wsRef.current?.readyState === WebSocket.OPEN
        ) {
            const remaining = new Float32Array(pcmBufferRef.current);
            wsRef.current.send(float32ToInt16(remaining));
        }
        pcmBufferRef.current = [];

        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }

        if (sinkNodeRef.current) {
            sinkNodeRef.current.disconnect();
            sinkNodeRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setRecording(false);
    }, []);

    const stopRecording = useCallback(
        async ({ awaitSummary = false, timeoutMs = 1500 } = {}) => {
            teardownCapture();

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                try {
                    wsRef.current.send(JSON.stringify({ type: "finish" }));
                } catch (error) {
                    console.warn(
                        "Failed to send finish event to STT socket",
                        error,
                    );
                    closeWs();
                    resolvePendingStop(speechSummaryRef.current || null);
                }
            }

            if (!awaitSummary) {
                window.setTimeout(closeWs, 250);
                return null;
            }

            return await new Promise((resolve) => {
                stopPromiseResolveRef.current = (summary) => {
                    closeWs();
                    resolve(summary);
                };

                stopPromiseTimerRef.current = window.setTimeout(() => {
                    resolvePendingStop(speechSummaryRef.current || null);
                }, timeoutMs);
            });
        },
        [closeWs, resolvePendingStop, teardownCapture],
    );

    const cancelRecording = useCallback(() => {
        teardownCapture();
        closeWs();
        resolvePendingStop(null);
        chunksRef.current = [];
        finalTranscriptRef.current = "";
        updateTranscript("");
        setTimer(0);
        updateSpeechSummary(null);
    }, [
        closeWs,
        resolvePendingStop,
        teardownCapture,
        updateSpeechSummary,
        updateTranscript,
    ]);

    return {
        recording,
        transcript,
        setTranscript,
        transcriptRef,
        timer,
        sttSupported,
        speechSummary,
        speechSummaryRef,
        audioChunksRef: chunksRef,
        startRecording,
        stopRecording,
        cancelRecording,
    };
}
