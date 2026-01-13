// src/modules/availability/availability.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  UpdateAvailabilityDto,
  BulkUpdateAvailabilityDto,
  CheckSlotDto,
  GetAvailableSlotsDto,
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

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get('check-initialized')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Check if availability is initialized',
    description: 'Check if the current user has initialized their availability schedule',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Initialization status retrieved',
    schema: {
      type: 'object',
      properties: {
        initialized: { type: 'boolean' },
        lastUpdated: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async checkInitialized(@CurrentUser('userId') userId: string) {
    return this.availabilityService.checkInitialized(userId);
  }

  @Get('check-initialized/:professionalId')
  @ApiOperation({
    summary: 'Check professional availability initialization',
    description: 'Check if a specific professional has initialized availability',
  })
  @ApiParam({
    name: 'professionalId',
    type: String,
    example: 'prof_abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Initialization status retrieved',
    schema: {
      type: 'object',
      properties: {
        initialized: { type: 'boolean' },
        professionalName: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  async checkInitializedForProfessional(@Param('professionalId') professionalId: string) {
    return this.availabilityService.checkInitialized(professionalId);
  }

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initialize availability schedule',
    description: 'Create default availability schedule for a professional',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Availability initialized successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        availabilityId: { type: 'string' },
        days: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Availability already initialized',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async initializeAvailability(@CurrentUser('userId') userId: string) {
    return this.availabilityService.initializeAvailability(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get my availability',
    description: 'Retrieve current user availability schedule',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Availability retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        days: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              dayOfWeek: { type: 'string' },
              isAvailable: { type: 'boolean' },
              startTime: { type: 'string' },
              endTime: { type: 'string' },
              slots: { type: 'array' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Availability not found',
  })
  async getMyAvailability(@CurrentUser('userId') userId: string) {
    return this.availabilityService.getAvailability(userId);
  }

  @Get('professional/:professionalId')
  @ApiOperation({
    summary: 'Get professional availability',
    description: 'Retrieve availability schedule for a specific professional',
  })
  @ApiParam({
    name: 'professionalId',
    type: String,
    example: 'prof_abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Professional availability retrieved',
    schema: {
      type: 'object',
      properties: {
        professional: { type: 'object' },
        availability: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              dayOfWeek: { type: 'string' },
              slots: { type: 'array' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  async getProfessionalAvailability(@Param('professionalId') professionalId: string) {
    return this.availabilityService.getAvailability(professionalId);
  }

  @Put(':dayId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update availability for specific day',
    description: 'Update availability settings for a particular day',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'dayId',
    type: String,
    example: 'day_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isAvailable: { type: 'boolean', example: true },
        startTime: { type: 'string', example: '09:00' },
        endTime: { type: 'string', example: '17:00' },
        slotDuration: { type: 'number', example: 60 },
        breakStart: { type: 'string', example: '12:00' },
        breakEnd: { type: 'string', example: '13:00' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid time range',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Day not found',
  })
  async updateAvailability(
    @CurrentUser('userId') userId: string,
    @Param('dayId') dayId: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.updateAvailability(userId, dayId, dto);
  }

  @Put('bulk/update')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update availability',
    description: 'Update multiple days availability at once',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['updates'],
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              dayId: { type: 'string' },
              isAvailable: { type: 'boolean' },
              startTime: { type: 'string' },
              endTime: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk update completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        updatedCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid update data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async bulkUpdateAvailability(
    @CurrentUser('userId') userId: string,
    @Body() dto: BulkUpdateAvailabilityDto,
  ) {
    return this.availabilityService.bulkUpdateAvailability(userId, dto);
  }

  @Post('check-slot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check slot availability',
    description: 'Check if a specific time slot is available for booking',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['professionalId', 'date', 'startTime', 'duration'],
      properties: {
        professionalId: { type: 'string', example: 'prof_abc123' },
        date: { type: 'string', format: 'date', example: '2024-01-20' },
        startTime: { type: 'string', example: '10:00' },
        duration: { type: 'number', example: 60 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Slot availability checked',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        conflictReason: { type: 'string' },
        suggestedSlots: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid slot parameters',
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  async checkSlotAvailability(@Body() dto: CheckSlotDto) {
    return this.availabilityService.checkSlotAvailability(dto);
  }

  @Get('slots/all')
  @ApiOperation({
    summary: 'Get all available slots',
    description: 'Retrieve all available time slots with filtering options',
  })
  @ApiQuery({
    name: 'professionalId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'modality',
    required: false,
    enum: ['Video', 'Audio'],
  })
  @ApiResponse({
    status: 200,
    description: 'Available slots retrieved',
    schema: {
      type: 'object',
      properties: {
        slots: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              professionalId: { type: 'string' },
              professionalName: { type: 'string' },
              date: { type: 'string' },
              startTime: { type: 'string' },
              endTime: { type: 'string' },
              modality: { type: 'string' },
              price: { type: 'number' },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  async getAllAvailableSlots(@Query() query: GetAvailableSlotsDto) {
    return this.availabilityService.getAllAvailableSlots(query);
  }

  @Get('professionals/all')
  @ApiOperation({
    summary: 'Get all professionals with availability',
    description: 'Retrieve list of all professionals who have set availability',
  })
  @ApiResponse({
    status: 200,
    description: 'Professionals list retrieved',
    schema: {
      type: 'object',
      properties: {
        professionals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              specialization: { type: 'string' },
              nextAvailable: { type: 'string' },
              rating: { type: 'number' },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  async getAllProfessionalsWithAvailability() {
    return this.availabilityService.getAllProfessionalsWithAvailability();
  }

  @Delete(':dayId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete availability day',
    description: 'Remove availability for a specific day',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'dayId',
    type: String,
    example: 'day_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Day availability deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Day not found',
  })
  async deleteAvailabilityDay(
    @CurrentUser('userId') userId: string,
    @Param('dayId') dayId: string,
  ) {
    return this.availabilityService.deleteAvailabilityDay(userId, dayId);
  }
}
