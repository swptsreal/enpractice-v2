const AI_SENDER_ID = 'AI';
const DEFAULT_ERROR_MESSAGE =
    'Xin loi nha, hien tai toi khong the tra loi tin nhan cua ban';

function nowIso() {
    return new Date().toISOString();
}

export function normalizeStoredMessages(messages) {
    if (!Array.isArray(messages)) return [];
    return messages.map((message, index) => {
        const createdAt = message.createdAt || message.timestamp || nowIso();
        const role =
            message.role ||
            (message.senderId === AI_SENDER_ID ? 'assistant' : 'user');

        return {
            ...message,
            id:
                message.id ||
                message.messageId ||
                message.clientMessageId ||
                'stored-' + createdAt + '-' + index,
            serverId: message.serverId || message.messageId || null,
            sequence: message.sequence ?? null,
            clientMessageId: message.clientMessageId ?? null,
            replyToMessageId: message.replyToMessageId ?? null,
            role,
            content: message.content || '',
            status: message.status || 'completed',
            errorCode: message.errorCode ?? null,
            createdAt,
            completedAt: message.completedAt ?? null,
            source: message.source || 'guest-local',
            timestamp: message.timestamp || createdAt,
        };
    });
}

export function interruptStreamingMessages(messages) {
    return messages.map((message) =>
        message.status === 'streaming'
            ? { ...message, status: 'interrupted' }
            : message
    );
}

export function createOptimisticUserMessage({
    clientMessageId,
    content,
    senderId,
    timestamp,
    source = 'optimistic',
}) {
    const createdAt = timestamp || nowIso();

    return {
        id: clientMessageId,
        serverId: null,
        sequence: null,
        clientMessageId,
        replyToMessageId: null,
        role: 'user',
        senderId,
        content,
        status: 'sending',
        errorCode: null,
        createdAt,
        completedAt: null,
        source,
        timestamp: createdAt,
    };
}

function buildAiMessage(event, overrides = {}) {
    const createdAt = event.timestamp || nowIso();
    const serverId = event.messageId || null;

    return {
        id:
            serverId ||
            event.requestId ||
            `assistant-${event.clientMessageId || createdAt}`,
        serverId,
        sequence: null,
        requestId: event.requestId,
        messageId: event.messageId,
        clientMessageId: event.clientMessageId ?? null,
        replyToMessageId: event.replyToMessageId ?? null,
        role: 'assistant',
        senderId: event.senderId || AI_SENDER_ID,
        content: event.content || '',
        errorCode: event.errorCode || null,
        quotaRemaining: event.quotaRemaining ?? null,
        quotaResetAt: event.quotaResetAt ?? null,
        requiredCredit: event.requiredCredit ?? null,
        availableCredit: event.availableCredit ?? null,
        createdAt,
        completedAt: event.final ? createdAt : null,
        timestamp: createdAt,
        source: 'live',
        status: 'completed',
        ...overrides,
    };
}

function findAssistantIndex(messages, event) {
    return messages.findIndex(
        (message) =>
            message.role === 'assistant' &&
            ((event.messageId &&
                (message.serverId === event.messageId ||
                    message.messageId === event.messageId ||
                    message.id === event.messageId)) ||
                (event.clientMessageId &&
                    message.clientMessageId === event.clientMessageId))
    );
}

function completeOptimisticUser(messages, clientMessageId) {
    if (!clientMessageId) return messages;

    return messages.map((message) =>
        message.role === 'user' &&
        message.clientMessageId === clientMessageId &&
        message.status === 'sending'
            ? { ...message, status: 'completed', completedAt: nowIso() }
            : message
    );
}

export function applyIncomingEvent(prevMessages, event) {
    if (!event?.type) return prevMessages;
    if (event.type === 'ERROR' && event.errorCode === 'DUPLICATE_IN_PROGRESS') {
        return prevMessages;
    }

    let messages = [...prevMessages];

    if (event.type === 'START') {
        messages = completeOptimisticUser(messages, event.clientMessageId);
        messages = interruptStreamingMessages(messages);
        const messageIndex = findAssistantIndex(messages, event);
        const next = buildAiMessage(event, {
            content: '',
            status: 'streaming',
        });

        if (messageIndex >= 0) {
            messages[messageIndex] = { ...messages[messageIndex], ...next };
            return messages;
        }
        return [...messages, next];
    }

    const messageIndex = findAssistantIndex(messages, event);

    if (event.type === 'DELTA') {
        if (messageIndex < 0) {
            return [
                ...interruptStreamingMessages(messages),
                buildAiMessage(event, {
                    status: 'streaming',
                    content: event.content || '',
                }),
            ];
        }
        const current = messages[messageIndex];
        messages[messageIndex] = {
            ...current,
            status: 'streaming',
            content: (current.content || '') + (event.content || ''),
        };
        return messages;
    }

    if (event.type === 'COMPLETE') {
        const next = buildAiMessage(event, {
            status: 'completed',
            content:
                event.content ||
                (messageIndex >= 0 ? messages[messageIndex].content : ''),
            completedAt: event.timestamp || nowIso(),
        });
        if (messageIndex >= 0) {
            messages[messageIndex] = { ...messages[messageIndex], ...next };
            return messages;
        }
        return [...interruptStreamingMessages(messages), next];
    }

    if (event.type === 'ERROR') {
        const next = buildAiMessage(event, {
            status: 'error',
            content:
                event.content ||
                (messageIndex >= 0
                    ? messages[messageIndex].content
                    : DEFAULT_ERROR_MESSAGE),
            completedAt: event.timestamp || nowIso(),
        });
        if (messageIndex >= 0) {
            messages[messageIndex] = { ...messages[messageIndex], ...next };
            return messages;
        }
        return [...interruptStreamingMessages(messages), next];
    }

    return prevMessages;
}

export function markMessageSendFailed(messages, clientMessageId) {
    return messages.map((message) =>
        message.role === 'user' && message.clientMessageId === clientMessageId
            ? { ...message, status: 'error' }
            : message
    );
}

export function markUnresolvedSendingMessages(
    messages,
    persistedClientMessageIds
) {
    return messages.map((message) =>
        message.role === 'user' &&
        message.status === 'sending' &&
        !persistedClientMessageIds.has(message.clientMessageId)
            ? { ...message, status: 'error' }
            : message
    );
}

export function getRetryableMessage(messages, clientMessageId) {
    return (
        messages.find(
            (message) =>
                message.role === 'user' &&
                message.status === 'error' &&
                message.clientMessageId === clientMessageId
        ) || null
    );
}
