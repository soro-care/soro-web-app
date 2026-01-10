import Booking from "../models/booking.model.js";
import Availability from "../models/availability.model.js";
import UserModel from '../models/user.model.js'
import Notification from "../models/notification.model.js";
import { generateZoomLink, addAlternativeHosts } from "../utils/meetGenerator.js";
import sendEmail from "../config/sendEmail.js";
import { scheduleBookingReminders, completePastBookings } from '../utils/bookingReminders.js';


// Status transition validation
const validTransitions = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Rescheduled: ['Confirmed', 'Cancelled'],
  Completed: [],
  Cancelled: []
};

export async function createBooking(req, res) {
  try {
    const {
      professionalId,
      date,
      startTime,
      endTime,
      modality,
      concern,
      notes,
    } = req.body;
    const userId = req.userId;

    // 1) Validate professional
    const professional = await UserModel.findById(professionalId);
    if (!professional || professional.role !== "PROFESSIONAL") {
      return res.status(404).json({ message: "Professional not found" });
    }

    // 2) Check slot availability...
    // (your existing availability & conflict logic here)

    // 3) Create the booking
    const bookingDate = new Date(date);
    const newBooking = await Booking.create({
      user: userId,
      professional: professionalId,
      date: bookingDate,
      startTime,
      endTime,
      modality,
      concern,
      notes,
      status: "Pending",
    });

    // 4) Remove slot from availability, create notification
    const user = await UserModel.findById(userId);
    await Notification.create({
      recipient: professionalId,
      sender: userId,
      booking: newBooking._id,
      type: "BookingRequest",
      message: `New booking request from ${user.name}`,
    });

    // 5) Prepare anonymity flags
    const isPeer = professional.isPeerCounselor === true;
    const profDisplay = isPeer
      ? `Peer Counselor (ID: ${professional.counselorId})`
      : professional.name;
    const clientDisplay = isPeer
      ? `Client (ID: ${user.userId})`
      : user.name;

    // 6) Send styled, conditional email
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/><title>New Booking Request - Soro</title></head>
    <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:#30459D;padding:20px;text-align:center;">
            <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
              alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
            <h1 style="color:#FFF;font-size:24px;margin:0;">New Booking Request</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
            <p style="font-size:16px;line-height:1.5;">
              Hi <strong>${profDisplay}</strong>,
            </p>
            <p style="font-size:16px;line-height:1.5;">
              You have a new booking request that needs your attention:
            </p>
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Session Details</h2>
              <table width="100%" style="border-collapse:collapse;font-size:15px;">
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Professional:</td>
                  <td style="padding:8px 0;">${profDisplay}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Client:</td>
                  <td style="padding:8px 0;">${clientDisplay}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Date:</td>
                  <td style="padding:8px 0;">${bookingDate.toDateString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Time:</td>
                  <td style="padding:8px 0;">${startTime} – ${endTime}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Modality:</td>
                  <td style="padding:8px 0;">${modality}</td>
                </tr>
              </table>
              ${
                concern
                  ? `<div style="margin-top:15px;">
                      <h3 style="margin:0 0 8px;color:#30459D;font-size:16px;">Concern</h3>
                      <p style="margin:0;background:#FFF;padding:12px;border:1px solid #EDF0F7;border-radius:4px;">
                        ${concern}
                      </p>
                    </div>`
                  : ""
              }
            </div>
            <p style="text-align:center;margin:25px 0;">
              <a href="https://soro.care/dashboard"
                style="background:#2D8CFF;color:#FFF;text-decoration:none;
                       padding:12px 24px;border-radius:4px;font-weight:bold;">
                Review Booking Request
              </a>
            </p>
            <p style="font-size:14px;color:#666;line-height:1.4;">
              Please respond within 24 hours. We'll notify the client once you take action.
            </p>
            <p style="font-size:16px;line-height:1.5;margin-top:20px;">
              Best regards,<br/>The Soro Team
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
            © ${new Date().getFullYear()} Soro. All rights reserved.&nbsp;
            <a href="https://soro.care/unsubscribe" style="color:#888;text-decoration:underline;">
              Unsubscribe
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await sendEmail(
      professional.email,
      "New Booking Request – Action Required",
      html
    );

    return res.status(201).json({ success: true, booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
}


export async function confirmBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const professionalId = req.userId;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email userId')
      .populate('professional', 'name email isPeerCounselor counselorId userId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.professional._id.toString() !== professionalId.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm this booking' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ 
        message: `Cannot confirm booking with status ${booking.status}` 
      });
    }

    const isPeerCounsellor = booking.professional.isPeerCounselor;

    const start = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}`);
    const end = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.endTime}`);
    const durationMinutes = Math.round((end - start) / (1000 * 60));

    const startDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}`);
    const startTimeISO = startDateTime.toISOString();

    const zoomMeeting = await generateZoomLink(
      isPeerCounsellor ? 'Anonymous Peer Counseling Session' : `Session with ${isPeerCounsellor ? 'a Peer Counselor' : booking.user.name}`,
      durationMinutes,
      startTimeISO
    );

    await addAlternativeHosts(zoomMeeting.id, [
      booking.user.email, 
      booking.professional.email
    ]);

    // Update booking with Zoom details
    booking.meetingLink = zoomMeeting.join_url;
    booking.meetingPassword = zoomMeeting.password;
    booking.status = 'Confirmed';
    await booking.save();

    // Create notifications - handle differently for peer counseling
    await Promise.all([
      // Notification for client
      Notification.create({
        recipient: booking.user._id,
        sender: professionalId,
        booking: booking._id,
        type: 'BookingConfirmed',
        message: isPeerCounsellor 
          ? 'Your peer counseling session has been confirmed' 
          : `Your booking with ${booking.professional.name} has been confirmed`
      }),
      // Notification for professional
      Notification.create({
        recipient: professionalId,
        sender: professionalId,
        booking: booking._id,
        type: 'BookingConfirmed',
        message: isPeerCounsellor
          ? 'You confirmed a peer counseling session'
          : `You confirmed a booking with ${booking.user.name}`
      })
    ]);

    // Email templates with anonymity handling
    const emailTemplate = (name, role) => {
      const otherPartyName = isPeerCounsellor 
        ? (role === 'client' ? 'a Peer Counselor' : 'a Client') 
        : (role === 'client' ? booking.professional.name : booking.user.name);
      
      const anonymityInstructions = isPeerCounsellor ? `
        <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
          <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Important Anonymity Instructions</h2>
          <p style="margin:0;font-size:15px;">To maintain complete anonymity during your peer counseling session:</p>
          <ol style="font-size:15px;line-height:1.5;margin:10px 0;">
            <li><strong>Use this direct web link:</strong> <a href="${zoomMeeting.join_url}" target="_blank" style="color:#2D8CFF;">${zoomMeeting.join_url}</a></li>
            <li><strong>When prompted for name</strong>, use "${role === 'client' ? 'Peer Client' : 'Peer Counselor'}"</li>
            <li><strong>Do not sign in to Zoom</strong> - use the web version without logging in</li>
            <li><strong>Camera is disabled</strong> by default for privacy</li>
            <li><strong>Close other Zoom windows</strong> if you have the Zoom app installed</li>
          </ol>
          <p style="font-size:14px;color:#666;margin:10px 0 0;">
            Note: Your personal information will not be visible to the other participant.
          </p>
        </div>
      ` : '';

      // For peer counselors, show counselor ID instead of name
      const professionalDisplay = isPeerCounsellor 
        ? `Peer Counselor (ID: ${booking.professional.counselorId})`
        : booking.professional.name;

      // For clients in peer counseling, show their user ID instead of name
      const clientDisplay = isPeerCounsellor
        ? `Client (ID: ${booking.user.userId})`
        : booking.user.name;

      return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/><title>Session Confirmed - Soro</title></head>
    <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:#30459D;padding:20px;text-align:center;">
            <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
              alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
            <h1 style="color:#FFF;font-size:24px;margin:0;">Your ${isPeerCounsellor ? 'Anonymous ' : ''}Session Confirmed!</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
            <p style="font-size:16px;line-height:1.5;">
              Hi there,
            </p>
            <p style="font-size:16px;line-height:1.5;">
              Great news! Your ${isPeerCounsellor ? 'anonymous ' : ''}session has been confirmed and is ready to begin.
            </p>
            
            ${anonymityInstructions}
            
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Session Details</h2>
              <table width="100%" style="border-collapse:collapse;font-size:15px;">
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">${role === 'client' ? 'Professional' : 'Client'}:</td>
                  <td style="padding:8px 0;">${role === 'client' ? professionalDisplay : clientDisplay}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Date:</td>
                  <td style="padding:8px 0;">${booking.date.toDateString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Time:</td>
                  <td style="padding:8px 0;">${booking.startTime} - ${booking.endTime}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Duration:</td>
                  <td style="padding:8px 0;">${durationMinutes} minutes</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Meeting Type:</td>
                  <td style="padding:8px 0;">${booking.modality}</td>
                </tr>
              </table>
            </div>

            <p style="text-align:center;margin:25px 0;">
              <a href="${zoomMeeting.join_url}"
                style="background:#2D8CFF;color:#FFF;text-decoration:none;
                       padding:12px 24px;border-radius:4px;font-weight:bold;">
                Join ${isPeerCounsellor ? 'Anonymous ' : ''}Meeting
              </a>
            </p>

            ${zoomMeeting.password ? `
            <div style="background:#FFF8E6;padding:15px;border-radius:6px;margin:20px 0;">
              <p style="margin:0;font-size:15px;"><strong>Meeting Password:</strong> ${zoomMeeting.password}</p>
            </div>
            ` : ''}

            <p style="font-size:14px;color:#666;line-height:1.4;">
              You can add this meeting to your calendar by clicking the link below:
            </p>
            <p style="font-size:14px;">
              <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${formatISO(start)}/${formatISO(end)}&text=Session+with+${encodeURIComponent(role === 'client' ? professionalDisplay : clientDisplay)}&details=Zoom+Link:+${encodeURIComponent(zoomMeeting.join_url)}${zoomMeeting.password ? `%0APassword:+${encodeURIComponent(zoomMeeting.password)}` : ''}&location=${encodeURIComponent(zoomMeeting.join_url)}" 
                 style="color:#2D8CFF;text-decoration:underline;">
                Add to Google Calendar
              </a>
            </p>
            
            <p style="font-size:16px;line-height:1.5;margin-top:20px;">
              Best regards,<br/>The Soro Team
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
            © ${new Date().getFullYear()} Soro. All rights reserved.&nbsp;
            <a href="https://soro.care" style="color:#888;text-decoration:underline;">
              Unsubscribe
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
    };

    // Send confirmation emails with appropriate anonymity
    await Promise.all([
      // Email to client
      sendEmail(
        booking.user.email,
        isPeerCounsellor 
          ? 'Your anonymous peer counseling session has been confirmed' 
          : `Your session with ${booking.professional.name} has been confirmed`,
        emailTemplate(booking.user.name, 'client')
      ),
      // Email to professional
      sendEmail(
        booking.professional.email,
        isPeerCounsellor
          ? 'You confirmed an anonymous peer counseling session'
          : `You confirmed a session with ${booking.user.name}`,
        emailTemplate(booking.professional.name, 'professional')
      )
    ]);

    res.status(200).json({
      ...booking.toObject(),
      // Omit names in response if peer counseling
      user: isPeerCounsellor ? undefined : booking.user,
      professional: isPeerCounsellor ? undefined : booking.professional
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ 
      message: 'Error confirming booking', 
      error: error.message 
    });
  }
}
// Helper function to format date for Google Calendar
function formatISO(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z');
}


// Cancel a booking (status: Pending/Confirmed/Rescheduled → Cancelled)
export async function cancelBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.userId;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email userId')
      .populate('professional', 'name email isPeerCounselor counselorId userId');

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check authorization
    const isProfessional = booking.professional._id.toString() === userId.toString();
    const isUser = booking.user._id.toString() === userId.toString();
    
    if (!isProfessional && !isUser) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to cancel this booking' 
      });
    }

    // Validate status transition
    if (!['Pending', 'Confirmed', 'Rescheduled'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot cancel booking with status ${booking.status}` 
      });
    }

    const isPeerCounsellor = booking.professional.isPeerCounselor;

    // Update booking
    booking.status = 'Cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    // Create notifications for both parties with anonymity handling
    await Promise.all([
      Notification.create({
        recipient: booking.user._id,
        sender: userId,
        booking: booking._id,
        type: 'BookingCancelled',
        message: isPeerCounsellor
          ? 'Your peer counseling session has been cancelled'
          : `Booking with ${booking.professional.name} has been cancelled`
      }),
      Notification.create({
        recipient: booking.professional._id,
        sender: userId,
        booking: booking._id,
        type: 'BookingCancelled',
        message: isPeerCounsellor
          ? 'A peer counseling session has been cancelled'
          : `Booking with ${booking.user.name} has been cancelled`
      })
    ]);

    // Email template with anonymity handling
    const cancellationEmail = (name, role) => {
      const professionalDisplay = isPeerCounsellor
        ? `Peer Counselor (ID: ${booking.professional.counselorId})`
        : booking.professional.name;

      const clientDisplay = isPeerCounsellor
        ? `Client (ID: ${booking.user.userId})`
        : booking.user.name;

      return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/><title>${isPeerCounsellor ? 'Anonymous ' : ''}Booking Cancelled - Soro</title></head>
    <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:#30459D;padding:20px;text-align:center;">
            <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
              alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
            <h1 style="color:#FFF;font-size:24px;margin:0;">${isPeerCounsellor ? 'Anonymous ' : ''}Booking Cancelled</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
            <p style="font-size:16px;line-height:1.5;">
              Hi there,
            </p>
            <p style="font-size:16px;line-height:1.5;">
              We're writing to inform you that the following booking has been cancelled:
            </p>
            
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Session Details</h2>
              <table width="100%" style="border-collapse:collapse;font-size:15px;">
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">${role === 'user' ? 'Professional' : 'Client'}:</td>
                  <td style="padding:8px 0;">${role === 'user' ? professionalDisplay : clientDisplay}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Date:</td>
                  <td style="padding:8px 0;">${booking.date.toDateString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Time:</td>
                  <td style="padding:8px 0;">${booking.startTime} - ${booking.endTime}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Status:</td>
                  <td style="padding:8px 0;color:#E74C3C;font-weight:bold;">Cancelled</td>
                </tr>
                ${cancellationReason ? `
                <tr>
                  <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Reason:</td>
                  <td style="padding:8px 0;">${cancellationReason}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <p style="font-size:14px;color:#666;line-height:1.4;">
              ${role === 'user' ? 
                (isPeerCounsellor 
                  ? 'You can schedule a new anonymous session anytime through your dashboard.' 
                  : 'You can schedule a new session anytime through your dashboard.') : 
                (isPeerCounsellor
                  ? 'The client may reach out to schedule another anonymous session.'
                  : 'The client may reach out to reschedule through the platform.')}
            </p>
            
            <p style="font-size:16px;line-height:1.5;margin-top:20px;">
              Best regards,<br/>The Soro Team
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
            © ${new Date().getFullYear()} Soro. All rights reserved.&nbsp;
            <a href="https://soro.care" style="color:#888;text-decoration:underline;">
              Unsubscribe
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
    };

    // Only send emails if both parties have email addresses
    await Promise.all([
      // Email to client
      sendEmail(
        booking.user.email,
        isPeerCounsellor 
          ? 'Your anonymous peer counseling session has been cancelled' 
          : `Your session with ${booking.professional.name} has been cancelled`,
        cancellationEmail(booking.user.name, 'client')
      ),
      // Email to professional
      sendEmail(
        booking.professional.email,
        isPeerCounsellor
          ? 'You cancelled an anonymous peer counseling session'
          : `You cancelled a session with ${booking.user.name}`,
        cancellationEmail(booking.professional.name, 'professional')
      )
    ]);

    res.status(200).json({
      ...booking.toObject(),
      // Omit names in response if peer counseling
      user: isPeerCounsellor ? undefined : booking.user,
      professional: isPeerCounsellor ? undefined : booking.professional
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error cancelling booking', 
      error: error.message 
    });
  }
}

// Complete a booking (status: Confirmed → Completed)
export async function completeBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const professionalId = req.userId;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email')
      .populate('professional', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check
    if (booking.professional._id.toString() !== professionalId.toString()) {
      return res.status(403).json({ message: 'Not authorized to complete this booking' });
    }

    // Validate status
    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ 
        message: `Cannot complete booking with status ${booking.status}` 
      });
    }

    // Update booking
    booking.status = 'Completed';
    await booking.save();

    // Create notifications
    await Promise.all([
      Notification.create({
        recipient: booking.user._id,
        sender: professionalId,
        booking: booking._id,
        type: 'BookingCompleted',
        message: `Your session with ${booking.professional.name} has been completed`
      }),
      Notification.create({
        recipient: professionalId,
        sender: professionalId,
        booking: booking._id,
        type: 'BookingCompleted',
        message: `You completed a session with ${booking.user.name}`
      })
    ]);

    // Email template
    const completionEmail = (name, role) => `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/><title>Session Completed - Soro</title></head>
    <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:#30459D;padding:20px;text-align:center;">
            <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
              alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
            <h1 style="color:#FFF;font-size:24px;margin:0;">Session Completed</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
            <p style="font-size:16px;line-height:1.5;">
              Hi there,
            </p>
            <p style="font-size:16px;line-height:1.5;">
              Your recent session has been successfully completed. Here are the details:
            </p>
            
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Session Details</h2>
              <table width="100%" style="border-collapse:collapse;font-size:15px;">
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">${role === 'user' ? 'Professional' : 'Client'}:</td>
                  <td style="padding:8px 0;">${role === 'user' ? booking.professional.name : booking.user.name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Date:</td>
                  <td style="padding:8px 0;">${booking.date.toDateString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Time:</td>
                  <td style="padding:8px 0;">${booking.startTime} - ${booking.endTime}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Status:</td>
                  <td style="padding:8px 0;color:#27AE60;font-weight:bold;">Completed</td>
                </tr>
              </table>
            </div>

            <p style="font-size:14px;color:#666;line-height:1.4;">
              ${role === 'user' ? 
                'We hope your session was helpful. You can book follow-up sessions anytime through your dashboard.' : 
                'Thank you for providing this valuable service to our community.'}
            </p>
            
            <p style="font-size:16px;line-height:1.5;margin-top:20px;">
              Best regards,<br/>The Soro Team
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
            © ${new Date().getFullYear()} Soro. All rights reserved.&nbsp;
            <a href="https://soro.care" style="color:#888;text-decoration:underline;">
              Unsubscribe
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Send emails
    await Promise.all([
      sendEmail({
        to: booking.user.email,
        subject: 'Session Completed',
        html: completionEmail(booking.user.name, 'user')
      }),
      sendEmail({
        to: booking.professional.email,
        subject: 'Session Completed',
        html: completionEmail(booking.professional.name, 'professional')
      })
    ]);

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error completing booking', error: error.message });
  }
}

// Reschedule a booking (status: Confirmed → Rescheduled)
export async function rescheduleBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const { newDate, newStartTime, newEndTime, reason } = req.body;
    const professionalId = req.userId;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email')
      .populate('professional', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check
    if (booking.professional._id.toString() !== professionalId.toString()) {
      return res.status(403).json({ message: 'Not authorized to reschedule this booking' });
    }

    // Validate status
    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ 
        message: `Cannot reschedule booking with status ${booking.status}` 
      });
    }

    // Check slot availability
    const newBookingDate = new Date(newDate);
    const dayOfWeek = newBookingDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const isSlotAvailable = await Availability.exists({
      professional: professionalId,
      day: dayOfWeek,
      available: true,
      slots: {
        $elemMatch: {
          startTime: newStartTime,
          endTime: newEndTime
        }
      }
    });

    if (!isSlotAvailable) {
      return res.status(400).json({ message: 'Requested time slot is not available' });
    }

    // Check for conflicts
    const existingBooking = await Booking.findOne({
      professional: professionalId,
      date: newBookingDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: { $in: ['Pending', 'Confirmed', 'Rescheduled'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Create rescheduled booking
    const rescheduledBooking = await Booking.create({
      user: booking.user._id,
      professional: professionalId,
      date: newBookingDate,
      startTime: newStartTime,
      endTime: newEndTime,
      modality: booking.modality,
      concern: booking.concern,
      notes: booking.notes,
      status: 'Rescheduled',
      rescheduledFrom: booking._id
    });

    // Update original booking
    booking.status = 'Cancelled';
    booking.cancellationReason = reason || 'Rescheduled to new time';
    await booking.save();

    // Create notifications
    await Promise.all([
      Notification.create({
        recipient: booking.user._id,
        sender: professionalId,
        booking: rescheduledBooking._id,
        type: 'BookingRescheduled',
        message: `Your booking with ${booking.professional.name} has been rescheduled`
      }),
      Notification.create({
        recipient: professionalId,
        sender: professionalId,
        booking: rescheduledBooking._id,
        type: 'BookingRescheduled',
        message: `You rescheduled a booking with ${booking.user.name}`
      })
    ]);

    // Email template
    const rescheduleEmail = (name, role) => `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/><title>Booking Rescheduled - Soro</title></head>
    <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:#30459D;padding:20px;text-align:center;">
            <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
              alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
            <h1 style="color:#FFF;font-size:24px;margin:0;">Booking Rescheduled</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
            <p style="font-size:16px;line-height:1.5;">
              Hi there,
            </p>
            <p style="font-size:16px;line-height:1.5;">
              Your booking has been rescheduled. Here are the updated details:
            </p>
            
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">New Session Details</h2>
              <table width="100%" style="border-collapse:collapse;font-size:15px;">
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">${role === 'user' ? 'Professional' : 'Client'}:</td>
                  <td style="padding:8px 0;">${role === 'user' ? booking.professional.name : booking.user.name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Date:</td>
                  <td style="padding:8px 0;">${newBookingDate.toDateString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Time:</td>
                  <td style="padding:8px 0;">${newStartTime} - ${newEndTime}</td>
                </tr>
                ${reason ? `
                <tr>
                  <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Reason:</td>
                  <td style="padding:8px 0;">${reason}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background:#FFF8E6;padding:15px;border-radius:6px;margin:20px 0;">
              <h3 style="margin:0 0 10px;color:#30459D;font-size:16px;">Previous Session Details</h3>
              <table width="100%" style="border-collapse:collapse;font-size:14px;">
                <tr>
                  <td style="padding:6px 0;font-weight:bold;">Date:</td>
                  <td style="padding:6px 0;">${booking.date.toDateString()}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-weight:bold;">Time:</td>
                  <td style="padding:6px 0;">${booking.startTime} - ${booking.endTime}</td>
                </tr>
              </table>
            </div>

            <p style="font-size:14px;color:#666;line-height:1.4;">
              ${role === 'user' ? 
                'Please confirm your availability for the new time through your dashboard.' : 
                'The client will need to confirm the new time through the platform.'}
            </p>
            
            <p style="font-size:16px;line-height:1.5;margin-top:20px;">
              Best regards,<br/>The Soro Team
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
            © ${new Date().getFullYear()} Soro. All rights reserved.&nbsp;
            <a href="https://soro.care" style="color:#888;text-decoration:underline;">
              Unsubscribe
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Send emails
    await Promise.all([
      sendEmail({
        to: booking.user.email,
        subject: 'Booking Rescheduled',
        html: rescheduleEmail(booking.user.name, 'user')
      }),
      sendEmail({
        to: booking.professional.email,
        subject: 'Booking Rescheduled',
        html: rescheduleEmail(booking.professional.name, 'professional')
      })
    ]);

    res.status(200).json(rescheduledBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error rescheduling booking', error: error.message });
  }
}

// Confirm a rescheduled booking (status: Rescheduled → Confirmed)
export async function confirmRescheduledBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const professionalId = req.userId;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email')
      .populate('professional', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check
    if (booking.professional._id.toString() !== professionalId.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm this booking' });
    }

    // Validate status
    if (booking.status !== 'Rescheduled') {
      return res.status(400).json({ 
        message: `Cannot confirm booking with status ${booking.status}` 
      });
    }

    // Calculate duration for Zoom meeting
    const start = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}`);
    const end = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.endTime}`);
    const durationMinutes = Math.round((end - start) / (1000 * 60));

    // Generate Zoom link if video session
    let zoomMeeting = null;
    if (booking.modality === 'Video') {
      zoomMeeting = await generateZoomLink(
        `Session with ${booking.user.name}`,
        durationMinutes
      );
      booking.meetingLink = zoomMeeting.join_url;
      booking.meetingPassword = zoomMeeting.password;
    }

    // Update booking
    booking.status = 'Confirmed';
    await booking.save();

    // Create notifications
    await Promise.all([
      Notification.create({
        recipient: booking.user._id,
        sender: professionalId,
        booking: booking._id,
        type: 'BookingConfirmed',
        message: `Your rescheduled booking with ${booking.professional.name} has been confirmed`
      }),
      Notification.create({
        recipient: professionalId,
        sender: professionalId,
        booking: booking._id,
        type: 'BookingConfirmed',
        message: `You confirmed a rescheduled booking with ${booking.user.name}`
      })
    ]);

    // Email template
    const confirmationEmail = (name, role) => `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/><title>Rescheduled Booking Confirmed - Soro</title></head>
    <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:#30459D;padding:20px;text-align:center;">
            <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
              alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
            <h1 style="color:#FFF;font-size:24px;margin:0;">Rescheduled Booking Confirmed</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
            <p style="font-size:16px;line-height:1.5;">
              Hi there,
            </p>
            <p style="font-size:16px;line-height:1.5;">
              Great news! Your rescheduled booking has been confirmed. Here are your session details:
            </p>
            
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Session Details</h2>
              <table width="100%" style="border-collapse:collapse;font-size:15px;">
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">${role === 'user' ? 'Professional' : 'Client'}:</td>
                  <td style="padding:8px 0;">${role === 'user' ? booking.professional.name : booking.user.name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Date:</td>
                  <td style="padding:8px 0;">${booking.date.toDateString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Time:</td>
                  <td style="padding:8px 0;">${booking.startTime} - ${booking.endTime}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Duration:</td>
                  <td style="padding:8px 0;">${durationMinutes} minutes</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Modality:</td>
                  <td style="padding:8px 0;">${booking.modality}</td>
                </tr>
              </table>
            </div>

            ${booking.modality === 'Video' && zoomMeeting ? `
            <p style="text-align:center;margin:25px 0;">
              <a href="${zoomMeeting.join_url}"
                style="background:#2D8CFF;color:#FFF;text-decoration:none;
                       padding:12px 24px;border-radius:4px;font-weight:bold;">
                Join Zoom Meeting
              </a>
            </p>
            
            ${zoomMeeting.password ? `
            <div style="background:#FFF8E6;padding:15px;border-radius:6px;margin:20px 0;">
              <p style="margin:0;font-size:15px;"><strong>Meeting Password:</strong> ${zoomMeeting.password}</p>
            </div>
            ` : ''}
            ` : ''}

            <p style="font-size:14px;color:#666;line-height:1.4;">
              ${role === 'user' ? 
                'We look forward to seeing you at your rescheduled session!' : 
                'Thank you for confirming this rescheduled booking.'}
            </p>
            
            <p style="font-size:16px;line-height:1.5;margin-top:20px;">
              Best regards,<br/>The Soro Team
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
            © ${new Date().getFullYear()} Soro. All rights reserved.&nbsp;
            <a href="https://soro.care" style="color:#888;text-decoration:underline;">
              Unsubscribe
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

     await Promise.all([
      // Email to client
      sendEmail(
        booking.user.email,
        'Rescheduled Booking Confirmed',
        confirmationEmail(booking.user.name, 'user')
      ),
      // Email to professional
      sendEmail(
        booking.professional.email,
        'Rescheduled Booking Confirmed',
        confirmationEmail(booking.professional.name, 'professional')
      )
    ]);
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error confirming rescheduled booking', error: error.message });
  }
}

// Get bookings for a user or professional with filtering
export async function getBookings(req, res) {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First, find and cancel any pending bookings that have passed their start time
    // for this specific user/professional
    await cancelOverduePendingBookingsForUser(userId, user.role);

    // Then proceed with the normal query
    let query = {};
    if (user.role === 'PROFESSIONAL') {
      query.professional = userId;
    } else {
      query.user = userId;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate(user.role === 'PROFESSIONAL' ? 'user' : 'professional', 'name avatar isPeerCounselor counselorId userId')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      bookings,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
}

export async function cancelOverduePendingBookings() {
  const now = new Date();
  const currentDate = new Date(now.toISOString().split('T')[0]);
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM" format

  // Find all overdue pending bookings
  const overdueBookings = await Booking.find({
    status: 'Pending',
    $or: [
      { date: { $lt: currentDate } }, // Date is in the past
      { 
        date: currentDate,
        startTime: { $lte: currentTime } // Today but time has passed
      }
    ]
  })
  .populate('user', 'name email userId')
  .populate('professional', 'name email isPeerCounselor counselorId userId');

  // Process all overdue bookings
  for (const booking of overdueBookings) {
    try {
      await cancelSingleBooking(booking);
    } catch (error) {
      console.error(`Error cancelling overdue booking ${booking._id}:`, error);
    }
  }
}

export async function cancelOverduePendingBookingsForUser(userId, role) {
  const now = new Date();
  const currentDate = new Date(now.toISOString().split('T')[0]);
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  const query = {
    status: 'Pending',
    $or: [
      { date: { $lt: currentDate } },
      { 
        date: currentDate,
        startTime: { $lte: currentTime }
      }
    ]
  };

  // Add role-specific filter
  if (role === 'PROFESSIONAL') {
    query.professional = userId;
  } else {
    query.user = userId;
  }

  // Find and process overdue bookings for this specific user
  const overdueBookings = await Booking.find(query)
    .populate('user', 'name email userId')
    .populate('professional', 'name email isPeerCounselor counselorId userId');

  for (const booking of overdueBookings) {
    try {
      await cancelSingleBooking(booking);
    } catch (error) {
      console.error(`Error cancelling overdue booking ${booking._id}:`, error);
    }
  }
}

async function cancelSingleBooking(booking) {
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

  // Send cancellation emails
  const isPeerCounsellor = booking.professional.isPeerCounselor;
  
  const professionalDisplay = isPeerCounsellor
    ? `Peer Counselor (ID: ${booking.professional.counselorId})`
    : booking.professional.name;

  const clientDisplay = isPeerCounsellor
    ? `Client (ID: ${booking.user.userId})`
    : booking.user.name;

  const cancellationEmailTemplate = (name, role) => `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/><title>Booking Auto-Cancelled - Soro</title></head>
    <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:#30459D;padding:20px;text-align:center;">
            <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
              alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
            <h1 style="color:#FFF;font-size:24px;margin:0;">Booking Auto-Cancellation Notice</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
            <p style="font-size:16px;line-height:1.5;">
              Hi there,
            </p>
            <p style="font-size:16px;line-height:1.5;">
              We're writing to inform you that the following booking was automatically cancelled as it wasn't accepted before the session time:
            </p>
            
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Session Details</h2>
              <table width="100%" style="border-collapse:collapse;font-size:15px;">
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">${role === 'client' ? 'Professional' : 'Client'}:</td>
                  <td style="padding:8px 0;">${role === 'client' ? professionalDisplay : clientDisplay}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Date:</td>
                  <td style="padding:8px 0;">${booking.date.toDateString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Time:</td>
                  <td style="padding:8px 0;">${booking.startTime} - ${booking.endTime}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Status:</td>
                  <td style="padding:8px 0;color:#E74C3C;font-weight:bold;">Cancelled</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Reason:</td>
                  <td style="padding:8px 0;">Not accepted before session time</td>
                </tr>
              </table>
            </div>

            <p style="font-size:14px;color:#666;line-height:1.4;">
              ${role === 'client' ? 
                (isPeerCounsellor 
                  ? 'You can request a new anonymous session anytime through the platform.' 
                  : 'You can request a new session anytime through your dashboard.') : 
                (isPeerCounsellor
                  ? 'The client may request another anonymous session.'
                  : 'The client may request to reschedule through the platform.')}
            </p>
            
            <p style="font-size:16px;line-height:1.5;margin-top:20px;">
              Best regards,<br/>The Soro Team
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
            © ${new Date().getFullYear()} Soro. All rights reserved.&nbsp;
            <a href="https://soro.care" style="color:#888;text-decoration:underline;">
              Unsubscribe
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
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
}
// Get booking details
export async function getBookingDetails(req, res) {

  try {
    const { bookingId } = req.params;
    const userId = req.userId;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email avatar')
      .populate('professional', 'name email avatar specialization');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.professional._id.toString() !== userId.toString() && 
        booking.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking details', error: error.message });
  }
};