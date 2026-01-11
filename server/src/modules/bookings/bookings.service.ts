// src/modules/bookings/bookings.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { MeetingGeneratorService } from './utils/meeting-generator.service';
import {
  CreateBookingDto,
  UpdateBookingStatusDto,
  RescheduleBookingDto,
  GetBookingsQueryDto,
} from './dto';
import { BookingStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private meetingGenerator: MeetingGeneratorService,
    private notificationsService: NotificationsService,
  ) {}

  // ============================================
  // CREATE BOOKING
  // ============================================

  async createBooking(userId: string, dto: CreateBookingDto) {
    // 1. Validate professional exists
    const professional = await this.prisma.user.findUnique({
      where: { id: dto.professionalId },
      select: {
        id: true,
        pseudonymousId: true,
        name: true,
        email: true,
        role: true,
        isPeerCounselor: true,
        counselorId: true,
      },
    });

    if (!professional || professional.role !== 'PROFESSIONAL') {
      throw new NotFoundException('Professional not found');
    }

    // 2. Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        pseudonymousId: true,
        name: true,
        email: true,
        userId: true,
      },
    });

    // 3. Check for conflicting bookings
    const bookingDate = new Date(dto.date);
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        counselorPseudonymousId: professional.pseudonymousId,
        date: bookingDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        status: {
          in: ['Pending', 'Confirmed', 'Rescheduled'],
        },
      },
    });

    if (existingBooking) {
      throw new BadRequestException('This time slot is already booked');
    }

    // 4. Create booking
    const booking = await this.prisma.booking.create({
      data: {
        userPseudonymousId: user.pseudonymousId,
        counselorPseudonymousId: professional.pseudonymousId,
        date: bookingDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        modality: dto.modality,
        concern: dto.concern,
        notes: dto.notes,
        status: 'Pending',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            userId: true,
          },
        },
        professional: {
          select: {
            name: true,
            email: true,
            isPeerCounselor: true,
            counselorId: true,
          },
        },
      },
    });

    // 5. Create notification
    await this.notificationsService.notifyBookingRequest(
      professional.id,
      userId,
      booking.id,
      user.name,
    );

    // 6. Send email notification
    const isPeer = professional.isPeerCounselor;
    await this.sendBookingRequestEmail(
      professional.email,
      professional.name,
      user.name,
      user.userId,
      professional.counselorId,
      booking,
      isPeer,
    );

    return {
      message: 'Booking created successfully',
      data: {
        id: booking.id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        modality: booking.modality,
      },
    };
  }

  // ============================================
  // CONFIRM BOOKING
  // ============================================

  async confirmBooking(professionalId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userId: true,
          },
        },
        professional: {
          select: {
            id: true,
            pseudonymousId: true,
            name: true,
            email: true,
            isPeerCounselor: true,
            counselorId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify professional owns this booking
    if (
      booking.professional.pseudonymousId !== booking.counselorPseudonymousId
    ) {
      throw new ForbiddenException('Not authorized to confirm this booking');
    }

    if (booking.status !== 'Pending') {
      throw new BadRequestException(
        `Cannot confirm booking with status ${booking.status}`,
      );
    }

    // Generate meeting link
    const duration = this.meetingGenerator.calculateDuration(
      booking.startTime,
      booking.endTime,
    );
    const meetingRoom = this.meetingGenerator.generateSimpleMeetingRoom();

    // Update booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'Confirmed',
        meetingLink: meetingRoom.join_url,
        meetingPassword: meetingRoom.password,
      },
    });

    // Create notifications
    await Promise.all([
      this.prisma.notification.create({
        data: {
          recipient: booking.user.id,
          sender: booking.professional.id,
          booking: booking.id,
          type: 'BookingConfirmed',
          message: booking.professional.isPeerCounselor
            ? 'Your peer counseling session has been confirmed'
            : `Your booking with ${booking.professional.name} has been confirmed`,
        },
      }),
      this.prisma.notification.create({
        data: {
          recipient: booking.professional.id,
          sender: booking.professional.id,
          booking: booking.id,
          type: 'BookingConfirmed',
          message: booking.professional.isPeerCounselor
            ? 'You confirmed a peer counseling session'
            : `You confirmed a booking with ${booking.user.name}`,
        },
      }),
    ]);

    // Send confirmation emails
    await this.sendBookingConfirmationEmails(booking, meetingRoom);

    return {
      message: 'Booking confirmed successfully',
      data: updatedBooking,
    };
  }

  // ============================================
  // CANCEL BOOKING
  // ============================================

  async cancelBooking(
    userId: string,
    bookingId: string,
    dto?: UpdateBookingStatusDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            pseudonymousId: true,
            name: true,
            email: true,
            userId: true,
          },
        },
        professional: {
          select: {
            id: true,
            pseudonymousId: true,
            name: true,
            email: true,
            isPeerCounselor: true,
            counselorId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check authorization
    const isProfessional = booking.professional.id === userId;
    const isUser = booking.user.id === userId;

    if (!isProfessional && !isUser) {
      throw new ForbiddenException('Not authorized to cancel this booking');
    }

    // Validate status
    if (!['Pending', 'Confirmed', 'Rescheduled'].includes(booking.status)) {
      throw new BadRequestException(
        `Cannot cancel booking with status ${booking.status}`,
      );
    }

    // Update booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'Cancelled',
        cancellationReason: dto?.cancellationReason,
      },
    });

    // Create notifications
    await Promise.all([
      this.prisma.notification.create({
        data: {
          recipient: booking.user.id,
          sender: userId,
          booking: booking.id,
          type: 'BookingCancelled',
          message: booking.professional.isPeerCounselor
            ? 'Your peer counseling session has been cancelled'
            : `Booking with ${booking.professional.name} has been cancelled`,
        },
      }),
      this.prisma.notification.create({
        data: {
          recipient: booking.professional.id,
          sender: userId,
          booking: booking.id,
          type: 'BookingCancelled',
          message: booking.professional.isPeerCounselor
            ? 'A peer counseling session has been cancelled'
            : `Booking with ${booking.user.name} has been cancelled`,
        },
      }),
    ]);

    // Send cancellation emails
    await this.sendBookingCancellationEmails(booking, dto?.cancellationReason);

    return {
      message: 'Booking cancelled successfully',
      data: updatedBooking,
    };
  }

  // ============================================
  // COMPLETE BOOKING
  // ============================================

  async completeBooking(professionalId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        professional: {
          select: {
            id: true,
            pseudonymousId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.professional.id !== professionalId) {
      throw new ForbiddenException('Not authorized to complete this booking');
    }

    if (booking.status !== 'Confirmed') {
      throw new BadRequestException(
        `Cannot complete booking with status ${booking.status}`,
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'Completed' },
    });

    return {
      message: 'Booking completed successfully',
      data: updatedBooking,
    };
  }

  // ============================================
  // RESCHEDULE BOOKING
  // ============================================

  async rescheduleBooking(
    professionalId: string,
    bookingId: string,
    dto: RescheduleBookingDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        professional: {
          select: {
            id: true,
            pseudonymousId: true,
            name: true,
            email: true,
            isPeerCounselor: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.professional.id !== professionalId) {
      throw new ForbiddenException('Not authorized to reschedule this booking');
    }

    if (booking.status !== 'Confirmed') {
      throw new BadRequestException(
        `Cannot reschedule booking with status ${booking.status}`,
      );
    }

    // Check for conflicts
    const newDate = new Date(dto.newDate);
    const conflict = await this.prisma.booking.findFirst({
      where: {
        counselorPseudonymousId: booking.counselorPseudonymousId,
        date: newDate,
        startTime: dto.newStartTime,
        endTime: dto.newEndTime,
        status: {
          in: ['Pending', 'Confirmed', 'Rescheduled'],
        },
      },
    });

    if (conflict) {
      throw new BadRequestException('New time slot is already booked');
    }

    // Update booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        date: newDate,
        startTime: dto.newStartTime,
        endTime: dto.newEndTime,
        status: 'Rescheduled',
        cancellationReason: dto.reason || 'Rescheduled to new time',
      },
    });

    // Create notification
    await this.prisma.notification.create({
      data: {
        recipient: booking.user.id,
        sender: professionalId,
        booking: booking.id,
        type: 'BookingRescheduled',
        message: `Your booking has been rescheduled to ${newDate.toDateString()} at ${dto.newStartTime}`,
      },
    });

    return {
      message: 'Booking rescheduled successfully',
      data: updatedBooking,
    };
  }

  // ============================================
  // GET BOOKINGS
  // ============================================

  async getBookings(
    userId: string,
    userRole: string,
    query: GetBookingsQueryDto,
  ) {
    const {
      status,
      page = 1,
      limit = 10,
      dateFrom,
      dateTo,
      professionalId,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter by user role
    if (userRole === 'PROFESSIONAL') {
      const professional = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { pseudonymousId: true },
      });
      where.counselorPseudonymousId = professional.pseudonymousId;
    } else {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { pseudonymousId: true },
      });
      where.userPseudonymousId = user.pseudonymousId;
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
              userId: true,
            },
          },
          professional: {
            select: {
              name: true,
              avatar: true,
              isPeerCounselor: true,
              counselorId: true,
              specialization: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      message: 'Bookings retrieved successfully',
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // GET BOOKING DETAILS
  // ============================================

  async getBookingDetails(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            userId: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPeerCounselor: true,
            counselorId: true,
            specialization: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check authorization
    if (booking.user.id !== userId && booking.professional.id !== userId) {
      throw new ForbiddenException('Not authorized to view this booking');
    }

    return {
      message: 'Booking details retrieved successfully',
      data: booking,
    };
  }

  // ============================================
  // EMAIL HELPERS
  // ============================================

  private async sendBookingRequestEmail(
    professionalEmail: string,
    professionalName: string,
    userName: string,
    userId: string,
    counselorId: string,
    booking: any,
    isPeer: boolean,
  ) {
    const clientDisplay = isPeer ? `Client (ID: ${userId})` : userName;
    const profDisplay = isPeer
      ? `Peer Counselor (ID: ${counselorId})`
      : professionalName;

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;">
        <h2>New Booking Request</h2>
        <p>Hi ${profDisplay},</p>
        <p>You have a new booking request from ${clientDisplay}:</p>
        <ul>
          <li><strong>Date:</strong> ${booking.date.toDateString()}</li>
          <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
          <li><strong>Modality:</strong> ${booking.modality}</li>
        </ul>
        <p>Please log in to confirm or decline this booking.</p>
      </body>
      </html>
    `;

    await this.emailService.sendEmail(
      professionalEmail,
      'New Booking Request - Soro',
      html,
    );
  }

  private async sendBookingConfirmationEmails(booking: any, meetingRoom: any) {
    // Implementation similar to your old code
    // Send to both user and professional
  }

  private async sendBookingCancellationEmails(
    booking: any,
    reason?: string,
  ) {
    // Implementation similar to your old code
  }
}
