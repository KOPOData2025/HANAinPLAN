import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://hanainplan.kro.kr/api/';

const axiosRequestConfig = {
  baseURL: BASE_URL,
  withCredentials: false
};

export const axiosInstance = axios.create(axiosRequestConfig);

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    return Promise.reject(error);
  }
);