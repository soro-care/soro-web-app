// src/modules/auth/auth.service.ts

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import {
  RegisterDto,
  VerifyOtpDto,
  LoginDto,
  ForgotPasswordDto,
  VerifyResetOtpDto,
  ResetPasswordDto,
  RegisterProfessionalDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  // ============================================
  // USER REGISTRATION FLOW
  // ============================================

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP (upsert in case user re-registers)
    await this.prisma.oTP.upsert({
      where: { email: dto.email },
      create: {
        email: dto.email,
        otp,
        expiry: otpExpiry,
        userData: {
          name: dto.name,
          email: dto.email,
          password: dto.password, // Will be hashed after OTP verification
        },
      },
      update: {
        otp,
        expiry: otpExpiry,
        attempts: 0,
        userData: {
          name: dto.name,
          email: dto.email,
          password: dto.password,
        },
      },
    });

    // Send OTP email
    await this.emailService.sendEmail(
      dto.email,
      '🔑 Your Soro Verification Code',
      this.emailService.otpTemplate(dto.name, otp),
    );

    return {
      message: 'OTP sent to your email',
      nextStep: 'verify-otp',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    // Find OTP record
    const otpRecord = await this.prisma.oTP.findUnique({
      where: { email: dto.email },
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP expired or invalid. Please request a new one.');
    }

    // Check OTP match
    if (otpRecord.otp !== dto.otp) {
      // Increment attempts
      await this.prisma.oTP.update({
        where: { email: dto.email },
        data: { attempts: { increment: 1 } },
      });

      // Check if too many attempts
      if (otpRecord.attempts >= 2) {
        // >= 2 because we already incremented
        await this.prisma.oTP.delete({ where: { email: dto.email } });
        throw new BadRequestException('Too many failed attempts. Please request a new OTP.');
      }

      throw new BadRequestException('Invalid OTP');
    }

    // Check if expired
    if (new Date() > otpRecord.expiry) {
      await this.prisma.oTP.delete({ where: { email: dto.email } });
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    // Extract user data from OTP record
    const userData = otpRecord.userData as any;

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Generate username
    const username = this.generateUsername(userData.name);

    // Create user with consent timestamp
    const user = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        username,
        verifyEmail: true,
        consentGivenAt: new Date(),
      },
    });

    // Delete OTP record
    await this.prisma.oTP.delete({ where: { email: dto.email } });

    // Send welcome email
    await this.emailService.sendEmail(
      user.email,
      '🎉 Welcome to Soro!',
      this.emailService.welcomeTemplate(user.name),
    );

    return {
      message: 'Account created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    };
  }

  async resendOtp(email: string) {
    const otpRecord = await this.prisma.oTP.findUnique({
      where: { email },
    });

    if (!otpRecord) {
      throw new NotFoundException('No pending registration found for this email');
    }

    // Generate new OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update OTP
    await this.prisma.oTP.update({
      where: { email },
      data: {
        otp: newOtp,
        expiry: otpExpiry,
        attempts: 0,
      },
    });

    const userData = otpRecord.userData as any;

    // Send new OTP
    await this.emailService.sendEmail(
      email,
      '🔑 Your New Soro Verification Code',
      this.emailService.otpTemplate(userData.name, newOtp),
    );

    return { message: 'New OTP sent to your email' };
  }

  // ============================================
  // LOGIN
  // ============================================

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check status
    if (user.status !== 'Active') {
      throw new UnauthorizedException('Account is not active. Contact admin.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.role);

    // Update last login and refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginDate: new Date(),
        refreshToken: tokens.refreshToken,
      },
    });

    return {
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
        },
        ...tokens,
      },
    };
  }

  // ============================================
  // PASSWORD RESET FLOW
  // ============================================

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success (security best practice)
    if (!user) {
      return {
        message: "If this email exists, we've sent a password reset link",
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP in user document
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        forgotPasswordOtp: otp,
        forgotPasswordExpiry: otpExpiry,
      },
    });

    // Send email
    await this.emailService.sendEmail(
      user.email,
      '🔑 Your Soro Password Reset Code',
      this.emailService.passwordResetTemplate(user.name, otp),
    );

    return { message: 'Password reset OTP sent to your email' };
  }

  async verifyResetOtp(dto: VerifyResetOtpDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        forgotPasswordOtp: dto.otp,
        forgotPasswordExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Generate temporary token (15 min expiry)
    const tempToken = this.jwtService.sign(
      { userId: user.id, purpose: 'password_reset' },
      { expiresIn: '15m' },
    );

    // Clear OTP
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        forgotPasswordOtp: null,
        forgotPasswordExpiry: null,
      },
    });

    return {
      message: 'OTP verified successfully',
      tempToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Verify temp token
    let decoded: any;
    try {
      decoded = this.jwtService.verify(dto.tempToken);
      if (decoded.purpose !== 'password_reset') {
        throw new Error('Invalid token purpose');
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Check password match
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    // Update password
    const user = await this.prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    // Send confirmation email
    await this.emailService.sendEmail(
      user.email,
      '✅ Your Soro Password Has Been Reset',
      this.emailService.passwordResetConfirmationTemplate(user.name),
    );

    return { message: 'Password updated successfully' };
  }

  // ============================================
  // PROFESSIONAL REGISTRATION
  // ============================================

  async registerProfessional(dto: RegisterProfessionalDto) {
    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check pre-authorization
    const preAuth = await this.prisma.preAuthorization.findUnique({
      where: { email: dto.email },
    });

    if (!preAuth) {
      throw new UnauthorizedException('Get authorization from an admin first');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Generate username
    const username = this.generateUsername(dto.name);

    // Create professional user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        username,
        role: 'PROFESSIONAL',
        isPeerCounselor: dto.isPeerCounselor || false,
        specialization: dto.specialization,
        qualifications: dto.qualifications || [],
        bio: dto.bio,
        yearsOfExperience: dto.yearsOfExperience,
        consentGivenAt: new Date(),
        verifyEmail: true,
      },
    });

    // Send welcome email
    await this.emailService.sendEmail(
      user.email,
      '🎉 Welcome to Soro as a Professional!',
      this.emailService.professionalWelcomeTemplate({
        name: user.name,
        isPeerCounselor: user.isPeerCounselor,
        counselorId: user.counselorId,
      }),
    );

    return {
      message: 'Professional registered successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        counselorId: user.counselorId,
      },
    };
  }

  // ============================================
  // TOKEN REFRESH
  // ============================================

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        { userId: user.id, role: user.role },
        { expiresIn: '15m' },
      );

      return {
        message: 'Token refreshed successfully',
        accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private async generateTokens(userId: string, role: string) {
    const accessToken = this.jwtService.sign({ userId, role }, { expiresIn: '15m' });

    const refreshToken = this.jwtService.sign(
      { userId, role },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  private generateUsername(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 10);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${base}${random}`;
  }
}
