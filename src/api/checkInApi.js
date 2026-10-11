import axiosClient from './axiosClient';

export const checkInApi = {
    getStatus() {
        return axiosClient.get('/user/check-in/status');
    },

    claimToday() {
        return axiosClient.post('/user/check-in/today');
    },
};

export default checkInApi;
