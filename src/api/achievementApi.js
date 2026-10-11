import axiosClient from './axiosClient';

export const achievementApi = {
    getAchievements() {
        return axiosClient.get('/user/achievements');
    },
};

export default achievementApi;
