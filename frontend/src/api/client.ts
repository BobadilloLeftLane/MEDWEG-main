import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * API Client Configuration
 * Axios instance with authentication and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // CRITICAL: Enable HTTP-Only cookie transmission
});

/**
 * Request interceptor
 *
 * SECURITY NOTE: Tokens are automatically sent via HTTP-Only cookies.
 * No need to manually attach Authorization header.
 * Cookies are sent automatically because withCredentials: true
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Tokens are in HTTP-Only cookies - sent automatically
    // No manual Authorization header needed
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 *
 * SECURITY NOTE: Token refresh now uses HTTP-Only cookies.
 * Backend automatically reads refresh token from cookies and sets new cookies.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint - backend reads refresh token from HTTP-Only cookie
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {}, // Empty body - backend reads cookie
          {
            withCredentials: true, // Send cookies
          }
        );

        // Backend sets new HTTP-Only cookies automatically
        // No need to manually store tokens

        // Retry original request (new cookies will be sent automatically)
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Response type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * API Error type
 */
export interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export default apiClient;
