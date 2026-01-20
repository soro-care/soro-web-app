// 📁 FILE: src/app/(professional)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { professionalAPI } from '@/lib/api/professional';
import { toast } from 'sonner';
import type { 
  ProfessionalStats, 
  Booking, 
  QuickStat 
} from '@/lib/types';
import type { Booking as ApiBooking } from '@/lib/api/bookings';

export default function ProfessionalDashboard() {
  const [stats, setStats] = useState<ProfessionalStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to convert API booking to our Booking type
  const convertToBooking = (apiBooking: ApiBooking): Booking => {
    return {
      ...apiBooking,
      professionalId: apiBooking.user?.id || '', // Adjust based on your API
      userId: apiBooking.user?.id || '', // Adjust based on your API
      createdAt: new Date().toISOString(), // Get from API if available
      updatedAt: new Date().toISOString(), // Get from API if available
    };
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, bookingsData] = await Promise.all([
        professionalAPI.getStats(),
        professionalAPI.getMyBookings(),
      ]);

      setStats(statsData);

      // Convert API bookings to our Booking type
      const convertedBookings: Booking[] = bookingsData.map(convertToBooking);

      // Filter bookings
      const now = new Date();
      const upcoming = convertedBookings.filter(
        (b) =>
          (b.status === 'Confirmed' || b.status === 'Pending') &&
          new Date(b.date) >= now
      );
      const pending = convertedBookings.filter((b) => b.status === 'Pending');

      setUpcomingBookings(upcoming.slice(0, 5));
      setPendingRequests(pending.slice(0, 3));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (bookingId: string, action: 'confirm' | 'cancel') => {
    try {
      if (action === 'confirm') {
        await professionalAPI.confirmBooking(bookingId);
        toast.success('Booking confirmed!');
      } else {
        await professionalAPI.cancelBooking(bookingId, 'Cancelled by professional');
        toast.success('Booking cancelled');
      }
      loadDashboardData();
    } catch (error) {
      toast.error(`Failed to ${action} booking`);
    }
  };

  const quickStats: QuickStat[] = [
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      change: '+12%',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Active Clients',
      value: stats?.totalClients || 0,
      change: '+5 this month',
      icon: Users,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      label: 'Completed Sessions',
      value: stats?.completedBookings || 0,
      change: `${stats?.weeklyBookings || 0} this week`,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      change: 'Need action',
      icon: Clock,
      color: 'from-orange-500 to-amber-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, Professional!</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here&apos;s what&apos;s happening with your practice today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.change && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      {stat.change}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Pending Booking Requests</h2>
              <Link href="/professional/bookings?filter=pending">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((booking) => (
                  <Card key={booking.id} className="p-4 bg-orange-50 dark:bg-orange-900/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">
                          {booking.user?.name || 'Anonymous Client'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {booking.modality} Session
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                        Pending
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      <strong>Concern:</strong> {booking.concern}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction(booking.id, 'confirm')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction(booking.id, 'cancel')}
                        className="flex-1"
                      >
                        Decline
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Today's Schedule */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Today&apos;s Schedule</h2>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No sessions today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-medium">
                        {booking.user?.name?.[0] || 'C'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{booking.user?.name || 'Client'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                    </div>
                    {booking.status === 'Confirmed' && booking.meetingLink && (
                      <Button size="sm" variant="outline" className="w-full mt-2" asChild>
                        <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">
                          Join Session
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link href="/professional/availability">
              <Button variant="outline" className="w-full mt-4">
                <Clock className="w-4 h-4 mr-2" />
                Manage Availability
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/professional/availability">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <Clock className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Set Availability</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Update your schedule
            </p>
          </Card>
        </Link>

        <Link href="/professional/bookings">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <Calendar className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">View Bookings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage all sessions
            </p>
          </Card>
        </Link>

        <Link href="/professional/profile">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <Users className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Update Profile</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Edit your information
            </p>
          </Card>
        </Link>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
          <AlertCircle className="w-8 h-8 text-orange-600 mb-3" />
          <h3 className="font-semibold mb-1">Need Help?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Contact support
          </p>
        </Card>
      </div>
    </div>
  );
}