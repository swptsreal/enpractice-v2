import axiosClient from '../api/axiosClient';
import { speechApi } from '../api/speechApi';

/**
 * Text-to-Speech utility
 * Tries server TTS API first, falls back to Web Speech API
 */

// Currently playing audio element (for cancellation)
let currentAudio = null;
/**
 * Resolves the promise that owns the "playing" state of the clip in `currentAudio`.
 *
 * A PAUSED CLIP NEVER FIRES `ended`, so the promise returned by `playBase64Audio` would never
 * settle: the button that started it would stay on "Đang phát…" for good, and pressing a second
 * listen control would leave the first one frozen. Settling it here is what makes the two
 * controls agree about which one is speaking.
 */
let settleCurrentPlayback = null;

/**
 * One streaming answer: the request, the AudioContext, and the sources already scheduled.
 *
 * Kept outside React because playback outlives one render and must be cancellable from the
 * "Nghe" button, the next recording, or unmount.
 */
let streamPlayback = null;

function closeAudioContext(context) {
    try {
        const result = context?.close?.();
        if (result?.catch) result.catch(() => {});
    } catch {
        /* already closed */
    }
}

function stopStreamPlayback() {
    const state = streamPlayback;
    if (!state) return;
    streamPlayback = null;
    try {
        state.controller.abort();
    } catch {
        /* already aborted */
    }
    for (const source of state.sources) {
        try {
            source.stop();
        } catch {
            /* already ended */
        }
    }
    state.sources.length = 0;
    state.settle();
    closeAudioContext(state.context);
}

/** Stop whatever is speaking: the server clip, and the browser's own utterance. */
function cancelPlayback() {
    stopStreamPlayback();
    window.speechSynthesis?.cancel();
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if (settleCurrentPlayback) {
        const settle = settleCurrentPlayback;
        settleCurrentPlayback = null;
        settle();
    }
}

const speechCache = new Map();
const MAX_CACHE_ENTRIES = 20;

function detectSpeechLanguage(text) {
    return /[ăâđêôơưĂÂĐÊÔƠƯ]|[\u00C0-\u1EF9]/.test(text) ? 'vi' : 'en';
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Play a long answer as it is synthesised.
 *
 * The backend emits one NDJSON event per sentence-sized chunk. Each MP3 chunk is decoded and
 * scheduled on one AudioContext, so there is no HTMLAudioElement gap between sentences. The
 * first chunk starts playing as soon as it arrives; later chunks are scheduled behind it.
 *
 * Falls back to the one-shot endpoint on browsers without AudioContext/streaming fetch, or if the
 * stream fails before any audio was scheduled.
 */
export async function speakStreaming(text, options = {}) {
    if (!text) return;

    const { language = 'auto', voiceName } =
        typeof options === 'string' ? { voiceName: options } : options;
    const trimmed = text.trim();
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextCtor || !window.fetch || !window.ReadableStream) {
        return speakWithVoice(trimmed, { language, voiceName });
    }

    cancelPlayback();

    const context = new AudioContextCtor();
    try {
        await context.resume();
    } catch {
        /* a suspended context still plays after the first user-gesture resume */
    }

    const controller = new AbortController();
    const sources = [];
    let nextStart = 0;
    let pending = 0;
    let done = false;
    let started = false;
    let settled = false;
    let resolveFinished;
    let rejectFinished;
    const finished = new Promise((resolve, reject) => {
        resolveFinished = resolve;
        rejectFinished = reject;
    });
    const state = {
        controller,
        context,
        sources,
        settle: () => {
            if (settled) return;
            settled = true;
            resolveFinished();
        },
        reject: (error) => {
            if (settled) return;
            settled = true;
            rejectFinished(error);
        },
    };
    streamPlayback = state;

    const finishIfIdle = () => {
        if (done && pending === 0) state.settle();
    };

    try {
        for await (const event of speechApi.streamTts(trimmed, {
            language,
            voiceName,
            signal: controller.signal,
        })) {
            if (event.type === 'error') {
                throw new Error(event.message || event.code || 'TTS stream failed');
            }
            if (event.type !== 'chunk' || !event.audioBase64) continue;

            const buffer = await context.decodeAudioData(base64ToArrayBuffer(event.audioBase64));
            if (controller.signal.aborted) break;

            const source = context.createBufferSource();
            source.buffer = buffer;
            source.connect(context.destination);
            const startAt = Math.max(context.currentTime + 0.02, nextStart);
            source.start(startAt);
            nextStart = startAt + buffer.duration;
            pending += 1;
            started = true;
            sources.push(source);
            source.onended = () => {
                pending -= 1;
                finishIfIdle();
            };
        }

        done = true;
        finishIfIdle();
        await finished;
    } catch (error) {
        if (!started && !controller.signal.aborted) {
            streamPlayback = null;
            closeAudioContext(context);
            return speakWithVoice(trimmed, { language, voiceName });
        }
        throw error;
    } finally {
        if (streamPlayback === state) streamPlayback = null;
        closeAudioContext(context);
    }
}

export async function speakWithVoice(text, options = {}) {
    if (!text) return;

    const { language = 'auto', voiceName } =
        typeof options === 'string' ? { voiceName: options } : options;
    const trimmed = text.trim();
    const cacheKey = `${language}:${voiceName || ''}:${trimmed}`;

    cancelPlayback();

    try {
        const cached = speechCache.get(cacheKey);
        if (cached) {
            await playBase64Audio(cached);
            return;
        }

        const data = await axiosClient.post(
            '/tts/synthesize',
            { text: trimmed, language, voiceName },
            { timeout: 30000 }
        );

        if (data?.audioBase64) {
            if (speechCache.size >= MAX_CACHE_ENTRIES) {
                speechCache.delete(speechCache.keys().next().value);
            }
            speechCache.set(cacheKey, data.audioBase64);
            await playBase64Audio(data.audioBase64);
            return;
        }
    } catch (err) {
        if (import.meta.env.DEV) {
            console.warn(
                '[TTS] API failed, falling back to browser speech:',
                err.message
            );
        }
    }

    // Fallback to browser SpeechSynthesis, using the text language rather than
    // always English: a Vietnamese answer read by an English voice is unusable.
    speakWithBrowser(trimmed, detectSpeechLanguage(trimmed));
}

/**
 * Play base64-encoded audio
 * @param {string} base64 - Base64 audio string
 * @returns {Promise<void>}
 */
function playBase64Audio(base64) {
    return new Promise((resolve, reject) => {
        cancelPlayback();

        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        currentAudio = audio;
        settleCurrentPlayback = resolve;

        audio.onended = () => {
            currentAudio = null;
            settleCurrentPlayback = null;
            resolve();
        };
        audio.onerror = (e) => {
            currentAudio = null;
            settleCurrentPlayback = null;
            reject(e);
        };

        audio.play().catch(reject);
    });
}

/**
 * Fallback: speak using browser's SpeechSynthesis
 * @param {string} text
 * @param {'en'|'vi'} lang
 * @param {number} rate
 */
function speakWithBrowser(text, lang = 'en', rate = 1.0) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = lang === 'en' ? 'en-US' : 'vi-VN';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang === 'en' ? 'en' : 'vi';
    const matchedVoice = voices.find((v) => v.lang.startsWith(langPrefix));
    if (matchedVoice) {
        utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
}

/**
 * Stop whatever is speaking right now: the server clip if it is playing, and the browser's
 * own utterance. Exported because a screen that is about to RECORD must silence the partner
 * first — a voice playing out of the speakers is a voice the microphone will hear, and the
 * learner's transcript would come back with the question inside it.
 */
export function stopSpeaking() {
    cancelPlayback();
}

/**
 * Speak text aloud — calls server TTS API first, falls back to browser SpeechSynthesis
 * @param {string} text - Text to speak
 * @param {'en'|'vi'} lang - Language code
 * @param {number} rate - Speech rate (0.5 - 2), default 1.0
 */
export async function speak(text, lang = 'en', rate = 1.0) {
    if (!text) return;

    cancelPlayback();

    try {
        const data = await axiosClient.post('/tts/synthesize-vocabulary', {
            text: text.trim(),
        });

        if (data?.audioBase64) {
            await playBase64Audio(data.audioBase64);
            return;
        }
    } catch (err) {
        if (import.meta.env.DEV) {
            console.warn(
                '[TTS] API failed, falling back to browser speech:',
                err.message
            );
        }
    }

    // Fallback to browser SpeechSynthesis
    speakWithBrowser(text, lang, rate);
}

/**
 * Speak English text
 * @param {string} text
 */
export function speakEnglish(text) {
    speak(text, 'en', 1.0);
}

/**
 * Speak Vietnamese text
 * @param {string} text
 */
export function speakVietnamese(text) {
    speak(text, 'vi', 1.0);
}

/**
 * Check if SpeechSynthesis is supported
 */
export function isTTSSupported() {
    return 'speechSynthesis' in window;
}
