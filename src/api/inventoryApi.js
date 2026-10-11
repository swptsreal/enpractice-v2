import axiosClient from './axiosClient';

export const inventoryApi = {
    getMine(params = {}) {
        return axiosClient.get('/user/inventory', { params });
    },

    equip(userInventoryItemId) {
        return axiosClient.post(`/user/inventory/${userInventoryItemId}/equip`);
    },

    useItem(userInventoryItemId) {
        return axiosClient.post(`/user/inventory/${userInventoryItemId}/use`);
    },

    unequip(type) {
        return axiosClient.delete(`/user/inventory/equipped/${type}`);
    },

    getEquippedItems(userId) {
        return axiosClient.get(`/users/${userId}/equipped-items`);
    },

    getEquippedItemsByUserIds(userIds) {
        return axiosClient.post('/users/equipped-items/batch', { userIds });
    },
};

export default inventoryApi;
