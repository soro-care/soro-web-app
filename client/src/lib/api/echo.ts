// ============================================
// 📁 FILE: src/lib/api/echo.ts
// Echo API functions
// ============================================

import { apiClient } from './client';

export type EchoRoom = 
  | 'pressure' 
  | 'burnout' 
  | 'not_enough' 
  | 'silence' 
  | 'rage' 
  | 'exhaustion' 
  | 'gratitude' 
  | 'victory' 
  | 'hope' 
  | 'resilience';

export type EchoSentiment = 'struggle' | 'positive' | 'neutral';

export interface Echo {
  id: string;
  content: string;
  authorName: string;
  room: EchoRoom;
  sentiment: EchoSentiment;
  wordCount: number;
  moderated: boolean;
  crisisFlag: boolean;
  isArchived: boolean;
  reportCount: number;
  emotionTags: string[];
  likes: string[]; // User IDs who liked
  comments: EchoComment[];
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EchoComment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface RoomStats {
  id: string;
  roomId: string;
  totalStories: number;
  todaysStories: number;
  lastUpdated: string;
  trending: boolean;
  averageWordCount: number;
  crisisCount: number;
}

export const echoAPI = {
  // Share story
  shareStory: async (data: {
    content: string;
    authorName: string;
    room: EchoRoom;
  }): Promise<Echo> => {
    const response = await apiClient.post('/echo/share', data);
    return response.data;
  },

  // Get stories by room
  getStoriesByRoom: async (room: EchoRoom, page = 1, limit = 20): Promise<Echo[]> => {
    const response = await apiClient.get(`/echo/room/${room}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get story by ID
  getStory: async (storyId: string): Promise<Echo> => {
    const response = await apiClient.get(`/echo/story/${storyId}`);
    return response.data;
  },

  // Search stories
  searchStories: async (query: string): Promise<Echo[]> => {
    const response = await apiClient.get('/echo/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Get related stories
  getRelatedStories: async (roomId: string): Promise<Echo[]> => {
    const response = await apiClient.get(`/echo/room/${roomId}/related`);
    return response.data;
  },

  // Get room statistics
  getRoomStats: async (): Promise<RoomStats[]> => {
    const response = await apiClient.get('/echo/stats');
    return response.data;
  },

  // Like story
  likeStory: async (storyId: string): Promise<void> => {
    await apiClient.post('/echo/like', { storyId });
  },

  // Add comment
  addComment: async (storyId: string, content: string, authorName: string): Promise<void> => {
    await apiClient.post('/echo/comment', { storyId, content, authorName });
  },

  // Get comments
  getComments: async (storyId: string): Promise<EchoComment[]> => {
    const response = await apiClient.get(`/echo/story/${storyId}/comments`);
    return response.data;
  },

  // Track share
  trackShare: async (storyId: string): Promise<void> => {
    await apiClient.post('/echo/track-share', { storyId });
  },

  // Report story
  reportStory: async (storyId: string, reason: string): Promise<void> => {
    await apiClient.post('/echo/report', { storyId, reason });
  },
};
