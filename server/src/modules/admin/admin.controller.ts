// src/modules/admin/admin.controller.ts

import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  GetUsersQueryDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  GetDashboardStatsDto,
  GetBookingsQueryDto,
  UpdateBookingStatusDto,
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

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({
    summary: 'Get admin dashboard statistics',
    description: 'Comprehensive platform analytics for administrators',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2024-12-31',
  })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'] })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: { type: 'object' },
        bookings: { type: 'object' },
        psn: { type: 'object' },
        blog: { type: 'object' },
        echo: { type: 'object' },
        survey: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getDashboardStats(@CurrentUser('id') userId: string, @Query() query: GetDashboardStatsDto) {
    return this.adminService.getDashboardStats(userId, query);
  }

  @Get('analytics/system')
  @ApiOperation({
    summary: 'Get system analytics',
    description: 'Detailed system performance and usage analytics',
  })
  @ApiResponse({
    status: 200,
    description: 'System analytics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getSystemAnalytics(@CurrentUser('id') userId: string) {
    return this.adminService.getSystemAnalytics(userId);
  }

  @Get('moderation/queue')
  @ApiOperation({
    summary: 'Get content moderation queue',
    description: 'Retrieve all content pending moderation',
  })
  @ApiResponse({
    status: 200,
    description: 'Moderation queue retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        echoes: { type: 'array' },
        comments: { type: 'array' },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getContentModerationQueue(@CurrentUser('id') userId: string) {
    return this.adminService.getContentModerationQueue(userId);
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve paginated list of all users with filtering options',
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
    name: 'role',
    required: false,
    enum: ['user', 'professional', 'admin'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'suspended'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Users list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        meta: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllUsers(@CurrentUser('id') userId: string, @Query() query: GetUsersQueryDto) {
    return this.adminService.getAllUsers(userId, query);
  }

  @Get('users/:userId')
  @ApiOperation({
    summary: 'Get user details',
    description: 'Retrieve detailed information about a specific user',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    example: 'clx123abc456def',
  })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
        lastLogin: { type: 'string' },
        profile: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDetails(@CurrentUser('id') adminId: string, @Param('userId') userId: string) {
    return this.adminService.getUserDetails(adminId, userId);
  }

  @Put('users/:userId/status')
  @ApiOperation({
    summary: 'Update user status',
    description: 'Update the status of a user (active/inactive/suspended)',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    example: 'clx123abc456def',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'suspended'],
          example: 'suspended',
        },
        reason: {
          type: 'string',
          example: 'Violation of terms of service',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @CurrentUser('id') adminId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(adminId, userId, dto);
  }

  @Put('users/:userId/role')
  @ApiOperation({
    summary: 'Update user role',
    description: 'Update the role of a user (user/professional/admin)',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    example: 'clx123abc456def',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['role'],
      properties: {
        role: {
          type: 'string',
          enum: ['user', 'professional', 'admin'],
          example: 'professional',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(
    @CurrentUser('id') adminId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(adminId, userId, dto);
  }

  @Delete('users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently delete a user account (admin only)',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    example: 'clx123abc456def',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@CurrentUser('id') adminId: string, @Param('userId') userId: string) {
    return this.adminService.deleteUser(adminId, userId);
  }

  @Get('bookings')
  @ApiOperation({
    summary: 'Get all bookings',
    description: 'Retrieve paginated list of all bookings with filtering options',
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
    description: 'Bookings list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        meta: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllBookings(@CurrentUser('id') userId: string, @Query() query: GetBookingsQueryDto) {
    return this.adminService.getAllBookings(userId, query);
  }

  @Put('bookings/:bookingId/status')
  @ApiOperation({
    summary: 'Update booking status',
    description: 'Update the status of a booking',
  })
  @ApiParam({
    name: 'bookingId',
    type: String,
    example: 'booking_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'completed', 'cancelled'],
          example: 'completed',
        },
        notes: {
          type: 'string',
          example: 'Session completed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Booking status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateBookingStatus(
    @CurrentUser('id') userId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.adminService.updateBookingStatus(userId, bookingId, dto);
  }
}
