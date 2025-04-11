import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://localhost:7112/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;