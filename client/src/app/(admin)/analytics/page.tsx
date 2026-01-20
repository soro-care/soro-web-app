"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, Users, Calendar, DollarSign, 
  MessageCircle, ArrowUp, ArrowDown, Download
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data generators
const generateUserGrowthData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => ({
    month,
    users: 100 + i * 45 + Math.floor(Math.random() * 50),
    professionals: 20 + i * 8 + Math.floor(Math.random() * 10),
    active: 80 + i * 35 + Math.floor(Math.random() * 40)
  }));
};

const generateBookingTrendsData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => ({
    month,
    bookings: 50 + i * 20 + Math.floor(Math.random() * 30),
    completed: 40 + i * 18 + Math.floor(Math.random() * 25),
    revenue: 2000 + i * 800 + Math.floor(Math.random() * 500)
  }));
};

const generateRoomDistributionData = () => {
  const rooms = [
    { name: 'Anxiety & Stress', value: 245, color: '#ef4444' },
    { name: 'Depression', value: 198, color: '#f59e0b' },
    { name: 'Relationships', value: 176, color: '#10b981' },
    { name: 'Trauma', value: 134, color: '#3b82f6' },
    { name: 'Career Counseling', value: 112, color: '#8b5cf6' },
    { name: 'Family Issues', value: 89, color: '#ec4899' }
  ];
  return rooms;
};

const generateProfessionalPerformanceData = () => {
  const professionals = [
    'Dr. Sarah Johnson',
    'Dr. Michael Chen',
    'Dr. Emily Williams',
    'Dr. David Brown',
    'Dr. Lisa Anderson'
  ];
  return professionals.map((name, i) => ({
    name: name.split(' ')[1],
    bookings: 80 - i * 12,
    rating: 4.8 - i * 0.2,
    revenue: 8000 - i * 1200
  }));
};

const generateRevenueByMonthData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, i) => ({
    month,
    revenue: 12000 + i * 2500 + Math.floor(Math.random() * 2000),
    expenses: 5000 + i * 800 + Math.floor(Math.random() * 1000),
    profit: 7000 + i * 1700 + Math.floor(Math.random() * 1500)
  }));
};

const AdminAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('year');
  
  const userGrowthData = generateUserGrowthData();
  const bookingTrendsData = generateBookingTrendsData();
  const roomDistributionData = generateRoomDistributionData();
  const professionalPerformanceData = generateProfessionalPerformanceData();
  const revenueData = generateRevenueByMonthData();

  // Calculate stats
  const currentUsers = userGrowthData[userGrowthData.length - 1].users;
  const previousUsers = userGrowthData[userGrowthData.length - 2].users;
  const userGrowth = ((currentUsers - previousUsers) / previousUsers * 100).toFixed(1);

  const currentBookings = bookingTrendsData[bookingTrendsData.length - 1].bookings;
  const previousBookings = bookingTrendsData[bookingTrendsData.length - 2].bookings;
  const bookingGrowth = ((currentBookings - previousBookings) / previousBookings * 100).toFixed(1);

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = revenueData.reduce((sum, item) => sum + item.profit, 0);
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  const statCards = [
    {
      label: 'Total Users',
      value: currentUsers.toLocaleString(),
      change: `${userGrowth}%`,
      trend: parseFloat(userGrowth) > 0 ? 'up' : 'down',
      icon: Users,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      label: 'Monthly Bookings',
      value: currentBookings.toLocaleString(),
      change: `${bookingGrowth}%`,
      trend: parseFloat(bookingGrowth) > 0 ? 'up' : 'down',
      icon: Calendar,
      color: 'from-purple-500 to-indigo-600'
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: `${profitMargin}% margin`,
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Active Rooms',
      value: roomDistributionData.reduce((sum, room) => sum + room.value, 0).toLocaleString(),
      change: '6 categories',
      trend: 'neutral',
      icon: MessageCircle,
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Platform performance and insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-shadow">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-600" />}
                  {stat.trend === 'down' && <ArrowDown className="w-3 h-3 text-red-600" />}
                  <span className={stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Growth</h2>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Active</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="active" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Trends Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Booking Trends</h2>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Room Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Popular Rooms</h2>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roomDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roomDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {roomDistributionData.map((room, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{room.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Revenue Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="profit" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Professional Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Professional Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Professional</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Bookings</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Rating</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {professionalPerformanceData.map((pro, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">Dr. {pro.name}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-900 dark:text-white">{pro.bookings}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-gray-900 dark:text-white">{pro.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-green-600 font-semibold">${pro.revenue.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                            style={{ width: `${(pro.bookings / 80) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round((pro.bookings / 80) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Growth Rate</p>
                <p className="text-2xl font-bold">{userGrowth}%</p>
              </div>
            </div>
            <p className="text-sm opacity-90">Month-over-month user growth is strong</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Completion Rate</p>
                <p className="text-2xl font-bold">92%</p>
              </div>
            </div>
            <p className="text-sm opacity-90">High booking completion rate indicates quality</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Avg. Session Value</p>
                <p className="text-2xl font-bold">$85</p>
              </div>
            </div>
            <p className="text-sm opacity-90">Revenue per session is increasing steadily</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;