// ============================================
// 📁 FILE: src/lib/stores/authStore.ts
// Zustand store for authentication state
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI } from '@/lib/api/auth';
import type { AuthState, LoginData, RegisterData, OTPVerifyData, User } from '@/types/auth';
import { toast } from 'sonner';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          // Remove confirmPassword before sending to API
          const { confirmPassword, ...registerData } = data;
          await authAPI.register(registerData);
          toast.success('Registration successful! Check your email for OTP.');
        } catch (error: any) {
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOTP: async (data: OTPVerifyData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.verifyOTP(data);
          
          // Securely store tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          
          set({ 
            user: response.user, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          toast.success('Email verified successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'OTP verification failed';
          toast.error(message);
          throw error;
        }
      },

      login: async (data: LoginData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(data);
          
          // Securely store tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            // Store remember me preference
            if (data.rememberMe) {
              localStorage.setItem('rememberMe', 'true');
            }
          }
          
          set({ 
            user: response.user, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          toast.success(`Welcome back, ${response.user.name}!`);
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          throw error;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear all auth data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('rememberMe');
          }
          
          set({ 
            user: null, 
            isAuthenticated: false 
          });
          
          toast.info('Logged out successfully');
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);