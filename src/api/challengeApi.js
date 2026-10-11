import axiosClient from './axiosClient';

export const challengeApi = {
    getCurrentWeekly() {
        return axiosClient.get('/user/challenges/weekly/current');
    },
};

export default challengeApi;
