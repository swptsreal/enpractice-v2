/**
 * localDictionary.js
 * CRUD helper cho Dictionary khi user chưa đăng nhập.
 * Lưu dữ liệu vào localStorage với key EN_PRACTICE_DICTIONARY_KEY.
 */

const DICT_KEY = 'en_practice_dictionary';

// ─── Spaced Repetition (SM-2 simplified) ──────────────────────────────────────
const SM2_INTERVALS = [1, 3, 7, 14, 30, 90]; // days

function calcNextReview(masteryLevel, performanceScore) {
    // tăng/giảm mastery dựa vào điểm (0-5)
    let newMastery = masteryLevel;
    if (performanceScore >= 4) {
        newMastery = Math.min(5, masteryLevel + 1);
    } else if (performanceScore <= 1) {
        newMastery = Math.max(0, masteryLevel - 1);
    }
    const days = SM2_INTERVALS[newMastery] ?? 1;
    const next = new Date();
    next.setDate(next.getDate() + days);
    return { newMastery, nextReviewDate: next.toISOString() };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
function loadAll() {
    try {
        const raw = localStorage.getItem(DICT_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveAll(words) {
    localStorage.setItem(DICT_KEY, JSON.stringify(words));
}

function generateId() {
    return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Lấy tất cả từ (raw).
 */
export function getAll() {
    return loadAll();
}

/**
 * searchWords — tương đương API GET /dictionary?keyword&wordType&isFavorite&page&size
 * Trả về { content, totalElements, page, size } giống page object từ BE.
 */
export function searchWords({ keyword = '', wordType = null, isFavorite = null, page = 0, size = 12 } = {}) {
    let words = loadAll();

    if (keyword) {
        const kw = keyword.toLowerCase();
        words = words.filter(
            (w) =>
                w.word?.toLowerCase().includes(kw) ||
                w.meaning?.toLowerCase().includes(kw)
        );
    }
    if (wordType) {
        words = words.filter((w) => w.wordType?.toLowerCase() === wordType.toLowerCase());
    }
    if (isFavorite !== null && isFavorite !== undefined) {
        words = words.filter((w) => w.isFavorite === isFavorite);
    }

    // Sort newest first
    words = [...words].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalElements = words.length;
    const content = words.slice(page * size, page * size + size);

    return { content, totalElements, page, size, totalPages: Math.ceil(totalElements / size) };
}

/**
 * getStats — tương đương API GET /dictionary/stats
 */
export function getStats() {
    const words = loadAll();
    const totalWords = words.length;
    const masteredWords = words.filter((w) => (w.masteryLevel ?? 0) >= 4).length;
    const now = new Date();
    const dueReviews = words.filter((w) => {
        if (!w.nextReviewDate) return true; // chưa được thêm review date → đến hạn
        return new Date(w.nextReviewDate) <= now;
    }).length;

    return { totalWords, masteredWords, dueReviews };
}

/**
 * getDueReviews — tương đương API GET /dictionary/due-review?page&size
 */
export function getDueReviews({ page = 0, size = 50, limit = null } = {}) {
    const now = new Date();
    const pageSize =
        Number.isFinite(Number(limit)) && Number(limit) > 0
            ? Number(limit)
            : size;
    let words = loadAll().filter((w) => {
        if (!w.nextReviewDate) return true;
        return new Date(w.nextReviewDate) <= now;
    });

    const totalElements = words.length;
    const content = words.slice(page * pageSize, page * pageSize + pageSize);
    return { content, totalElements };
}

/**
 * addWord — tương đương API POST /dictionary
 */
export function addWord(data) {
    const words = loadAll();
    const now = new Date().toISOString();
    const newWord = {
        id: generateId(),
        masteryLevel: 0,
        nextReviewDate: now, // due immediately on first add
        createdAt: now,
        isFavorite: false,
        ...data,
    };
    words.unshift(newWord);
    saveAll(words);
    return newWord;
}

/**
 * updateWord — tương đương API PUT /dictionary/:id
 */
export function updateWord(id, data) {
    const words = loadAll();
    const idx = words.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error('Word not found');
    words[idx] = { ...words[idx], ...data };
    saveAll(words);
    return words[idx];
}

/**
 * deleteWord — tương đương API DELETE /dictionary/:id
 */
export function deleteWord(id) {
    const words = loadAll().filter((w) => w.id !== id);
    saveAll(words);
}

/**
 * toggleFavorite — tương đương API PATCH /dictionary/:id/favorite
 */
export function toggleFavorite(id) {
    const words = loadAll();
    const idx = words.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error('Word not found');
    words[idx].isFavorite = !words[idx].isFavorite;
    saveAll(words);
    return words[idx];
}

/**
 * reviewWord — tương đương API PATCH /dictionary/:id/review
 */
export function reviewWord(id, performanceScore) {
    const words = loadAll();
    const idx = words.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error('Word not found');
    const { newMastery, nextReviewDate } = calcNextReview(
        words[idx].masteryLevel ?? 0,
        performanceScore
    );
    words[idx].masteryLevel = newMastery;
    words[idx].nextReviewDate = nextReviewDate;
    saveAll(words);
    return words[idx];
}

/**
 * clearAll — xóa toàn bộ (dùng sau khi sync lên DB)
 */
export function clearAll() {
    localStorage.removeItem(DICT_KEY);
}

export const DICT_STORAGE_KEY = DICT_KEY;
