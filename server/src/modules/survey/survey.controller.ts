// src/modules/survey/survey.controller.ts

import {
  Controller,
  Post,
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
import { SurveyService } from './survey.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateSurveyDto, UpdateSurveyDto, GetSurveyAnalyticsDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Survey')
@Controller('survey')
export class SurveyController {
  constructor(private surveyService: SurveyService) {}

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit survey',
    description: 'Submit mental health assessment survey',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['responses'],
      properties: {
        responses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              answer: { type: 'string' },
              score: { type: 'number' },
            },
          },
        },
        assessmentType: {
          type: 'string',
          enum: ['PHQ-9', 'GAD-7', 'PSS', 'custom'],
          example: 'PHQ-9',
        },
        notes: {
          type: 'string',
          example: 'Feeling better this week',
        },
        mood: {
          type: 'string',
          enum: ['very-happy', 'happy', 'neutral', 'sad', 'very-sad'],
          example: 'happy',
        },
        stressors: {
          type: 'array',
          items: { type: 'string' },
          example: ['work', 'family', 'finances'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Survey submitted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        surveyId: { type: 'string' },
        score: { type: 'number' },
        recommendation: { type: 'string' },
        resources: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid survey data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createSurvey(@CurrentUser('id') userId: string, @Body() dto: CreateSurveyDto) {
    return this.surveyService.createSurvey(userId, dto);
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update survey',
    description: 'Update existing survey responses',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        responses: { type: 'array' },
        notes: { type: 'string' },
        mood: { type: 'string' },
        completed: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Survey updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        updatedAt: { type: 'string' },
        score: { type: 'number' },
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
  @ApiResponse({
    status: 404,
    description: 'Survey not found',
  })
  async updateSurvey(@CurrentUser('id') userId: string, @Body() dto: UpdateSurveyDto) {
    return this.surveyService.updateSurvey(userId, dto);
  }

  @Get('my-survey')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get my survey',
    description: 'Retrieve current user survey responses and history',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 5,
  })
  @ApiQuery({
    name: 'assessmentType',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Survey data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        currentSurvey: { type: 'object' },
        history: { type: 'array' },
        trends: { type: 'object' },
        recommendations: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMySurvey(@CurrentUser('id') userId: string) {
    return this.surveyService.getMySurvey(userId);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get survey status',
    description: 'Check if survey is due or completed',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Survey status retrieved',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        lastCompleted: { type: 'string' },
        nextDue: { type: 'string' },
        isOverdue: { type: 'boolean' },
        streak: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getSurveyStatus(@CurrentUser('id') userId: string) {
    return this.surveyService.getSurveyStatus(userId);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Get survey analytics',
    description: 'Retrieve survey analytics and insights (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
  })
  @ApiQuery({
    name: 'assessmentType',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'demographic',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        participation: { type: 'object' },
        scores: { type: 'object' },
        trends: { type: 'object' },
        demographics: { type: 'object' },
        insights: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSurveyAnalytics(
    @CurrentUser('id') userId: string,
    @Query() query: GetSurveyAnalyticsDto,
  ) {
    return this.surveyService.getSurveyAnalytics(userId, query);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Get all surveys',
    description: 'Retrieve all survey submissions (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
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
    name: 'userId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Surveys retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        surveys: { type: 'array' },
        meta: { type: 'object' },
        stats: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllSurveys(@CurrentUser('id') userId: string) {
    return this.surveyService.getAllSurveys(userId);
  }

  @Delete(':surveyId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete survey',
    description: 'Delete a survey submission (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'surveyId',
    type: String,
    example: 'survey_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Survey deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Survey not found',
  })
  async deleteSurvey(@CurrentUser('id') userId: string, @Param('surveyId') surveyId: string) {
    return this.surveyService.deleteSurvey(userId, surveyId);
  }
}
