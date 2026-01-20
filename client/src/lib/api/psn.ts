// ============================================
// 📁 FILE: src/lib/api/psn.ts
// PSN API functions
// ============================================

import { apiClient } from './client';

// Re-export types from the main types file
export type { 
  PSNApplication, 
  PSNModule, 
  PSNProgress, 
  AssessmentResult,
  ApplicationStatus 
} from '@/types';

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  application?: any;
}

export interface CertificateResponse {
  certificateUrl: string;
}

export interface ApplyData {
  motivation: string;
  availability: string;
  experience: string;
}

export const psnAPI = {
  // Application
  apply: async (data: ApplyData) => {
    const response = await apiClient.post('/psn/apply', data);
    return response.data;
  },

  getMyApplication: async () => {
    const response = await apiClient.get('/psn/application/my');
    return response.data;
  },

  verifyPayment: async (reference: string) => {
    const response = await apiClient.post('/psn/verify-payment', { reference });
    return response.data;
  },

  // Modules
  getModules: async () => {
    const response = await apiClient.get('/psn/my-modules');
    return response.data;
  },

  getModule: async (moduleId: string) => {
    const response = await apiClient.get(`/psn/my-modules/${moduleId}`);
    return response.data;
  },

  markVideoWatched: async (moduleId: string) => {
    await apiClient.post('/psn/video-watched', { moduleId });
  },

  submitAssessment: async (moduleId: string, data: Record<string, any>) => {
    await apiClient.post(`/psn/modules/${moduleId}/assessment`, data);
  },

  // Progress
  getMyProgress: async () => {
    const response = await apiClient.get('/psn/my-progress');
    return response.data;
  },

  // Certificate
  generateCertificate: async () => {
    const response = await apiClient.post('/psn/certificate');
    return response.data;
  },
};