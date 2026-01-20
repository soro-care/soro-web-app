// ============================================
// 📁 FILE: src/lib/api/profile.ts
// Profile API functions
// ============================================

import { apiClient } from './client';

// Re-export types from main types file
export type { 
  User, 
  EmergencyContact, 
  ProfileFormData, 
  EmergencyContactFormData 
} from '@/types';

export const profileAPI = {
  // Get profile
  getProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Emergency contacts
  getEmergencyContacts: async () => {
    const response = await apiClient.get('/profile/emergency-contacts');
    return response.data;
  },

  addEmergencyContact: async (data: any) => {
    const response = await apiClient.post('/profile/emergency-contacts', data);
    return response.data;
  },

  deleteEmergencyContact: async (contactId: string) => {
    await apiClient.delete(`/profile/emergency-contacts/${contactId}`);
  },
};