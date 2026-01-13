// src/modules/bookings/bookings.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateBookingDto,
  UpdateBookingStatusDto,
  RescheduleBookingDto,
  GetBookingsQueryDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create booking',
    description: 'Create a new booking with a professional',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['professionalId', 'date', 'startTime', 'endTime', 'modality', 'concern'],
      properties: {
        professionalId: {
          type: 'string',
          example: 'prof_abc123',
        },
        date: {
          type: 'string',
          format: 'date',
          example: '2024-01-20',
        },
        startTime: {
          type: 'string',
          example: '10:00',
        },
        endTime: {
          type: 'string',
          example: '11:00',
        },
        modality: {
          type: 'string',
          enum: ['Video', 'Audio'],
          example: 'Video',
        },
        concern: {
          type: 'string',
          example: 'Anxiety management',
        },
        notes: {
          type: 'string',
          example: 'First session, prefer video call',
        },
        emergencyContact: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            relationship: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        bookingId: { type: 'string' },
        meetingLink: { type: 'string' },
        price: { type: 'number' },
        paymentRequired: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid booking data or slot not available',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Time slot already booked',
  })
  async createBooking(@CurrentUser('userId') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all bookings',
    description: 'Retrieve paginated bookings with filtering options',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  @ApiQuery({
    name: 'roleFilter',
    required: false,
    enum: ['client', 'professional'],
    description: 'Filter by user role in booking',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        bookings: { type: 'array' },
        meta: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getBookings(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
    @Query() query: GetBookingsQueryDto,
  ) {
    return this.bookingsService.getBookings(userId, role, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get booking details',
    description: 'Retrieve detailed information about a specific booking',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'booking_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        booking: { type: 'object' },
        professional: { type: 'object' },
        client: { type: 'object' },
        sessionNotes: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to view',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async getBookingDetails(@CurrentUser('userId') userId: string, @Param('id') bookingId: string) {
    return this.bookingsService.getBookingDetails(userId, bookingId);
  }

  @Put(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm booking',
    description: 'Confirm a booking (Professional only)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'booking_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking confirmed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        confirmedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Professional only',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Booking already confirmed',
  })
  async confirmBooking(@CurrentUser('userId') userId: string, @Param('id') bookingId: string) {
    return this.bookingsService.confirmBooking(userId, bookingId);
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel booking',
    description: 'Cancel a booking (Client or Professional)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'booking_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'Client requested cancellation',
        },
        refundPercentage: {
          type: 'number',
          example: 100,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        cancellationTime: { type: 'string' },
        refundIssued: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to cancel',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Booking cannot be cancelled',
  })
  async cancelBooking(
    @CurrentUser('userId') userId: string,
    @Param('id') bookingId: string,
    @Body() dto?: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.cancelBooking(userId, bookingId, dto);
  }

  @Put(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete booking',
    description: 'Mark a booking as completed (Professional only)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'booking_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        completedAt: { type: 'string' },
        ratingEnabled: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Professional only',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Booking cannot be completed',
  })
  async completeBooking(@CurrentUser('userId') userId: string, @Param('id') bookingId: string) {
    return this.bookingsService.completeBooking(userId, bookingId);
  }

  @Put(':id/reschedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reschedule booking',
    description: 'Reschedule a booking (Professional only)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'booking_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['newDate', 'newStartTime', 'newEndTime'],
      properties: {
        newDate: {
          type: 'string',
          format: 'date',
          example: '2024-01-25',
        },
        newStartTime: {
          type: 'string',
          example: '14:00',
        },
        newEndTime: {
          type: 'string',
          example: '15:00',
        },
        reason: {
          type: 'string',
          example: 'Professional unavailable',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Booking rescheduled successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        rescheduledBookingId: { type: 'string' },
        requiresClientConfirmation: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'New time slot not available',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Professional only',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async rescheduleBooking(
    @CurrentUser('userId') userId: string,
    @Param('id') bookingId: string,
    @Body() dto: RescheduleBookingDto,
  ) {
    return this.bookingsService.rescheduleBooking(userId, bookingId, dto);
  }

  @Put(':id/confirm-reschedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm rescheduled booking',
    description: 'Client confirms or rejects a rescheduled booking',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'booking_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['accept'],
      properties: {
        accept: {
          type: 'boolean',
          example: true,
        },
        rejectionReason: {
          type: 'string',
          example: 'New time not suitable',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reschedule confirmation processed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        bookingStatus: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Client only',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async confirmReschedule(@CurrentUser('userId') userId: string, @Param('id') bookingId: string) {
    return this.bookingsService.confirmBooking(userId, bookingId);
  }
}
