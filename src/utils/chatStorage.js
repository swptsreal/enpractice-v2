const MAX_MESSAGES = 100;
const KEY_PREFIX = 'chat_history_';

/**
 * Lấy key localStorage theo userId
 */
function getKey(userId) {
    return `${KEY_PREFIX}${userId}`;
}

/**
 * Đọc lịch sử chat từ localStorage
 * @param {string} userId
 * @returns {Array} mảng tin nhắn
 */
export function getChatHistory(userId) {
    try {
        const raw = localStorage.getItem(getKey(userId));
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Failed to read chat history from localStorage', e);
        return [];
    }
}

/**
 * Lưu lịch sử chat vào localStorage (giữ tối đa MAX_MESSAGES tin nhắn mới nhất)
 * @param {string} userId
 * @param {Array} messages
 */
export function saveChatHistory(userId, messages) {
    try {
        const trimmed = messages.slice(-MAX_MESSAGES);
        localStorage.setItem(getKey(userId), JSON.stringify(trimmed));
    } catch (e) {
        console.error('Failed to save chat history to localStorage', e);
    }
}

/**
 * Xoá toàn bộ lịch sử chat của user
 * @param {string} userId
 */
export function clearChatHistory(userId) {
    try {
        localStorage.removeItem(getKey(userId));
    } catch (e) {
        console.error('Failed to clear chat history from localStorage', e);
    }
}
