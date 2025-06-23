// src/utils/axiosConfig.ts
import axios from "axios";

const instance = axios.create({
  baseURL: "http://ec2-13-61-21-156.eu-north-1.compute.amazonaws.com:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    console.log('Axios Request:', config.url, config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => {
    console.log('Axios Response:', response.status, response.headers['set-cookie']);
    return response;
  },
  (error) => {
    console.error('Axios Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default instance;