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
  Typography,
  useMediaQuery,
  useTheme,
  Chip,
  Box,
  Avatar,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person,
  Psychology,
  AdminPanelSettings,
  Visibility,
  ArrowDropDown,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

export default function UsersAdmin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const user = useSelector((state) => state.user);
  const itemsPerPage = 10;

  const tabs = [
    { label: "All Users", value: "all", icon: <Person fontSize="small" /> },
    { label: "Clients", value: "USER", icon: <Person fontSize="small" /> },
    { label: "Professionals", value: "PROFESSIONAL", icon: <Psychology fontSize="small" /> },
    { label: "Admins", value: "ADMIN", icon: <AdminPanelSettings fontSize="small" /> },
  ];

  // Fetch all users for counts
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.adminGetUsers,
        params: { limit: 10000 }
      });
      
      if (response.data.success) {
        setAllUsers(response.data.data || []);
        setTotalUsers(response.data.pagination?.totalUsers || 0);
      }
    } catch (err) {
      console.error("Error fetching all users:", err);
      showSnackbar('Error fetching users', 'error');
    }
  };

  // Compute role counts
  const roleCounts = useMemo(() => {
    const counts = { all: allUsers.length, USER: 0, PROFESSIONAL: 0, ADMIN: 0, SUPERADMIN: 0 };
    allUsers.forEach((u) => {
      if (u.role === "USER") counts.USER++;
      else if (u.role === "PROFESSIONAL") counts.PROFESSIONAL++;
      else if (u.role === "ADMIN") counts.ADMIN++;
      else if (u.role === "SUPERADMIN") counts.SUPERADMIN++;
    });
    return counts;
  }, [allUsers]);

  // Fetch paginated users when tab, page, or search changes
  useEffect(() => {
    fetchUsers();
  }, [activeTab, currentPage, searchTerm]);

  // Fetch paginated users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const role = activeTab === "all" ? "" : activeTab;
      
      const response = await Axios({
        ...SummaryApi.adminGetUsers,
        params: {
          role: role,
          search: searchTerm,
          page: currentPage,
          limit: itemsPerPage,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      
      if (response.data.success) {
        setUsers(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalUsers(response.data.pagination?.totalUsers || 0);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      showSnackbar('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter users for active tab
  const filteredUsers = useMemo(() => {
    if (activeTab === "all") return users;
    return users.filter((u) => u.role === activeTab);
  }, [users, activeTab]);

  // Helper functions
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      setDeletingId(selectedUser._id);
      
      const response = await Axios({
        ...SummaryApi.adminDeleteUser,
        url: `${SummaryApi.adminDeleteUser.url}/${selectedUser._id}`,
        data: null
      });
      
      if (response.data.success) {
        showSnackbar('User deleted successfully');
        fetchUsers();
        fetchAllUsers();
      }
      
    } catch (err) {
      console.error("Error deleting user:", err);
      showSnackbar('Error deleting user', 'error');
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      handleMenuClose();
    }
  };

  // Update user status
  const handleStatusChange = async (user, newStatus) => {
    try {
      setUpdatingId(user._id);
      
      const response = await Axios({
        ...SummaryApi.adminUpdateUserStatus,
        url: `${SummaryApi.adminUpdateUserStatus.url}/${user._id}/status`,
        data: { status: newStatus }
      });
      
      if (response.data.success) {
        showSnackbar(`User status updated to ${newStatus}`);
        fetchUsers();
        fetchAllUsers();
      }
      
    } catch (err) {
      console.error("Error updating user status:", err);
      showSnackbar('Error updating user status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
    handleMenuClose();
  };

  // Empty state component
  const EmptyState = () => {
    const IconComponent = Person;
    const messages = {
      all: {
        title: "No Users Found",
        description: "No users match your search criteria",
      },
      USER: {
        title: "No Clients Found",
        description: "No client users found in the system",
      },
      PROFESSIONAL: {
        title: "No Professionals Found",
        description: "No professional users found in the system",
      },
      ADMIN: {
        title: "No Admins Found",
        description: "No admin users found in the system",
      },
    }[activeTab] || messages.all;

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

  // Helper functions for styling
  const getAvatarColor = (role) => {
    const colors = {
      USER: '#3B82F6',
      PROFESSIONAL: '#10B981',
      ADMIN: '#8B5CF6',
      SUPERADMIN: '#F59E0B'
    };
    return colors[role] || '#6B7280';
  };

  const getRoleColor = (role) => {
    const colors = {
      USER: '#3B82F6',
      PROFESSIONAL: '#10B981',
      ADMIN: '#8B5CF6',
      SUPERADMIN: '#F59E0B'
    };
    return colors[role] || '#6B7280';
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
          User Management
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Manage all platform users and their permissions ✨
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header with Search and Tabs */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <TextField
                fullWidth
                placeholder="Search users by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                size="small"
                className="bg-gray-50 rounded-lg"
                InputProps={{
                  className: "rounded-lg",
                }}
              />
            </div>
          </div>

          {isMobile ? (
            <FormControl fullWidth>
              <Select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value);
                  setCurrentPage(1);
                }}
                displayEmpty
                inputProps={{ "aria-label": "Select user type" }}
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
                  <MenuItem key={tab.value} value={tab.value}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                      <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs ml-2">
                        {roleCounts[tab.value] || 0}
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
                    key={tab.value}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 flex items-center gap-2 border-b-2 ${
                      activeTab === tab.value
                        ? "border-[#30459D] text-[#30459D]"
                        : "border-transparent text-gray-600 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tab.icon}
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                    <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                      {roleCounts[tab.value] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content - Desktop Table */}
        <TableContainer className="rounded-b-xl">
          <Table className="responsive-table">
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="p-3 md:p-4 font-semibold text-gray-600 min-w-[200px]">
                  User
                </TableCell>
                <TableCell className="p-3 md:p-4 font-semibold text-gray-600 min-w-[120px]">
                  Role
                </TableCell>
                <TableCell className="p-3 md:p-4 font-semibold text-gray-600 min-w-[120px]">
                  Status
                </TableCell>
                <TableCell className="p-3 md:p-4 font-semibold text-gray-600 min-w-[150px]">
                  Joined Date
                </TableCell>
                <TableCell className="p-3 md:p-4 font-semibold text-gray-600 min-w-[120px]">
                  Last Login
                </TableCell>
                <TableCell className="p-3 md:p-4 font-semibold text-gray-600 text-right w-[100px]">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={180} height={24} /></TableCell>
                    <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
                    <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
                    <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={100} height={24} /></TableCell>
                    <TableCell className="p-2 md:p-3"><Skeleton variant="rectangular" width={100} height={24} /></TableCell>
                    <TableCell className="p-2 md:p-3 text-right"><Skeleton variant="circular" width={32} height={32} /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((userItem) => (
                  <TableRow key={userItem._id} hover className="group">
                    <TableCell className="p-2 md:p-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={userItem.avatar}
                          sx={{ width: 40, height: 40, bgcolor: getAvatarColor(userItem.role) }}
                        >
                          {userItem.name ? userItem.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {userItem.name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {userItem.email}
                          </span>
                          <span className="text-xs text-gray-400">
                            ID: {userItem.userId || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="p-2 md:p-3">
                      <Chip
                        label={userItem.role}
                        size="small"
                        sx={{
                          backgroundColor: getRoleColor(userItem.role),
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.7rem'
                        }}
                      />
                    </TableCell>

                    <TableCell className="p-2 md:p-3">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={userItem.status === 'Active'}
                            onChange={(e) => {
                              const newStatus = e.target.checked ? 'Active' : 'Inactive';
                              handleStatusChange(userItem, newStatus);
                            }}
                            disabled={updatingId === userItem._id}
                            size="small"
                            color="success"
                          />
                        }
                        label={
                          <span className="text-sm">
                            {userItem.status}
                            {updatingId === userItem._id && (
                              <CircularProgress size={12} sx={{ ml: 1 }} />
                            )}
                          </span>
                        }
                      />
                    </TableCell>

                    <TableCell className="p-2 md:p-3">
                      <span className="text-sm text-gray-600">
                        {formatDate(userItem.createdAt)}
                      </span>
                    </TableCell>

                    <TableCell className="p-2 md:p-3">
                      <span className="text-sm text-gray-600">
                        {userItem.last_login_date ? formatDate(userItem.last_login_date) : 'Never'}
                      </span>
                    </TableCell>

                    <TableCell className="p-2 md:p-3 text-right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, userItem)}
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

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {totalUsers} users
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
        <MenuItem onClick={() => handleViewUser(selectedUser)}>
          <Visibility className="mr-2 text-blue-500" /> View Details
        </MenuItem>
        <MenuItem onClick={() => setShowDeleteModal(true)}>
          <DeleteIcon className="mr-2 text-red-500" /> Delete User
        </MenuItem>
      </Menu>

      {/* View User Dialog */}
      <Dialog
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "rounded-xl" }}
      >
        <DialogTitle className="bg-gradient-to-r from-[#30459D] to-[#4066D0] text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <Person className="text-white" />
            <span>User Details</span>
          </div>
        </DialogTitle>
        <DialogContent className="p-6">
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar
                  src={selectedUser.avatar}
                  sx={{ width: 80, height: 80, bgcolor: getAvatarColor(selectedUser.role) }}
                >
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedUser.email}
                  </Typography>
                  <Chip
                    label={selectedUser.role}
                    size="small"
                    sx={{
                      backgroundColor: getRoleColor(selectedUser.role),
                      color: 'white',
                      marginTop: 1
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    User ID
                  </Typography>
                  <Typography variant="body2">{selectedUser.userId || 'N/A'}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedUser.status}
                    size="small"
                    color={selectedUser.status === 'Active' ? 'success' : 'default'}
                  />
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Mobile
                  </Typography>
                  <Typography variant="body2">{selectedUser.mobile || 'N/A'}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Joined Date
                  </Typography>
                  <Typography variant="body2">{formatDate(selectedUser.createdAt)}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Login
                  </Typography>
                  <Typography variant="body2">
                    {selectedUser.last_login_date ? formatDate(selectedUser.last_login_date) : 'Never'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email Verified
                  </Typography>
                  <Typography variant="body2">
                    {selectedUser.verify_email ? 'Yes' : 'No'}
                  </Typography>
                </div>
              </div>

              {selectedUser.role === 'PROFESSIONAL' && (
                <div className="border-t pt-4">
                  <Typography variant="subtitle1" gutterBottom>
                    Professional Details
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">
                        Counselor ID
                      </Typography>
                      <Typography variant="body2">{selectedUser.counselorId || 'N/A'}</Typography>
                    </div>
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">
                        Specialization
                      </Typography>
                      <Typography variant="body2">{selectedUser.specialization || 'N/A'}</Typography>
                    </div>
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">
                        Experience
                      </Typography>
                      <Typography variant="body2">
                        {selectedUser.yearsOfExperience ? `${selectedUser.yearsOfExperience} years` : 'N/A'}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">
                        Peer Counselor
                      </Typography>
                      <Typography variant="body2">
                        {selectedUser.isPeerCounselor ? 'Yes' : 'No'}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions className="p-6 pt-0 border-t border-gray-100">
          <Button
            onClick={() => setShowViewModal(false)}
            className="text-gray-600 hover:bg-gray-50"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        PaperProps={{ className: "rounded-xl max-w-md" }}
      >
        <DialogTitle className="bg-gradient-to-r from-[#30459D] to-[#4066D0] text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <DeleteIcon className="text-white" />
            <span>Delete User</span>
          </div>
        </DialogTitle>
        <DialogContent className="p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <DeleteIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedUser?.name}? This action cannot be 
              undone and will permanently remove the user from the system.
            </p>
          </div>
        </DialogContent>
        <DialogActions className="p-6 pt-0 border-t border-gray-100">
          <div className="flex gap-3 w-full">
            <Button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleDeleteUser}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
              disabled={deletingId === selectedUser?._id}
              startIcon={
                deletingId === selectedUser?._id ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {deletingId === selectedUser?._id
                ? "Deleting..."
                : "Delete User"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
    </div>
  );
}