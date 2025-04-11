import axios from "./axios";

export const registerUser = (data) => {
    return axios.post("/user/register", data);
};