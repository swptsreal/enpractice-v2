const KEY_PREFIX = 'custom_speaking_conversation:';

function getKey(conversationId) {
    return `${KEY_PREFIX}${conversationId}`;
}

export function saveCustomConversationSnapshot(conversationId, snapshot) {
    if (!conversationId || !snapshot) return;

    localStorage.setItem(
        getKey(conversationId),
        JSON.stringify({
            ...snapshot,
            conversationId,
            updatedAt: Date.now(),
        })
    );
}

export function getCustomConversationSnapshot(conversationId) {
    if (!conversationId) return null;

    const raw = localStorage.getItem(getKey(conversationId));
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.warn('Failed to parse custom conversation snapshot', error);
        localStorage.removeItem(getKey(conversationId));
        return null;
    }
}

export function clearCustomConversationSnapshot(conversationId) {
    if (!conversationId) return;
    localStorage.removeItem(getKey(conversationId));
}
