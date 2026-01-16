import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  Dialog,
  DialogContent,
  CircularProgress,
  IconButton,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Grid,
  useMediaQuery,
  useTheme,
  Stack
} from '@mui/material';
import { 
  Close,
  CalendarToday,
  Schedule,
  Call,
  CheckCircle,
  ArrowBack,
  Person,
  AccessTime,
  EventAvailable
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse, addDays, isSameDay } from 'date-fns';
import { useSnackbar } from 'notistack';
import Axios from '../utils/Axios';
import { useSelector } from 'react-redux';

const primaryColor = '#30459D';
const secondaryColor = '#263685';
const lightBg = '#F8FAFF';

const BookingForm = ({ onClose, onBookingSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector(state => state.user);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [concern, setConcern] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errors, setErrors] = useState({ concern: false });

  // Fetch all available time slots with counselor info
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        setLoading(true);
        const response = await Axios.get('/api/availability/slots/all');
        setAvailableSlots(response.data);
      } catch (error) {
        enqueueSnackbar('Error loading available time slots', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [enqueueSnackbar]);

  // Group slots by date
  const getGroupedSlotsByDate = () => {
    const grouped = {};
    
    availableSlots.forEach(slot => {
      try {
        // Ensure the date is properly parsed
        const slotDate = new Date(slot.date);
        if (isNaN(slotDate.getTime())) {
          console.error('Invalid date:', slot.date);
          return;
        }
        
        const dateKey = slotDate.toISOString().split('T')[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: slotDate,
            formattedDate: format(slotDate, 'EEEE, MMMM do'),
            slots: []
          };
        }
        grouped[dateKey].slots.push(slot);
      } catch (error) {
        console.error('Error processing slot date:', error);
      }
    });

    return Object.values(grouped).sort((a, b) => a.date - b.date);
  };

  const getSlotsForDate = (date) => {
    if (!date) return [];
    try {
      const dateKey = new Date(date).toISOString().split('T')[0];
      const dateGroup = getGroupedSlotsByDate().find(g => {
        const groupDateKey = new Date(g.date).toISOString().split('T')[0];
        return groupDateKey === dateKey;
      });
      return dateGroup ? dateGroup.slots : [];
    } catch (error) {
      console.error('Error processing date:', error);
      return [];
    }
  };

  const handleDateSelect = (date) => {
    setSelectedSlot({ ...selectedSlot, date });
    setActiveStep(1);
  };

  const handleSlotSelect = (slot) => {
    try {
      // Ensure date is properly instantiated
      const slotDate = new Date(slot.date);
      if (isNaN(slotDate.getTime())) {
        throw new Error('Invalid date in slot');
      }

      const selectedSlotData = {
        id: slot.id,
        date: slotDate, // Use the Date object
        startTime: slot.startTime,
        endTime: slot.endTime,
        professional: {
          ...slot.professional
        }
      };
      setSelectedSlot(selectedSlotData);
      setActiveStep(2);
    } catch (error) {
      console.error('Error selecting slot:', error);
      enqueueSnackbar('Error selecting time slot', { variant: 'error' });
    }
  };

  const handleBookingSubmit = async () => {
    if (!concern.trim()) {
      setErrors({...errors, concern: true});
      enqueueSnackbar('Please describe your primary concern', { variant: 'error' });
      return;
    }

    try {
      // Validate the selected slot data
      if (!selectedSlot || !selectedSlot.date || isNaN(new Date(selectedSlot.date).getTime())) {
        throw new Error('Invalid booking date');
      }

      setLoading(true);
      
      const bookingData = {
        professionalId: selectedSlot.professional._id,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        modality: 'Audio',
        concern,
        notes
      };

      const response = await Axios.post('/api/booking', bookingData);
      
      setBookingSuccess(true);
      setActiveStep(3);
      
      if (onBookingSuccess) {
        onBookingSuccess({
          ...response.data,
          professional: selectedSlot.professional
        });
      }
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error creating booking', 
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const formatTimeRange = (start, end) => {
    return `${format(parse(start, 'HH:mm', new Date()), 'h:mm a')} - ${format(parse(end, 'HH:mm', new Date()), 'h:mm a')}`;
  };

  const steps = [
    'Select Date',
    'Choose Time Slot',
    'Confirm Booking'
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            background: 'white',
            boxShadow: '0 20px 40px rgba(48, 69, 157, 0.15)',
            position: 'relative'
          }
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            zIndex: 1,
            color: '#fff',
            backgroundColor: 'rgba(48, 69, 157, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(48, 69, 157, 0.5)',
            }
          }}
        >
          <Close />
        </IconButton>

        <Box sx={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, #4A6BDB 100%)`,
          px: 4,
          py: 3,
          color: 'white'
        }}>
          <Typography variant="h4" component="h2" sx={{ 
            fontWeight: 800,
            fontFamily: "'Poppins', sans-serif",
            fontSize: isMobile ? '1.5rem' : '2rem'
          }}>
            Book Your Session
          </Typography>
          <Typography variant="body1" sx={{ 
            opacity: 0.9,
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}>
            {steps[activeStep]}
          </Typography>
        </Box>

        <Box sx={{ px: isMobile ? 2 : 4, py: 3 }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: secondaryColor,
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: primaryColor,
              },
              '& .MuiStepLabel-label': {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                fontWeight: 600
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Divider sx={{ borderColor: 'rgba(48, 69, 157, 0.1)' }} />

        <DialogContent sx={{ p: isMobile ? 2 : 4 }}>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 700,
                color: primaryColor,
                mb: 3,
                fontSize: isMobile ? '0.875rem' : '1.25rem'
              }}>
                Select an available date
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: primaryColor }} />
                </Box>
              ) : (
                <Grid container spacing={isMobile ? 1 : 2}>
                  {getGroupedSlotsByDate().map((day) => (
                    <Grid item xs={12} sm={6} md={4} key={day.formattedDate}>
                      <Paper
                        elevation={0}
                        onClick={() => handleDateSelect(day.date)}
                        sx={{
                          p: isMobile ? 2 : 3,
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          border: selectedSlot?.date && isSameDay(selectedSlot.date, day.date) ? 
                            `1px solid ${primaryColor}` : '1px solid rgba(48, 69, 157, 0.1)',
                          backgroundColor: selectedSlot?.date && isSameDay(selectedSlot.date, day.date) ? 
                            'rgba(48, 69, 157, 0.05)' : 'white',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 5px 15px rgba(48, 69, 157, 0.1)',
                            borderColor: '#d5daef'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EventAvailable sx={{ 
                            color: primaryColor, 
                            mr: 2,
                            fontSize: isMobile ? 24 : 32,
                            backgroundColor: 'rgba(48, 69, 157, 0.1)',
                            p: 0.5,
                            borderRadius: '50%'
                          }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ 
                              color: primaryColor,
                              fontSize: isMobile ? '0.875rem' : '1rem'
                            }}>
                              {day.formattedDate?.split(',')[0]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                              {day.formattedDate?.split(',')[1]}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ 
                              display: 'block',
                              mt: 0.5,
                              fontSize: isMobile ? '0.625rem' : '0.75rem'
                            }}>
                              {day.slots.length} available slot{day.slots.length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                backgroundColor: lightBg,
                p: 2,
                borderRadius: 2
              }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  sx={{ 
                    mr: 2,
                    color: primaryColor,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(48, 69, 157, 0.1)'
                    }
                  }}
                >
                  Back
                </Button>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: primaryColor,
                  fontSize: isMobile ? '0.875rem' : '1.25rem'
                }}>
                  Available time slots on 
                  {selectedSlot?.date && !isNaN(new Date(selectedSlot.date).getTime()) && 
                  format(new Date(selectedSlot.date), 'MMMM do')}
                </Typography>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: primaryColor }} />
                </Box>
              ) : (
                <Grid container spacing={isMobile ? 1 : 2}>
                  {getSlotsForDate(selectedSlot?.date).map((slot, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper
                        elevation={0}
                        onClick={() => handleSlotSelect(slot)}
                        sx={{
                          p: isMobile ? 2 : 3,
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          border: selectedSlot?.id === slot.id ? 
                            `1px solid ${primaryColor}` : '1px solid rgba(48, 69, 157, 0.1)',
                          backgroundColor: selectedSlot?.id === slot.id ? 
                            'rgba(48, 69, 157, 0.05)' : 'white',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 5px 15px rgba(48, 69, 157, 0.1)',
                            borderColor: primaryColor
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTime sx={{ 
                            color: primaryColor, 
                            mr: 2,
                            fontSize: isMobile ? 20 : 28
                          }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ 
                              color: primaryColor,
                              fontSize: isMobile ? '0.875rem' : '1rem'
                            }}>
                              {formatTimeRange(slot.startTime, slot.endTime)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Person sx={{ 
                                color: 'text.secondary', 
                                fontSize: isMobile ? 16 : 20,
                                mr: 1
                              }} />
                              <Typography variant="body2" color="text.secondary" sx={{ 
                                fontSize: isMobile ? '0.75rem' : '0.875rem'
                              }}>
                                Counselor ID: {slot.professional.counselorId || 'PC-' + slot.professional._id.slice(-4)}
                              </Typography>
                            </Box>
                          </Box>
                          <Avatar
                            src={slot.professional.avatar}
                            sx={{ 
                              width: isMobile ? 40 : 48, 
                              height: isMobile ? 40 : 48,
                              ml: 2
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4,
                backgroundColor: lightBg,
                p: 2,
                borderRadius: 2
              }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  sx={{ 
                    mr: 2,
                    color: primaryColor,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(48, 69, 157, 0.1)'
                    }
                  }}
                >
                  Back
                </Button>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: primaryColor,
                  fontSize: isMobile ? '0.875rem' : '1.25rem'
                }}>
                  Confirm your booking
                </Typography>
              </Box>

              <Grid container spacing={isMobile ? 1 : 4}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ 
                    p: isMobile ? 2 : 3, 
                    mb: 3, 
                    borderRadius: 3,
                    border: '1px solid #d5daef',
                    backgroundColor: 'rgba(48, 69, 157, 0.03)'
                  }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ 
                      color: primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }}>
                      <Person sx={{ mr: 1, color: primaryColor }} />
                      Appointment Details
                    </Typography>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={selectedSlot?.professional?.avatar}
                        sx={{ 
                          width: isMobile ? 40 : 48, 
                          height: isMobile ? 40 : 48, 
                          mr: 2,
                        }}
                      />
                      <Box>
                        <Typography variant="body1" fontWeight={600} sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                          Counselor ID: {selectedSlot?.professional?.counselorId || 'PC-' + selectedSlot?.professional?._id.slice(-4)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                          {selectedSlot?.professional?.specialization}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      backgroundColor: 'white',
                      p: 1.5,
                      borderRadius: 1
                    }}>
                      <CalendarToday sx={{ 
                        color: primaryColor, 
                        mr: 2,
                        fontSize: isMobile ? 16 : 20
                      }} />
                      <Typography sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                        {selectedSlot?.date && !isNaN(new Date(selectedSlot.date).getTime()) && 
                          format(new Date(selectedSlot.date), 'MMMM do')}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      backgroundColor: 'white',
                      p: 1.5,
                      borderRadius: 1
                    }}>
                      <Schedule sx={{ 
                        color: primaryColor, 
                        mr: 2,
                        fontSize: isMobile ? 16 : 20
                      }} />
                      <Typography sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                        {selectedSlot && formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      backgroundColor: 'white',
                      p: 1.5,
                      borderRadius: 1
                    }}>
                      <Call sx={{ 
                        color: primaryColor, 
                        mr: 2,
                        fontSize: isMobile ? 16 : 20
                      }} />
                      <Typography sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                        Audio Call Session
                      </Typography>
                    </Box>
                  </Paper>

                  <TextField
                    fullWidth
                    label="Primary Concern"
                    value={concern}
                    onChange={(e) => {
                      setConcern(e.target.value);
                      setErrors({...errors, concern: false});
                    }}
                    error={errors.concern}
                    helperText={errors.concern ? 'Please describe your primary concern' : ''}
                    sx={{ mb: 3 }}
                    required
                    InputLabelProps={{
                      style: { color: primaryColor }
                    }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    InputLabelProps={{
                      style: { color: primaryColor }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ 
                    p: isMobile ? 2 : 3, 
                    borderRadius: 3,
                    border: '1px solid #d5daef',
                    backgroundColor: lightBg,
                    height: '100%'
                  }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ 
                      color: primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }}>
                      <CheckCircle sx={{ mr: 1, color: primaryColor }} />
                      Booking Summary
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      {[
                        { label: 'Counselor ID:', value: selectedSlot?.professional?.counselorId || 'PC-' + selectedSlot?.professional?._id.slice(-4) },
                        { label: 'Date:', value: selectedSlot?.date && format(selectedSlot.date, 'MMMM do, yyyy') },
                        { label: 'Time:', value: selectedSlot && formatTimeRange(selectedSlot.startTime, selectedSlot.endTime) },
                        { label: 'Session Type:', value: 'Audio Call' },
                        { label: 'Primary Concern:', value: concern || 'Not specified' }
                      ].map((item, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          mb: 1.5,
                          p: 1.5,
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #d5daef'
                        }}>
                          <Typography color="text.secondary" sx={{ 
                            fontWeight: 500,
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                          }}>
                            {item.label}
                          </Typography>
                          <Typography fontWeight={600} sx={{ 
                            color: primaryColor,
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            textAlign: 'right'
                          }}>
                            {item.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ 
                      my: 2, 
                      borderColor: 'rgba(48, 69, 157, 0.2)',
                      borderBottomWidth: 2
                    }} />

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={loading ? <CircularProgress size={24} /> : <CheckCircle />}
                      onClick={handleBookingSubmit}
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: isMobile ? '0.875rem' : '1rem',
                        backgroundColor: primaryColor,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, #263685 100%)`,
                        boxShadow: '0 4px 8px rgba(48, 69, 157, 0.3)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          background: `linear-gradient(135deg, ${primaryColor} 0%, #263685 100%)`,
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        }
                      }}
                    >
                      {loading ? 'Creating Booking...' : 'Confirm Booking'}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 3 && bookingSuccess && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              px: 2
            }}>
              <CheckCircle sx={{ 
                fontSize: isMobile ? 60 : 80, 
                color: secondaryColor, 
                mb: 2,
                filter: 'drop-shadow(0 2px 4px rgba(255,107,107,0.3))'
              }} />
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{
                color: primaryColor,
                fontSize: isMobile ? '1.5rem' : '2rem'
              }}>
                Booking Confirmed!
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom sx={{ 
                mb: 3,
                fontSize: isMobile ? '0.875rem' : '1rem'
              }}>
                Your audio session with {selectedSlot?.professional?.counselorId || 'PC-' + selectedSlot?.professional?._id.slice(-4)} is scheduled
              </Typography>

              <Paper elevation={0} sx={{ 
                p: isMobile ? 2 : 3, 
                mt: 3, 
                mb: 4, 
                borderRadius: 3,
                textAlign: 'left',
                border: `1px solid ${primaryColor}`,
                backgroundColor: 'rgba(48, 69, 157, 0.03)'
              }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ 
                  color: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}>
                  <EventAvailable sx={{ mr: 1, color: primaryColor }} />
                  Appointment Details
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  backgroundColor: 'white',
                  p: 1.5,
                  borderRadius: 1
                }}>
                  <Person sx={{ color: primaryColor, mr: 2 }} />
                  <Typography sx={{ mr: 1, color: 'text.secondary' }}>
                    Counselor ID:
                  </Typography>
                  <Typography fontWeight={600} sx={{ color: primaryColor }}>
                    {selectedSlot?.professional?.counselorId || 'PC-' + selectedSlot?.professional?._id.slice(-4)}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  backgroundColor: 'white',
                  p: 1.5,
                  borderRadius: 1
                }}>
                  <CalendarToday sx={{ color: primaryColor, mr: 2 }} />
                  <Typography sx={{ mr: 1, color: 'text.secondary' }}>
                    Date:
                  </Typography>
                  <Typography fontWeight={600} sx={{ color: primaryColor }}>
                    {selectedSlot?.date && !isNaN(new Date(selectedSlot.date).getTime()) && 
                      format(new Date(selectedSlot.date), 'MMMM do')}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  backgroundColor: 'white',
                  p: 1.5,
                  borderRadius: 1
                }}>
                  <Schedule sx={{ color: primaryColor, mr: 2 }} />
                  <Typography sx={{ mr: 1, color: 'text.secondary' }}>
                    Time:
                  </Typography>
                  <Typography fontWeight={600} sx={{ color: primaryColor }}>
                    {selectedSlot 
                      ? `${format(parse(selectedSlot.startTime, 'HH:mm', new Date()), 'h:mm a')} - ${format(parse(selectedSlot.endTime, 'HH:mm', new Date()), 'h:mm a')}`
                      : 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  backgroundColor: 'white',
                  p: 1.5,
                  borderRadius: 1
                }}>
                  <Call sx={{ color: primaryColor, mr: 2 }} />
                  <Typography sx={{ mr: 1, color: 'text.secondary' }}>
                    Session Type:
                  </Typography>
                  <Typography fontWeight={600} sx={{ color: primaryColor }}>
                    Audio Call
                  </Typography>
                </Box>
              </Paper>

              <Button
                variant="contained"
                onClick={onClose}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  backgroundColor: primaryColor,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #263685 100%)`,
                  boxShadow: '0 4px 8px rgba(48, 69, 157, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #263685 100%)`,
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                Done
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BookingForm;