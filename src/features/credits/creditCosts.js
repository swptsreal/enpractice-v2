const ACTION_ICON_KEYS = {
    AI_CHAT: 'bot',
    VOCABULARY_TEST_GENERATE: 'book',
    IELTS_START: 'graduation',
    WRITING_START: 'pen',
    WRITING_PRACTICE_START: 'pen',
    SPEAKING_START: 'mic',
    WRITING_PRACTICE_GENERATE: 'wand',
    AI_EXPLAIN: 'sparkles',
};

export function getCreditActionIconKey(actionCode) {
    return ACTION_ICON_KEYS[actionCode] || 'receipt';
}
