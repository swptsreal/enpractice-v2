import axiosClient from './axiosClient';

/**
 * Auth API — Đăng nhập, Đăng ký, Lấy thông tin user
 */

export const authApi = {
    /**
     * Đăng ký tài khoản mới
     * @param {{ email: string, password: string, displayName: string }} data
     * @returns {Promise<{ accessToken: string, refreshToken: string, accessTokenExpiresAt: string, refreshTokenExpiresAt: string, user: object }>}
     */
    register(data) {
        return axiosClient.post('/auth/register', data, {
            skipAuthRefresh: true,
        });
    },

    /**
     * Đăng nhập
     * @param {{ email: string, password: string }} data
     * @returns {Promise<{ accessToken: string, refreshToken: string, accessTokenExpiresAt: string, refreshTokenExpiresAt: string, user: object }>}
     */
    login(data) {
        return axiosClient.post('/auth/login', data, {
            skipAuthRefresh: true,
        });
    },

    refresh(data) {
        return axiosClient.post('/auth/refresh', data, {
            skipAuthRefresh: true,
        });
    },

    logout(refreshToken) {
        return axiosClient.post(
            '/auth/logout',
            { refreshToken },
            { skipAuthRefresh: true }
        );
    },

    logoutAll() {
        return axiosClient.post('/auth/logout-all', {});
    },

    /**
     * Lấy thông tin user hiện tại (cần JWT)
     * @returns {Promise<{ id: string, email: string, displayName: string }>}
     */
    getMe() {
        return axiosClient.get('/auth/me');
    },

    /**
     * Lưu FCM token để nhận push notification
     * @param {string} fcmToken
     * @param {string} os
     * @param {string} browser
     * @returns {Promise<void>}
     */
    saveFcmToken(fcmToken, os, browser) {
        return axiosClient.post('/auth/fcm-token', { fcmToken, os, browser });
    },
};
