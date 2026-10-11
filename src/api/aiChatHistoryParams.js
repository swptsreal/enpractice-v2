export function buildAiChatHistoryParams({ beforeSequence, limit = 50 } = {}) {
    const params = { limit };
    if (beforeSequence !== undefined && beforeSequence !== null) {
        params.beforeSequence = beforeSequence;
    }
    return params;
}
