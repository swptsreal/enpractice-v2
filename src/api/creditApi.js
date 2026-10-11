import axiosClient from './axiosClient';

export const creditApi = {
    getBalance: () => axiosClient.get('/credits/balance'),
    getCosts: () => axiosClient.get('/credits/costs'),
    getTransactions: (params = {}) =>
        axiosClient.get('/credits/transactions', { params }),
};
