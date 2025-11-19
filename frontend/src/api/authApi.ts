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
  user?: User;
  requiresEmailVerification?: boolean;
  email?: string;
  message?: string;
  // SECURITY: Tokens are NOT in response (HTTP-Only cookies)
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
 * SECURITY: Tokens are read from and written to HTTP-Only cookies by backend
 */
export const refreshAccessToken = async (): Promise<void> => {
  await apiClient.post('/auth/refresh', {}); // Empty body - backend reads cookies
  // Backend sets new HTTP-Only cookies automatically
};

/**
 * Register Institution
 */
export interface RegisterRequest {
  institutionName: string;
  email: string;
  password: string;
  confirmPassword: string;
  addressStreet: string;
  addressPlz: string;
  addressCity: string;
  phone: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data);
  return response.data.data;
};

/**
 * Verify Email with 6-digit code
 */
export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export const verifyEmail = async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  const response = await apiClient.post<ApiResponse<VerifyEmailResponse>>('/auth/verify-email', data);
  return response.data.data;
};

/**
 * Resend verification code
 */
export interface ResendCodeRequest {
  email: string;
}

export interface ResendCodeResponse {
  message: string;
}

export const resendVerificationCode = async (data: ResendCodeRequest): Promise<ResendCodeResponse> => {
  const response = await apiClient.post<ApiResponse<ResendCodeResponse>>('/auth/resend-code', data);
  return response.data.data;
};
