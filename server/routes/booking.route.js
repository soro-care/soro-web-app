import { Router } from 'express';
import {
    createBooking,
    getBookings,
    getBookingDetails,
    confirmBooking,
    completeBooking,
    rescheduleBooking,
    cancelBooking,
    confirmRescheduledBooking
} from '../controllers/booking.controller.js';
import auth from '../middleware/auth.js';

const bookingRouter = Router();


bookingRouter.get('/test', (req, res) => {
  res.send('🎯 Booking route is working!');
});

// Create a new booking (status: Pending)
bookingRouter.post(
  '/', 
  auth, 
  createBooking
);

// Get bookings with filtering
bookingRouter.get('/', auth, getBookings);


// Get booking details
bookingRouter.get(
  '/:bookingId', 
  auth, 
  getBookingDetails
);

// Confirm a pending booking (status: Pending → Confirmed)
bookingRouter.put(
  '/:bookingId/confirm', 
  auth, 
  confirmBooking
);

// Cancel a booking (status: Pending/Confirmed/Rescheduled → Cancelled)
bookingRouter.put(
  '/:bookingId/cancel', 
  auth, 
  cancelBooking
);

// Complete a booking (status: Confirmed → Completed)
bookingRouter.put(
  '/:bookingId/complete', 
  auth, 
  completeBooking
);

// Reschedule a booking (status: Confirmed → Rescheduled)
bookingRouter.put(
  '/:bookingId/reschedule', 
  auth, 
  rescheduleBooking
);

// Confirm a rescheduled booking (status: Rescheduled → Confirmed)
bookingRouter.put(
  '/:bookingId/confirm-rescheduled', 
  auth, 
  confirmRescheduledBooking
);

export default bookingRouter;