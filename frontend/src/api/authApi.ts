import apiClient, { ApiResponse } from './client';
import { User } from '../store/authStore';

/**
 * Auth API
 * All authentication-related API calls
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface WorkerLoginRequest {
  username: string;
  password: string;
}

/**
 * Login for Admin Application and Admin Institution
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
  return response.data.data;
};

/**
 * Login for Worker (username/password)
 */
export const workerLogin = async (data: WorkerLoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/worker-login', data);
  return response.data.data;
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', {
    refreshToken,
  });
  return response.data.data;
};
