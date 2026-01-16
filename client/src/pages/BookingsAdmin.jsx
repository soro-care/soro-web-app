import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
  TableHead,
  CircularProgress,
  FormControl,
  Select,
  Card,
  CardContent,
  Typography,
  useMediaQuery,
  useTheme,
  Chip,
  Box,
} from "@mui/material";
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  VideoCall,
  Headphones,
  ArrowDropDown,
  CalendarToday,
  AccessTime,
  Person,
  EventBusy,
  CheckCircleOutline,
  HourglassEmpty,
} from "@mui/icons-material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, isValid } from "date-fns";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

export default function BookingsAdmin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [activeTab, setActiveTab] = useState("Pending");
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [openReschedule, setOpenReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  const user = useSelector((state) => state.user);
  const itemsPerPage = 5;

  const tabs = [
    { label: "Pending", status: "Pending", icon: <HourglassEmpty fontSize="small" /> },
    { label: "Upcoming", status: "Confirmed", icon: <CalendarToday fontSize="small" /> },
    { label: "Completed", status: "Completed", icon: <CheckCircleOutline fontSize="small" /> },
    { label: "Cancelled", status: "Cancelled", icon: <EventBusy fontSize="small" /> },
    { label: "All", status: "all", icon: <CalendarToday fontSize="small" /> },
  ];

  // Fetch all bookings for status counts
  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.adminGetBookings,
        params: { limit: 10000 }
      });
      
      if (response.data.success) {
        const mapped = (response.data.data || []).map((b) => ({
          ...b,
          parsedDate: b.date ? new Date(b.date) : null,
        }));
        setAllBookings(mapped);
        setTotalBookings(response.data.pagination?.totalBookings || 0);
      }
    } catch (err) {
      console.error("Error fetching all bookings:", err);
    }
  };

  // Compute status counts
  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0, all: allBookings.length };
    allBookings.forEach((b) => {
      if (b.status === "Pending") counts.Pending++;
      else if (b.status === "Confirmed") counts.Confirmed++;
      else if (b.status === "Completed") counts.Completed++;
      else if (b.status === "Cancelled") counts.Cancelled++;
    });
    return counts;
  }, [allBookings]);

  // Fetch paginated bookings when tab or page changes
  useEffect(() => {
    fetchBookings();
  }, [activeTab, currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const tab = tabs.find((t) => t.label === activeTab);
      const status = tab?.status === 'all' ? '' : tab?.status;
      
      const response = await Axios({
        ...SummaryApi.adminGetBookings,
        params: {
          status: status,
          page: currentPage,
          limit: itemsPerPage,
          sortBy: 'date',
          sortOrder: 'desc'
        }
      });
      
      if (response.data.success) {
        const mapped = (response.data.data || []).map((b) => ({
          ...b,
          parsedDate: b.date ? new Date(b.date) : null,
        }));
        setBookings(mapped);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalBookings(response.data.pagination?.totalBookings || 0);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings for active tab
  const filteredBookings = useMemo(() => {
    const tab = tabs.find((t) => t.label === activeTab);
    if (!tab || tab.status === 'all') return bookings;
    return (bookings || []).filter((b) => b.status === tab.status);
  }, [bookings, activeTab]);

  // Helper functions
  const formatDateSafe = (date, formatStr = "MMM dd") => {
    if (!date || !isValid(new Date(date))) return "N/A";
    try {
      return format(new Date(date), formatStr);
    } catch {
      return "N/A";
    }
  };

  const handleMenuOpen = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  // Booking action handlers
  const handleCancelBooking = async (booking) => {
    try {
      setCancellingId(booking._id);
      
      await Axios({
        ...SummaryApi.adminUpdateBookingStatus,
        url: `${SummaryApi.adminUpdateBookingStatus.url}/${booking._id}/status`,
        method: 'patch',
        data: {
          status: 'Cancelled',
          cancellationReason: "Admin cancelled booking"
        }
      });
      
      // Refresh data
      fetchBookings();
      fetchAllBookings();
      
      setCancellingId(null);
      setShowCancelModal(false);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setCancellingId(null);
      setShowCancelModal(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      await Axios({
        ...SummaryApi.adminUpdateBookingStatus,
        url: `${SummaryApi.adminUpdateBookingStatus.url}/${selectedBooking._id}/status`,
        method: 'patch',
        data: { status: 'Confirmed' }
      });
      
      fetchBookings();
      fetchAllBookings();
      handleMenuClose();
    } catch (err) {
      console.error("Error confirming booking:", err);
    }
  };

  const handleCompleteBooking = async () => {
    try {
      await Axios({
        ...SummaryApi.adminUpdateBookingStatus,
        url: `${SummaryApi.adminUpdateBookingStatus.url}/${selectedBooking._id}/status`,
        method: 'patch',
        data: { status: 'Completed' }
      });
      
      fetchBookings();
      fetchAllBookings();
      handleMenuClose();
    } catch (err) {
      console.error("Error completing booking:", err);
    }
  };

  const handleReschedule = () => {
    setOpenReschedule(true);
    handleMenuClose();
  };

  const handleRescheduleSubmit = async () => {
    try {
      if (!rescheduleDate || !isValid(rescheduleDate)) {
        throw new Error("Invalid date selected");
      }
      
      // For rescheduling, you might need a separate endpoint
      // This is a placeholder implementation
      await Axios.put(`/api/booking/${selectedBooking._id}/reschedule`, {
        newDate: rescheduleDate,
        newStartTime: format(rescheduleDate, "HH:mm"),
        newEndTime: format(new Date(rescheduleDate.getTime() + 60 * 60 * 1000), "HH:mm"),
      });
      
      setOpenReschedule(false);
      setRescheduleDate(null);
      fetchBookings();
      fetchAllBookings();
    } catch (err) {
      console.error("Error rescheduling booking:", err);
    }
  };

  // Empty state component
  const EmptyState = () => {
    const IconComponent = {
      Pending: HourglassEmpty,
      Upcoming: CalendarToday,
      Completed: CheckCircleOutline,
      Cancelled: EventBusy,
      All: CalendarToday,
    }[activeTab];

    const messages = {
      Pending: {
        title: "No Pending Requests",
        description: "Pending booking requests will appear here",
      },
      Upcoming: {
        title: "No Upcoming Sessions",
        description: "You don't have any upcoming bookings scheduled",
      },
      Completed: {
        title: "No Completed Sessions",
        description: "Your completed sessions will appear here",
      },
      Cancelled: {
        title: "No Cancelled Sessions",
        description: "Cancelled sessions will appear here",
      },
      All: {
        title: "No Bookings",
        description: "No bookings found in the system",
      },
    }[activeTab];

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          textAlign: "center",
        }}
      >
        <IconComponent
          sx={{
            fontSize: 64,
            color: "grey.400",
            mb: 2,
          }}
        />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {messages.title}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 300 }}>
          {messages.description}
        </Typography>
      </Box>
    );
  };

  return (
    <div
      className={`${
        user?._id
          ? "px-4 py-8 md:ml-64 md:px-8 md:py-12 bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7]"
          : ""
      } min-h-screen`}
    >
      <div className="mb-6 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#30459D]">
          Bookings Management
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Manage all platform bookings at a glance ✨
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs Header */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          {isMobile ? (
            <FormControl fullWidth>
              <Select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "Select booking status" }}
                IconComponent={ArrowDropDown}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "12px 32px 12px 16px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  },
                }}
              >
                {tabs.map((tab) => (
                  <MenuItem key={tab.label} value={tab.label}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                      <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs ml-2">
                        {statusCounts[tab.status] || 0}
                      </span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => {
                      setActiveTab(tab.label);
                      setCurrentPage(1); // Reset to first page when changing tabs
                    }}
                    className={`px-4 py-2 flex items-center gap-2 border-b-2 ${
                      activeTab === tab.label
                        ? "border-[#30459D] text-[#30459D]"
                        : "border-transparent text-gray-600 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tab.icon}
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                    <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                      {statusCounts[tab.status] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content - Mobile Cards or Desktop Table */}
        {isMobile ? (
          <div className="p-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="px-4 py-3 border border-gray-100 bg-[#fbfbfb7b] hover:bg-[#fbfbfb] mb-4">
                  <div>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="text" width="70%" height={20} />
                    <div className="mt-3 flex justify-end">
                      <Skeleton variant="circular" width={32} height={32} />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredBookings.length === 0 ? (
              <EmptyState />
            ) : (
              filteredBookings.map((booking) => (
                <MobileBookingCard
                  key={booking._id}
                  role={user.role}
                  booking={booking}
                  onMoreClick={handleMenuOpen}
                  cancellingId={cancellingId}
                  setBookingToCancel={setBookingToCancel}
                  setShowCancelModal={setShowCancelModal}
                />
              ))
            )}
          </div>
        ) : (
          <TableContainer className="rounded-b-xl">
            <Table className="responsive-table">
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="p-3 md:p-4 font-semibold text-gray-600 min-w-[140px]">
                    Client
                  </TableCell>
                  <TableCell className="p-3 md:p-4 font-semibold text-gray-600 min-w-[140px]">
                    Professional
                  </TableCell>
                  <TableCell className="p-3 md:p-4 font-semibold text-gray-600 min-w-[180px]">
                    Date & Time
                  </TableCell>
                  <TableCell className="p-3 md:p-4 font-semibold text-gray-600 w-[80px]">
                    Type
                  </TableCell>
                  <TableCell className="p-3 md:p-4 font-semibold text-gray-600 min-w-[120px]">
                    Status
                  </TableCell>
                  <TableCell className="p-3 md:p-4 font-semibold text-gray-600 min-w-[200px]">
                    Concern
                  </TableCell>
                  <TableCell className="p-3 md:p-4 font-semibold text-gray-600 text-right w-[120px]">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={120} height={24} /></TableCell>
                      <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={120} height={24} /></TableCell>
                      <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={140} height={24} /></TableCell>
                      <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
                      <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
                      <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={100} height={24} /></TableCell>
                      <TableCell className="p-2 md:p-3 text-right"><Skeleton variant="circular" width={32} height={32} /></TableCell>
                    </TableRow>
                  ))
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking._id} hover className="group">
                      <TableCell className="p-2 md:p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                            <span className="text-sm font-medium text-[#30459D]">
                              {booking.user?.name ? booking.user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm truncate max-w-[120px]">
                              {booking.user?.name || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {booking.user?.userId || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="p-2 md:p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {booking.professional?.name ? booking.professional.name.charAt(0).toUpperCase() : 'P'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm truncate max-w-[120px]">
                              {booking.professional?.name || 'Unknown Professional'}
                            </span>
                            {booking.professional?.isPeerCounselor && (
                              <span className="text-xs text-gray-500">
                                {booking.professional.counselorId}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="p-2 md:p-3">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {formatDateSafe(booking.date, "MMM dd, yyyy")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {booking.startTime || "N/A"} – {booking.endTime || "N/A"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="p-2 md:p-3">
                        {booking.modality === "Video" ? (
                          <VideoCall className="text-[#30459D] w-5 h-5" />
                        ) : (
                          <Headphones className="text-blue-400 w-5 h-5" />
                        )}
                      </TableCell>

                      <TableCell className="p-2 md:p-3">
                        <Chip
                          label={booking.status}
                          size="small"
                          sx={{
                            backgroundColor: booking.status === 'Confirmed' ? 'rgba(76, 175, 80, 0.1)' :
                                          booking.status === 'Pending' ? 'rgba(255, 152, 0, 0.1)' :
                                          booking.status === 'Completed' ? 'rgba(76, 175, 80, 0.1)' :
                                          booking.status === 'Cancelled' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                            color: booking.status === 'Confirmed' ? '#4caf50' :
                                  booking.status === 'Pending' ? '#ff9800' :
                                  booking.status === 'Completed' ? '#4caf50' :
                                  booking.status === 'Cancelled' ? '#f44336' : '#9e9e9e',
                            fontWeight: 500,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>

                      <TableCell className="p-2 md:p-3">
                        <span className="text-sm text-gray-600 truncate max-w-[200px] block">
                          {booking.concern || "Not specified"}
                        </span>
                      </TableCell>

                      <TableCell className="p-2 md:p-3 text-right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, booking)}
                          className="text-gray-400 hover:text-[#30459D]"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Showing {filteredBookings.length} of {totalBookings} bookings
            </span>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                size="small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="min-w-[80px] text-gray-600 border-gray-300 hover:border-gray-400"
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="contained"
                size="small"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="min-w-[80px] bg-[#30459D] text-white hover:bg-[#263685]"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ className: "rounded-xl shadow-lg" }}
      >
        {selectedBooking?.status === "Pending" && (
          <MenuItem onClick={handleConfirmBooking}>
            <CheckCircleIcon className="mr-2 text-green-500" /> Approve
          </MenuItem>
        )}
        
        {selectedBooking?.status === "Confirmed" && (
          <MenuItem onClick={handleCompleteBooking}>
            <CheckCircleIcon className="mr-2 text-green-500" /> Mark Complete
          </MenuItem>
        )}
        
        {(selectedBooking?.status === "Pending" || selectedBooking?.status === "Confirmed") && (
          <MenuItem onClick={() => {
            setBookingToCancel(selectedBooking);
            setShowCancelModal(true);
            handleMenuClose();
          }}>
            <CancelIcon className="mr-2 text-red-500" /> Cancel
          </MenuItem>
        )}
        
        {selectedBooking?.status === "Completed" && (
          <MenuItem>
            <CheckCircleIcon className="mr-2 text-green-500" /> View Details
          </MenuItem>
        )}
        
        {selectedBooking?.status === "Cancelled" && (
          <MenuItem>
            <CancelIcon className="mr-2 text-red-500" /> View Details
          </MenuItem>
        )}
      </Menu>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        PaperProps={{ className: "rounded-xl max-w-md" }}
      >
        <DialogTitle className="bg-gradient-to-r from-[#30459D] to-[#4066D0] text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <CancelIcon className="text-white" />
            <span>Cancel Booking</span>
          </div>
        </DialogTitle>
        <DialogContent className="p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <CancelIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Confirm Cancellation
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be 
              undone.
            </p>
          </div>
        </DialogContent>
        <DialogActions className="p-6 pt-0 border-t border-gray-100">
          <div className="flex gap-3 w-full">
            <Button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 text-gray-600 hover:bg-gray-50"
            >
              No, Keep Booking
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                await handleCancelBooking(bookingToCancel);
              }}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
              disabled={cancellingId === bookingToCancel?._id}
              startIcon={
                cancellingId === bookingToCancel?._id ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {cancellingId === bookingToCancel?._id
                ? "Cancelling..."
                : "Yes, Cancel"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function MobileBookingCard({
  booking,
  role,
  onMoreClick,
  cancellingId,
  setBookingToCancel,
  setShowCancelModal,
}) {
  return (
    <div className="mb-4 border border-gray-100 bg-[#ffffff]">
      <div className="px-4 py-3 border border-gray-100 bg-[#fbfbfb7b] hover:bg-[#fbfbfb]">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="text-sm font-medium text-[#30459D]">
                {booking.user?.name
                  ? booking.user.userId?.split(" ").map(w => w[0]).join("").toUpperCase()
                  : booking.professional?.isPeerCounselor
                    ? "PC"
                    : booking.professional?.counselorId
                        ?.split(" ")
                        .map(w => w[0])
                        .join("")
                        .toUpperCase() || ""
                }
              </span>
            </div>
            <div>
              <Typography variant="subtitle1" fontWeight={600}>
                {booking.user?.name
                  ? booking.user.userId
                  : booking.professional?.isPeerCounselor
                    ? booking.professional.counselorId
                    : booking.professional?.counselorId || ""
                }
              </Typography>
              {booking.professional?.isPeerCounselor && (
                <Typography variant="caption" color="textSecondary">
                  Peer Counselor
                </Typography>
              )}
            </div>
          </div>
          <div>
            {booking.modality === "Video" ? (
              <VideoCall className="text-[#30459D] w-5 h-5" />
            ) : (
              <Headphones className="text-blue-400 w-5 h-5" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1">
            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary">
              {booking.parsedDate
                ? format(booking.parsedDate, "MMM dd, yyyy")
                : "N/A"}
            </Typography>
          </div>
          <div className="flex items-center gap-1">
            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary">
              {booking.startTime} – {booking.endTime}
            </Typography>
          </div>
        </div>

        <Typography variant="body2" className="mb-3">
          <strong>Concern:</strong> {booking.concern || "Not specified"}
        </Typography>

        <div className="flex justify-end">
          {booking.status === "Pending" && role === "USER" ? (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={
                cancellingId === booking._id ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CancelIcon />
                )
              }
              onClick={() => {
                setBookingToCancel(booking);
                setShowCancelModal(true);
              }}
              sx={{
                color: 'error.main',
                borderColor: 'error.light',
                '&:hover': { backgroundColor: 'error.light' }
              }}
              disabled={cancellingId === booking._id}
            >
              {cancellingId === booking._id ? "Cancelling..." : "Cancel"}
            </Button>
          ) : (
            <IconButton
              size="small"
              onClick={(e) => onMoreClick(e, booking)}
              sx={{ color: 'grey.600', '&:hover': { color: 'primary.main' } }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}


MobileBookingCard.propTypes = {
  booking: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    user: PropTypes.shape({ 
      name: PropTypes.string,
      userId: PropTypes.string 
    }),
    professional: PropTypes.shape({ 
      name: PropTypes.string,
      isPeerCounselor: PropTypes.bool,
      counselorId: PropTypes.string 
    }),
    date: PropTypes.string,
    parsedDate: PropTypes.instanceOf(Date),
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    modality: PropTypes.string,
    concern: PropTypes.string,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onMoreClick: PropTypes.func.isRequired,
  role: PropTypes.string,
  cancellingId: PropTypes.string,
  setBookingToCancel: PropTypes.func.isRequired,
  setShowCancelModal: PropTypes.func.isRequired,
};