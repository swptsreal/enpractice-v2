import dayjs from 'dayjs';

export const VOCABULARY_TEST_QUESTION_COUNTS = [5, 10, 15, 20];
export const VOCABULARY_TEST_SOURCE_ALL = 'ALL';
export const VOCABULARY_TEST_SOURCE_OPTIONS = [
    'VOCABULARY_RECORD',
    'USER_DICTIONARY',
    'USER_WORD_LOOKUP_EVENT',
];
export const VOCABULARY_TEST_SOURCE_SURFACE = 'VOCAB_TEST_DIRECT';

const ATTEMPT_SESSION_PREFIX = 'en_practice_vocabulary_attempt_session_';
const ATTEMPT_DRAFT_PREFIX = 'en_practice_vocabulary_attempt_draft_';

function getAttemptSessionKey(attemptId) {
    return `${ATTEMPT_SESSION_PREFIX}${attemptId}`;
}

function getAttemptDraftKey(attemptId) {
    return `${ATTEMPT_DRAFT_PREFIX}${attemptId}`;
}

function readJson(storage, key) {
    try {
        const value = storage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`Failed to read storage key ${key}:`, error);
        storage.removeItem(key);
        return null;
    }
}

function writeJson(storage, key, value) {
    if (value == null) {
        storage.removeItem(key);
        return;
    }

    storage.setItem(key, JSON.stringify(value));
}

export function normalizeVocabularyTestSources(sources = []) {
    const rawValues = Array.isArray(sources)
        ? sources.filter(Boolean)
        : [sources].filter(Boolean);

    const uniqueValues = [...new Set(rawValues)];

    if (
        uniqueValues.length === 0 ||
        uniqueValues.includes(VOCABULARY_TEST_SOURCE_ALL)
    ) {
        return [VOCABULARY_TEST_SOURCE_ALL];
    }

    return uniqueValues.filter((value) =>
        VOCABULARY_TEST_SOURCE_OPTIONS.includes(value)
    );
}

function createVocabularyTestClientRequestId() {
    return (
        globalThis.crypto?.randomUUID?.() ||
        'vocabulary-test-' +
            Date.now() +
            '-' +
            Math.random().toString(36).slice(2, 10)
    );
}

export function buildVocabularyGeneratePayload({
    questionCount,
    sources,
    sourceSurface = VOCABULARY_TEST_SOURCE_SURFACE,
} = {}) {
    return {
        clientRequestId: createVocabularyTestClientRequestId(),
        questionCount,
        sources: normalizeVocabularyTestSources(sources),
        sourceSurface,
    };
}

export function getVocabularySourceLabel(source, t) {
    return t(`vocabularyTest.sources.options.${source}`, {
        defaultValue: source,
    });
}

export function getVocabularySourceSummary(sources, t) {
    const normalizedSources = normalizeVocabularyTestSources(sources);

    if (normalizedSources.includes(VOCABULARY_TEST_SOURCE_ALL)) {
        return [getVocabularySourceLabel(VOCABULARY_TEST_SOURCE_ALL, t)];
    }

    return normalizedSources.map((source) => getVocabularySourceLabel(source, t));
}

export function extractVocabularyCollection(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    if (Array.isArray(payload?.content)) {
        return payload.content;
    }

    if (Array.isArray(payload?.data?.items)) {
        return payload.data.items;
    }

    if (Array.isArray(payload?.data?.content)) {
        return payload.data.content;
    }

    if (
        payload &&
        typeof payload === 'object' &&
        (payload.testId || payload.attemptId)
    ) {
        return [payload].filter(Boolean);
    }

    return [];
}

export function getVocabularyAttemptAccuracy(attempt) {
    if (typeof attempt?.accuracyPercent === 'number') {
        return attempt.accuracyPercent;
    }

    if (
        typeof attempt?.correctCount === 'number' &&
        typeof attempt?.totalQuestions === 'number' &&
        attempt.totalQuestions > 0
    ) {
        return (attempt.correctCount / attempt.totalQuestions) * 100;
    }

    return null;
}

export function formatVocabularyDateTime(value) {
    if (!value) {
        return '—';
    }

    return dayjs(value).format('DD/MM/YYYY HH:mm');
}

export function formatVocabularyDuration(seconds, t) {
    if (typeof seconds !== 'number' || Number.isNaN(seconds) || seconds < 0) {
        return t('vocabularyTest.common.na');
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes <= 0) {
        return t('vocabularyTest.common.secondsOnly', {
            count: remainingSeconds,
        });
    }

    return t('vocabularyTest.common.minutesSeconds', {
        minutes,
        seconds: String(remainingSeconds).padStart(2, '0'),
    });
}

export function saveVocabularyAttemptSession(attemptId, session) {
    if (!attemptId) {
        return;
    }

    writeJson(sessionStorage, getAttemptSessionKey(attemptId), session);
}

export function getVocabularyAttemptSession(attemptId) {
    if (!attemptId) {
        return null;
    }

    return readJson(sessionStorage, getAttemptSessionKey(attemptId));
}

export function hasVocabularyAttemptSession(attemptId) {
    return Boolean(getVocabularyAttemptSession(attemptId));
}

export function clearVocabularyAttemptSession(attemptId) {
    if (!attemptId) {
        return;
    }

    sessionStorage.removeItem(getAttemptSessionKey(attemptId));
}

export function saveVocabularyAttemptDraft(attemptId, draft) {
    if (!attemptId) {
        return;
    }

    writeJson(sessionStorage, getAttemptDraftKey(attemptId), draft);
}

export function getVocabularyAttemptDraft(attemptId) {
    if (!attemptId) {
        return null;
    }

    return readJson(sessionStorage, getAttemptDraftKey(attemptId));
}

export function clearVocabularyAttemptDraft(attemptId) {
    if (!attemptId) {
        return;
    }

    sessionStorage.removeItem(getAttemptDraftKey(attemptId));
}

export function clearVocabularyAttemptState(attemptId) {
    clearVocabularyAttemptSession(attemptId);
    clearVocabularyAttemptDraft(attemptId);
}

export function getVocabularyErrorMessage(error, t) {
    const rawMessage = String(error?.message || '').toLowerCase();

    if (
        rawMessage.includes('not enough') ||
        rawMessage.includes('insufficient') ||
        rawMessage.includes('khong du') ||
        rawMessage.includes('không đủ')
    ) {
        return t('vocabularyTest.error.notEnoughData');
    }

    if (error?.status === 404) {
        return t('vocabularyTest.error.notFound');
    }

    return (
        error?.message ||
        t('vocabularyTest.error.generic', {
            defaultValue: 'Something went wrong. Please try again.',
        })
    );
}
