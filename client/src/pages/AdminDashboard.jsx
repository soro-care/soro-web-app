import { useState, useEffect } from 'react';
import { 
  Users, BarChart, BookText, UserPlus, Shield, Mail,
  X, CheckCircle, Calendar, Clock, TrendingUp, UserCheck,
  Sliders, Target
} from 'lucide-react';
import Axios from '../utils/Axios';
import { Snackbar, Alert } from '@mui/material';
import SummaryApi from '../common/SummaryApi';

const AdminDashboard = () => {
  const [showPreauthorizeModal, setShowPreauthorizeModal] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [preauthorizedUsers, setPreauthorizedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [stats, setStats] = useState({
    users: {
      total: 0,
      professionals: 0,
      newThisMonth: 0
    },
    bookings: {
      total: 0,
      pending: 0,
      completed: 0
    },
    slots: {
      total: 0
    },
    platform: {
      utilizationRate: 0
    }
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    fetchPreauthorizedUsers();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoadingStats(true);
      const response = await Axios({
        ...SummaryApi.getAdminStats,
        data: null
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setSnackbar({
        open: true,
        message: 'Error loading dashboard statistics',
        severity: 'error'
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPreauthorizedUsers = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getPreauthorized,
        data: null // Explicitly set data to null for GET requests
      });
      setPreauthorizedUsers(response.data);
      setStats(prev => ({
        ...prev,
        preauthorizedProfessionals: response.data.length
      }));
    } catch (error) {
      console.error('Error fetching preauthorized users:', error);
      setSnackbar({
        open: true,
        message: 'Error loading preauthorized users',
        severity: 'error'
      });
    }
  };

  const handlePreauthorize = async () => {
    if (!email) {
      setSnackbar({
        open: true,
        message: 'Please enter an email address',
        severity: 'warning'
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email address',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await Axios({
        ...SummaryApi.preauthorizeProfessional,
        data: { email }
      });
      
      setSnackbar({
        open: true,
        message: response.data.message || 'Professional preauthorized successfully!',
        severity: 'success'
      });
      
      setEmail('');
      setShowPreauthorizeModal(false);
      fetchPreauthorizedUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Error preauthorizing professional';
      setSnackbar({
        open: true,
        message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePreauthorization = async (userId) => {
    try {
      await Axios({
        ...SummaryApi.deletePreauthorization,
        url: `${SummaryApi.deletePreauthorization.url}/${userId}`,
        data: null
      });
      
      setSnackbar({
        open: true,
        message: 'Preauthorization removed successfully',
        severity: 'success'
      });
      fetchPreauthorizedUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error removing preauthorization',
        severity: 'error'
      });
    } finally {
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };


  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Loading state for stats
  if (loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30459D]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex mb-8 items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#30459D]">
            Hi, <span className="text-[#30459D]">Admin</span>
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            A quick look at stats 📊
          </p>
        </div>
        <button
          onClick={() => setShowPreauthorizeModal(true)}
          className="bg-[#30459D] hover:bg-[#25367d] text-white px-4 py-2 rounded-md flex items-center"
        >
          Preauthorize Counsellor
        </button>
      </div>

      {/* Stats Grid - 6 Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Users (USER role only) */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{formatNumber(stats.users.total)}</h3>
              <p className="text-gray-500">Total Users</p>
            </div>
          </div>
        </div>

        {/* Total Professionals */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{formatNumber(stats.users.professionals)}</h3>
              <p className="text-gray-500">Professionals</p>
            </div>
          </div>
        </div>

        {/* New Users This Month */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{formatNumber(stats.users.newThisMonth)}</h3>
              <p className="text-gray-500">New Users (Month)</p>
            </div>
          </div>
        </div>

        {/* Total Bookings with breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <BookText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{formatNumber(stats.bookings.total)}</h3>
              <p className="text-gray-500">Total Bookings</p>
            </div>
          </div>
          {/* <div className="border-t pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-600">Pending: {formatNumber(stats.bookings.pending)}</span>
              <span className="text-green-600">Completed: {formatNumber(stats.bookings.completed)}</span>
            </div>
          </div> */}
        </div>

        {/* Total Available Slots */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-full">
              <Sliders className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{formatNumber(stats.slots.total)}</h3>
              <p className="text-gray-500">Available Slots</p>
            </div>
          </div>
        </div>

        {/* Platform Utilization Rate */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.platform.utilizationRate}%</h3>
              <p className="text-gray-500">Utilization Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preauthorized Professionals Table (Keep this section as it was) */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold">Preauthorized Professionals</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#30459D]"
            />
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Authorized By</th>
                <th className="text-left py-3 px-4">Date Authorized</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {preauthorizedUsers.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {user.authorizedBy?.email || 'System'}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setUserToDelete(user);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
              {preauthorizedUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No preauthorized professionals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {preauthorizedUsers.map((user) => (
              <div key={user._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {user.email}
                    </span>
                  </div>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => {
                      setUserToDelete(user);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  Authorized by: {user.authorizedBy?.email || 'System'}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Date: {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Authorized
                  </span>
                </div>
              </div>
            ))}
            {preauthorizedUsers.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No preauthorized professionals found
              </div>
            )}
          </div>
        </div>
      </div>

      

      {/* Preauthorize Modal */}
      {showPreauthorizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preauthorize Professional</h2>
              <button
                onClick={() => setShowPreauthorizeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Add a professional's email to allow them to register on the platform.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter professional's email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#30459D]"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPreauthorizeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePreauthorize}
                disabled={loading}
                className="px-4 py-2 bg-[#30459D] text-white rounded-md hover:bg-[#25367d] disabled:opacity-50"
              >
                {loading ? 'Authorizing...' : 'Authorize Professional'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Remove Preauthorization</h2>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove preauthorization for {userToDelete?.email}?
              This will prevent them from registering as a professional.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePreauthorization(userToDelete?._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove Authorization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminDashboard;