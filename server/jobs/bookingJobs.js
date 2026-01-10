// jobs/bookingJobs.js
import { 
  scheduleBookingReminders, 
  completePastBookings,
  cancelPendingPastBookings 
} from '../utils/bookingReminders.js';
import cron from 'node-cron';

// Run every 5 minutes to check for upcoming bookings and send reminders
cron.schedule('*/5 * * * *', async () => {
  console.log('Running booking reminders check...');
  await scheduleBookingReminders();
});

// Run every hour to complete past bookings and cancel pending ones
cron.schedule('0 * * * *', async () => {
  console.log('Running booking completion and cancellation checks...');
  await completePastBookings();
  await cancelPendingPastBookings();
});

console.log('Booking job scheduler started...');