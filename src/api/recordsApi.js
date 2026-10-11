import axiosClient from './axiosClient';

/**
 * Records API — CRUD vocabulary records, stats, chart, review words
 */

export const recordsApi = {
    /**
     * Lấy tất cả records
     * @returns {Promise<Array>}
     */
    getAll(data) {
        return axiosClient.post('/records/search', data);
    },

    /**
     * Lookup existing enrichment snapshot for a word/phrase
     * @param {string} englishWord
     * @returns {Promise<object>}
     */
    lookupEnrichment(englishWord) {
        return axiosClient.post('/records/enrichment', { englishWord });
    },

    /**
     * Tạo record mới
     * @param {object} data
     * @returns {Promise<object>}
     */
    create(data) {
        return axiosClient.post('/records', data);
    },

    /**
     * Xóa 1 record
     * @param {string} id
     * @returns {Promise<void>}
     */
    delete(id) {
        return axiosClient.delete(`/records/${id}`);
    },

    /**
     * Xóa tất cả records
     * @returns {Promise<void>}
     */
    deleteAll() {
        return axiosClient.delete('/records');
    },

    /**
     * Import batch từ localStorage
     * @param {{ records: Array, reviewSessions: Array }} data
     * @returns {Promise<{ importedRecords: number, importedSessions: number }>}
     */
    importData(data) {
        return axiosClient.post('/records/import', data);
    },

    /**
     * Lấy thống kê theo khoảng thời gian
     * @param {'day'|'week'|'month'} period
     * @returns {Promise<object>}
     */
    getStats(period = 'week') {
        return axiosClient.get('/records/stats', { params: { period } });
    },

    /**
     * Lấy dữ liệu biểu đồ
     * @param {'day'|'week'|'month'} period
     * @returns {Promise<Array>}
     */
    getChartData(period = 'week') {
        return axiosClient.get('/records/chart', { params: { period } });
    },

    /**
     * Lấy streak (chuỗi ngày liên tục)
     * @returns {Promise<number>}
     */
    getStreak() {
        return axiosClient.get('/records/streak');
    },

    /**
     * Lấy từ để ôn tập theo khoảng thời gian + nhóm từ
     * @param {{rangeMode?: string, from?: string, to?: string, week?: string, month?: string, group?: string, limit?: number, words?: string}} params
     * @returns {Promise<Array>}
     */
    getReviewWords({
        rangeMode = 'range',
        from = '',
        to = '',
        week = '',
        month = '',
        group = 'unreviewed',
        words = '',
        limit = 20,
    } = {}) {
        return axiosClient.get('/records/review-words', {
            params: { rangeMode, from, to, week, month, group, words, limit },
        });
    },

    /**
     * Đếm từ khả dụng cho từng nhóm trong khoảng đã chọn
     * @returns {Promise<{unreviewed: number, wrong: number, all: number}>}
     */
    getReviewCounts({
        rangeMode = 'range',
        from = '',
        to = '',
        week = '',
        month = '',
        words = '',
    } = {}) {
        return axiosClient.get('/records/review-counts', {
            params: { rangeMode, from, to, week, month, words },
        });
    },
};
