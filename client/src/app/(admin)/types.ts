// 📁 FILE: src/app/(admin)/types.ts
// ============================================

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'PROFESSIONAL' | 'ADMIN' | 'SUPERADMIN';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  avatar: string;
  joinedAt: string;
  lastActive: string;
  bookings: number;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingClient {
  name: string;
  email: string;
  avatar: string;
}

export interface BookingProfessional {
  name: string;
  email: string;
  avatar: string;
}

export interface Booking {
  id: string;
  client: BookingClient;
  professional: BookingProfessional;
  room: string;
  date: string;
  time: string;
  duration: number;
  status: BookingStatus;
  price: number;
  notes: string;
  createdAt: string;
}

// Moderation Types
export type ModerationItemType = 'echo' | 'comment';
export type ModerationPriority = 'high' | 'medium' | 'low';

export interface EchoContent {
  title: string;
  excerpt: string;
  likes: number;
  comments: number;
}

export interface Report {
  reporter: string;
  reason: string;
  details: string;
  reportedAt: string;
}

export interface ModerationItem {
  id: string;
  type: ModerationItemType;
  content: EchoContent | string;
  author: {
    name: string;
    avatar: string;
  };
  reportCount: number;
  reports: Report[];
  flaggedAt: string;
  status: string;
  priority: ModerationPriority;
}

// Settings Types
export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
}

export interface SecuritySettings {
  twoFactorRequired: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  loginAttempts: number;
  lockoutDuration: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newUserAlert: boolean;
  newBookingAlert: boolean;
  flaggedContentAlert: boolean;
  systemUpdates: boolean;
  weeklyReport: boolean;
}

export interface BookingSettings {
  maxAdvanceBooking: number;
  minAdvanceBooking: number;
  sessionDurations: number[];
  defaultDuration: number;
  allowCancellation: boolean;
  cancellationWindow: number;
  autoConfirm: boolean;
}

export interface PaymentSettings {
  currency: string;
  commissionRate: number;
  payoutSchedule: string;
  minimumPayout: number;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
}

export interface ModerationSettings {
  autoModeration: boolean;
  profanityFilter: boolean;
  flagThreshold: number;
  autoRemoveThreshold: number;
  requireApproval: boolean;
  spamDetection: boolean;
}

// Stats Types
export interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  activeUsers: number;
  flaggedContent: number;
  totalProfessionals: number;
  completedBookings: number;
  totalEchoStories: number;
  newUsersThisMonth: number;
  pendingBookings: number;
}

// Navigation Types - Fixed the any type
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>; // Fixed: No more any
}

// Helper Types
export type SaveStatus = 'saving' | 'saved' | null;
export type StatusFilter = BookingStatus | 'all';
export type DateFilter = 'all' | 'today' | 'week' | 'month';
export type TypeFilter = ModerationItemType | 'all';
export type PriorityFilter = ModerationPriority | 'all';