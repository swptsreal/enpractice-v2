import axiosClient from './axiosClient';

export const xpMilestoneApi = {
    getAll() {
        return axiosClient.get('/user/xp-milestones');
    },

    claim(code) {
        return axiosClient.post(`/user/xp-milestones/${code}/claim`);
    },
};

export default xpMilestoneApi;
