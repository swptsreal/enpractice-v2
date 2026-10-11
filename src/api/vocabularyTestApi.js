import axiosClient from './axiosClient';

export const vocabularyTestApi = {
    generateTest(payload) {
        return axiosClient.post('/vocabulary-tests/generate', payload);
    },

    getTests(params = {}) {
        return axiosClient.get('/vocabulary-tests', { params });
    },

    getTestDetail(testId) {
        return axiosClient.get(`/vocabulary-tests/${testId}`);
    },

    startTest(testId) {
        return axiosClient.post(`/vocabulary-tests/${testId}/start`);
    },

    submitAttempt(attemptId, payload) {
        return axiosClient.post(
            `/vocabulary-tests/attempts/${attemptId}/submit`,
            payload
        );
    },

    getAttempts(params = {}) {
        return axiosClient.get('/vocabulary-tests/attempts', { params });
    },

    getAttemptDetail(attemptId) {
        return axiosClient.get(`/vocabulary-tests/attempts/${attemptId}`);
    },
};

