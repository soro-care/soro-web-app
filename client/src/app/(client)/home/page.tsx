// ============================================
// 📁 FILE: src/app/(client)/dashboard/page.tsx
// Client Dashboard with glassmorphic cards
// ============================================

'use client';

import { generateSEO } from '@/lib/seo';
import { useAuthStore } from '@/lib/stores/authStore';
import { Calendar, MessageCircle, BookOpen, Users, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function ClientDashboard() {
  const { user } = useAuthStore();

  const quickStats = [
    {
      label: 'Sessions',
      value: '3',
      change: '+1 this week',
      icon: Calendar,
      color: 'from-pink-500 to-rose-500',
    },
    {
      label: 'Stories Shared',
      value: '12',
      change: 'Last shared 2d ago',
      icon: MessageCircle,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Articles Read',
      value: '8',
      change: '+2 this week',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'PSN Progress',
      value: '45%',
      change: 'Module 3 of 8',
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-500',
    },
  ];

  const upcomingSessions = [
    {
      id: '1',
      professional: 'Dr. Sarah Johnson',
      specialty: 'Clinical Psychology',
      date: '2025-01-18',
      time: '2:00 PM',
      type: 'Video',
      status: 'confirmed',
    },
    {
      id: '2',
      professional: 'Dr. Michael Chen',
      specialty: 'Anxiety & Depression',
      date: '2025-01-22',
      time: '10:00 AM',
      type: 'Audio',
      status: 'pending',
    },
  ];

  const quickActions = [
    {
      title: 'Book Session',
      description: 'Connect with a professional',
      icon: Calendar,
      href: '/bookings/new',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Share Story',
      description: 'Post to Echo safely',
      icon: MessageCircle,
      href: '/echo/share',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'AI Chat',
      description: 'Talk to SafeSpace AI',
      icon: MessageCircle,
      href: '/safespace',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'PSN Training',
      description: 'Continue learning',
      icon: Users,
      href: '/psn',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here&apos;s what&apos;s happening with your mental health journey
        </p>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 glass hover:shadow-xl transition-all cursor-pointer border-0">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stat.change}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="p-6 glass hover:shadow-xl transition-all group border-0 h-full">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {action.description}
                  </p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Upcoming Sessions
          </h2>
          <Link href="/bookings">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {upcomingSessions.map((session) => (
            <Card key={session.id} className="p-6 glass border-0 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {session.professional.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {session.professional}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {session.specialty}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {session.time}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'confirmed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {session.status === 'confirmed' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {session.status}
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="rounded-xl">
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <Card className="p-6 glass border-0">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Completed session with Dr. Sarah
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Shared a story in Echo
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Read &quot;Managing Anxiety&quot; article
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">5 days ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}