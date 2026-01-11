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

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // ============================================
  // CREATE BOOKING
  // ============================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(userId, dto);
  }

  // ============================================
  // GET ALL BOOKINGS
  // ============================================

  @Get()
  async getBookings(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
    @Query() query: GetBookingsQueryDto,
  ) {
    return this.bookingsService.getBookings(userId, role, query);
  }

  // ============================================
  // GET BOOKING DETAILS
  // ============================================

  @Get(':id')
  async getBookingDetails(
    @CurrentUser('userId') userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.bookingsService.getBookingDetails(userId, bookingId);
  }

  // ============================================
  // CONFIRM BOOKING (PROFESSIONAL ONLY)
  // ============================================

  @Put(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmBooking(
    @CurrentUser('userId') userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.bookingsService.confirmBooking(userId, bookingId);
  }

  // ============================================
  // CANCEL BOOKING
  // ============================================

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @CurrentUser('userId') userId: string,
    @Param('id') bookingId: string,
    @Body() dto?: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.cancelBooking(userId, bookingId, dto);
  }

  // ============================================
  // COMPLETE BOOKING (PROFESSIONAL ONLY)
  // ============================================

  @Put(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeBooking(
    @CurrentUser('userId') userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.bookingsService.completeBooking(userId, bookingId);
  }

  // ============================================
  // RESCHEDULE BOOKING (PROFESSIONAL ONLY)
  // ============================================

  @Put(':id/reschedule')
  @HttpCode(HttpStatus.OK)
  async rescheduleBooking(
    @CurrentUser('userId') userId: string,
    @Param('id') bookingId: string,
    @Body() dto: RescheduleBookingDto,
  ) {
    return this.bookingsService.rescheduleBooking(userId, bookingId, dto);
  }

  // ============================================
  // CONFIRM RESCHEDULED BOOKING
  // ============================================

  @Put(':id/confirm-reschedule')
  @HttpCode(HttpStatus.OK)
  async confirmReschedule(
    @CurrentUser('userId') userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.bookingsService.confirmBooking(userId, bookingId);
  }
}
