import axios from "axios";

const api = axios.create({
  baseURL: "https://spedilo-main.onrender.com", // backend
  withCredentials: false, // using Bearer tokens instead of cookies
});

// Request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log("API Request:", config.method?.toUpperCase(), config.url);
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If no token, don't loop redirects
      const token = localStorage.getItem("token");
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === "/login" || currentPath === "/register";
      if (!token || isAuthPage) {
        return Promise.reject(error);
      }
      // Session expired or invalid
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
