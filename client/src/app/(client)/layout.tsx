// ============================================
// 📁 FILE: src/app/(client)/layout.tsx
// Client layout with bottom nav
// ============================================

'use client';

import { TopBar } from '@/components/shared/TopBar';
import { BottomNav } from '@/components/shared/BottomNav';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuth(true); // Require authentication

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <TopBar />
      <main className="pb-20 md:pb-8">{children}</main>
      <BottomNav />
    </div>
  );
}
