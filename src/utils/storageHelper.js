import dayjs from 'dayjs';
import { hasToken } from '../api';
import { recordsApi } from '../api/recordsApi';
import { reviewsApi } from '../api/reviewsApi';
import {
    applyReviewStates,
    countReviewWords,
    selectReviewWords,
} from '../components/review/reviewSelection';

const STORAGE_KEY = 'en_practice_records';
const REVIEW_SESSIONS_KEY = 'en_practice_review_sessions';
const REVIEW_STATES_KEY = 'en_practice_review_states';

// ============================================================
// Helper: Check if user is logged in (has JWT token)
// ============================================================
function isLoggedIn() {
    return hasToken();
}

// ============================================================
// LOCAL STORAGE FUNCTIONS (original logic, kept as-is)
// ============================================================

function localGetRecords() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function localSaveRecord(record) {
    const records = localGetRecords();
    const newRecord = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        ...record,
        timestamp: dayjs().toISOString(),
    };
    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return newRecord;
}

function localDeleteRecord(id) {
    const records = localGetRecords().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return records;
}

function localClearAllRecords() {
    localStorage.removeItem(STORAGE_KEY);
}

function localGetStats(period = 'week') {
    const records = localGetRecords();
    const now = dayjs();

    let startDate;
    switch (period) {
        case 'day':
            startDate = now.startOf('day');
            break;
        case 'week':
            startDate = now.startOf('week');
            break;
        case 'month':
            startDate = now.startOf('month');
            break;
        default:
            startDate = now.startOf('week');
    }

    const filtered = records.filter((r) =>
        dayjs(r.timestamp).isAfter(startDate)
    );

    const total = filtered.length;
    const correct = filtered.filter((r) => r.isCorrect).length;
    const incorrect = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    const wrongWords = {};
    records.forEach((r) => {
        if (!r.isCorrect) {
            if (!wrongWords[r.englishWord]) {
                wrongWords[r.englishWord] = {
                    word: r.englishWord,
                    correctMeaning: r.correctMeaning,
                    wrongCount: 0,
                    lastAttempt: r.timestamp,
                };
            }
            wrongWords[r.englishWord].wrongCount++;
            if (
                dayjs(r.timestamp).isAfter(
                    wrongWords[r.englishWord].lastAttempt
                )
            ) {
                wrongWords[r.englishWord].lastAttempt = r.timestamp;
            }
        }
    });

    const frequentlyWrong = Object.values(wrongWords)
        .sort((a, b) => b.wrongCount - a.wrongCount)
        .slice(0, 20);

    return {
        total,
        correct,
        incorrect,
        accuracy,
        frequentlyWrong,
        filtered,
    };
}

function localGetChartData(period = 'week') {
    const records = localGetRecords();
    const now = dayjs();

    let days;
    let format;
    switch (period) {
        case 'day':
            days = 24;
            format = 'HH:00';
            break;
        case 'week':
            days = 7;
            format = 'DD/MM';
            break;
        case 'month':
            days = 30;
            format = 'DD/MM';
            break;
        default:
            days = 7;
            format = 'DD/MM';
    }

    const chartData = [];

    if (period === 'day') {
        for (let i = 23; i >= 0; i--) {
            const hour = now.subtract(i, 'hour');
            const label = hour.format(format);
            const hourRecords = records.filter((r) => {
                const rTime = dayjs(r.timestamp);
                return (
                    rTime.format('YYYY-MM-DD HH') ===
                    hour.format('YYYY-MM-DD HH')
                );
            });
            chartData.push({
                name: label,
                correct: hourRecords.filter((r) => r.isCorrect).length,
                incorrect: hourRecords.filter((r) => !r.isCorrect).length,
                total: hourRecords.length,
            });
        }
    } else {
        for (let i = days - 1; i >= 0; i--) {
            const date = now.subtract(i, 'day');
            const label = date.format(format);
            const dayRecords = records.filter((r) => {
                return (
                    dayjs(r.timestamp).format('YYYY-MM-DD') ===
                    date.format('YYYY-MM-DD')
                );
            });
            chartData.push({
                name: label,
                correct: dayRecords.filter((r) => r.isCorrect).length,
                incorrect: dayRecords.filter((r) => !r.isCorrect).length,
                total: dayRecords.length,
            });
        }
    }

    return chartData;
}

function localGetStreak() {
    const records = localGetRecords();
    if (records.length === 0) return 0;

    let streak = 0;
    let currentDate = dayjs().startOf('day');

    while (true) {
        const hasRecord = records.some(
            (r) =>
                dayjs(r.timestamp).format('YYYY-MM-DD') ===
                currentDate.format('YYYY-MM-DD')
        );
        if (hasRecord) {
            streak++;
            currentDate = currentDate.subtract(1, 'day');
        } else {
            break;
        }
    }

    return streak;
}

function localGetReviewStates() {
    try {
        const raw = localStorage.getItem(REVIEW_STATES_KEY);
        const states = raw ? JSON.parse(raw) : [];
        return Array.isArray(states) ? states : [];
    } catch {
        return [];
    }
}

function localSaveReviewStates(states) {
    try {
        localStorage.setItem(REVIEW_STATES_KEY, JSON.stringify(states || []));
    } catch {
        // ignore storage quota/parse errors
    }
}

function localGetReviewWords({
    rangeMode,
    from = '',
    to = '',
    week = '',
    month = '',
    group = 'unreviewed',
    words = '',
    limit = 20,
} = {}) {
    const records = localGetRecords();
    const wordFilter = new Set(
        String(words || '')
            .split(',')
            .map((word) => word.trim().toLowerCase())
            .filter(Boolean)
    );
    const scopedRecords = wordFilter.size
        ? records.filter((record) =>
              wordFilter.has(
                  String(record.normalizedWord || record.englishWord || '')
                      .trim()
                      .toLowerCase()
              )
          )
        : records;

    return selectReviewWords({
        records: scopedRecords,
        reviewStates: localGetReviewStates(),
        group,
        params: { rangeMode, from, to, week, month },
        limit,
    });
}

function localGetReviewWordCounts({
    rangeMode,
    from = '',
    to = '',
    week = '',
    month = '',
    words = '',
} = {}) {
    const records = localGetRecords();
    const wordFilter = new Set(
        String(words || '')
            .split(',')
            .map((word) => word.trim().toLowerCase())
            .filter(Boolean)
    );
    const scopedRecords = wordFilter.size
        ? records.filter((record) =>
              wordFilter.has(
                  String(record.normalizedWord || record.englishWord || '')
                      .trim()
                      .toLowerCase()
              )
          )
        : records;

    return countReviewWords({
        records: scopedRecords,
        reviewStates: localGetReviewStates(),
        params: { rangeMode, from, to, week, month },
    });
}

function localSaveReviewSession(session) {
    try {
        const raw = localStorage.getItem(REVIEW_SESSIONS_KEY);
        const sessions = raw ? JSON.parse(raw) : [];
        const id =
            session.sessionId ||
            Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const nextSession = {
            id,
            ...session,
            timestamp: dayjs().toISOString(),
        };
        const index = sessions.findIndex((item) => item.id === id);
        if (index >= 0) sessions[index] = nextSession;
        else sessions.unshift(nextSession);
        localStorage.setItem(
            REVIEW_SESSIONS_KEY,
            JSON.stringify(sessions.slice(0, 50))
        );
        if (index < 0) {
            localSaveReviewStates(
                applyReviewStates(
                    localGetReviewStates(),
                    nextSession.words || [],
                    nextSession.timestamp
                )
            );
        }
        return nextSession;
    } catch {
        return null;
    }
}
function localGetLastReviewSession() {
    try {
        const raw = localStorage.getItem(REVIEW_SESSIONS_KEY);
        const sessions = raw ? JSON.parse(raw) : [];
        return sessions.length > 1 ? sessions[1] : null;
    } catch {
        return null;
    }
}

// ============================================================
// DUAL-MODE PUBLIC API
// Each function checks isLoggedIn() and routes accordingly.
// When logged in, functions are async (return Promises).
// When not logged in, they return sync values (backward compatible).
// ============================================================

/**
 * Save a vocabulary test record
 * @returns {Object|Promise<Object>}
 */
export function saveRecord(record) {
    if (isLoggedIn()) {
        return recordsApi.create(record);
    }
    return localSaveRecord(record);
}

/**
 * Lookup vocabulary enrichment if the user is logged in.
 * Guests continue with the local/offline flow.
 * @returns {object|Promise<object>|null}
 */
export function lookupRecordEnrichment(englishWord) {
    if (isLoggedIn()) {
        return recordsApi.lookupEnrichment(englishWord);
    }

    return null;
}

/**
 * Get all records
 * @returns {Array|Promise<Array>}
 */
export function getRecords(data) {
    if (isLoggedIn()) {
        return recordsApi.getAll(data);
    }
    return localGetRecords();
}

/**
 * Delete a single record by id
 * @returns {Array|Promise<void>}
 */
export function deleteRecord(id) {
    if (isLoggedIn()) {
        return recordsApi.delete(id);
    }
    return localDeleteRecord(id);
}

/**
 * Clear all records
 */
export function clearAllRecords() {
    if (isLoggedIn()) {
        return recordsApi.deleteAll();
    }
    return localClearAllRecords();
}

/**
 * Get stats for a date range
 * @returns {Object|Promise<Object>}
 */
export function getStats(period = 'week') {
    if (isLoggedIn()) {
        return recordsApi.getStats(period);
    }
    return localGetStats(period);
}

/**
 * Get chart data grouped by date
 * @returns {Array|Promise<Array>}
 */
export function getChartData(period = 'week') {
    if (isLoggedIn()) {
        return recordsApi.getChartData(period);
    }
    return localGetChartData(period);
}

/**
 * Get current streak
 * @returns {number|Promise<number>}
 */
export function getStreak() {
    if (isLoggedIn()) {
        return recordsApi.getStreak();
    }
    return localGetStreak();
}

/**
 * Get words for review
 * @returns {Array|Promise<Array>}
 */
export function getReviewWords(params = {}) {
    const {
        rangeMode,
        from = '',
        to = '',
        week = '',
        month = '',
        group = 'unreviewed',
        words = '',
        limit = 20,
    } = params;

    if (isLoggedIn()) {
        return recordsApi.getReviewWords({
            rangeMode,
            from,
            to,
            week,
            month,
            group,
            words,
            limit,
        });
    }
    return localGetReviewWords({
        rangeMode,
        from,
        to,
        week,
        month,
        group,
        words,
        limit,
    });
}

/**
 * Count available review words for each filter
 * @returns {Object|Promise<Object>}
 */
export function getReviewWordCounts(params = {}) {
    const { rangeMode, from = '', to = '', week = '', month = '', words = '' } = params;

    if (isLoggedIn()) {
        return recordsApi.getReviewCounts({
            rangeMode,
            from,
            to,
            week,
            month,
            words,
        });
    }
    return localGetReviewWordCounts({ rangeMode, from, to, week, month, words });
}

/**
 * Save a review session result
 * @returns {Object|Promise<Object>}
 */
export function saveReviewSession(session) {
    if (isLoggedIn()) {
        return reviewsApi.save(session);
    }
    return localSaveReviewSession(session);
}

/**
 * Get the last review session for comparison
 * @returns {Object|null|Promise<Object|null>}
 */
export function getLastReviewSession() {
    if (isLoggedIn()) {
        return reviewsApi.getLast();
    }
    return localGetLastReviewSession();
}
