import axiosClient from './axiosClient';

export const profileApi = {
    getSummary() {
        return axiosClient.get('/user/profile/summary');
    },

    getProfile() {
        return axiosClient.get('/user/profile');
    },

    updateProfile(payload) {
        return axiosClient.put('/user/profile', payload);
    },

    /**
     * Kết thúc onboarding: câu trả lời khảo sát + trạng thái COMPLETED/SKIPPED trong một
     * request. Không có endpoint "bắt đầu lại" — đọc `onboarding.required` từ
     * `GET /user/profile` là đủ để biết có nên mở màn onboarding hay không.
     */
    submitOnboarding(payload) {
        return axiosClient.put('/user/profile/onboarding', payload);
    },

    uploadAvatar(file) {
        const formData = new FormData();
        formData.append('file', file);

        return axiosClient.post('/files/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default profileApi;
