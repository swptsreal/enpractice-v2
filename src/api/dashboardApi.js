import axiosClient from './axiosClient';

export const dashboardApi = {
    getDashboard() {
        return axiosClient.get('/user/dashboard');
    },

    getContinueLearning() {
        return axiosClient.get('/user/dashboard/continue-learning');
    },

    getDailyLearningPlan() {
        return axiosClient.get('/user/dashboard/daily-learning-plan');
    },

    getQuickPractice() {
        return axiosClient.get('/user/dashboard/quick-practice');
    },

    getProgressSnapshot() {
        return axiosClient.get('/user/dashboard/progress-snapshot');
    },

    getReminderBanner() {
        return axiosClient.get('/user/dashboard/reminder-banner');
    },

    getFlagshipRetention() {
        return axiosClient.get('/user/dashboard/flagship-retention');
    },

    getRecentActivities() {
        return axiosClient.get('/user/dashboard/recent-activities');
    },
};
