import { useCallback, useEffect, useRef, useState } from 'react';
import { speechApi } from '../api/speechApi';

/**
 * Record a short question and transcribe it on the server.
 *
 * This is deliberately separate from `useSpeechRecording`: speaking screens still use the
 * browser's Web Speech API for live word-by-word feedback, while the chat composer needs a
 * transcript that works on Safari/Firefox and keeps IELTS terms. Mixing the two paths in one
 * hook made both harder to reason about.
 */

function getSupportedMimeType() {
    const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mp4;codecs=mp4a.40.2',
    ];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
}

export function useServerSpeechRecording({ onError } = {}) {
    const [recording, setRecording] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [timer, setTimer] = useState(0);
    const [sttSupported] = useState(
        () =>
            typeof navigator !== 'undefined' &&
            !!navigator.mediaDevices?.getUserMedia &&
            typeof MediaRecorder !== 'undefined'
    );

    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const startedAtRef = useRef(0);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const releaseStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startRecording = useCallback(async () => {
        if (
            !navigator.mediaDevices?.getUserMedia ||
            typeof MediaRecorder === 'undefined'
        ) {
            onError?.('STT_UNSUPPORTED');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            streamRef.current = stream;
            chunksRef.current = [];

            const mimeType = getSupportedMimeType();
            const recorder = new MediaRecorder(
                stream,
                mimeType ? { mimeType } : {}
            );
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            };
            recorder.start(1000);
            mediaRecorderRef.current = recorder;
            startedAtRef.current = Date.now();

            setTranscript('');
            setTranscribing(false);
            setRecording(true);
            setTimer(0);
            clearTimer();
            timerRef.current = setInterval(() => setTimer((value) => value + 1), 1000);
        } catch (error) {
            releaseStream();
            if (
                error.name === 'NotAllowedError' ||
                error.name === 'PermissionDeniedError'
            ) {
                onError?.('MIC_PERMISSION_DENIED');
            } else if (error.name === 'NotFoundError') {
                onError?.('MIC_NOT_FOUND');
            } else {
                onError?.('MIC_UNAVAILABLE');
            }
        }
    }, [clearTimer, onError, releaseStream]);

    const stopRecording = useCallback(async () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
            setRecording(false);
            clearTimer();
            return '';
        }

        const durationMs = Math.max(0, Date.now() - startedAtRef.current);
        const mimeType = recorder.mimeType || getSupportedMimeType() || 'audio/webm';

        const blob = await new Promise((resolve) => {
            recorder.onstop = () => {
                resolve(
                    chunksRef.current.length
                        ? new Blob(chunksRef.current, { type: mimeType })
                        : null
                );
            };
            recorder.stop();
        });

        mediaRecorderRef.current = null;
        releaseStream();
        clearTimer();
        setRecording(false);

        if (!blob || blob.size < 512 || durationMs < 500) {
            onError?.('STT_TOO_SHORT');
            return '';
        }

        setTranscribing(true);
        try {
            const data = await speechApi.transcribe(blob, {
                language: 'auto',
                durationMs,
            });
            const text = String(data?.text || '').trim();
            setTranscript(text);
            return text;
        } catch (error) {
            if (error?.status === 429) {
                onError?.('STT_QUOTA_EXCEEDED');
            } else if (error?.status === 422) {
                onError?.('STT_NO_SPEECH');
            } else {
                onError?.('STT_FAILED');
            }
            return '';
        } finally {
            setTranscribing(false);
        }
    }, [clearTimer, onError, releaseStream]);

    const cancelRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            try {
                recorder.stop();
            } catch {
                /* already stopped */
            }
        }
        mediaRecorderRef.current = null;
        releaseStream();
        clearTimer();
        chunksRef.current = [];
        setRecording(false);
        setTranscribing(false);
        setTranscript('');
        setTimer(0);
    }, [clearTimer, releaseStream]);

    useEffect(
        () => () => {
            const recorder = mediaRecorderRef.current;
            if (recorder && recorder.state !== 'inactive') {
                try {
                    recorder.stop();
                } catch {
                    /* already stopped */
                }
            }
            releaseStream();
            clearTimer();
        },
        [clearTimer, releaseStream]
    );

    return {
        recording,
        transcribing,
        transcript,
        setTranscript,
        timer,
        sttSupported,
        startRecording,
        stopRecording,
        cancelRecording,
    };
}
