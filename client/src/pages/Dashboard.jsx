import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { useNavigate } from 'react-router-dom';
import { 
  Snackbar,
  Alert
} from '@mui/material';
import ProfessionalDashboard from './ProfessionalDashboard';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showInitModal, setShowInitModal] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [professionalAvailability, setProfessionalAvailability] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingSessions, setPendingSessions] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  console.log(upcomingSessions, 'upcomingSessions')
  console.log(pendingSessions, 'pendingSessions')
  console.log(user, 'user')

  useEffect(() => {
    checkInitialization();
    fetchDashboardData();
    fetchRecentBlogs();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const availabilityRes = await Axios.get('/api/availability');
      setProfessionalAvailability(availabilityRes.data);
      
      const [confirmedRes, pendingRes] = await Promise.all([
        Axios.get('/api/booking?status=Confirmed&limit=3'),
        Axios.get('/api/booking?status=Pending&limit=3')
      ]);
      
      setUpcomingSessions(confirmedRes.data.bookings);
      setPendingSessions(pendingRes.data.bookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSnackbar({
        open: true,
        message: 'Error loading dashboard data',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!showBookingForm) {
      fetchDashboardData();
    }
  }, [showBookingForm]);

  const handleNewBooking = async (newBooking, professional) => {
    if (user?.role === 'USER') {
      setPendingSessions(prev => [
        { 
          ...newBooking, 
          status: 'Pending',
          professional: professional 
        },
        ...prev
      ].slice(0, 3));
    }

    await fetchDashboardData();

    setSnackbar({
      open: true,
      message: 'Booking created! Waiting for confirmation',
      severity: 'success'
    });
  };

  const handleApprove = async (bookingId) => {
    try {
      setApprovingId(bookingId);
      await Axios.put(`/api/booking/${bookingId}/confirm`);
      setSnackbar({
        open: true,
        message: 'Booking approved successfully',
        severity: 'success'
      });
      fetchDashboardData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error approving booking',
        severity: 'error'
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    fetchDashboardData();
  };

  const handleReject = async (bookingId) => {
  try {
    setRejectingId(bookingId);
    const response = await Axios.put(`/api/booking/${bookingId}/cancel`, {
      cancellationReason: 'Professional rejected booking'
    });
    
    // Check if the booking was actually cancelled (status 200)
    if (response.status === 200) {
      setSnackbar({
        open: true,
        message: 'Booking rejected successfully',
        severity: 'success'
      });
      fetchDashboardData();
    } else {
      throw new Error(response.data.message || 'Error rejecting booking');
    }
  } catch (error) {
    // Check if it's just an email error
    if (error.response?.data?.error?.includes('No recipients')) {
      setSnackbar({
        open: true,
        message: 'Booking cancelled but notification failed',
        severity: 'warning'
      });
      fetchDashboardData();
    } else {
      setSnackbar({
        open: true,
        message: 'Error rejecting booking',
        severity: 'error'
      });
    }
  } finally {
    setRejectingId(null);
  }
};
  
  const checkInitialization = async () => {
    try {
      const response = await Axios.get('/api/availability/check-initialized');
      
      if (!response.data.isInitialized && user?.role === 'PROFESSIONAL') {
        setShowInitModal(true);
      }
    } catch (error) {
      console.error('Error checking initialization:', error);
      setSnackbar({
        open: true,
        message: 'Error checking availability status',
        severity: 'error'
      });
    }
  };

  const initializeAvailability = async () => {
    try {
      setInitializing(true);
      const response = await Axios.post('/api/availability/initialize');
      
      if (response.status === 201) {
        setShowInitModal(false);
        setSnackbar({
          open: true,
          message: 'Availability initialized successfully',
          severity: 'success'
        });
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error initializing availability:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error initializing availability',
        severity: 'error'
      });
    } finally {
      setInitializing(false);
    }
  };

  const fetchRecentBlogs = async () => {
    try {
      setLoading(true);
      const response = await Axios({ ...SummaryApi.getRecentBlogs });
      if (response.data.success) {
        setBlogs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${user?._id ? 'md:ml-64 bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7]' : ''} min-h-screen`}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {user?.role === 'PROFESSIONAL' ? (
          <ProfessionalDashboard
            user={user}
            isLoading={isLoading}
            showInitModal={showInitModal}
            setShowInitModal={setShowInitModal}
            initializing={initializing}
            setInitializing={setInitializing}
            snackbar={snackbar}
            setSnackbar={setSnackbar}
            professionalAvailability={professionalAvailability}
            upcomingSessions={upcomingSessions}
            pendingSessions={pendingSessions}
            approvingId={approvingId}
            rejectingId={rejectingId}
            handleApprove={handleApprove}
            handleReject={handleReject}
            initializeAvailability={initializeAvailability}
            fetchDashboardData={fetchDashboardData}
          />
        ) : user?.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : (
          <UserDashboard
            user={user}
            isLoading={isLoading}
            selectedMood={selectedMood}
            setSelectedMood={setSelectedMood}
            showBookingForm={showBookingForm}
            setShowBookingForm={setShowBookingForm}
            pendingSessions={pendingSessions}
            upcomingSessions={upcomingSessions}
            blogs={blogs}
            loading={loading}
            handleNewBooking={handleNewBooking}
            handleCloseBookingForm={handleCloseBookingForm}
          />
        )}
        
      </div>
    </div>
  );
};

export default Dashboard;