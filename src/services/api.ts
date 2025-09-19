import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://spedilo-main.onrender.com",
  withCredentials: true, // Enable cookies
});

// Request interceptor - no need to manually attach token as it's in cookies
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear any local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
