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
  //   CreateAvailabilityDto,
  UpdateAvailabilityDto,
  BulkUpdateAvailabilityDto,
  CheckSlotDto,
  GetAvailableSlotsDto,
} from './dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  // ============================================
  // CHECK IF AVAILABILITY IS INITIALIZED
  // ============================================

  @Get('check-initialized')
  @UseGuards(JwtAuthGuard)
  async checkInitialized(@CurrentUser('userId') userId: string) {
    return this.availabilityService.checkInitialized(userId);
  }

  @Get('check-initialized/:professionalId')
  async checkInitializedForProfessional(
    @Param('professionalId') professionalId: string,
  ) {
    return this.availabilityService.checkInitialized(professionalId);
  }

  // ============================================
  // INITIALIZE AVAILABILITY
  // ============================================

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async initializeAvailability(@CurrentUser('userId') userId: string) {
    return this.availabilityService.initializeAvailability(userId);
  }

  // ============================================
  // GET AVAILABILITY (OWN OR SPECIFIC PROFESSIONAL)
  // ============================================

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyAvailability(@CurrentUser('userId') userId: string) {
    return this.availabilityService.getAvailability(userId);
  }

  @Get('professional/:professionalId')
  async getProfessionalAvailability(
    @Param('professionalId') professionalId: string,
  ) {
    return this.availabilityService.getAvailability(professionalId);
  }

  // ============================================
  // UPDATE AVAILABILITY FOR SPECIFIC DAY
  // ============================================

  @Put(':dayId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateAvailability(
    @CurrentUser('userId') userId: string,
    @Param('dayId') dayId: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.updateAvailability(userId, dayId, dto);
  }

  // ============================================
  // BULK UPDATE AVAILABILITY
  // ============================================

  @Put('bulk/update')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async bulkUpdateAvailability(
    @CurrentUser('userId') userId: string,
    @Body() dto: BulkUpdateAvailabilityDto,
  ) {
    return this.availabilityService.bulkUpdateAvailability(userId, dto);
  }

  // ============================================
  // CHECK SPECIFIC SLOT AVAILABILITY
  // ============================================

  @Post('check-slot')
  @HttpCode(HttpStatus.OK)
  async checkSlotAvailability(@Body() dto: CheckSlotDto) {
    return this.availabilityService.checkSlotAvailability(dto);
  }

  // ============================================
  // GET ALL AVAILABLE SLOTS
  // ============================================

  @Get('slots/all')
  async getAllAvailableSlots(@Query() query: GetAvailableSlotsDto) {
    return this.availabilityService.getAllAvailableSlots(query);
  }

  // ============================================
  // GET ALL PROFESSIONALS WITH AVAILABILITY
  // ============================================

  @Get('professionals/all')
  async getAllProfessionalsWithAvailability() {
    return this.availabilityService.getAllProfessionalsWithAvailability();
  }

  // ============================================
  // DELETE AVAILABILITY DAY
  // ============================================

  @Delete(':dayId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAvailabilityDay(
    @CurrentUser('userId') userId: string,
    @Param('dayId') dayId: string,
  ) {
    return this.availabilityService.deleteAvailabilityDay(userId, dayId);
  }
}
