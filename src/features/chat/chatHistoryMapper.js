const HISTORY_STATUS_MAP = Object.freeze({
    COMPLETE: 'completed',
    PARTIAL: 'partial',
    FAILED: 'error',
    CANCELLED: 'cancelled',
    STREAMING: 'interrupted',
});

const TERMINAL_STATUSES = new Set([
    'completed',
    'partial',
    'error',
    'cancelled',
]);

export function normalizeHistoryMessage(message, currentUserId) {
    const role = message.role === 'USER' ? 'user' : 'assistant';

    return {
        id: message.id,
        serverId: message.id,
        sequence: message.sequence ?? null,
        clientMessageId: message.clientMessageId ?? null,
        replyToMessageId: message.replyToMessageId ?? null,
        role,
        senderId: role === 'user' ? currentUserId : 'AI',
        content: message.content || '',
        status: HISTORY_STATUS_MAP[message.status] || 'error',
        errorCode: message.errorCode ?? null,
        createdAt: message.createdAt,
        completedAt: message.completedAt ?? null,
        source: 'history',
    };
}

export function normalizeHistoryPage(messages, currentUserId) {
    if (!Array.isArray(messages)) return [];

    return messages
        .map((message) => normalizeHistoryMessage(message, currentUserId))
        .sort((left, right) => left.sequence - right.sequence);
}

function matchesMessage(existing, incoming) {
    if (
        incoming.serverId &&
        existing.serverId &&
        incoming.serverId === existing.serverId
    ) {
        return true;
    }

    return Boolean(
        incoming.role === 'user' &&
            existing.role === 'user' &&
            incoming.clientMessageId &&
            incoming.clientMessageId === existing.clientMessageId
    );
}

function mergeMessage(existing, incoming) {
    const merged = { ...existing, ...incoming };
    const keepLiveTerminal =
        existing.role === 'assistant' &&
        existing.source !== 'history' &&
        TERMINAL_STATUSES.has(existing.status);

    if (!keepLiveTerminal) return merged;

    return {
        ...merged,
        content: existing.content,
        status: existing.status,
        errorCode: existing.errorCode,
        completedAt: existing.completedAt || incoming.completedAt,
        source: existing.source,
    };
}

export function mergeChatMessages(currentMessages, incomingMessages) {
    const merged = [];

    for (const incoming of [
        ...(Array.isArray(currentMessages) ? currentMessages : []),
        ...(Array.isArray(incomingMessages) ? incomingMessages : []),
    ]) {
        const existingIndex = merged.findIndex((message) =>
            matchesMessage(message, incoming)
        );

        if (existingIndex < 0) {
            merged.push(incoming);
            continue;
        }

        merged[existingIndex] = mergeMessage(merged[existingIndex], incoming);
    }

    return merged
        .map((message, index) => ({ message, index }))
        .sort((left, right) => {
            const leftSequence = left.message.sequence;
            const rightSequence = right.message.sequence;
            const leftPersisted = Number.isFinite(leftSequence);
            const rightPersisted = Number.isFinite(rightSequence);

            if (leftPersisted && rightPersisted) {
                return leftSequence - rightSequence;
            }
            if (leftPersisted) return -1;
            if (rightPersisted) return 1;
            return left.index - right.index;
        })
        .map(({ message }) => message);
}
