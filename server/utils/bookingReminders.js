// utils/bookingReminders.js
import Booking from '../models/booking.model.js';
import sendEmail from '../config/sendEmail.js';
import { format } from 'date-fns';

// Function to send reminder emails
const sendReminderEmails = async (booking) => {
  const isPeerCounsellor = booking.professional?.isPeerCounselor;
  
  const professionalDisplay = isPeerCounsellor
    ? `Peer Counselor (ID: ${booking.professional?.counselorId})`
    : booking.professional?.name;

  const clientDisplay = isPeerCounsellor
    ? `Client (ID: ${booking.user?.userId})`
    : booking.user?.name;

  const reminderEmailTemplate = (name, role) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #30459D;">Session Reminder</h2>
      
      <div style="background: #F8FAFF; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your session starts in 1 hour</h3>
        <p><strong>${role === 'client' ? 'Professional' : 'Client'}:</strong> ${role === 'client' ? professionalDisplay : clientDisplay}</p>
        <p><strong>Date:</strong> ${format(new Date(booking.date), 'EEEE, MMMM do, yyyy')}</p>
        <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        <p><strong>Meeting Type:</strong> ${booking.modality}</p>
      </div>

      ${booking.meetingLink ? `
      <div style="margin: 25px 0; text-align: center;">
        <a href="${booking.meetingLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #2D8CFF; 
                  color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Join Meeting
        </a>
      </div>
      ` : ''}

      ${isPeerCounsellor ? `
      <div style="background: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #30459D;">Anonymity Reminder</h3>
        <p>Remember to maintain anonymity during your peer counseling session:</p>
        <ul>
          <li>Use the provided meeting link directly</li>
          <li>Don't share personal identifying information</li>
          <li>Camera is disabled by default</li>
        </ul>
      </div>
      ` : ''}
    </div>
  `;

  try {
    await Promise.all([
      // Send to client
      sendEmail(
        booking.user?.email,
        isPeerCounsellor 
          ? 'Reminder: Your anonymous peer counseling session' 
          : `Reminder: Your session with ${professionalDisplay}`,
        reminderEmailTemplate(booking.user?.name, 'client')
      ),
      // Send to professional
      sendEmail(
        booking.professional?.email,
        isPeerCounsellor
          ? 'Reminder: Anonymous peer counseling session'
          : `Reminder: Session with ${clientDisplay}`,
        reminderEmailTemplate(booking.professional?.name, 'professional')
      )
    ]);
  } catch (error) {
    console.error('Error sending reminder emails:', error);
  }
};

// Schedule reminders for upcoming bookings
export const scheduleBookingReminders = async () => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Find bookings that start within the next hour and haven't been reminded
    const upcomingBookings = await Booking.find({
      status: 'Confirmed',
      date: { 
        $gte: now,
        $lte: oneHourFromNow 
      },
      reminderSent: { $ne: true }
    })
    .populate('user', 'name email userId')
    .populate('professional', 'name email isPeerCounselor counselorId userId');

    for (const booking of upcomingBookings) {
      try {
        // Send reminder emails
        await sendReminderEmails(booking);
        
        // Mark as reminded
        booking.reminderSent = true;
        await booking.save();
      } catch (error) {
        console.error(`Error processing reminder for booking ${booking._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error scheduling booking reminders:', error);
  }
};

// Automatically complete past bookings
export const completePastBookings = async () => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Find confirmed bookings that ended more than 1 hour ago
    const pastBookings = await Booking.find({
      status: 'Confirmed',
      date: { $lte: oneHourAgo }
    })
    .populate('user', 'name email')
    .populate('professional', 'name email');

    for (const booking of pastBookings) {
      try {
        // Update status to completed
        booking.status = 'Completed';
        await booking.save();

        // Create notifications
        await Promise.all([
          Notification.create({
            recipient: booking.user._id,
            sender: booking.professional._id,
            booking: booking._id,
            type: 'BookingCompleted',
            message: `Your session with ${booking.professional.name} has been completed`
          }),
          Notification.create({
            recipient: booking.professional._id,
            sender: booking.professional._id,
            booking: booking._id,
            type: 'BookingCompleted',
            message: `Your session with ${booking.user.name} has been completed`
          })
        ]);
      } catch (error) {
        console.error(`Error completing booking ${booking._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error completing past bookings:', error);
  }
};

export const cancelPendingPastBookings = async () => {
  try {
    const now = new Date();
    const currentTimeString = now.toLocaleTimeString('en-US', { hour12: false });
    
    // Find pending bookings where date has passed or date is today but start time has passed
    const pendingBookings = await Booking.find({
      status: 'Pending',
      $or: [
        { date: { $lt: new Date(now.toISOString().split('T')[0]) } }, // Date is in the past
        { 
          date: new Date(now.toISOString().split('T')[0]), // Today's date
          startTime: { $lte: currentTimeString } // Start time has passed
        }
      ]
    })
    .populate('user', 'name email userId')
    .populate('professional', 'name email isPeerCounselor counselorId userId');

    for (const booking of pendingBookings) {
      try {
        // Update status to cancelled
        booking.status = 'Cancelled';
        booking.cancellationReason = 'Automatically cancelled - not accepted before session time';
        await booking.save();

        // Create notifications
        await Promise.all([
          Notification.create({
            recipient: booking.user._id,
            sender: booking.professional._id,
            booking: booking._id,
            type: 'BookingCancelled',
            message: 'Your booking was automatically cancelled as it was not accepted before the session time'
          }),
          Notification.create({
            recipient: booking.professional._id,
            sender: booking.user._id,
            booking: booking._id,
            type: 'BookingCancelled',
            message: 'A pending booking was automatically cancelled as it was not accepted before the session time'
          })
        ]);

        // Send cancellation emails if needed
        const isPeerCounsellor = booking.professional.isPeerCounselor;
        
        const professionalDisplay = isPeerCounsellor
          ? `Peer Counselor (ID: ${booking.professional.counselorId})`
          : booking.professional.name;

        const clientDisplay = isPeerCounsellor
          ? `Client (ID: ${booking.user.userId})`
          : booking.user.name;

        const cancellationEmailTemplate = (name, role) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #30459D;">Booking Auto-Cancellation Notice</h2>
            <p>The following booking was automatically cancelled as it wasn't accepted before the session time:</p>
            
            <div style="background: #F8FAFF; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Session Details</h3>
              <p><strong>${role === 'client' ? 'Professional' : 'Client'}:</strong> ${role === 'client' ? professionalDisplay : clientDisplay}</p>
              <p><strong>Date:</strong> ${format(booking.date, 'EEEE, MMMM do, yyyy')}</p>
              <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
              <p><strong>Status:</strong> Cancelled</p>
              <p><strong>Reason:</strong> Not accepted before session time</p>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              ${role === 'client' ? 
                (isPeerCounsellor 
                  ? 'You can request a new anonymous session anytime.' 
                  : 'You can request a new session anytime.') : 
                (isPeerCounsellor
                  ? 'The client may request another anonymous session.'
                  : 'The client may request to reschedule.')}
            </p>
          </div>
        `;

        await Promise.all([
          // Email to client
          sendEmail(
            booking.user.email,
            isPeerCounsellor 
              ? 'Your anonymous peer counseling session was automatically cancelled' 
              : `Your session with ${professionalDisplay} was automatically cancelled`,
            cancellationEmailTemplate(booking.user.name, 'client')
          ),
          // Email to professional
          sendEmail(
            booking.professional.email,
            isPeerCounsellor
              ? 'An anonymous peer counseling session was automatically cancelled'
              : `Your session with ${clientDisplay} was automatically cancelled`,
            cancellationEmailTemplate(booking.professional.name, 'professional')
          )
        ]);

      } catch (error) {
        console.error(`Error cancelling pending booking ${booking._id}:`, error);
      }
    }

    console.log(`Cancelled ${pendingBookings.length} pending bookings that weren't accepted on time`);
  } catch (error) {
    console.error('Error cancelling pending past bookings:', error);
  }
};
