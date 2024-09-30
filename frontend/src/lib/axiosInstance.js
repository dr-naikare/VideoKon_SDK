import axios from 'axios';
import { getCookie, setCookie } from './cookie'; // Adjust the path as needed

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api/auth/',
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    config => {
        const token = getCookie('accesstoken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = getCookie('refreshToken');
            try {
                const response = await axios.post('http://localhost:5000/api/auth/refresh-token', { token: refreshToken });
                if (response.status === 200) {
                    setCookie('accesstoken', response.data.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                    return axiosInstance(originalRequest);
                }
            } catch (err) {
                console.error('Failed to refresh token:', err);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;