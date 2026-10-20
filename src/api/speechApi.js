import axiosClient, {
    API_BASE_URL,
    ApiError,
    ensureValidAccessToken,
} from './axiosClient';

/**
 * Server-side speech helpers for the AI coach.
 *
 * STT is a normal multipart POST. TTS for a long answer is an NDJSON stream: the
 * backend synthesises one sentence at a time and writes each clip as soon as it is ready, so the
 * first audio starts before the rest of the answer has been synthesised.
 */
export const speechApi = {
    transcribe(file, { language = 'auto', durationMs } = {}) {
        const form = new FormData();
        form.append('file', file, file.name || 'speech.webm');
        form.append('language', language);
        if (Number.isFinite(durationMs)) {
            form.append('durationMs', String(Math.round(durationMs)));
        }

        return axiosClient.post('/speech/transcriptions', form, {
            timeout: 30000,
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    async *streamTts(text, { language = 'auto', voiceName, signal } = {}) {
        const token = await ensureValidAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/x-ndjson',
        };
        if (token) headers.Authorization = `Bearer ${token}`;
        if (import.meta.env.VITE_INTERNAL_KEY) {
            headers['X-Internal-Key'] = import.meta.env.VITE_INTERNAL_KEY;
        }

        const response = await fetch(`${API_BASE_URL}/tts/stream`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ text, language, voiceName }),
            signal,
        });

        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new ApiError(
                body?.message || 'Không thể tổng hợp giọng nói.',
                response.status,
                body?.data
            );
        }
        if (!response.body) {
            throw new ApiError('Không thể đọc luồng giọng nói.', 0);
        }

        yield* readNdjson(response.body);
    },
};

async function* readNdjson(stream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let newline;
            while ((newline = buffer.indexOf('\n')) >= 0) {
                const line = buffer.slice(0, newline).trim();
                buffer = buffer.slice(newline + 1);
                if (line) yield JSON.parse(line);
            }
        }

        buffer += decoder.decode();
        const tail = buffer.trim();
        if (tail) yield JSON.parse(tail);
    } finally {
        reader.releaseLock();
    }
}

export default speechApi;
