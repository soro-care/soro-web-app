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
import {
  UpdateUserDto,
  UpdateUsernameDto,
  GetUsersQueryDto,
  ContactFormDto,
} from './dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ============================================
  // GET CURRENT USER
  // ============================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser('userId') userId: string) {
    return this.usersService.getUserById(userId);
  }

  // ============================================
  // GET USER BY ID
  // ============================================

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  // ============================================
  // UPDATE USER
  // ============================================

  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, dto);
  }

  // ============================================
  // UPDATE USERNAME
  // ============================================

  @Put('update-username')
  @UseGuards(JwtAuthGuard)
  async updateUsername(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateUsernameDto,
  ) {
    return this.usersService.updateUsername(userId, dto);
  }

  // ============================================
  // UPLOAD AVATAR
  // ============================================

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(userId, file);
  }

  // ============================================
  // GET ALL PROFESSIONALS
  // ============================================

  @Get('professionals/all')
  async getAllProfessionals() {
    return this.usersService.getAllProfessionals();
  }

  // ============================================
  // GET ALL USERS (ADMIN ONLY)
  // ============================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.getAllUsers(query);
  }

  // ============================================
  // FOLLOW USER (Future Feature)
  // ============================================

  @Post('follow/:id')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @CurrentUser('userId') userId: string,
    @Param('id') targetUserId: string,
  ) {
    return this.usersService.followUser(userId, targetUserId);
  }

  // ============================================
  // CONTACT FORM
  // ============================================

  @Post('contact')
  async submitContactForm(
    @Body() dto: ContactFormDto,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.usersService.submitContactForm(dto, userId);
  }
}
