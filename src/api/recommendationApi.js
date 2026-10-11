import axiosClient from './axiosClient';

export const recommendationApi = {
    getPrimary(surface = 'HOME') {
        return axiosClient.get('/user/recommendations/primary', {
            params: { surface },
        });
    },

    getFeed(surface = 'HOME') {
        return axiosClient.get('/user/recommendations/feed', {
            params: { surface },
        });
    },

    submitFeedback(recommendationKey, payload) {
        return axiosClient.post(
            `/user/recommendations/${recommendationKey}/feedback`,
            payload
        );
    },
};

export default recommendationApi;
