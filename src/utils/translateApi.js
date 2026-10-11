const BASE_URL = 'https://translate.googleapis.com/translate_a/single';

export function normalizeEnglishLookupText(value) {
    return String(value || '')
        .trim()
        .replace(/[’‘]/g, "'")
        .replace(/[–—]/g, '-')
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

export function isLikelyEnglishLookupText(value) {
    const normalized = normalizeEnglishLookupText(value);

    if (!normalized) return false;
    if (normalized.length > 160) return false;
    if (!/[a-z]/i.test(normalized)) return false;
    if (/[\d@#$%^*_+=\\[\]{}<>|~]/.test(normalized)) return false;

    return true;
}

/**
 * Call Google Translate API
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 */
async function callTranslateAPI(text, sourceLang, targetLang) {
    const params = new URLSearchParams({
        client: 'gtx',
        sl: sourceLang,
        tl: targetLang,
        q: text,
    });
    ['t', 'ss', 'at'].forEach((dt) => params.append('dt', dt));

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Translation API request failed');
    }

    return response.json();
}

export function normalizeMeaningText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFC')
        .replace(/\s+/g, ' ');
}

export function buildMeaningCandidates(
    correctTranslation,
    alternatives = [],
    acceptedMeanings = []
) {
    const seen = new Set();
    const candidates = [];

    [correctTranslation, ...alternatives, ...acceptedMeanings].forEach(
        (candidate) => {
            const normalized = normalizeMeaningText(candidate);
            if (!normalized || seen.has(normalized)) return;
            seen.add(normalized);
            candidates.push(String(candidate).trim());
        }
    );

    return candidates;
}

/**
 * Validate if a word is a valid English word
 * We do this by translating it and checking if the API returns a result
 * @param {string} word
 * @returns {Promise<{valid: boolean, translation: string}>}
 */
export async function validateEnglishWord(word) {
    try {
        const trimmed = normalizeEnglishLookupText(word);
        if (!isLikelyEnglishLookupText(trimmed)) {
            return { valid: false, translation: '' };
        }

        const data = await callTranslateAPI(trimmed, 'en', 'vi');

        // data[0] contains translations
        if (data && data[0] && data[0][0]) {
            const translation = data[0][0][0];
            // If the translation is the same as the input, it might not be a valid word
            // But some words are the same in both languages, so we allow it
            return {
                valid: true,
                translation: translation || '',
            };
        }

        return { valid: false, translation: '' };
    } catch (error) {
        console.error('Validation error:', error);
        throw error;
    }
}

/**
 * Translate English to Vietnamese and get detailed results
 * @param {string} word
 * @returns {Promise<{translation: string, synonyms: string[], alternatives: string[]}>}
 */
export async function translateToVietnamese(word) {
    try {
        // Need to build URL manually because URLSearchParams deduplicates 'dt'
        const url = `${BASE_URL}?client=gtx&sl=en&tl=vi&hl=vi&dt=t&dt=ss&dt=at&dt=md&q=${encodeURIComponent(word.trim().toLowerCase())}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('API failed');

        const data = await response.json();

        // Primary translation
        const translation = data[0]?.[0]?.[0] || '';

        // Alternative translations
        const alternatives = [];
        if (data[5]) {
            data[5].forEach(group => {
                if (group[2]) {
                    group[2].forEach(alt => {
                        if (alt[0] && alt[0] !== translation) {
                            alternatives.push(alt[0]);
                        }
                    });
                }
            });
        }

        // Synonyms (from ss data)
        const synonyms = [];
        if (data[11]) {
            data[11].forEach(group => {
                if (group[1]) {
                    group[1].forEach(synGroup => {
                        if (synGroup[0]) {
                            synGroup[0].forEach(syn => {
                                if (syn && !synonyms.includes(syn)) {
                                    synonyms.push(syn);
                                }
                            });
                        }
                    });
                }
            });
        }

        return {
            translation,
            synonyms: synonyms.slice(0, 8),
            alternatives: alternatives.slice(0, 6),
        };
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

/**
 * Check if user's Vietnamese input matches the correct translation
 * @param {string} userInput - User's Vietnamese answer
 * @param {string} correctTranslation - Correct translation from API
 * @param {string[]} alternatives - Alternative translations
 * @returns {boolean}
 */
export function checkMeaning(
    userInput,
    correctTranslation,
    alternatives = [],
    acceptedMeanings = []
) {
    const userNormalized = normalizeMeaningText(userInput);

    if (!userNormalized) return false;

    return buildMeaningCandidates(
        correctTranslation,
        alternatives,
        acceptedMeanings
    ).some((candidate) => {
        const normalizedCandidate = normalizeMeaningText(candidate);

        if (normalizedCandidate === userNormalized) return true;

        return (
            normalizedCandidate.includes(userNormalized) ||
            userNormalized.includes(normalizedCandidate)
        );
    });
}

/**
 * Check if user's English input matches the correct English word
 * @param {string} userInput - User's English answer
 * @param {string} correctEnglishWord - Correct English word
 * @returns {boolean}
 */
export function checkEnglishWord(userInput, correctEnglishWord) {
    const normalize = (str) => str.trim().toLowerCase().replace(/\s+/g, ' ');
    return normalize(userInput) === normalize(correctEnglishWord);
}
