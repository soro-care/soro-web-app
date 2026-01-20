// ============================================
// 📁 FILE: src/lib/api/admin.ts
// Admin API functions
// ============================================

import { apiClient } from './client';
import type { User } from '@/types/auth';
import type { Booking } from './bookings';
import type { Echo } from './echo';

export interface AdminStats {
  totalUsers: number;
  totalProfessionals: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  completedBookings: number;
  pendingBookings: number;
  totalEchoStories: number;
  flaggedContent: number;
}

export interface SystemAnalytics {
  userGrowth: Array<{ date: string; count: number }>;
  bookingTrends: Array<{ date: string; bookings: number; revenue: number }>;
  popularRooms: Array<{ room: string; count: number }>;
  professionalPerformance: Array<{ name: string; bookings: number; rating: number }>;
}

export interface ModerationItem {
  id: string;
  type: 'echo' | 'comment' | 'booking';
  content: string;
  reportCount: number;
  flaggedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const adminAPI = {
  // Dashboard stats
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // Analytics
  getAnalytics: async (): Promise<SystemAnalytics> => {
    const response = await apiClient.get('/admin/analytics/system');
    return response.data;
  },

  // User management
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number }> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getUserDetails: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<void> => {
    await apiClient.put(`/admin/users/${userId}/status`, { status });
  },

  updateUserRole: async (userId: string, role: string): Promise<void> => {
    await apiClient.put(`/admin/users/${userId}/role`, { role });
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  // Booking management
  getAllBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ bookings: Booking[]; total: number }> => {
    const response = await apiClient.get('/admin/bookings', { params });
    return response.data;
  },

  updateBookingStatus: async (bookingId: string, status: string): Promise<void> => {
    await apiClient.put(`/admin/bookings/${bookingId}/status`, { status });
  },

  // Content moderation
  getModerationQueue: async (): Promise<ModerationItem[]> => {
    const response = await apiClient.get('/admin/moderation/queue');
    return response.data;
  },

  moderateContent: async (
    storyId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<void> => {
    await apiClient.put(`/echo/moderation/${storyId}`, { action, reason });
  },
};
