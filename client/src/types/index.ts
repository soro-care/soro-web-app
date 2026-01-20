// src/types/index.ts
import { LucideIcon } from 'lucide-react';

// ============================================
// Survey Types
// ============================================
export type AgeRange = '' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
export type Gender = '' | 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
export type ConcernID = 'anxiety' | 'depression' | 'relationships' | 'trauma' | 'career' | 'family';
export type Severity = '' | 'mild' | 'moderate' | 'severe';
export type YesNo = '' | 'Yes' | 'No';
export type SessionFrequency = '' | 'weekly' | 'biweekly' | 'monthly' | 'asneeded';
export type PreferredTime = '' | 'morning' | 'afternoon' | 'evening';
export type ProfessionalGender = '' | 'Male' | 'Female' | 'No preference';
export type Step = 1 | 2 | 3 | 4;
export type ColorType = 'blue' | 'purple' | 'pink' | 'red' | 'green' | 'orange' | 'yellow';

export interface SurveyData {
  age: AgeRange;
  gender: Gender;
  occupation: string;
  primaryConcerns: ConcernID[];
  concernSeverity: Severity;
  previousTherapy: YesNo;
  currentMedication: YesNo;
  therapyGoals: string[];
  sessionFrequency: SessionFrequency;
  preferredTime: PreferredTime;
  professionalGender: ProfessionalGender;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions: string;
  additionalNotes: string;
}

export interface Concern {
  id: ConcernID;
  label: string;
  icon: LucideIcon;
  color: ColorType;
}

export interface SeverityOption {
  value: Severity;
  label: string;
  color: ColorType;
}

export interface TimeOption {
  value: PreferredTime;
  label: string;
  icon: string;
}

// ============================================
// User & Profile Types
// ============================================
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  mobile?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship?: string;
  phone: string;
  email?: string;
  canBeContacted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  mobile?: string;
}

export interface EmergencyContactFormData {
  name: string;
  relationship?: string;
  phone: string;
  email?: string;
  canBeContacted: boolean;
}

// ============================================
// PSN Types
// ============================================
export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PSNApplication {
  id: string;
  userId: string;
  motivation: string;
  availability: string;
  experience: string;
  status: ApplicationStatus;
  applicationDate: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PSNModule {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  content: string;
  unlockDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PSNProgress {
  id: string;
  userId: string;
  moduleId: string;
  videoWatched: boolean;
  preAssessment: boolean;
  postAssessment: boolean;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  moduleId: string;
  type: 'pre' | 'post';
  score: number;
  answers: Record<string, any>;
  createdAt: string;
}

// ============================================
// SafeSpace AI Types
// ============================================
export type MessageRole = 'user' | 'assistant' | 'system';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type CrisisLevel = 'low' | 'medium' | 'high';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  sentiment?: Sentiment;
  crisisFlag?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  crisisDetected: boolean;
  crisisLevel?: CrisisLevel;
  createdAt: string;
  updatedAt: string;
}

export interface CrisisResource {
  id: string;
  name: string;
  description: string;
  phone: string;
  website: string;
  available24_7: boolean;
  tags: string[];
}

// ============================================
// API Error Types
// ============================================
export interface ApiError extends Error {
  response?: {
    data: {
      message: string;
      code?: string;
      errors?: Record<string, string[]>;
    };
    status: number;
  };
}