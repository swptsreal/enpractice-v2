import { REALTIME_MODES } from '../guest-ai-trial/guestAiTrialConstants.js';

export const GUEST_CHAT_DEFAULT_MAX_CHARACTERS = 1000;

export function normalizeChatContent(
    content,
    maxCharacters = GUEST_CHAT_DEFAULT_MAX_CHARACTERS
) {
    const normalized = String(content ?? '').trim();
    if (!normalized || normalized.length > maxCharacters) {
        const error = new Error(
            'Chat content must be 1-' + maxCharacters + ' characters'
        );
        error.code = 'INVALID_REQUEST';
        throw error;
    }
    return normalized;
}

export function getChatRealtimeContract(mode, identity) {
    if (mode === REALTIME_MODES.GUEST) {
        return {
            queue: '/user/queue/public/realtime-chat',
            destination: '/app/public/realtime-chat',
        };
    }
    return {
        queue: `/topic/realtime-chat/${identity}`,
        destination: '/app/realtime-chat',
    };
}

export function buildChatRequest({ mode, clientMessageId, content, identity }) {
    if (mode === REALTIME_MODES.GUEST) {
        return { clientMessageId, content, senderId: null, timestamp: null };
    }
    return {
        clientMessageId,
        content,
        senderId: identity,
        timestamp: new Date().toISOString(),
    };
}
