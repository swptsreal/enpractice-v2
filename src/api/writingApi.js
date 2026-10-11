import axiosClient from './axiosClient';

/**
 * Writing API — Tasks & Submissions (user-facing)
 */
export const writingApi = {
    /**
     * List published writing tasks
     * @param {{ taskType?: string, difficulty?: string, page?: number, size?: number }} params
     */
    getTasks(params = {}) {
        return axiosClient.get('/writing/tasks', { params });
    },

    /**
     * Get writing task detail
     * @param {string} taskId
     */
    getTaskById(taskId) {
        return axiosClient.get(`/writing/tasks/${taskId}`);
    },

    getHighestScores(taskIds = []) {
        return axiosClient.post('/writing/tasks/highest-scores', {
            taskIds,
        });
    },

    /**
     * Submit an essay for AI grading
     * @param {string} taskId
     * @param {{ essayContent: string, timeSpentSeconds?: number }} payload
     */
    submitEssay(taskId, payload) {
        return axiosClient.post(`/writing/tasks/${taskId}/submit`, payload);
    },

    /**
     * Get submission history
     * @param {{ page?: number, size?: number }} params
     */
    getSubmissions(params = {}) {
        return axiosClient.get('/writing/submissions', { params });
    },

    /**
     * Get submission detail with grading status/results
     * @param {string} submissionId
     */
    getSubmissionById(submissionId) {
        return axiosClient.get(`/writing/submissions/${submissionId}`);
    },

    getCompletionSnapshot(submissionId) {
        return axiosClient.get(
            `/user/results/writing/${submissionId}/completion-snapshot`
        );
    },
};
