import { useState, useRef, useEffect } from 'react';

/** Detect best supported audio mimeType across browsers */
function getSupportedMimeType() {
    const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
    ];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
}

/**
 * useSpeechRecording
 *
 * Handles microphone recording + Web Speech API transcription.
 *
 * @param {object} options
 * @param {function} options.onError  - (message: string) called once per unique error
 * @param {function} options.onWarning - (message: string) called for non-fatal warnings
 * @param {string}  [options.lang='en-US'] - BCP-47 language tag for STT
 *
 * @returns {{
 *   recording: boolean,
 *   transcript: string,
 *   setTranscript: function,
 *   timer: number,
 *   sttSupported: boolean,
 *   audioChunksRef: React.MutableRefObject,
 *   startRecording: function,
 *   stopRecording: function,
 *   cancelRecording: function,
 * }}
 */
export function useSpeechRecording({
    onError,
    onWarning,
    lang = 'en-US',
} = {}) {
    const [recording, setRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [timer, setTimer] = useState(0);
    const [sttSupported, setSttSupported] = useState(true);

    const mediaRecorderRef = useRef(null);
    const recognitionRef = useRef(null);
    const timerRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const sttErrorRef = useRef(false); // prevents onend restart-loop after error

    // Detect STT support once on mount
    useEffect(() => {
        const supported = !!(
            window.SpeechRecognition || window.webkitSpeechRecognition
        );
        setSttSupported(supported);
    }, []);

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            onError?.('Trình duyệt của bạn không hỗ trợ ghi âm.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            streamRef.current = stream;

            const mimeType = getSupportedMimeType();
            const mediaRecorder = new MediaRecorder(
                stream,
                mimeType ? { mimeType } : {}
            );
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            // NOTE: onstop handler is NOT set here — caller may need different behavior.
            // Caller can access chunksRef via audioChunksRef and handle blob creation.

            mediaRecorder.start(1000);
            mediaRecorderRef.current = mediaRecorder;

            // --- Web Speech API ---
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                sttErrorRef.current = false;
                const recognition = new SpeechRecognition();
                recognition.lang = lang;
                recognition.continuous = true;
                recognition.interimResults = true;

                let finalTranscript = '';

                recognition.onresult = (event) => {
                    let interim = '';
                    for (
                        let i = event.resultIndex;
                        i < event.results.length;
                        i++
                    ) {
                        if (event.results[i].isFinal) {
                            finalTranscript +=
                                event.results[i][0].transcript + ' ';
                        } else {
                            interim += event.results[i][0].transcript;
                        }
                    }
                    setTranscript(finalTranscript + interim);
                };

                recognition.onerror = (e) => {
                    console.warn('STT error:', e.error);
                    sttErrorRef.current = true; // block onend restart

                    if (
                        e.error === 'not-allowed' ||
                        e.error === 'service-not-allowed'
                    ) {
                        onWarning?.(
                            'Quyền microphone bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.'
                        );
                        recognitionRef.current = null; // stop all retries
                    }
                    // other errors (network, aborted) are transient — onend will fire
                    // but sttErrorRef=true will block restart for that cycle
                };

                recognition.onend = () => {
                    // Only restart if: no error this cycle AND still actively recording
                    if (
                        !sttErrorRef.current &&
                        recognitionRef.current &&
                        mediaRecorderRef.current?.state === 'recording'
                    ) {
                        try {
                            recognitionRef.current.start();
                        } catch {
                            // ignore — already stopped
                        }
                    }
                    // Reset for next cycle (transient errors get one retry)
                    sttErrorRef.current = false;
                };

                recognition.start();
                recognitionRef.current = recognition;
            }

            setRecording(true);
            setTimer(0);
            timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
        } catch (err) {
            console.error('Recording error:', err);
            if (
                err.name === 'NotAllowedError' ||
                err.name === 'PermissionDeniedError'
            ) {
                onError?.(
                    'Microphone bị từ chối. Hãy cấp quyền microphone trong cài đặt trình duyệt.'
                );
            } else if (err.name === 'NotFoundError') {
                onError?.('Không tìm thấy microphone trên thiết bị này.');
            } else {
                onError?.(
                    'Không thể truy cập microphone: ' +
                        (err.message || err.name)
                );
            }
        }
    };

    const stopRecording = () => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== 'inactive'
        ) {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // prevent restart loop on explicit stop
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setRecording(false);
    };

    /**
     * Cancel: stop everything and reset state (no submit).
     * Clears chunks so the caller does not accidentally submit stale audio.
     */
    const cancelRecording = () => {
        stopRecording();
        chunksRef.current = [];
        setTranscript('');
        setTimer(0);
    };

    return {
        recording,
        transcript,
        setTranscript,
        timer,
        sttSupported,
        audioChunksRef: chunksRef,
        startRecording,
        stopRecording,
        cancelRecording,
    };
}
