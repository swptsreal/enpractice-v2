import axiosClient from '../api/axiosClient';

/**
 * Text-to-Speech utility
 * Tries server TTS API first, falls back to Web Speech API
 */

// Currently playing audio element (for cancellation)
let currentAudio = null;

export async function speakWithVoice(text, voiceName = 'US_NEURAL_J') {
    if (!text) return;

    window.speechSynthesis?.cancel();
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    try {
        const data = await axiosClient.post('/tts/synthesize', {
            text: text.trim(),
            voiceName,
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
    speakWithBrowser(text, 'en');
}

/**
 * Play base64-encoded audio
 * @param {string} base64 - Base64 audio string
 * @returns {Promise<void>}
 */
function playBase64Audio(base64) {
    return new Promise((resolve, reject) => {
        // Stop any currently playing audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        currentAudio = audio;

        audio.onended = () => {
            currentAudio = null;
            resolve();
        };
        audio.onerror = (e) => {
            currentAudio = null;
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
 * Speak text aloud — calls server TTS API first, falls back to browser SpeechSynthesis
 * @param {string} text - Text to speak
 * @param {'en'|'vi'} lang - Language code
 * @param {number} rate - Speech rate (0.5 - 2), default 1.0
 */
export async function speak(text, lang = 'en', rate = 1.0) {
    if (!text) return;

    // Cancel any ongoing speech / audio
    window.speechSynthesis?.cancel();
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

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
