import axiosClient from './axiosClient';

export const notificationApi = {
    getNotifications(params = {}) {
        return axiosClient.get('/notifications', { params });
    },
    getUnreadCount() {
        return axiosClient.get('/notifications/unread-count');
    },
    markAsRead(id) {
        return axiosClient.patch(`/notifications/${id}/read`);
    },
    markAllAsRead() {
        return axiosClient.patch('/notifications/read-all');
    },
    deleteNotification(id) {
        return axiosClient.delete(`/notifications/${id}`);
    },
    getPreferences() {
        return axiosClient.get('/notification-preferences');
    },
    updatePreferences(payload) {
        return axiosClient.put('/notification-preferences', payload);
    },
};

export default notificationApi;
