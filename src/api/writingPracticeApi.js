import axiosClient from './axiosClient';

export const writingPracticeApi = {
    getSets(params = {}) {
        return axiosClient.get('/writing-practice/sets', { params });
    },

    getSetById(id) {
        return axiosClient.get(`/writing-practice/sets/${id}`);
    },

    startOrResumeAttempt(id, payload) {
        return axiosClient.post(`/writing-practice/sets/${id}/attempts`, payload);
    },

    getAttemptById(attemptId) {
        return axiosClient.get(`/writing-practice/attempts/${attemptId}`);
    },

    getAttemptSubmissions(attemptId) {
        return axiosClient.get(
            `/writing-practice/attempts/${attemptId}/submissions`
        );
    },

    getAttemptHistory(params = {}) {
        return axiosClient.get('/writing-practice/attempts', { params });
    },

    submitSentence(attemptId, sentenceId, payload) {
        return axiosClient.post(
            `/writing-practice/attempts/${attemptId}/sentences/${sentenceId}/submit`,
            payload
        );
    },

    skipSentence(attemptId, sentenceId) {
        return axiosClient.post(
            `/writing-practice/attempts/${attemptId}/sentences/${sentenceId}/skip`
        );
    },
};
