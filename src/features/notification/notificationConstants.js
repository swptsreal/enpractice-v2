/**
 * Notification vocabulary, ported from v1's `features/notification/constants`
 * because it is a contract with the backend rather than presentation.
 *
 * NOTE ON THE TYPE LIST: v1's `NOTIFICATION_TYPE_VALUES` contains
 * `VOCABULARY_TEST_READY` TWICE, which is a v1 bug — the deduped list is used here.
 * The backend sends `type` as a free string, so an unknown value is rendered as the
 * raw code rather than dropped.
 */
export const NOTIFICATION_TYPES = [
    'VOCABULARY_REMINDER',
    'VOCABULARY_TEST_READY',
    'VOCABULARY_TEST_FAILED',
    'WRITING_RESULT_READY',
    'SPEAKING_RESULT_READY',
    'SPEAKING_CONVERSATION_RESULT_READY',
    'CUSTOM_CONVERSATION_RESULT_READY',
    'ADMIN_BROADCAST',
];

export const NOTIFICATION_STATUSES = ['UNREAD', 'READ'];

/** Static i18n key per type, so the audit can see them. */
export const NOTIFICATION_LABEL_KEYS = {
    VOCABULARY_REMINDER: 'notifications.type.VOCABULARY_REMINDER',
    VOCABULARY_TEST_READY: 'notifications.type.VOCABULARY_TEST_READY',
    VOCABULARY_TEST_FAILED: 'notifications.type.VOCABULARY_TEST_FAILED',
    WRITING_RESULT_READY: 'notifications.type.WRITING_RESULT_READY',
    SPEAKING_RESULT_READY: 'notifications.type.SPEAKING_RESULT_READY',
    SPEAKING_CONVERSATION_RESULT_READY: 'notifications.type.SPEAKING_CONVERSATION_RESULT_READY',
    CUSTOM_CONVERSATION_RESULT_READY: 'notifications.type.CUSTOM_CONVERSATION_RESULT_READY',
    ADMIN_BROADCAST: 'notifications.type.ADMIN_BROADCAST',
};

/**
 * Priority -> the tint of the row's icon tile.
 *
 * The tint is NEVER the only signal: every row also states its unread state with a dot
 * (a shape) and its type as text, so a colour-blind or screen-reader user loses nothing.
 */
export const PRIORITY_TONE = {
    HIGH: 'wrong',
    URGENT: 'wrong',
    NORMAL: 'teal',
    LOW: 'neutral',
};

export const NOTIFICATION_PAGE_SIZE = 15;
