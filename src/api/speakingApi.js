import axiosClient from './axiosClient';

/**
 * Speaking API — Topics & Attempts (user-facing)
 */
export const speakingApi = {
    getTopics(params = {}) {
        return axiosClient.get('/speaking/topics', { params });
    },

    getTopicById(topicId) {
        return axiosClient.get(`/speaking/topics/${topicId}`);
    },

    getHighestScores(topicIds = []) {
        return axiosClient.post('/speaking/topics/highest-scores', {
            topicIds,
        });
    },

    submitAttempt(topicId, payload) {
        return axiosClient.post(`/speaking/topics/${topicId}/submit`, payload);
    },

    getAttempts(params = {}) {
        return axiosClient.get('/speaking/attempts', { params });
    },

    getAttemptById(attemptId) {
        return axiosClient.get(`/speaking/attempts/${attemptId}`);
    },

    getCompletionSnapshot(attemptId) {
        return axiosClient.get(
            `/user/results/speaking/${attemptId}/completion-snapshot`
        );
    },

    uploadAudio(file) {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/speaking/upload-audio', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // === Conversation endpoints ===

    startConversation(topicId) {
        return axiosClient.post(
            `/speaking/conversations/start?topicId=${topicId}`
        );
    },

    submitTurn(conversationId, payload) {
        return axiosClient.post(
            `/speaking/conversations/${conversationId}/turn`,
            payload
        );
    },

    getConversation(conversationId) {
        return axiosClient.get(`/speaking/conversations/${conversationId}`);
    },

    getConversations(params = {}) {
        return axiosClient.get('/speaking/conversations', { params });
    },

    // === Custom conversation endpoints ===

    startCustomConversation(payload) {
        return axiosClient.post(
            '/custom-speaking-conversations/start',
            payload
        );
    },

    submitCustomConversationTurn(conversationId, payload) {
        return axiosClient.post(
            `/custom-speaking-conversations/${conversationId}/turn`,
            payload
        );
    },

    finishCustomConversation(conversationId) {
        return axiosClient.post(
            `/custom-speaking-conversations/${conversationId}/finish`
        );
    },

    getCustomConversation(conversationId) {
        return axiosClient.get(
            `/custom-speaking-conversations/${conversationId}`
        );
    },

    getCustomConversationCompletionSnapshot(conversationId) {
        return axiosClient.get(
            `/user/results/custom-conversations/${conversationId}/completion-snapshot`
        );
    },

    getCustomConversations(params = {}) {
        return axiosClient.get('/custom-speaking-conversations', { params });
    },

    // === Custom conversation templates ===

    getCustomSpeakingTemplates() {
        return axiosClient.get('/custom-speaking-templates');
    },

    getCustomSpeakingTemplate(templateId) {
        return axiosClient.get(`/custom-speaking-templates/${templateId}`);
    },

    createCustomSpeakingTemplate(payload) {
        return axiosClient.post('/custom-speaking-templates', payload);
    },

    deleteCustomSpeakingTemplate(templateId) {
        return axiosClient.delete(`/custom-speaking-templates/${templateId}`);
    },
};
