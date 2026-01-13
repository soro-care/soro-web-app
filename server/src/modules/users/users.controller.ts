// src/modules/users/users.controller.ts

import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto, UpdateUsernameDto, GetUsersQueryDto, ContactFormDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user',
    description: 'Retrieve profile of currently authenticated user',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            avatar: { type: 'string' },
            role: { type: 'string' },
            status: { type: 'string' },
            bio: { type: 'string' },
            location: { type: 'string' },
            dateOfBirth: { type: 'string' },
            phone: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
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
    description: 'User not found',
  })
  async getCurrentUser(@CurrentUser('userId') userId: string) {
    return this.usersService.getUserById(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve public profile of a specific user',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    type: String,
    example: 'user_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        isFollowing: { type: 'boolean' },
        mutualConnections: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update user',
    description: 'Update current user profile information',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        bio: { type: 'string' },
        location: { type: 'string' },
        dateOfBirth: { type: 'string', format: 'date' },
        phone: { type: 'string' },
        website: { type: 'string' },
        socialLinks: {
          type: 'object',
          properties: {
            twitter: { type: 'string' },
            linkedin: { type: 'string' },
            instagram: { type: 'string' },
          },
        },
        preferences: {
          type: 'object',
          properties: {
            emailNotifications: { type: 'boolean' },
            pushNotifications: { type: 'boolean' },
            newsletter: { type: 'boolean' },
            language: { type: 'string' },
            timezone: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: { type: 'object' },
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
  async updateUser(@CurrentUser('userId') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(userId, dto);
  }

  @Put('update-username')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update username',
    description: 'Change username for current user',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username'],
      properties: {
        username: {
          type: 'string',
          minLength: 3,
          maxLength: 30,
          pattern: '^[a-zA-Z0-9_]+$',
          example: 'new_username',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Username updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        oldUsername: { type: 'string' },
        newUsername: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Username already taken or invalid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateUsername(@CurrentUser('userId') userId: string, @Body() dto: UpdateUsernameDto) {
    return this.usersService.updateUsername(userId, dto);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: 'Upload avatar',
    description: 'Upload or update user profile picture',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        avatarUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(userId, file);
  }

  @Get('professionals/all')
  @ApiOperation({
    summary: 'Get all professionals',
    description: 'Retrieve list of all professionals with filtering options',
  })
  @ApiQuery({
    name: 'specialization',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'availability',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
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
  @ApiResponse({
    status: 200,
    description: 'Professionals retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        professionals: { type: 'array' },
        meta: { type: 'object' },
        filters: { type: 'object' },
      },
    },
  })
  async getAllProfessionals() {
    return this.usersService.getAllProfessionals();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve all users with admin filters (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['user', 'professional', 'admin', 'all'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'suspended', 'all'],
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
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: { type: 'array' },
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
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.getAllUsers(query);
  }

  @Post('follow/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Follow user',
    description: 'Follow or unfollow another user',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    type: String,
    example: 'user_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Follow action completed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        following: { type: 'boolean' },
        followerCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot follow yourself',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async followUser(@CurrentUser('userId') userId: string, @Param('id') targetUserId: string) {
    return this.usersService.followUser(userId, targetUserId);
  }

  @Post('contact')
  @ApiOperation({
    summary: 'Submit contact form',
    description: 'Submit contact form to platform support',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'subject', 'message'],
      properties: {
        name: {
          type: 'string',
          example: 'John Doe',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'john@example.com',
        },
        subject: {
          type: 'string',
          example: 'General Inquiry',
        },
        message: {
          type: 'string',
          minLength: 10,
          maxLength: 2000,
          example: 'I have a question about...',
        },
        category: {
          type: 'string',
          enum: ['general', 'support', 'feedback', 'business', 'other'],
          example: 'general',
        },
        userId: {
          type: 'string',
          example: 'user_123abc',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contact form submitted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        ticketId: { type: 'string' },
        estimatedResponseTime: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid contact form data',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many submissions from this IP',
  })
  async submitContactForm(@Body() dto: ContactFormDto, @CurrentUser('userId') userId?: string) {
    return this.usersService.submitContactForm(dto, userId);
  }
}
