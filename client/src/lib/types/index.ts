// 📁 FILE: src/lib/types/index.ts

// ==================== USER TYPES ====================
export type UserRole = 'USER' | 'PROFESSIONAL' | 'ADMIN' | 'SUPERADMIN'; // Added SUPERADMIN

export type BaseUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  mobile?: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalUser = BaseUser & {
  role: 'PROFESSIONAL';
  specialization?: string; // Made optional
  qualifications?: string[]; // Made optional
  bio?: string; // Made optional
  yearsOfExperience?: number; // Made optional
  hourlyRate?: number;
  availableDays?: string[];
  languages?: string[];
  rating?: number;
  totalSessions?: number;
};


export type RegularUser = BaseUser & {
  role: 'USER';
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: string;
  preferences?: {
    language?: string;
    notification?: boolean;
  };
};

export type AdminUser = BaseUser & {
  role: 'ADMIN';
  permissions: string[];
};

export type User = RegularUser | ProfessionalUser | AdminUser;

// Type guards
export function isProfessionalUser(user: User): user is ProfessionalUser {
  return user.role === 'PROFESSIONAL';
}

export function isRegularUser(user: User): user is RegularUser {
  return user.role === 'USER';
}

export function isAdminUser(user: User): user is AdminUser {
  return user.role === 'ADMIN';
}

// ==================== BOOKING TYPES ====================
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
export type SessionModality = 'Video' | 'Audio' | 'Chat' | 'In-Person';

export type BookingUserInfo = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
};

export type Booking = {
  id: string;
  professionalId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  concern: string;
  modality: SessionModality;
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: BookingUserInfo;
  professional?: BookingUserInfo;
};

// ==================== DASHBOARD STATS TYPES ====================
export type ProfessionalStats = {
  totalBookings: number;
  completedBookings: number;
  pendingRequests: number;
  totalClients: number;
  weeklyBookings: number;
  monthlyRevenue?: number;
  averageRating?: number;
  upcomingBookings: number;
};

// ==================== NAVIGATION TYPES ====================
export type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

// ==================== FORM TYPES ====================
export type ProfessionalProfileFormData = {
  name: string;
  username: string;
  email: string;
  mobile?: string;
  specialization: string;
  qualifications: string;
  bio: string;
  yearsOfExperience: string;
};

export type ProfessionalProfileUpdateData = Omit<ProfessionalProfileFormData, 'yearsOfExperience' | 'qualifications'> & {
  yearsOfExperience: number;
  qualifications: string[];
};

// ==================== API RESPONSE TYPES ====================
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ==================== QUICK STATS TYPES ====================
export type QuickStat = {
  label: string;
  value: number;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

// ==================== COMPONENT PROPS TYPES ====================
export type SidebarContentProps = {
  user: User | null;
  navigation: NavigationItem[];
  pathname: string;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
  router: {
    push: (path: string) => void;
  };
};

export type ProfessionalLayoutProps = {
  children: React.ReactNode;
};


