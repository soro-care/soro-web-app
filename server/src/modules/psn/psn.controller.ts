// src/modules/psn/psn.controller.ts

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
import { PSNService } from './psn.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreatePSNApplicationDto,
  ReviewApplicationDto,
  CreateModuleDto,
  UpdateModuleDto,
  SubmitAssessmentDto,
  MarkVideoWatchedDto,
  GetProgressQueryDto,
  PaymentVerificationDto,
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

@ApiTags('PSN - Peer Support Network')
@Controller('psn')
export class PSNController {
  constructor(private psnService: PSNService) {}

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Apply to PSN',
    description: 'Submit application to join Peer Support Network program',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['motivation', 'experience'],
      properties: {
        motivation: {
          type: 'string',
          minLength: 100,
          maxLength: 2000,
          example: 'I want to help others because...',
        },
        experience: {
          type: 'string',
          minLength: 50,
          maxLength: 1000,
          example: 'I have experience with...',
        },
        availability: {
          type: 'string',
          example: 'Weekends, evenings',
        },
        skills: {
          type: 'array',
          items: { type: 'string' },
          example: ['Active Listening', 'Empathy', 'Crisis Management'],
        },
        certifications: {
          type: 'array',
          items: { type: 'string' },
          example: ['Mental Health First Aid', 'Crisis Intervention'],
        },
        references: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              relationship: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        applicationId: { type: 'string' },
        status: { type: 'string' },
        paymentRequired: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid application data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Already applied',
  })
  async applyToPSN(@CurrentUser('id') userId: string, @Body() dto: CreatePSNApplicationDto) {
    return this.psnService.createApplication(userId, dto);
  }

  @Get('application/my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get my application',
    description: 'Retrieve current user PSN application status',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Application retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        application: { type: 'object' },
        status: { type: 'string' },
        nextSteps: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found',
  })
  async getMyApplication(@CurrentUser('id') userId: string) {
    return this.psnService.getMyApplication(userId);
  }

  @Post('verify-payment')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify payment',
    description: 'Verify payment for PSN application',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['paymentId', 'amount'],
      properties: {
        paymentId: {
          type: 'string',
          example: 'pay_123abc',
        },
        amount: {
          type: 'number',
          example: 99.99,
        },
        currency: {
          type: 'string',
          example: 'USD',
        },
        paymentMethod: {
          type: 'string',
          example: 'stripe',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        verified: { type: 'boolean' },
        applicationStatus: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payment data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found',
  })
  async verifyPayment(@CurrentUser('id') userId: string, @Body() dto: PaymentVerificationDto) {
    return this.psnService.verifyPayment(userId, dto);
  }

  @Get('applications')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Get all applications',
    description: 'Retrieve all PSN applications (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'under-review', 'approved', 'rejected', 'all'],
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
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'name'],
  })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        applications: { type: 'array' },
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
  async getAllApplications(@CurrentUser('id') adminId: string, @Query() query: any) {
    return this.psnService.getAllApplications(adminId, query);
  }

  @Put('applications/:applicationId/review')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Review application',
    description: 'Review and update PSN application status (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'applicationId',
    type: String,
    example: 'app_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['approved', 'rejected', 'under-review'],
          example: 'approved',
        },
        feedback: {
          type: 'string',
          example: 'Strong application with relevant experience',
        },
        notes: {
          type: 'string',
          example: 'Schedule interview for next week',
        },
        interviewDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-02-15T10:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Application reviewed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        application: { type: 'object' },
        notificationSent: { type: 'boolean' },
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
  @ApiResponse({
    status: 404,
    description: 'Application not found',
  })
  async reviewApplication(
    @CurrentUser('id') adminId: string,
    @Param('applicationId') applicationId: string,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.psnService.reviewApplication(adminId, applicationId, dto);
  }

  @Post('modules')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create module',
    description: 'Create a new PSN training module (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'description', 'content', 'duration'],
      properties: {
        title: {
          type: 'string',
          example: 'Active Listening Skills',
        },
        slug: {
          type: 'string',
          example: 'active-listening-skills',
        },
        description: {
          type: 'string',
          example: 'Learn essential active listening techniques...',
        },
        content: {
          type: 'string',
          example: 'Full module content...',
        },
        duration: {
          type: 'number',
          example: 120,
        },
        difficulty: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced'],
          example: 'beginner',
        },
        videoUrl: {
          type: 'string',
          example: 'https://example.com/video.mp4',
        },
        resources: {
          type: 'array',
          items: { type: 'string' },
        },
        prerequisites: {
          type: 'array',
          items: { type: 'string' },
        },
        isPublished: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Module created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        moduleId: { type: 'string' },
        slug: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid module data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createModule(@CurrentUser('id') adminId: string, @Body() dto: CreateModuleDto) {
    return this.psnService.createModule(adminId, dto);
  }

  @Get('modules')
  @ApiOperation({
    summary: 'Get all modules',
    description: 'Retrieve all published PSN modules',
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['title', 'difficulty', 'duration', 'createdAt'],
  })
  @ApiResponse({
    status: 200,
    description: 'Modules retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        modules: { type: 'array' },
        total: { type: 'number' },
        categories: { type: 'array' },
      },
    },
  })
  async getAllModules() {
    return this.psnService.getAllModules();
  }

  @Get('modules/:moduleId')
  @ApiOperation({
    summary: 'Get module by ID',
    description: 'Retrieve detailed information about a specific module',
  })
  @ApiParam({
    name: 'moduleId',
    type: String,
    example: 'mod_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Module retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        module: { type: 'object' },
        prerequisites: { type: 'array' },
        nextModules: { type: 'array' },
        progress: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Module not found',
  })
  async getModuleById(@Param('moduleId') moduleId: string) {
    return this.psnService.getModuleById(moduleId);
  }

  @Put('modules/:moduleId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Update module',
    description: 'Update an existing PSN module (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'moduleId',
    type: String,
    example: 'mod_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        content: { type: 'string' },
        duration: { type: 'number' },
        difficulty: { type: 'string' },
        videoUrl: { type: 'string' },
        resources: { type: 'array' },
        isPublished: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Module updated successfully',
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
    description: 'Module not found',
  })
  async updateModule(
    @CurrentUser('id') adminId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.psnService.updateModule(adminId, moduleId, dto);
  }

  @Delete('modules/:moduleId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete module',
    description: 'Delete a PSN module (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'moduleId',
    type: String,
    example: 'mod_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Module deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Module has active learners, cannot delete',
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
    description: 'Module not found',
  })
  async deleteModule(@CurrentUser('id') adminId: string, @Param('moduleId') moduleId: string) {
    return this.psnService.deleteModule(adminId, moduleId);
  }

  @Get('my-modules')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get available modules',
    description: 'Retrieve modules available to current fellow',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['not-started', 'in-progress', 'completed', 'all'],
  })
  @ApiResponse({
    status: 200,
    description: 'Modules retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        modules: { type: 'array' },
        progress: { type: 'object' },
        recommendations: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a PSN fellow',
  })
  async getAvailableModules(@CurrentUser('id') userId: string) {
    return this.psnService.getAvailableModules(userId);
  }

  @Get('my-modules/:moduleId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get module details',
    description: 'Retrieve detailed module information with progress',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'moduleId',
    type: String,
    example: 'mod_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Module details retrieved',
    schema: {
      type: 'object',
      properties: {
        module: { type: 'object' },
        progress: { type: 'object' },
        nextModule: { type: 'object' },
        assessment: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to access',
  })
  @ApiResponse({
    status: 404,
    description: 'Module not found',
  })
  async getModuleDetails(@CurrentUser('id') userId: string, @Param('moduleId') moduleId: string) {
    return this.psnService.getModuleDetails(userId, moduleId);
  }

  @Post('video-watched')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark video as watched',
    description: 'Mark module video as watched',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['moduleId'],
      properties: {
        moduleId: {
          type: 'string',
          example: 'mod_123abc',
        },
        videoId: {
          type: 'string',
          example: 'vid_123abc',
        },
        watchedDuration: {
          type: 'number',
          example: 600,
        },
        totalDuration: {
          type: 'number',
          example: 1200,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video marked as watched',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        progress: { type: 'number' },
        nextAction: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Module not found',
  })
  async markVideoWatched(@CurrentUser('id') userId: string, @Body() dto: MarkVideoWatchedDto) {
    return this.psnService.markVideoWatched(userId, dto);
  }

  @Post('modules/:moduleId/assessment')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit assessment',
    description: 'Submit module assessment answers',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'moduleId',
    type: String,
    example: 'mod_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['answers'],
      properties: {
        answers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              answer: { type: 'string' },
            },
          },
        },
        timeSpent: {
          type: 'number',
          example: 1800,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Assessment submitted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        score: { type: 'number' },
        passed: { type: 'boolean' },
        feedback: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid assessment data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Module not found',
  })
  async submitAssessment(
    @CurrentUser('id') userId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: SubmitAssessmentDto,
  ) {
    return this.psnService.submitAssessment(userId, moduleId, dto);
  }

  @Get('my-progress')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get my progress',
    description: 'Retrieve current PSN learning progress',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Progress retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        overallProgress: { type: 'number' },
        completedModules: { type: 'number' },
        totalModules: { type: 'number' },
        modules: { type: 'array' },
        streak: { type: 'number' },
        estimatedCompletion: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a PSN fellow',
  })
  async getMyProgress(@CurrentUser('id') userId: string) {
    return this.psnService.getMyProgress(userId);
  }

  @Post('certificate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate certificate',
    description: 'Generate PSN completion certificate',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Certificate generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        certificateUrl: { type: 'string' },
        certificateId: { type: 'string' },
        issuedDate: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Not all modules completed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not eligible for certificate',
  })
  async generateCertificate(@CurrentUser('id') userId: string) {
    return this.psnService.generateCertificate(userId);
  }

  @Get('analytics/fellows')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Get fellows progress',
    description: 'Retrieve progress analytics for all fellows (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['progress', 'name', 'joinedDate'],
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Fellows analytics retrieved',
    schema: {
      type: 'object',
      properties: {
        fellows: { type: 'array' },
        stats: { type: 'object' },
        trends: { type: 'object' },
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
  async getFellowsProgress(
    @CurrentUser('id') adminId: string,
    @Query() query: GetProgressQueryDto,
  ) {
    return this.psnService.getFellowsProgress(adminId, query);
  }

  @Get('analytics/modules')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Get module analytics',
    description: 'Retrieve analytics for all modules (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Module analytics retrieved',
    schema: {
      type: 'object',
      properties: {
        modules: { type: 'array' },
        completionRates: { type: 'object' },
        assessmentStats: { type: 'object' },
        popularModules: { type: 'array' },
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
  async getModuleAnalytics(@CurrentUser('id') adminId: string) {
    return this.psnService.getModuleAnalytics(adminId);
  }
}
