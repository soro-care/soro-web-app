// src/modules/echo/echo.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { EchoService } from './echo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateEchoDto,
  GetEchoesQueryDto,
  AddEchoCommentDto,
  LikeEchoDto,
  ShareEchoDto,
  ReportEchoDto,
  ModerateEchoDto,
  GetRoomStatsQueryDto,
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

@ApiTags('Echo')
@Controller('echo')
export class EchoController {
  constructor(private echoService: EchoService) {}

  @Post('share')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Share anonymous story',
    description: 'Share a mental health story anonymously. Crisis detection is automatic.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['content', 'authorName', 'room'],
      properties: {
        content: {
          type: 'string',
          minLength: 10,
          maxLength: 2000,
          example: 'Today was really hard, but I made it through...',
        },
        authorName: {
          type: 'string',
          minLength: 2,
          maxLength: 30,
          example: 'Hope Seeker',
        },
        room: {
          type: 'string',
          enum: [
            'pressure',
            'burnout',
            'not-enough',
            'silence',
            'rage',
            'exhaustion',
            'gratitude',
            'victory',
            'hope',
            'resilience',
          ],
          example: 'hope',
        },
        mood: {
          type: 'string',
          enum: ['happy', 'sad', 'anxious', 'angry', 'hopeful', 'neutral'],
          example: 'hopeful',
        },
        isCrisis: {
          type: 'boolean',
          example: false,
        },
        allowComments: {
          type: 'boolean',
          example: true,
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['anxiety', 'recovery', 'support'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Story shared successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        echo: { type: 'object' },
        crisisDetected: { type: 'boolean' },
        resources: {
          type: 'object',
          properties: {
            hotlines: { type: 'array' },
            articles: { type: 'array' },
            supportGroups: { type: 'array' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or content too short',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests from this IP',
  })
  async createEcho(
    @Body() dto: CreateEchoDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.echoService.createEcho(dto, ipAddress, userAgent);
  }

  @Get('room/:room')
  @ApiOperation({
    summary: 'Get stories by room',
    description: 'Retrieve anonymous stories from a specific room',
  })
  @ApiParam({
    name: 'room',
    type: String,
    enum: [
      'pressure',
      'burnout',
      'not-enough',
      'silence',
      'rage',
      'exhaustion',
      'gratitude',
      'victory',
      'hope',
      'resilience',
    ],
    example: 'hope',
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
    example: 20,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['newest', 'oldest', 'mostLiked', 'mostCommented'],
  })
  @ApiQuery({
    name: 'mood',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Stories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        stories: { type: 'array' },
        roomInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            storyCount: { type: 'number' },
          },
        },
        meta: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Room not found',
  })
  async getEchoesByRoom(@Param('room') room: string, @Query() query: GetEchoesQueryDto) {
    return this.echoService.getEchoesByRoom(room, query);
  }

  @Get('story/:storyId')
  @ApiOperation({
    summary: 'Get story by ID',
    description: 'Retrieve a specific anonymous story with comments',
  })
  @ApiParam({
    name: 'storyId',
    type: String,
    example: 'echo_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Story retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        story: { type: 'object' },
        comments: { type: 'array' },
        relatedStories: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Story not found',
  })
  async getEchoById(@Param('storyId') storyId: string) {
    return this.echoService.getEchoById(storyId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search stories',
    description: 'Search anonymous stories by keywords, tags, or content',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
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
    name: 'room',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved',
    schema: {
      type: 'object',
      properties: {
        results: { type: 'array' },
        total: { type: 'number' },
        meta: { type: 'object' },
      },
    },
  })
  async searchEchoes(@Query() query: GetEchoesQueryDto) {
    return this.echoService.searchEchoes(query);
  }

  @Get('room/:roomId/related')
  @ApiOperation({
    summary: 'Get related stories',
    description: 'Retrieve stories related to a specific room',
  })
  @ApiParam({
    name: 'roomId',
    type: String,
    example: 'room_hope',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Related stories retrieved',
    schema: {
      type: 'object',
      properties: {
        stories: { type: 'array' },
        count: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Room not found',
  })
  async getRelatedStories(@Param('roomId') roomId: string, @Query('limit') limit?: number) {
    return this.echoService.getRelatedStories(roomId, limit ? +limit : 5);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get room statistics',
    description: 'Retrieve statistics for all echo rooms',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
  })
  @ApiResponse({
    status: 200,
    description: 'Room stats retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        rooms: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              room: { type: 'string' },
              storyCount: { type: 'number' },
              likeCount: { type: 'number' },
              commentCount: { type: 'number' },
              crisisCount: { type: 'number' },
              trend: { type: 'string' },
            },
          },
        },
        totals: { type: 'object' },
        period: { type: 'string' },
      },
    },
  })
  async getRoomsStats(@Query() query: GetRoomStatsQueryDto) {
    return this.echoService.getRoomsStats(query);
  }

  @Post('like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Like a story',
    description: 'Like or unlike an anonymous story',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['storyId'],
      properties: {
        storyId: {
          type: 'string',
          example: 'echo_123abc',
        },
        action: {
          type: 'string',
          enum: ['like', 'unlike'],
          example: 'like',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Like action processed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        likesCount: { type: 'number' },
        liked: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid story ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Story not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many likes from this IP',
  })
  async likeEcho(
    @Body() dto: LikeEchoDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.echoService.likeEcho(dto, ipAddress, userAgent);
  }

  @Post('comment')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add comment to story',
    description: 'Add an anonymous comment to a story',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['storyId', 'content', 'authorName'],
      properties: {
        storyId: {
          type: 'string',
          example: 'echo_123abc',
        },
        content: {
          type: 'string',
          minLength: 1,
          maxLength: 500,
          example: 'Thank you for sharing. You are not alone.',
        },
        authorName: {
          type: 'string',
          minLength: 2,
          maxLength: 30,
          example: 'Supportive Listener',
        },
        parentCommentId: {
          type: 'string',
          example: 'comment_123abc',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        commentId: { type: 'string' },
        requiresModeration: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid comment data',
  })
  @ApiResponse({
    status: 404,
    description: 'Story not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many comments from this IP',
  })
  async addComment(@Body() dto: AddEchoCommentDto) {
    return this.echoService.addComment(dto);
  }

  @Get('story/:storyId/comments')
  @ApiOperation({
    summary: 'Get story comments',
    description: 'Retrieve comments for a specific story',
  })
  @ApiParam({
    name: 'storyId',
    type: String,
    example: 'echo_123abc',
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
    enum: ['newest', 'oldest', 'mostLiked'],
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        comments: { type: 'array' },
        total: { type: 'number' },
        meta: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Story not found',
  })
  async getComments(@Param('storyId') storyId: string) {
    return this.echoService.getComments(storyId);
  }

  @Post('track-share')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track story sharing',
    description: 'Track when a story is shared externally',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['storyId', 'platform'],
      properties: {
        storyId: {
          type: 'string',
          example: 'echo_123abc',
        },
        platform: {
          type: 'string',
          enum: ['facebook', 'twitter', 'whatsapp', 'email', 'copy'],
          example: 'facebook',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Share tracked successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Story not found',
  })
  async trackShare(@Body() dto: ShareEchoDto) {
    return this.echoService.trackShare(dto);
  }

  @Post('report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Report inappropriate content',
    description: 'Report a story or comment for inappropriate content',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['contentId', 'reason', 'contentType'],
      properties: {
        contentId: {
          type: 'string',
          example: 'echo_123abc',
        },
        contentType: {
          type: 'string',
          enum: ['story', 'comment'],
          example: 'story',
        },
        reason: {
          type: 'string',
          enum: ['harassment', 'spam', 'inappropriate', 'self-harm', 'other'],
          example: 'inappropriate',
        },
        details: {
          type: 'string',
          example: 'Contains offensive language',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Report submitted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        reportId: { type: 'string' },
        reviewed: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid report data',
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many reports from this IP',
  })
  async reportEcho(@Body() dto: ReportEchoDto, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.echoService.reportEcho(dto, ipAddress);
  }

  @Get('moderation/flagged')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Get flagged content',
    description: 'Retrieve all flagged stories and comments for moderation (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'reviewed', 'all'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['story', 'comment', 'all'],
  })
  @ApiResponse({
    status: 200,
    description: 'Flagged content retrieved',
    schema: {
      type: 'object',
      properties: {
        flaggedContent: { type: 'array' },
        pendingCount: { type: 'number' },
        reviewedCount: { type: 'number' },
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
  async getFlaggedStories() {
    return this.echoService.getFlaggedStories();
  }

  @Put('moderation/:storyId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Moderate story',
    description: 'Approve, reject, or take action on a story (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'storyId',
    type: String,
    example: 'echo_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['action'],
      properties: {
        action: {
          type: 'string',
          enum: ['approve', 'reject', 'hide', 'delete'],
          example: 'approve',
        },
        reason: {
          type: 'string',
          example: 'Violates community guidelines',
        },
        notes: {
          type: 'string',
          example: 'Contains personal information',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Moderation action completed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        action: { type: 'string' },
        timestamp: { type: 'string' },
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
    description: 'Story not found',
  })
  async moderateEcho(
    @CurrentUser('id') userId: string,
    @Param('storyId') storyId: string,
    @Body() dto: ModerateEchoDto,
  ) {
    return this.echoService.moderateEcho(userId, storyId, dto);
  }
}
