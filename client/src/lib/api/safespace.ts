// ============================================
// 📁 FILE: src/lib/api/safespace.ts
// SafeSpace AI API functions
// ============================================

import { apiClient } from './client';

// Re-export types from the main types file
export type { ChatSession, Message, CrisisResource } from '@/types';

export interface SendMessageData {
  content: string;
}

export interface CrisisResourcesResponse {
  resources: any[];
  localResources?: any[];
}

export const safespaceAPI = {
  // Get all chat sessions
  getSessions: async () => {
    const response = await apiClient.get('/safespace/sessions');
    return response.data;
  },

  // Get specific session
  getSession: async (sessionId: string) => {
    const response = await apiClient.get(`/safespace/sessions/${sessionId}`);
    return response.data;
  },

  // Create new session
  createSession: async () => {
    const response = await apiClient.post('/safespace/sessions');
    return response.data;
  },

  // Send message
  sendMessage: async (sessionId: string, content: string) => {
    const response = await apiClient.post(
      `/safespace/sessions/${sessionId}/messages`, 
      { content }
    );
    return response.data;
  },

  // Delete session
  deleteSession: async (sessionId: string) => {
    await apiClient.delete(`/safespace/sessions/${sessionId}`);
  },

  // Get crisis resources
  getCrisisResources: async () => {
    const response = await apiClient.get('/safespace/crisis-resources');
    return response.data;
  },
};