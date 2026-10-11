export const SPEAKING_PART_COLORS = {
    PART_1: 'blue',
    PART_2: 'purple',
    PART_3: 'geekblue',
};

export const SPEAKING_TYPE_ICON_COLORS = {
    PART_1: '#3b82f6',
    PART_2: '#8b5cf6',
    PART_3: '#1d4ed8',
};

export const SPEAKING_ATTEMPT_STATUS_COLORS = {
    SUBMITTED: 'blue',
    PROCESSING: 'orange',
    GRADING: 'orange',
    GRADED: 'green',
    ERROR: 'red',
    FAILED: 'red',
};

export const SPEAKING_CONVERSATION_STATUS_COLORS = {
    IN_PROGRESS: 'blue',
    COMPLETED: 'orange',
    GRADING: 'gold',
    GRADED: 'green',
    FAILED: 'red',
};

export const STYLE_OPTIONS = [
    { label: 'Casual', value: 'CASUAL' },
    { label: 'Professional', value: 'PROFESSIONAL' },
    { label: 'Encouraging', value: 'ENCOURAGING' },
    { label: 'Challenging', value: 'CHALLENGING' },
    { label: 'Playful', value: 'PLAYFUL' },
    { label: 'Flirty', value: 'FLIRTY' },
    { label: 'Deep', value: 'DEEP' },
    { label: 'Debate', value: 'DEBATE' },
    { label: 'Street', value: 'STREET' },
    { label: 'Unfiltered', value: 'UNFILTERED' },
];

export const PERSONALITY_OPTIONS = [
    { label: 'Friendly', value: 'FRIENDLY' },
    { label: 'Humorous', value: 'HUMOROUS' },
    { label: 'Patient', value: 'PATIENT' },
    { label: 'Straightforward', value: 'STRAIGHTFORWARD' },
    { label: 'Confident', value: 'CONFIDENT' },
    { label: 'Curious', value: 'CURIOUS' },
    { label: 'Empathetic', value: 'EMPATHETIC' },
    { label: 'Bold', value: 'BOLD' },
    { label: 'Flirty', value: 'FLIRTY' },
    { label: 'Edgy', value: 'EDGY' },
    { label: 'Rebellious', value: 'REBELLIOUS' },
];

export const EXPERTISE_OPTIONS = [
    { label: 'General', value: 'GENERAL' },
    { label: 'Business', value: 'BUSINESS' },
    { label: 'Technology', value: 'TECHNOLOGY' },
    { label: 'Education', value: 'EDUCATION' },
    { label: 'Travel', value: 'TRAVEL' },
    { label: 'Relationships', value: 'RELATIONSHIPS' },
    { label: 'Entertainment', value: 'ENTERTAINMENT' },
    { label: 'Gaming', value: 'GAMING' },
    { label: 'Fitness', value: 'FITNESS' },
    { label: 'Psychology', value: 'PSYCHOLOGY' },
    { label: 'Social Media', value: 'SOCIAL_MEDIA' },
    { label: 'Street Culture', value: 'STREET_CULTURE' },
];

export const VOICE_NAME_OPTIONS = [
    { label: 'Deep male voice', value: 'US_NEURAL_J' },
    { label: 'Balanced male voice', value: 'US_NEURAL_I' },
    { label: 'Female voice', value: 'US_NEURAL_F' },
    { label: 'Natural female voice', value: 'US_STUDIO_O' },
    { label: 'Ultra-natural female voice', value: 'US_CHIRP_F' },
];

function buildOptionLabelMap(options) {
    return options.reduce((accumulator, option) => {
        accumulator[option.value] = option.label;
        return accumulator;
    }, {});
}

export const CONVERSATION_STYLE_LABELS = buildOptionLabelMap(STYLE_OPTIONS);

export const CONVERSATION_PERSONALITY_LABELS =
    buildOptionLabelMap(PERSONALITY_OPTIONS);

export const CONVERSATION_EXPERTISE_LABELS =
    buildOptionLabelMap(EXPERTISE_OPTIONS);

export const VOICE_NAME_LABELS = buildOptionLabelMap(VOICE_NAME_OPTIONS);

export const CONVERSATION_STYLE_COLORS = {
    CASUAL: 'blue',
    PROFESSIONAL: 'geekblue',
    ENCOURAGING: 'green',
    CHALLENGING: 'volcano',
    PLAYFUL: 'magenta',
    FLIRTY: 'pink',
    DEEP: 'purple',
    DEBATE: 'red',
    STREET: 'orange',
    UNFILTERED: 'gold',
};

export const CONVERSATION_PERSONALITY_COLORS = {
    FRIENDLY: 'cyan',
    HUMOROUS: 'lime',
    PATIENT: 'green',
    STRAIGHTFORWARD: 'volcano',
    CONFIDENT: 'blue',
    CURIOUS: 'gold',
    EMPATHETIC: 'purple',
    BOLD: 'red',
    FLIRTY: 'pink',
    EDGY: 'magenta',
    REBELLIOUS: 'orange',
};

export const CONVERSATION_EXPERTISE_COLORS = {
    GENERAL: 'default',
    BUSINESS: 'gold',
    TECHNOLOGY: 'geekblue',
    EDUCATION: 'cyan',
    TRAVEL: 'green',
    RELATIONSHIPS: 'magenta',
    ENTERTAINMENT: 'purple',
    GAMING: 'volcano',
    FITNESS: 'lime',
    PSYCHOLOGY: 'blue',
    SOCIAL_MEDIA: 'pink',
    STREET_CULTURE: 'orange',
};

export function getConversationStyleLabel(value, t) {
    return t?.(`speaking.custom.styles.${value}`) || CONVERSATION_STYLE_LABELS[value] || value;
}

export function getConversationPersonalityLabel(value, t) {
    return t?.(`speaking.custom.personalities.${value}`) || CONVERSATION_PERSONALITY_LABELS[value] || value;
}

export function getConversationExpertiseLabel(value, t) {
    return t?.(`speaking.custom.expertises.${value}`) || CONVERSATION_EXPERTISE_LABELS[value] || value;
}

export function getVoiceNameLabel(value, t) {
    return t?.(`speaking.custom.voices.${value}`) || VOICE_NAME_LABELS[value] || value;
}

export function getWordsPerMinute(analytics) {
    return analytics?.wpm ?? analytics?.wordsPerMinute ?? null;
}

export function normalizeSpeechAnalyticsForSubmit(analytics) {
    if (!analytics) return undefined;

    return {
        wordCount: analytics.wordCount ?? null,
        wordsPerMinute: analytics.wordsPerMinute ?? analytics.wpm ?? null,
        pauseCount: analytics.pauseCount ?? null,
        avgPauseDurationMs: analytics.avgPauseDurationMs ?? null,
        longPauseCount: analytics.longPauseCount ?? null,
        fillerWordCount: analytics.fillerWordCount ?? null,
        fillerWords: analytics.fillerWords ?? [],
        avgWordConfidence: analytics.avgWordConfidence ?? null,
        lowConfidenceWords: analytics.lowConfidenceWords ?? [],
        wordDetails: analytics.wordDetails ?? analytics.words ?? [],
    };
}

export function formatSpeakingTime(seconds) {
    return `${Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function playBase64Audio(base64) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audio.onended = resolve;
        audio.onerror = reject;
        audio.play().catch(reject);
    });
}
