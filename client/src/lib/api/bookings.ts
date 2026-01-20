// ============================================
// 📁 FILE: src/lib/api/bookings.ts
// Booking API functions - TYPE SAFE VERSION
// ============================================

import { apiClient } from './client';

export interface Professional {
  id: string;
  name: string;
  avatar?: string;
  specialization: string;
  bio: string;
  yearsOfExperience: number;
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  day: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
  isBooked?: boolean;
}

export interface Booking {
  id: string;
  user: Professional;
  date: string;
  startTime: string;
  endTime: string;
  modality: 'Video' | 'Audio';
  concern: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  meetingLink?: string;
  createdAt: string;
}

export interface CreateBookingData {
  professionalId: string;
  date: string;
  startTime: string;
  endTime: string;
  modality: 'Video' | 'Audio';
  concern: string;
  notes?: string;
}

export interface RescheduleBookingData {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export const bookingsAPI = {
  getProfessionals: async (): Promise<Professional[]> => {
    const response = await apiClient.get('/users/professionals/all');
    return response.data;
  },

  getProfessional: async (id: string): Promise<Professional> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  getAvailability: async (professionalId: string): Promise<AvailabilitySlot[]> => {
    const response = await apiClient.get(`/availability/professional/${professionalId}`);
    return response.data;
  },

  createBooking: async (data: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get('/bookings');
    return response.data;
  },

  getBooking: async (id: string): Promise<Booking> => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (id: string, reason: string): Promise<void> => {
    await apiClient.put(`/bookings/${id}/cancel`, { cancellationReason: reason });
  },

  rescheduleBooking: async (id: string, data: RescheduleBookingData): Promise<void> => {
    await apiClient.put(`/bookings/${id}/reschedule`, data);
  },
};