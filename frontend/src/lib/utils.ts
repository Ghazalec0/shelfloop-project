import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

function getAccessToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
  if (!token || token === "undefined" || token === "null") return null;
  return token;
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("refreshToken") || localStorage.getItem("refresh_token");
  if (!token || token === "undefined" || token === "null") return null;
  return token;
}

function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject: (err: any) => reject(err),
        });
      });
    }
    originalRequest._retry = true;
    isRefreshing = true;
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token");
      }
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/refresh`,
        { refreshToken }
      );
      const payload = data?.data ?? data;
      const newAccessToken = payload?.accessToken || payload?.access_token;
      const newRefreshToken = payload?.refreshToken || payload?.refresh_token;
      if (!newAccessToken || !newRefreshToken) {
        throw new Error("Invalid refresh response");
      }
      saveTokens(newAccessToken, newRefreshToken);
      if (payload?.user) {
        localStorage.setItem("user", JSON.stringify(payload.user));
      }
      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { saveTokens, clearTokens, getAccessToken, getRefreshToken };
