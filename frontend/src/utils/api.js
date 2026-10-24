import axios from "axios";

export const FILE_URL = import.meta.env.VITE_FILE_URL || "https://api.kingcreativestudio.my.id/cakau-id";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "https://api.kingcreativestudio.my.id/cakau-id/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLogin = err.config?.url?.includes("/auth/login");
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
