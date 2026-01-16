import React, { useState, useEffect } from 'react';
import { 
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import { useNavigate } from 'react-router-dom';

const ProfessionalAvailability = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [availabilities, setAvailabilities] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const user = useSelector(state => state.user);
  const navigate = useNavigate();

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 
    'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Generate time options from 00:00 to 23:30 in 30-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour.toString().padStart(2, '0');
      const minStr = minute.toString().padStart(2, '0');
      timeOptions.push(`${hourStr}:${minStr}`);
    }
  }

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`/api/availability/${user._id}`);
      
      const allDays = daysOfWeek.map(day => {
        const foundDay = response.data.find(d => d.day === day);
        return foundDay || {
          _id: `temp-${day}`,
          day,
          slots: [],
          available: false
        };
      });
      
      setAvailabilities(allDays);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching availability data',
        severity: 'error'
      });
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditDay = (day) => {
    setEditingDay(JSON.parse(JSON.stringify(day)));
    setStartTime('');
    setEndTime('');
    setOpenEditModal(true);
  };

  const handleAddSlot = () => {
    if (startTime && endTime && startTime < endTime) {
      setEditingDay({
        ...editingDay,
        slots: [...editingDay.slots, {
          startTime,
          endTime
        }],
        available: true
      });
      setStartTime('');
      setEndTime('');
    } else if (startTime && endTime && startTime >= endTime) {
      setSnackbar({
        open: true,
        message: 'End time must be after start time',
        severity: 'error'
      });
    }
  };

  const handleRemoveSlot = (slotIndex) => {
    const updatedSlots = [...editingDay.slots];
    updatedSlots.splice(slotIndex, 1);
    setEditingDay({
      ...editingDay,
      slots: updatedSlots,
      available: updatedSlots.length > 0
    });
  };

  const handleSaveChanges = async () => {
    try {
      await Axios.put(`/api/availability/${editingDay._id}`, {
        slots: editingDay.slots,
        available: editingDay.slots.length > 0
      });
      
      setAvailabilities(availabilities.map(day => 
        day.day === editingDay.day ? editingDay : day
      ));
      
      setOpenEditModal(false);
      setSnackbar({
        open: true,
        message: 'Availability updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      setSnackbar({
        open: true,
        message: 'Error updating availability',
        severity: 'error'
      });
    }
  };

  const toggleAvailability = async (day) => {
    try {
      const newAvailability = !day.available;
      const updatedSlots = newAvailability ? day.slots : [];
      
      await Axios.put(`/api/availability/${day._id}`, {
        available: newAvailability,
        slots: updatedSlots
      });
      
      setAvailabilities(availabilities.map(d => 
        d.day === day.day ? {
          ...d, 
          available: newAvailability,
          slots: updatedSlots
        } : d
      ));
      
      setSnackbar({
        open: true,
        message: `Marked ${day.day} as ${newAvailability ? 'available' : 'unavailable'}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      setSnackbar({
        open: true,
        message: 'Error updating availability',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatTimeDisplay = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7]">
        <CircularProgress className="text-[#30459D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:ml-64 md:px-8 md:py-12 bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7]">
      <div className="mb-10 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#30459D]">
          Availability Management
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Manage your time slots for appointments 📅
        </p>
      </div>
      
      {/* Desktop Table */}
      {!isMobile && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Box sx={{ overflowX: 'auto' }}>
            <table className="w-full">
              <thead className="bg-[#30459D] text-white">
                <tr>
                  <th className="p-3 text-left">Day</th>
                  <th className="p-3 text-center">Available</th>
                  <th className="p-3 text-left">Time Slots</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {availabilities.map((day) => (
                  <tr 
                    key={day._id}
                    className={day.available ? 'bg-white' : 'bg-gray-50 opacity-80'}
                  >
                    <td className="p-3 font-medium border-b border-gray-100">
                      {day.day}
                    </td>
                    <td className="p-3 text-center border-b border-gray-100">
                      <Switch
                        checked={day.available}
                        onChange={() => toggleAvailability(day)}
                        color="primary"
                      />
                    </td>
                    <td className="p-3 border-b border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {day.available ? (
                          day.slots.length > 0 ? (
                            day.slots.map((slot, index) => (
                              <div 
                                key={index} 
                                className="bg-[#30459D]/10 text-[#30459D] text-xs px-2 py-1 rounded border border-[#30459D]/20"
                              >
                                <div className="font-medium">{formatTimeDisplay(slot.startTime)}</div>
                                <div className="text-[0.7rem]">to {formatTimeDisplay(slot.endTime)}</div>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No slots</span>
                          )
                        ) : (
                          <span className="text-gray-400 text-sm">Not available</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center border-b border-gray-100">
                      <IconButton
                        size="small"
                        onClick={() => handleEditDay(day)}
                        disabled={!day.available}
                        className="text-[#30459D] hover:bg-[#30459D]/10"
                      >
                        <EditIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </div>
      )}
      
      {/* Mobile Card View */}
      {isMobile && (
        <Grid container spacing={2}>
          {availabilities.map((day) => (
            <Grid item xs={12} key={day._id}>
              <Box
                className="rounded-lg"
                sx={{ 
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderLeft: `4px solid ${day.available ? '#30459D' : '#9ca3af'}`,
                  p: 2
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="600">
                    {day.day}
                  </Typography>
                  <Switch
                    checked={day.available}
                    onChange={() => toggleAvailability(day)}
                    color="primary"
                  />
                </Box>
                
                {day.available && (
                  <Box mt={1.5}>
                    <Typography variant="body2" fontWeight="500" color="text.secondary" mb={1}>
                      Time Slots:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {day.slots.length > 0 ? (
                        day.slots.map((slot, index) => (
                          <Box 
                            key={index}
                            sx={{
                              backgroundColor: '#30459D10',
                              color: '#30459D',
                              border: '1px solid #30459D30',
                              borderRadius: 1,
                              p: '4px 8px',
                              fontSize: '0.75rem',
                              textAlign: 'center'
                            }}
                          >
                            <Box fontWeight="600" fontSize="0.7rem">
                              {formatTimeDisplay(slot.startTime)}
                            </Box>
                            <Box fontSize="0.65rem">
                              to {formatTimeDisplay(slot.endTime)}
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary" fontSize="0.85rem">
                          No slots added
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                
                <Box mt={1.5} display="flex" justifyContent="flex-end">
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleEditDay(day)}
                    disabled={!day.available}
                    startIcon={<EditIcon />}
                    sx={{
                      color: '#30459D',
                      fontSize: '0.75rem',
                      '&:hover': { backgroundColor: '#30459D10' },
                      '&:disabled': { color: '#9ca3af' }
                    }}
                  >
                    Edit Slots
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Slot Dialog */}
      <Dialog 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            overflow: 'hidden'
          } 
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#30459D', 
          color: 'white',
          py: 2,
          px: 3
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon fontSize="small" />
            <Typography variant="h6">
              {editingDay?.day} Availability
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" mb={2} color="#30459D">
            Add New Time Slot
          </Typography>
          
          <Grid container spacing={2} alignItems="center" mb={3}>
            <Grid item xs={5}>
              <Typography variant="subtitle2" mb={1} color="#30459D" fontWeight="500">
                Start Time
              </Typography>
              <Select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                size="small"
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=""><em>Select time</em></MenuItem>
                {timeOptions.map((time) => (
                  <MenuItem key={`start-${time}`} value={time}>
                    {formatTimeDisplay(time)}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            
            <Grid item xs={2} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                to
              </Typography>
            </Grid>
            
            <Grid item xs={5}>
              <Typography variant="subtitle2" mb={1} color="#30459D" fontWeight="500">
                End Time
              </Typography>
              <Select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                size="small"
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=""><em>Select time</em></MenuItem>
                {timeOptions.map((time) => (
                  <MenuItem 
                    key={`end-${time}`} 
                    value={time}
                    disabled={startTime && time <= startTime}
                  >
                    {formatTimeDisplay(time)}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
          
          <Button
            variant="contained"
            onClick={handleAddSlot}
            disabled={!startTime || !endTime}
            sx={{
              bgcolor: '#30459D',
              '&:hover': { bgcolor: '#263685' },
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              width: '100%',
              mt: 1
            }}
            startIcon={<AddIcon />}
          >
            Add Time Slot
          </Button>
          
          <Box mt={4}>
            <Typography variant="subtitle1" fontWeight="medium" mb={2} color="#30459D">
              Current Time Slots
            </Typography>
            
            {editingDay?.slots.length > 0 ? (
              <Box 
                display="grid" 
                gridTemplateColumns={isMobile ? "1fr" : "repeat(auto-fill, minmax(140px, 1fr))"} 
                gap={1}
                maxHeight={300}
                overflow="auto"
                p={1}
                sx={{ backgroundColor: '#f9fafb', borderRadius: 2 }}
              >
                {editingDay.slots.map((slot, index) => (
                  <Box 
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#30459D08',
                      borderRadius: 1,
                      p: 1.5,
                      border: '1px solid',
                      borderColor: '#30459D15',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {formatTimeDisplay(slot.startTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        to {formatTimeDisplay(slot.endTime)}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleRemoveSlot(index)}
                      sx={{ color: '#ff6b6b', '&:hover': { color: '#ff5252' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box 
                sx={{
                  backgroundColor: '#f9fafb',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  border: '1px dashed #30459D30'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No time slots added yet
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  Add your first time slot above
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          justifyContent: 'space-between'
        }}>
          <Button
            onClick={() => setOpenEditModal(false)}
            sx={{
              color: 'text.secondary',
              borderRadius: 2,
              px: 3,
              py: 1,
              border: '1px solid #e0e0e0'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveChanges}
            variant="contained"
            disabled={!editingDay?.slots.length}
            sx={{
              bgcolor: '#30459D',
              '&:hover': { bgcolor: '#263685' },
              borderRadius: 2,
              px: 3,
              py: 1,
              '&:disabled': {
                bgcolor: 'action.disabledBackground'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            backgroundColor: 'white',
            color: 'black',
            borderLeft: `4px solid ${snackbar.severity === 'success' ? '#30459D' : snackbar.severity === 'error' ? '#d32f2f' : '#ffa000'}`,
            boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? '#30459D' : snackbar.severity === 'error' ? '#d32f2f' : '#ffa000'
            },
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProfessionalAvailability;