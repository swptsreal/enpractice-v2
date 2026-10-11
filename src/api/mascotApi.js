import axiosClient from './axiosClient'

export const mascotApi = {
    getMascotData: () => {
        return axiosClient.get('/user/mascot')
    }
}
