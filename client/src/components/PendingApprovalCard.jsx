import React, { useState } from 'react';
import { Clock, CalendarDays } from 'lucide-react';
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const PendingApprovalCard = ({ session, onApprove, onReject, isApproving, isRejecting }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    onReject(session._id);
    setShowRejectModal(false);
  };

  // Format date for better display
  const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      <div className="p-4 bg-white rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="truncate">
                <h4 className="font-medium text-gray-800 truncate">
                  {session.professional?.isPeerCounselor 
                    ? `Peer Counselor (ID: ${session.professional.counselorId})`
                    : session.user?.userId}
                </h4>
                {session.professional?.isPeerCounselor && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    User ID: {session.user?.userId}
                  </p>
                )}
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full whitespace-nowrap flex-shrink-0">
                Pending
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{session.concern}</p>
            
            {/* Improved date/time display - vertical layout */}
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CalendarDays className="w-4 h-4 flex-shrink-0 text-yellow-600" />
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-4 h-4 flex-shrink-0 text-yellow-600" />
                <span className="whitespace-nowrap">
                  {session.startTime} - {session.endTime}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                variant="contained"
                size="small"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onApprove(session._id)}
                disabled={isApproving}
              >
                {isApproving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Approve'
                )}
              </Button>
              <Button
                variant="outlined"
                size="small"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleRejectClick}
                disabled={isRejecting}
              >
                {isRejecting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Reject'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Confirmation Modal */}
      <Dialog
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        PaperProps={{ className: 'rounded-xl max-w-md' }}
      >
        <DialogTitle className="bg-gradient-to-r from-[#30459D] to-[#4066D0] text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <span>Confirm Rejection</span>
          </div>
        </DialogTitle>
        <DialogContent className="p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Are you sure you want to reject this session?
            </h3>
            <p className="text-gray-600 mb-6">
              This will cancel the booking request and notify the client.
            </p>
          </div>
        </DialogContent>
        <DialogActions className="p-6 pt-0 border-t border-gray-100">
          <div className="flex gap-3 w-full">
            <Button
              onClick={() => setShowRejectModal(false)}
              className="flex-1 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmReject}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
              disabled={isRejecting}
              startIcon={
                isRejecting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(PendingApprovalCard);