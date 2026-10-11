import { axiosClient } from './index';

/**
 * Leaderboard & XP API
 */
export const leaderboardApi = {
    /**
     * Lấy bảng xếp hạng
     * @param {{ period?: string, scope?: string, targetBand?: number, page?: number, size?: number }} params
     */
    getLeaderboard(params = {}) {
        return axiosClient.get('/leaderboard', { params });
    },

    /**
     * Lấy summary cho dashboard widget (top 3 + my rank)
     */
    getSummary() {
        return axiosClient.get('/leaderboard/summary');
    },

    /**
     * Lấy lịch sử XP cá nhân
     * @param {{ page?: number, size?: number }} params
     */
    getXpHistory(params = {}) {
        return axiosClient.get('/xp/history', { params });
    },
};
