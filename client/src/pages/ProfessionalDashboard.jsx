import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  CalendarDays, Edit3, ArrowRight,
  CalendarClock
} from 'lucide-react';
import { 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import PendingApprovalCard from '../components/PendingApprovalCard';
import SessionCard from '../components/SessionCard';

const ProfessionalDashboard = ({
  user,
  isLoading,
  showInitModal,
  setShowInitModal,
  initializing,
  snackbar,
  setSnackbar,
  professionalAvailability,
  upcomingSessions,
  pendingSessions,
  approvingId,
  rejectingId,
  handleApprove,
  handleReject,
  initializeAvailability,
  
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-8 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#30459D]">
          Welcome, <span className="text-[#30459D]">
            {user?.name.split(' ')[0]}
            {user?.counselorId && (
              <span className="text-gray-500 text-sm sm:text-base font-normal ml-2">
                (ID: {user.counselorId})
              </span>
            )}
          </span>
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Here's a quick look at your bookings and availability today 📊
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Availability Card */}
        <div className="border border-[#d5daef] rounded-xl p-6 bg-white/80 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl text-[#30459D] font-semibold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#30459D]" /> 
                <span>Weekly Availability</span>
              </h2>
              <button 
                className="text-[#30459D] hover:text-[#233685] flex items-center gap-1 text-sm font-medium"
                onClick={() => navigate('/availability')}
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            </div>
            
            <div className="border border-[#FAFAF8] rounded-xl p-6 bg-[#f6f7f9] backdrop-blur-sm space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                professionalAvailability
                  .filter(day => day.available)
                  .map((day, index) => (
                    <div key={index} className="divide-y divide-gray-200">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-gray-700 text-sm sm:text-base flex items-center gap-2">
                          <span className="w-24 sm:w-28 text-gray-600">{day.day}</span>
                          <span className="hidden sm:block flex-1 h-px bg-gray-200 mt-2"></span>
                        </h3>
                        
                        <div className="flex flex-wrap gap-2">
                          {day.slots.map((slot, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1.5 bg-[#eff1f9b8] text-[#30459D] rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1 hover:bg-[#30459D]/20 transition-colors"
                            >
                              <span className="hidden sm:inline">⏱</span> 
                              {`${slot.startTime} - ${slot.endTime}`}
                            </span>
                          ))}
                        </div>
                      </div>
                      {index < professionalAvailability.length - 1 && (
                        <div className="my-3 h-px bg-gray-100 w-full"></div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Bookings History */}
          <div className="border border-[#d5daef] rounded-xl p-4 sm:p-6 bg-white/80">
              <div className="relative pl-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl text-[#30459D] font-semibold flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#30459D]" /> 
                  <span>Session Queue</span>
                </h2>
                <button 
                  className="text-[#30459D] hover:text-[#233685] flex items-center gap-1 text-sm font-medium"
                  onClick={() => navigate('/bookings')}
                >
                  See More  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {[...pendingSessions, ...upcomingSessions]
                  .sort((a,b) => new Date(a.date) - new Date(b.date))
                  .slice(0,4)
                  .map((session, idx) => (
                    <div key={idx} className="relative pb-6">
                      <div className={`absolute left-0 w-4 h-4 rounded-full -ml-[15px] ${
                        session.status === 'Pending' ? 'bg-yellow-500' : 'bg-[#30459D]'
                      }`}></div>
                      
                      {session.status === 'Pending' ? (
                      <PendingApprovalCard
                        key={session._id}
                        session={session}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        isApproving={approvingId === session._id}
                        isRejecting={rejectingId === session._id}
                      />
                      ) : (
                        <SessionCard session={session} />
                      )}
                    </div>
                  ))}
                  
                {pendingSessions.length === 0 && upcomingSessions.length === 0 && (
                  <div className="text-center py-8">
                    <CalendarDays className="mx-auto w-12 h-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">No sessions scheduled</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Dialog
            open={showInitModal}
            onClose={() => setShowInitModal(false)}
            PaperProps={{ className: 'rounded-xl max-w-md' }}
          >
            <DialogTitle className="bg-gradient-to-r from-[#30459D] to-[#4066D0] text-white rounded-t-xl">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-white" />
                <span>Setup Your Availability</span>
              </div>
            </DialogTitle>
            
            <DialogContent className="p-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <CalendarClock className="w-8 h-8 text-[#30459D]" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Setup Your Availability
                </h3>
                <p className="text-gray-600 mb-6">
                  Before you can manage your availability, you need to initialize your schedule.
                  This will create empty slots for each day of the week that you can then customize.
                </p>
              </div>
            </DialogContent>
            
            <DialogActions className="p-6 pt-0 border-t border-gray-100">
              <div className="flex gap-3 w-full">
                <Button
                  onClick={() => setShowInitModal(false)}
                  className="flex-1 text-gray-600 hover:bg-gray-50"
                >
                  Later
                </Button>
                <Button
                  variant="contained"
                  onClick={initializeAvailability}
                  disabled={initializing}
                  className="flex-1 bg-[#30459D] text-white hover:bg-[#263685]"
                  startIcon={initializing ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {initializing ? 'Initializing...' : 'Initialize Now'}
                </Button>
              </div>
            </DialogActions>
          </Dialog>
          
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({...snackbar, open: false})}
          >
            <Alert 
              onClose={() => setSnackbar({...snackbar, open: false})} 
              severity={snackbar.severity}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
    </>
  );
};

export default ProfessionalDashboard;

ProfessionalDashboard.propTypes = {
  user: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  showInitModal: PropTypes.bool.isRequired,
  setShowInitModal: PropTypes.func.isRequired,
  initializing: PropTypes.bool.isRequired,
  setInitializing: PropTypes.func.isRequired,
  snackbar: PropTypes.object.isRequired,
  setSnackbar: PropTypes.func.isRequired,
  professionalAvailability: PropTypes.array.isRequired,
  upcomingSessions: PropTypes.array.isRequired,
  pendingSessions: PropTypes.array.isRequired,
  approvingId: PropTypes.string,
  rejectingId: PropTypes.string,
  handleApprove: PropTypes.func.isRequired,
  handleReject: PropTypes.func.isRequired,
  initializeAvailability: PropTypes.func.isRequired,
  fetchDashboardData: PropTypes.func.isRequired
};