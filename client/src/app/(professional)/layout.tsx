// 📁 FILE: src/app/(professional)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Calendar,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/hooks/useAuth';
import { SidebarContent } from './_components/SidebarContent';
import type { ProfessionalLayoutProps, NavigationItem, User } from '@/lib/types';

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/professional/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Availability',
    href: '/professional/availability',
    icon: Clock,
  },
  {
    name: 'Bookings',
    href: '/professional/bookings',
    icon: Calendar,
  },
  {
    name: 'Profile',
    href: '/professional/profile',
    icon: LogOut,
  },
];

export default function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const { user: authUser, logout } = useAuth(true);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cast user to match our User type (since auth hook might have different type)
  const user = authUser as User | null;

  useEffect(() => {
    // Redirect non-professionals
    if (user && user.role !== 'PROFESSIONAL') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'PROFESSIONAL') return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 safe-top">
        <div className="flex items-center justify-between h-16 px-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SidebarContent
                user={user}
                navigation={navigationItems}
                pathname={pathname}
                setSidebarOpen={setSidebarOpen}
                logout={logout}
                router={router}
              />
            </SheetContent>
          </Sheet>

          <span className="font-bold text-lg">SORO Professional</span>

          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 fixed inset-y-0 left-0">
          <SidebarContent
            user={user}
            navigation={navigationItems}
            pathname={pathname}
            setSidebarOpen={setSidebarOpen}
            logout={logout}
            router={router}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-80">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}