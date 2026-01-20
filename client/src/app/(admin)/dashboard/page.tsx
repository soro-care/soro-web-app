// ============================================
// 📁 FILE: src/app/(admin)/dashboard/page.tsx
// Admin Dashboard Overview
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { adminAPI, type AdminStats } from '@/lib/api/admin';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  const quickStats = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      href: '/admin/users',
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      change: `${stats?.pendingBookings || 0} pending`,
      trend: 'neutral',
      icon: Calendar,
      color: 'from-purple-500 to-indigo-600',
      href: '/admin/bookings',
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers || 0,
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      href: '/admin/users?status=active',
    },
    {
      label: 'Flagged Content',
      value: stats?.flaggedContent || 0,
      change: 'Needs review',
      trend: stats && stats.flaggedContent > 0 ? 'down' : 'neutral',
      icon: AlertCircle,
      color: 'from-red-500 to-orange-600',
      href: '/admin/moderation',
    },
  ];

  const recentActivity = [
    {
      type: 'user',
      message: 'New user registered',
      time: '2 minutes ago',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      type: 'booking',
      message: 'Booking confirmed',
      time: '15 minutes ago',
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      type: 'story',
      message: 'Story flagged for review',
      time: '1 hour ago',
      icon: AlertCircle,
      color: 'text-red-600',
    },
    {
      type: 'booking',
      message: 'New booking request',
      time: '2 hours ago',
      icon: Clock,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor and manage your platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.change && (
                    <div className="flex items-center gap-1 text-xs">
                      {stat.trend === 'up' && (
                        <ArrowUp className="w-3 h-3 text-green-600" />
                      )}
                      {stat.trend === 'down' && (
                        <ArrowDown className="w-3 h-3 text-red-600" />
                      )}
                      <span
                        className={
                          stat.trend === 'up'
                            ? 'text-green-600'
                            : stat.trend === 'down'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }
                      >
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Overview Stats */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Platform Overview</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Professionals
                  </p>
                  <p className="text-2xl font-bold">{stats?.totalProfessionals || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Completed Sessions
                  </p>
                  <p className="text-2xl font-bold">{stats?.completedBookings || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Echo Stories
                  </p>
                  <p className="text-2xl font-bold">{stats?.totalEchoStories || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    New Users (Month)
                  </p>
                  <p className="text-2xl font-bold">{stats?.newUsersThisMonth || 0}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Pending Bookings
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    {stats?.pendingBookings || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 ${activity.color}`}
                  >
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full mt-6">
                View All Activity
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/users">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <Users className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Manage Users</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View and manage all users
            </p>
          </Card>
        </Link>

        <Link href="/admin/bookings">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <Calendar className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Bookings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Monitor all sessions
            </p>
          </Card>
        </Link>

        <Link href="/admin/moderation">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <AlertCircle className="w-8 h-8 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Moderation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Review flagged content
            </p>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <TrendingUp className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View detailed insights
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}