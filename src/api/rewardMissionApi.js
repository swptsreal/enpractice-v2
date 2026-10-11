import axiosClient from './axiosClient';

export const rewardMissionApi = {
    getMine(params = {}) {
        return axiosClient.get('/user/reward-missions', { params });
    },
};

export default rewardMissionApi;
