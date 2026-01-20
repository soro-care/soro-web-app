// ============================================
// 📁 FILE: src/lib/api/professional.ts
// Professional API functions
// ============================================

import { apiClient } from './client';
import type { Booking } from './bookings';

export interface ProfessionalStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  pendingRequests: number;
  totalClients: number;
  weeklyBookings: number;
  monthlyRevenue: number;
  averageRating: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface DayAvailability {
  id: string;
  day: string;
  slots: TimeSlot[];
  available: boolean;
}

export const professionalAPI = {
  // Stats
  getStats: async (): Promise<ProfessionalStats> => {
    const response = await apiClient.get('/professional/stats');
    return response.data;
  },

  // Availability
  getMyAvailability: async (): Promise<DayAvailability[]> => {
    const response = await apiClient.get('/availability');
    return response.data;
  },

  initializeAvailability: async (): Promise<void> => {
    await apiClient.post('/availability/initialize');
  },

  updateDayAvailability: async (
    dayId: string,
    data: Partial<DayAvailability>
  ): Promise<DayAvailability> => {
    const response = await apiClient.put(`/availability/${dayId}`, data);
    return response.data;
  },

  bulkUpdateAvailability: async (
    updates: Array<{ dayId: string; data: Partial<DayAvailability> }>
  ): Promise<void> => {
    await apiClient.put('/availability/bulk/update', { updates });
  },

  // Bookings
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get('/bookings');
    return response.data;
  },

  confirmBooking: async (bookingId: string): Promise<void> => {
    await apiClient.put(`/bookings/${bookingId}/confirm`);
  },

  completeBooking: async (bookingId: string, notes?: string): Promise<void> => {
    await apiClient.put(`/bookings/${bookingId}/complete`, { notes });
  },

  cancelBooking: async (bookingId: string, reason: string): Promise<void> => {
    await apiClient.put(`/bookings/${bookingId}/cancel`, { cancellationReason: reason });
  },
};
