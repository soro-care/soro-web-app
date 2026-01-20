// ============================================
// 📁 FILE: src/types/auth.ts
// TypeScript types for authentication
// ============================================

export interface User {
  id: string;
  userId: string;
  pseudonymousId: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  mobile?: string;
  role: 'USER' | 'PROFESSIONAL' | 'ADMIN' | 'SUPERADMIN';
  status: 'Active' | 'Inactive' | 'Suspended';
  verifyEmail: boolean;
  isPeerCounselor: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface OTPVerifyData {
  email: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyOTP: (data: OTPVerifyData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}