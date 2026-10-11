import axiosClient from './axiosClient';

const dictionaryApi = {
    // Thêm từ mới
    addWord: (data) => {
        return axiosClient.post('/dictionary', data);
    },

    // Lấy danh sách (hỗ trợ params: keyword, wordType, isFavorite, tag, page, size)
    searchWords: (params) => {
        return axiosClient.get('/dictionary', { params });
    },

    // Lấy thống kê
    getStats: () => {
        return axiosClient.get('/dictionary/stats');
    },

    // Lấy danh sách cần ôn tập hôm nay
    getDueReviews: (params) => {
        return axiosClient.get('/dictionary/due-review', { params });
    },

    // Lấy chi tiết 1 từ
    getWordById: (id) => {
        return axiosClient.get(`/dictionary/${id}`);
    },

    // Cập nhật từ
    updateWord: (id, data) => {
        return axiosClient.put(`/dictionary/${id}`, data);
    },

    // Xóa từ
    deleteWord: (id) => {
        return axiosClient.delete(`/dictionary/${id}`);
    },

    // Đảo trạng thái yêu thích
    toggleFavorite: (id) => {
        return axiosClient.patch(`/dictionary/${id}/favorite`);
    },

    // Cập nhật điểm review (0-5)
    reviewWord: (id, performanceScore) => {
        return axiosClient.patch(`/dictionary/${id}/review`, { performanceScore });
    }
};

export default dictionaryApi;
