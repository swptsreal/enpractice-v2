import axiosClient from './axiosClient';

/**
 * Reviews API — Lưu và lấy phiên ôn tập
 */

export const reviewsApi = {
    /**
     * Lưu kết quả phiên ôn tập
     * @param {{ sessionId, startedAt, durationSeconds, filter, total, correct, incorrect, accuracy, words }} data
     * @returns {Promise<object>}
     */
    save(data) {
        return axiosClient.post('/reviews', data);
    },

    /**
     * Lấy phiên review ngay trước (để so sánh)
     * @returns {Promise<object|null>}
     */
    getLast() {
        return axiosClient.get('/reviews/last');
    },
};
