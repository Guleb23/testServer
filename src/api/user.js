import axios from './axios'


export const updateUser = (id, data, token) => {
    return axios.put(`/user/update/${id}`, data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};