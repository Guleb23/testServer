import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://guleb23-ordersusersapi-ff19.twc1.net/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;