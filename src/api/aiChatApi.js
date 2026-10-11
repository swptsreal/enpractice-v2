import axiosClient from './axiosClient';
import { buildAiChatHistoryParams } from './aiChatHistoryParams';

export const aiChatApi = {
    getMessages(options = {}) {
        return axiosClient.get('/ai-chat/messages', {
            params: buildAiChatHistoryParams(options),
        });
    },
};

export default aiChatApi;
