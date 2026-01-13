// src/modules/users/users.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { EmailService } from '../email/email.service';
import { UpdateUserDto, UpdateUsernameDto, GetUsersQueryDto, ContactFormDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private emailService: EmailService,
  ) {}

  // ============================================
  // GET USER DETAILS
  // ============================================

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userId: true,
        pseudonymousId: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        mobile: true,
        role: true,
        status: true,
        isPeerCounselor: true,
        counselorId: true,
        specialization: true,
        qualifications: true,
        bio: true,
        yearsOfExperience: true,
        verifyEmail: true,
        lastLoginDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ============================================
  // UPDATE USER
  // ============================================

  async updateUser(userId: string, dto: UpdateUserDto) {
    // If username is being updated, check availability
    if (dto.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    // If email is being updated, check availability
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException('Email already registered');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        mobile: true,
        bio: true,
        specialization: true,
        qualifications: true,
        yearsOfExperience: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  // ============================================
  // UPDATE USERNAME
  // ============================================

  async updateUsername(userId: string, dto: UpdateUsernameDto) {
    // Check if username is taken
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Username already taken');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return {
      message: 'Username updated successfully',
      data: updatedUser,
    };
  }

  // ============================================
  // UPLOAD AVATAR
  // ============================================

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Get current user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        const publicId = this.cloudinaryService.extractPublicId(user.avatar);
        await this.cloudinaryService.deleteImage(publicId);
      } catch (error) {
        // Continue even if deletion fails
        console.error('Failed to delete old avatar:', error);
      }
    }

    // Upload new avatar
    const uploadResult = await this.cloudinaryService.uploadImage(file, 'soro-avatars');

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: uploadResult.secure_url },
      select: {
        id: true,
        avatar: true,
      },
    });

    return {
      message: 'Avatar uploaded successfully',
      data: updatedUser,
    };
  }

  // ============================================
  // GET ALL PROFESSIONALS
  // ============================================

  async getAllProfessionals() {
    const professionals = await this.prisma.user.findMany({
      where: {
        role: 'PROFESSIONAL',
        status: 'Active',
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isPeerCounselor: true,
        counselorId: true,
        specialization: true,
        bio: true,
        yearsOfExperience: true,
        qualifications: true,
      },
    });

    // Anonymize peer counselors
    const anonymizedProfessionals = professionals.map((pro) => {
      if (pro.isPeerCounselor) {
        return {
          id: pro.id,
          counselorId: pro.counselorId,
          avatar: pro.avatar || '',
          isPeerCounselor: true,
          specialization: 'Peer Counselor',
          yearsOfExperience: pro.yearsOfExperience,
        };
      }
      return pro;
    });

    return {
      message: 'Professionals retrieved successfully',
      data: anonymizedProfessionals,
    };
  }

  // ============================================
  // GET ALL USERS (ADMIN)
  // ============================================

  async getAllUsers(query: GetUsersQueryDto) {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (role && role !== 'all') {
      where.role = role;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { userId: { contains: search, mode: 'insensitive' } },
        { counselorId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users and count
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          role: true,
          status: true,
          isPeerCounselor: true,
          counselorId: true,
          specialization: true,
          lastLoginDate: true,
          createdAt: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // FOLLOW/UNFOLLOW USER (Future Feature)
  // ============================================

  async followUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException("You can't follow yourself");
    }

    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Implement follow logic here when you add followers/following fields to schema

    return {
      message: 'User followed successfully',
    };
  }

  // ============================================
  // CONTACT FORM
  // ============================================

  async submitContactForm(dto: ContactFormDto, userId?: string) {
    let name = dto.name;
    let email = dto.email;

    // If authenticated user, get their info
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      if (user) {
        name = user.name;
        email = user.email;
      }
    }

    // Validate required fields for non-authenticated users
    if (!userId && (!name || !email)) {
      throw new BadRequestException('Name and email are required');
    }

    // Email to support team
    const supportEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/><title>New Contact Form Submission</title></head>
      <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#30459D;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
                alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
              <h1 style="color:#FFF;font-size:24px;margin:0;">New Contact Form Submission</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
              <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Contact Details</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>User Type:</strong> ${userId ? 'Authenticated User' : 'Guest User'}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
                <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Message</h2>
                <p style="margin:0;">${dto.message.replace(/\n/g, '<br>')}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
              © ${new Date().getFullYear()} Soro Care. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email to support
    await this.emailService.sendEmail(
      'hello@soro.care',
      `New Contact Form Submission from ${name}`,
      supportEmailHtml,
    );

    return {
      message: 'Your message has been sent successfully',
    };
  }
}
