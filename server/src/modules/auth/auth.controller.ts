// src/modules/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  VerifyOtpDto,
  ResendOtpDto,
  LoginDto,
  ForgotPasswordDto,
  VerifyResetOtpDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RegisterProfessionalDto,
} from './dto';
import { JwtAuthGuard } from './guards';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ============================================
  // REGISTRATION ENDPOINTS
  // ============================================

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email);
  }

  @Post('register-professional')
  @HttpCode(HttpStatus.CREATED)
  async registerProfessional(@Body() dto: RegisterProfessionalDto) {
    return this.authService.registerProfessional(dto);
  }

  // ============================================
  // LOGIN & LOGOUT
  // ============================================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);

    // Set HTTP-only cookies for tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    response.cookie('accessToken', result.data.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refreshToken', result.data.refreshToken, cookieOptions);

    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req, @Res({ passthrough: true }) response: Response) {
    // Clear refresh token in database
    await this.authService['prisma'].user.update({
      where: { id: req.user.userId },
      data: { refreshToken: null },
    });

    // Clear cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none' as const,
    };

    response.clearCookie('accessToken', cookieOptions);
    response.clearCookie('refreshToken', cookieOptions);

    return {
      message: 'Logout successful',
      success: true,
    };
  }

  // ============================================
  // PASSWORD RESET FLOW
  // ============================================

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('verify-reset-otp')
  @HttpCode(HttpStatus.OK)
  async verifyResetOtp(@Body() dto: VerifyResetOtpDto) {
    return this.authService.verifyResetOtp(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    const user = await this.authService['prisma'].user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    // Update password
    await this.authService['prisma'].user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password updated successfully',
      success: true,
    };
  }

  // ============================================
  // TOKEN REFRESH
  // ============================================

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.refreshToken || req.headers?.authorization?.split(' ')[1];

    if (!refreshToken) {
      throw new Error('Refresh token not provided');
    }

    const result = await this.authService.refreshToken(refreshToken);

    // Update access token cookie
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return result;
  }

  // ============================================
  // PROFILE (Protected Route Test)
  // ============================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    const user = await this.authService['prisma'].user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        status: true,
        isPeerCounselor: true,
        counselorId: true,
        specialization: true,
        bio: true,
        createdAt: true,
      },
    });

    return {
      message: 'Profile retrieved successfully',
      data: user,
    };
  }
}
