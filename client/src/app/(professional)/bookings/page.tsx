// ============================================
// 📁 FILE: src/app/(professional)/bookings/page.tsx
// Professional Bookings Management - TYPE SAFE VERSION
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/new-input';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Video,
  Mic,
  MoreVertical,
  Loader2,
  FileText,
} from 'lucide-react';
import { professionalAPI } from '@/lib/api/professional';
import { bookingsAPI, type Booking } from '@/lib/api/bookings';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type BookingFilter = 'all' | 'pending' | 'confirmed' | 'completed';

export default function ProfessionalBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Complete booking dialog
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, filter, searchQuery]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const data = await professionalAPI.getMyBookings();
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Apply status filter
    if (filter === 'pending') {
      filtered = filtered.filter((b) => b.status === 'Pending');
    } else if (filter === 'confirmed') {
      filtered = filtered.filter((b) => b.status === 'Confirmed');
    } else if (filter === 'completed') {
      filtered = filtered.filter((b) => b.status === 'Completed');
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((b) =>
        b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.concern?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleConfirm = async (bookingId: string) => {
    try {
      await professionalAPI.confirmBooking(bookingId);
      toast.success('Booking confirmed!');
      loadBookings();
    } catch (error) {
      toast.error('Failed to confirm booking');
    }
  };

  const handleCancel = async (bookingId: string) => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await professionalAPI.cancelBooking(bookingId, reason);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleComplete = async () => {
    if (!selectedBooking) return;

    setIsCompleting(true);
    try {
      await professionalAPI.completeBooking(selectedBooking.id, sessionNotes);
      toast.success('Session marked as complete!');
      setCompleteDialogOpen(false);
      setSessionNotes('');
      setSelectedBooking(null);
      loadBookings();
    } catch (error) {
      toast.error('Failed to complete booking');
    } finally {
      setIsCompleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'Completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'Cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const filterOptions: Array<{ value: BookingFilter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Bookings Management</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage all your client sessions
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by client name or concern..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {filterOptions.map((filterOption) => (
              <Button
                key={filterOption.value}
                variant={filter === filterOption.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterOption.value)}
                className={filter === filterOption.value ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : ''}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {filter === 'all'
              ? "You don't have any bookings yet"
              : `No ${filter} bookings`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                    {booking.user?.name?.[0] || 'C'}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {booking.user?.name || 'Anonymous Client'}
                      </h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.modality === 'Video' ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                        {booking.modality}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Concern:</strong> {booking.concern}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'Pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(booking.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(booking.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </>
                      )}

                      {booking.status === 'Confirmed' && booking.meetingLink && (
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={booking.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Session
                          </a>
                        </Button>
                      )}

                      {booking.status === 'Confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setCompleteDialogOpen(true);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    {booking.status !== 'Cancelled' && (
                      <DropdownMenuItem
                        onClick={() => handleCancel(booking.id)}
                        className="text-red-600"
                      >
                        Cancel Booking
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Complete Session Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Session</DialogTitle>
            <DialogDescription>
              Add session notes (optional) and mark this session as complete.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sessionNotes">Session Notes (Optional)</Label>
              <Textarea
                id="sessionNotes"
                rows={6}
                placeholder="Record any important observations or next steps..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                These notes are confidential and for your records only
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCompleteDialogOpen(false);
                setSessionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-gradient-to-r from-blue-500 to-cyan-600"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}