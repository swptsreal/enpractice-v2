import axiosClient from './axiosClient';

const weeklyReportApi = {
    getCurrent() {
        return axiosClient.get('/user/reports/weekly/current');
    },
    getHistory({ page = 0, size = 12 } = {}) {
        return axiosClient.get('/user/reports/weekly/history', {
            params: { page, size },
        });
    },
    getHistoryDetail(weekStart) {
        return axiosClient.get(
            `/user/reports/weekly/history/${encodeURIComponent(weekStart)}`
        );
    },
};

export default weeklyReportApi;
