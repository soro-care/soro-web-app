
// ============================================
// 📁 FILE: src/lib/api/auth.ts
// API functions for authentication
// ============================================

import { apiClient } from './client';
import type { 
  RegisterData, 
  LoginData, 
  OTPVerifyData,
  AuthResponse,
  User 
} from '@/types/auth';

export const authAPI = {
  // Register new user
  register: async (data: RegisterData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data: OTPVerifyData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Verify reset OTP
  verifyResetOTP: async (email: string, otp: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/verify-reset-otp', { email, otp });
    return response.data;
  },

  // Reset password
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', { 
      email, 
      otp, 
      newPassword 
    });
    return response.data;
  },
};