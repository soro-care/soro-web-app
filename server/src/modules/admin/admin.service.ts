// src/modules/admin/admin.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GetUsersQueryDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  GetDashboardStatsDto,
  GetBookingsQueryDto,
  UpdateBookingStatusDto,
} from './dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // DASHBOARD OVERVIEW
  // ============================================

  async getDashboardStats(adminId: string, query?: GetDashboardStatsDto) {
    const { startDate, endDate } = query || {};

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // User statistics
    const [totalUsers, activeUsers, newUsersThisMonth, totalProfessionals, totalPeerCounselors] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { status: 'Active' } }),
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        this.prisma.user.count({ where: { role: 'PROFESSIONAL' } }),
        this.prisma.user.count({ where: { isPeerCounselor: true } }),
      ]);

    // Booking statistics
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      this.prisma.booking.count(
        startDate || endDate ? { where: { createdAt: dateFilter } } : undefined,
      ),
      this.prisma.booking.count({ where: { status: 'Pending' } }),
      this.prisma.booking.count({ where: { status: 'Confirmed' } }),
      this.prisma.booking.count({ where: { status: 'Completed' } }),
      this.prisma.booking.count({ where: { status: 'Cancelled' } }),
    ]);

    // PSN statistics
    const [totalPSNApplications, pendingApplications, acceptedApplications, totalPSNFellows] =
      await Promise.all([
        this.prisma.pSNApplication.count(),
        this.prisma.pSNApplication.count({ where: { status: 'Pending' } }),
        this.prisma.pSNApplication.count({ where: { status: 'Accepted' } }),
        this.prisma.user.count({ where: { isPeerCounselor: true } }),
      ]);

    // Blog statistics
    const [totalBlogPosts, publishedPosts, totalBlogViews] = await Promise.all([
      this.prisma.blogPost.count(),
      this.prisma.blogPost.count({ where: { published: true } }),
      this.prisma.blogPost.aggregate({
        _sum: { views: true },
      }),
    ]);

    // Echo statistics
    const [totalEchoes, moderatedEchoes, crisisEchoes, flaggedEchoes] = await Promise.all([
      this.prisma.echo.count(),
      this.prisma.echo.count({ where: { moderated: true } }),
      this.prisma.echo.count({ where: { crisisFlag: true } }),
      this.prisma.echo.count({
        where: {
          OR: [{ moderated: false }, { reportCount: { gte: 1 } }],
        },
      }),
    ]);

    // Survey statistics
    const [totalSurveys, surveysWithDiagnosis] = await Promise.all([
      this.prisma.survey.count(),
      this.prisma.survey.count({ where: { diagnosed: 'Yes' } }),
    ]);

    // Recent activity
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const recentBookings = await this.prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        date: true,
        status: true,
        modality: true,
        createdAt: true,
      },
    });

    // Growth trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const userGrowth = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = await this.prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          },
        });
        return {
          date: date.toISOString().split('T')[0],
          count,
        };
      }),
    );

    const bookingGrowth = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = await this.prisma.booking.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          },
        });
        return {
          date: date.toISOString().split('T')[0],
          count,
        };
      }),
    );

    return {
      overview: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          professionals: totalProfessionals,
          peerCounselors: totalPeerCounselors,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          completionRate:
            totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0,
        },
        psn: {
          totalApplications: totalPSNApplications,
          pending: pendingApplications,
          accepted: acceptedApplications,
          totalFellows: totalPSNFellows,
        },
        blog: {
          totalPosts: totalBlogPosts,
          published: publishedPosts,
          totalViews: totalBlogViews._sum.views || 0,
        },
        echo: {
          total: totalEchoes,
          moderated: moderatedEchoes,
          crisis: crisisEchoes,
          flagged: flaggedEchoes,
        },
        survey: {
          total: totalSurveys,
          withDiagnosis: surveysWithDiagnosis,
          diagnosisRate:
            totalSurveys > 0 ? ((surveysWithDiagnosis / totalSurveys) * 100).toFixed(1) : 0,
        },
      },
      recentActivity: {
        users: recentUsers,
        bookings: recentBookings,
      },
      trends: {
        userGrowth,
        bookingGrowth,
      },
    };
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  async getAllUsers(adminId: string, query: GetUsersQueryDto) {
    const {
      role,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = query;

    const where: any = {};

    if (role) where.role = role;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          pseudonymousId: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          role: true,
          status: true,
          isPeerCounselor: true,
          verifyEmail: true,
          lastLoginDate: true,
          createdAt: true,
          _count: {
            select: {
              bookingsAsUser: true,
              bookingsAsPro: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        survey: true,
        bookingsAsUser: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        bookingsAsPro: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        availability: true,
        blogPosts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            bookingsAsUser: true,
            bookingsAsPro: true,
            blogPosts: true,
            blogComments: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserStatus(adminId: string, userId: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent admin from suspending themselves
    if (userId === adminId && dto.status === 'Suspended') {
      throw new BadRequestException('Cannot suspend your own account');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: dto.status as any },
    });

    return {
      message: 'User status updated successfully',
      user: updatedUser,
    };
  }

  async updateUserRole(adminId: string, userId: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent admin from changing their own role
    if (userId === adminId) {
      throw new BadRequestException('Cannot change your own role');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role as any },
    });

    return {
      message: 'User role updated successfully',
      user: updatedUser,
    };
  }

  async deleteUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent admin from deleting themselves
    if (userId === adminId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    // Check if user has active bookings
    const activeBookings = await this.prisma.booking.count({
      where: {
        OR: [
          { userPseudonymousId: user.pseudonymousId },
          { counselorPseudonymousId: user.pseudonymousId },
        ],
        status: { in: ['Pending', 'Confirmed'] },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException(
        'Cannot delete user with active bookings. Cancel or complete bookings first.',
      );
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'User deleted successfully',
    };
  }

  // ============================================
  // BOOKING MANAGEMENT
  // ============================================

  async getAllBookings(adminId: string, query: GetBookingsQueryDto) {
    const { status, userId, professionalId, page = 1, limit = 20, startDate, endDate } = query;

    const where: any = {};

    if (status) where.status = status;
    if (userId) where.userPseudonymousId = userId;
    if (professionalId) where.counselorPseudonymousId = professionalId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              pseudonymousId: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
              pseudonymousId: true,
              isPeerCounselor: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateBookingStatus(adminId: string, bookingId: string, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: dto.status as any,
        ...(dto.cancellationReason && {
          cancellationReason: dto.cancellationReason,
        }),
      },
    });

    return {
      message: 'Booking status updated successfully',
      booking: updatedBooking,
    };
  }

  // ============================================
  // SYSTEM ANALYTICS
  // ============================================

  async getSystemAnalytics(adminId: string) {
    // Platform health metrics
    const [totalApiCalls, errorRate, averageResponseTime] = await Promise.all([
      // These would come from your monitoring service
      // For now, returning placeholder values
      Promise.resolve(125000),
      Promise.resolve(0.02), // 2% error rate
      Promise.resolve(145), // 145ms average
    ]);

    // Database statistics
    const dbStats = {
      totalRecords: await this.getTotalRecords(),
      storageUsed: '2.4 GB', // Would come from DB metrics
      activeConnections: 12, // Would come from DB metrics
    };

    // User engagement metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [activeUsersLast30Days, bookingsLast30Days, echoesLast30Days] = await Promise.all([
      this.prisma.user.count({
        where: {
          lastLoginDate: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.booking.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.echo.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return {
      platformHealth: {
        totalApiCalls,
        errorRate: `${(errorRate * 100).toFixed(2)}%`,
        averageResponseTime: `${averageResponseTime}ms`,
        uptime: '99.9%',
      },
      database: dbStats,
      engagement: {
        activeUsersLast30Days,
        bookingsLast30Days,
        echoesLast30Days,
        averageSessionDuration: '12 minutes', // Would come from analytics
      },
    };
  }

  private async getTotalRecords() {
    const [users, bookings, echoes, blogs, surveys] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.booking.count(),
      this.prisma.echo.count(),
      this.prisma.blogPost.count(),
      this.prisma.survey.count(),
    ]);

    return users + bookings + echoes + blogs + surveys;
  }

  // ============================================
  // CONTENT MODERATION
  // ============================================

  async getContentModerationQueue(adminId: string) {
    const [flaggedEchoes, pendingComments, reportedContent] = await Promise.all([
      this.prisma.echo.findMany({
        where: {
          OR: [{ moderated: false }, { reportCount: { gte: 1 } }],
        },
        orderBy: [{ reportCount: 'desc' }, { createdAt: 'desc' }],
        take: 20,
      }),
      this.prisma.blogComment.findMany({
        where: { approved: false },
        take: 20,
        include: {
          postRel: {
            select: { title: true },
          },
          authorRel: {
            select: { name: true, email: true },
          },
        },
      }),
      this.prisma.echo.count({
        where: { reportCount: { gte: 1 } },
      }),
    ]);

    return {
      flaggedEchoes: {
        items: flaggedEchoes,
        count: flaggedEchoes.length,
      },
      pendingComments: {
        items: pendingComments,
        count: pendingComments.length,
      },
      totalReported: reportedContent,
    };
  }
}
