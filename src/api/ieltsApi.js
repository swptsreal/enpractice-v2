import axiosClient from './axiosClient';

/**
 * IELTS API — Tests & Attempts
 */
export const ieltsApi = {
    /**
     * Danh sách bài thi
     * @param {{ skill?: string, difficulty?: string, page?: number, size?: number }} params
     */
    getTests(params = {}) {
        return axiosClient.get('/ielts/tests', { params });
    },

    /**
     * Chi tiết bài thi (nested: sections → passages → questions)
     * @param {string} testId
     */
    getTestById(testId) {
        return axiosClient.get(`/ielts/tests/${testId}`);
    },

    /**
     * Lấy lựa chọn bắt đầu bài (full / section / passage)
     * @param {string} testId
     */
    getPracticeOptions(testId) {
        return axiosClient.get(`/ielts/tests/${testId}/practice-options`);
    },

    /**
     * Bắt đầu session IELTS theo scope
     * @param {{
     *   testId?: string,
     *   attemptMode: 'FULL'|'QUICK',
     *   scopeType: 'TEST'|'SECTION'|'PASSAGE'|'QUESTION_TYPE',
     *   scopeId?: string,
     *   questionType?: string,
     *   sourceRecommendationKey?: string,
     *   sourceSurface?: string
     * }} payload
     *
     * `QUESTION_TYPE` là scope của learning path: bài luyện chỉ gồm các câu thuộc MỘT dạng
     * (ví dụ MATCHING_HEADINGS), chọn từ các đề đã publish. Nó không cần `testId` lẫn `scopeId`
     * — dạng câu hỏi tự nó là định danh — nên payload chỉ gửi trường nào thực sự có.
     */
    startSession(payload) {
        return axiosClient.post('/ielts/sessions/start', payload);
    },

    /**
     * Bắt đầu full test theo flow cũ
     * @param {string} testId
     */
    startTest(testId) {
        return this.startSession({
            testId,
            attemptMode: 'FULL',
            scopeType: 'TEST',
            scopeId: testId,
        });
    },

    /**
     * Lấy trạng thái đã làm/chưa làm và điểm cao nhất theo danh sách test
     * @param {string[]} testIds
     */
    getHighestScores(testIds = []) {
        return axiosClient.post('/ielts/tests/highest-scores', { testIds });
    },

    /**
     * Nộp bài
     * @param {string} attemptId
     * @param {{ answers: Array<{questionId: string, userAnswer: string[]}>, timeSpentSeconds: number }} payload
     */
    submitAttempt(attemptId, payload) {
        return axiosClient.post(`/ielts/sessions/${attemptId}/submit`, payload);
    },

    /**
     * Lịch sử làm bài
     * @param {{ page?: number, size?: number }} params
     */
    getAttempts(params = {}) {
        return axiosClient.get('/ielts/attempts', { params });
    },

    /**
     * Chi tiết lần làm bài (có results + correctAnswer)
     * @param {string} attemptId
     */
    getAttemptById(attemptId) {
        return axiosClient.get(`/ielts/attempts/${attemptId}`);
    },

    /**
     * Lấy transcript listening cho màn result/review
     * @param {string} attemptId
     */
    getListeningTranscript(attemptId) {
        return axiosClient.get(
            `/ielts/attempts/${attemptId}/listening-transcript`
        );
    },

    /**
     * Lấy session đang làm hoặc resume payload
     * @param {string} attemptId
     */
    getSession(attemptId) {
        return axiosClient.get(`/ielts/sessions/${attemptId}`);
    },

    getCompletionSnapshot(attemptId) {
        return axiosClient.get(
            `/user/results/ielts/${attemptId}/completion-snapshot`
        );
    },
};
