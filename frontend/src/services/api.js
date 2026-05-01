import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  timeout: 10000,
});

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired – clear storage and redirect
      localStorage.removeItem("token");
      delete api.defaults.headers.common.Authorization;
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
