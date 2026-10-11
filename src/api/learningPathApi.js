import axiosClient from './axiosClient';

export const learningPathApi = {
    /**
     * The whole screen in one request: goal, position, the current unit and its nodes.
     *
     * One endpoint rather than three because the page shows all of it at once, and because the
     * states and the ordering are computed together on the server — splitting them would mean
     * sending the ordering rule to the client.
     */
    getPath() {
        return axiosClient.get('/learning-path');
    },
};

export default learningPathApi;
