export const CHAT_SCROLL_THRESHOLD_PX = 120;

export function isNearChatBottom({ scrollHeight, scrollTop, clientHeight }) {
    return scrollHeight - scrollTop - clientHeight <= CHAT_SCROLL_THRESHOLD_PX;
}

export function shouldRequestChatScroll(changeType) {
    return changeType === 'send' || changeType === 'START';
}
