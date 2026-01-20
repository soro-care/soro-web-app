// 📁 FILE: src/app/(admin)/bookings/page.tsx
// ============================================

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Search, Calendar, Clock, MapPin, 
  CheckCircle, XCircle, AlertCircle,
  Eye, MoreVertical, Download
} from 'lucide-react';
import type { 
  Booking, 
  BookingStatus, 
  StatusFilter,
  DateFilter 
} from '../types';

// Mock data generator
const generateMockBookings = (): Booking[] => {
  const statuses: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
  const rooms = ['Anxiety & Stress', 'Depression', 'Relationships', 'Trauma', 'Career Counseling', 'Family Issues'];
  const professionals = ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Williams', 'Dr. David Brown', 'Dr. Lisa Anderson'];
  const clients = ['John Doe', 'Jane Smith', 'Robert Wilson', 'Maria Garcia', 'James Taylor'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `booking-${i + 1}`,
    client: {
      name: clients[Math.floor(Math.random() * clients.length)],
      email: `client${i + 1}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=client${i}`
    },
    professional: {
      name: professionals[Math.floor(Math.random() * professionals.length)],
      email: `pro${i + 1}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=pro${i}`
    },
    room: rooms[Math.floor(Math.random() * rooms.length)],
    date: new Date(2025, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
    time: `${Math.floor(Math.random() * 12) + 9}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
    duration: Math.random() > 0.5 ? 60 : 90,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    price: Math.floor(Math.random() * 100) + 50,
    notes: 'Initial consultation session',
    createdAt: new Date(2025, 0, Math.floor(Math.random() * 18) + 1).toISOString()
  }));
};

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>(generateMockBookings());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Use useMemo for filtered bookings - no useEffect needed
  const filteredBookings = useMemo(() => {
    let result = bookings;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(booking => 
        booking.client.name.toLowerCase().includes(query) ||
        booking.professional.name.toLowerCase().includes(query) ||
        booking.room.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'today') {
        result = result.filter(booking => {
          const bDate = new Date(booking.date);
          bDate.setHours(0, 0, 0, 0);
          return bDate.getTime() === today.getTime();
        });
      } else if (dateFilter === 'week') {
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        result = result.filter(booking => {
          const bDate = new Date(booking.date);
          return bDate >= today && bDate <= weekFromNow;
        });
      } else if (dateFilter === 'month') {
        result = result.filter(booking => {
          const bDate = new Date(booking.date);
          return bDate.getMonth() === today.getMonth() && bDate.getFullYear() === today.getFullYear();
        });
      }
    }

    return result;
  }, [searchQuery, statusFilter, dateFilter, bookings]);

  // Reset current page when filters change
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const handleUpdateStatus = useCallback((bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: newStatus } : b
    ));
    setShowActionsMenu(null);
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
    }
  }, [selectedBooking]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  // Stats - use useMemo
  const stats = useMemo((): Stats => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0)
  }), [bookings]);

  // Handle filter changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleStatusFilterChange = useCallback((value: StatusFilter) => {
    setStatusFilter(value);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleDateFilterChange = useCallback((value: DateFilter) => {
    setDateFilter(value);
    handleFilterChange();
  }, [handleFilterChange]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookings Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredBookings.length} bookings found
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-shadow">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-blue-600">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-red-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
            <p className="text-2xl font-bold text-green-600">${stats.revenue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value as DateFilter)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Booking ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Professional</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Room</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Date & Time</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Price</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        {booking.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.client.avatar}
                          alt={booking.client.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{booking.client.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{booking.client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.professional.avatar}
                          alt={booking.professional.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{booking.professional.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{booking.professional.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{booking.room}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {booking.time} ({booking.duration} min)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${booking.price}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowBookingModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowActionsMenu(showActionsMenu === booking.id ? null : booking.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          
                          {showActionsMenu === booking.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                    <span>Confirm</span>
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    <span>Cancel</span>
                                  </button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Mark Complete</span>
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    <span>Cancel</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBookings.length)} of {filteredBookings.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Booking Details Modal */}
        {showBookingModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowBookingModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Details</h2>
                  <p className="text-gray-600 dark:text-gray-400 font-mono text-sm mt-1">{selectedBooking.id}</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => handleUpdateStatus(selectedBooking.id, e.target.value as BookingStatus)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Client & Professional */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Client</p>
                    <div className="flex items-center gap-3">
                      <img src={selectedBooking.client.avatar} alt={selectedBooking.client.name} className="w-12 h-12 rounded-full" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedBooking.client.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.client.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Professional</p>
                    <div className="flex items-center gap-3">
                      <img src={selectedBooking.professional.avatar} alt={selectedBooking.professional.name} className="w-12 h-12 rounded-full" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedBooking.professional.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.professional.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Room</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedBooking.room}</p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedBooking.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedBooking.time}</p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedBooking.duration} minutes</p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
                    <p className="font-semibold text-green-600 text-xl">${selectedBooking.price}</p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedBooking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <p className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white">
                    {selectedBooking.notes}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;