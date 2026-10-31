import axiosClient from "./axiosClient";

/**
 * Auth API — Đăng nhập, Đăng ký, Lấy thông tin user
 */

export const authApi = {
    /**
     * Đăng ký tài khoản mới
     *
     * Backend KHÔNG mở phiên khi đăng ký: nó gửi mail xác thực và trả
     * `{ email, verificationRequired, resendAvailableAt }`.
     *
     * @param {{ email: string, password: string, displayName: string }} data
     * @returns {Promise<{ email: string, verificationRequired: boolean, resendAvailableAt: string }>}
     */
    register(data) {
        return axiosClient.post("/auth/register", data, {
            skipAuthRefresh: true,
        });
    },

    /**
     * Xác thực email bằng token trong mail; đây mới là lúc backend mở phiên.
     * @param {{ token: string }} data
     */
    verifyEmail(data) {
        return axiosClient.post("/auth/verify-email", data, {
            skipAuthRefresh: true,
        });
    },

    /**
     * Gửi lại mail xác thực. Backend chặn 30s giữa hai lần gửi (429 kèm
     * `retryAfterSeconds`).
     * @param {{ email: string }} data
     */
    resendVerification(data) {
        return axiosClient.post("/auth/resend-verification", data, {
            skipAuthRefresh: true,
        });
    },

    /**
     * Đăng nhập
     * @param {{ email: string, password: string }} data
     * @returns {Promise<{ accessToken: string, refreshToken: string, accessTokenExpiresAt: string, refreshTokenExpiresAt: string, user: object }>}
     */
    login(data) {
        return axiosClient.post("/auth/login", data, {
            skipAuthRefresh: true,
        });
    },

    refresh(data) {
        return axiosClient.post("/auth/refresh", data, {
            skipAuthRefresh: true,
        });
    },

    logout(refreshToken) {
        return axiosClient.post(
            "/auth/logout",
            { refreshToken },
            { skipAuthRefresh: true },
        );
    },

    logoutAll() {
        return axiosClient.post("/auth/logout-all", {});
    },

    /**
     * Lấy thông tin user hiện tại (cần JWT)
     * @returns {Promise<{ id: string, email: string, displayName: string }>}
     */
    getMe() {
        return axiosClient.get("/auth/me");
    },

    /**
     * Lưu FCM token để nhận push notification
     * @param {string} fcmToken
     * @param {string} os
     * @param {string} browser
     * @returns {Promise<void>}
     */
    saveFcmToken(fcmToken, os, browser) {
        return axiosClient.post("/auth/fcm-token", { fcmToken, os, browser });
    },

    /**
     * Xác thực email bằng token trong mail. Trả về session — người vừa bấm link không phải đăng
     * nhập lại.
     * @param {{ token: string }} data
     * @returns {Promise<object>} AuthResponse
     */
    verifyEmail(data) {
        return axiosClient.post("/auth/verify-email", data, {
            skipAuthRefresh: true,
        });
    },

    /**
     * Gửi lại mail xác thực. Luôn trả 200 với cùng một câu, kể cả khi email không tồn tại.
     * @param {{ email: string }} data
     */
    resendVerification(data) {
        return axiosClient.post("/auth/resend-verification", data, {
            skipAuthRefresh: true,
        });
    },

    /**
     * Yêu cầu link đặt lại mật khẩu. Luôn trả 200 với cùng một câu.
     * @param {{ email: string }} data
     */
    forgotPassword(data) {
        return axiosClient.post("/auth/forgot-password", data, {
            skipAuthRefresh: true,
        });
    },

    /**
     * Đặt mật khẩu mới bằng token trong mail. Backend revoke mọi phiên đăng nhập.
     * @param {{ token: string, newPassword: string }} data
     */
    resetPassword(data) {
        return axiosClient.post("/auth/reset-password", data, {
            skipAuthRefresh: true,
        });
    },

    /**
     * Đổi mật khẩu khi đã đăng nhập. Trả về session MỚI (các phiên cũ đã bị revoke), nên caller
     * phải ghi đè session hiện tại.
     * @param {{ currentPassword: string, newPassword: string }} data
     * @returns {Promise<object>} AuthResponse
     */
    changePassword(data) {
        return axiosClient.post("/auth/change-password", data);
    },
};
