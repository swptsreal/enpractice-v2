import axiosClient from './axiosClient.js';

export const GUEST_SESSION_PATH = '/guest/sessions';
export const GUEST_SESSION_REQUEST_CONFIG = Object.freeze({
    skipAuthRefresh: true,
    skipAuthHeader: true,
    skipDebugLog: true,
});

export const guestSessionApi = {
    createSession() {
        return axiosClient.post(
            GUEST_SESSION_PATH,
            undefined,
            GUEST_SESSION_REQUEST_CONFIG
        );
    },
};
