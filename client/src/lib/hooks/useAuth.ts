// ============================================
// 📁 FILE: src/lib/hooks/useAuth.ts
// Custom hook for authentication
// ============================================

import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requireAuth = false) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
}