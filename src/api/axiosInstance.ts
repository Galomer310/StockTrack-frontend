// src/api/axiosInstance.ts
import axios from "axios";
import store from "../store"; // Import your Redux store
import { clearUser, setUser } from "../features/authSlice";

// Create an Axios instance with a base URL and default headers
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL, // Your backend URL from env variables
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach the current access token to every call. Every
// request through this instance now targets our own backend, so this is safe —
// no third-party host ever receives the token.
axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Which portfolio the user currently has open. Sent on every call so that a
  // buy, a sell or a holdings fetch lands in the right book without each call
  // site having to thread the id through. Requests that do not care simply
  // ignore it; the server checks the portfolio belongs to the caller.
  const { activeId } = store.getState().portfolio;
  if (activeId !== null) {
    config.headers["X-Portfolio-Id"] = String(activeId);
  }

  return config;
});

// Response interceptor: catch 403 errors and try to refresh the token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if we received a 403 and have not already retried this request
    if (error.response && error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite loops
      try {
        // Get current tokens and user from Redux state
        const { refreshToken, accessToken, user } = store.getState().auth;
        if (!refreshToken) {
          // No refresh token found; force logout
          store.dispatch(clearUser());
          window.location.href = "/login";
          return Promise.reject(error);
        }
        // Attempt to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_API_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // Assume the refresh endpoint returns { accessToken, refreshToken }
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        // Update Redux state with the new tokens
        if (user) {
          store.dispatch(setUser({ user, accessToken: newAccessToken, refreshToken: newRefreshToken }));
        } else {
          store.dispatch(clearUser());
          window.location.href = "/login";
          return Promise.reject(error);
        }
        // Update default headers for future requests
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (err) {
        // If token refresh fails, log out the user
        store.dispatch(clearUser());
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
