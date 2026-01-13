// src/modules/psn/psn.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
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

@Injectable()
export class PSNService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // ============================================
  // APPLICATION MANAGEMENT
  // ============================================

  async createApplication(userId: string, dto: CreatePSNApplicationDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has an application
    const existingApplication = await this.prisma.pSNApplication.findFirst({
      where: { userId },
    });

    if (existingApplication) {
      throw new ConflictException('You have already submitted an application');
    }

    // Create application
    const application = await this.prisma.pSNApplication.create({
      data: {
        userId,
        motivation: dto.motivation,
        availability: dto.availability,
        experience: dto.experience,
        status: 'Pending',
        applicationDate: new Date(),
      },
    });

    // Send confirmation email
    await this.emailService.sendPSNApplicationReceived(user.email, user.name, application.id);

    return {
      message: 'Application submitted successfully',
      application,
    };
  }

  async getMyApplication(userId: string) {
    const application = await this.prisma.pSNApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!application) {
      return {
        hasApplication: false,
        application: null,
      };
    }

    return {
      hasApplication: true,
      application,
    };
  }

  async getAllApplications(adminId: string, filters?: any) {
    const { status, search, page = 1, limit = 20 } = filters || {};

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.pSNApplication.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true,
            },
          },
        } as any,
        orderBy: { applicationDate: 'desc' },
      }),
      this.prisma.pSNApplication.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async reviewApplication(adminId: string, applicationId: string, dto: ReviewApplicationDto) {
    const application = await this.prisma.pSNApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'Pending') {
      throw new BadRequestException('Application has already been reviewed');
    }

    // Update application
    const updatedApplication = await this.prisma.pSNApplication.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });

    // Send email notification
    if (dto.status === 'Accepted') {
      await this.emailService.sendPSNApplicationAccepted(
        application.user.email,
        application.user.name,
      );
    } else {
      await this.emailService.sendPSNApplicationRejected(
        application.user.email,
        application.user.name,
      );
    }

    return {
      message: `Application ${dto.status.toLowerCase()} successfully`,
      application: updatedApplication,
    };
  }

  async verifyPayment(userId: string, dto: PaymentVerificationDto) {
    const application = await this.prisma.pSNApplication.findUnique({
      where: { id: dto.applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    if (application.status !== 'Accepted') {
      throw new BadRequestException('Application must be accepted first');
    }

    // Here you would verify the payment with your payment provider
    // For now, we'll assume it's verified

    // Update user role to PROFESSIONAL (peer counselor)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isPeerCounselor: true,
        role: 'PROFESSIONAL',
      },
    });

    // Send confirmation email
    await this.emailService.sendPSNPaymentConfirmed(application.user.email, application.user.name);

    return {
      message: 'Payment verified successfully. You now have access to PSN Portal',
      portalAccess: true,
    };
  }

  // ============================================
  // MODULE MANAGEMENT (ADMIN)
  // ============================================

  async createModule(adminId: string, dto: CreateModuleDto) {
    // Check if module with same order exists
    const existingModule = await this.prisma.pSNModule.findFirst({
      where: { order: dto.order },
    });

    if (existingModule) {
      throw new ConflictException(`Module with order ${dto.order} already exists`);
    }

    const module = await this.prisma.pSNModule.create({
      data: {
        title: dto.title,
        description: dto.description,
        videoUrl: dto.videoUrl,
        content: dto.content,
        order: dto.order,
        weekNumber: dto.weekNumber,
        unlockDate: new Date(dto.unlockDate),
      },
    });

    return {
      message: 'Module created successfully',
      module,
    };
  }

  async updateModule(adminId: string, moduleId: string, dto: UpdateModuleDto) {
    const module = await this.prisma.pSNModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // If order is being updated, check for conflicts
    if (dto.order && dto.order !== module.order) {
      const existingModule = await this.prisma.pSNModule.findFirst({
        where: {
          order: dto.order,
          id: { not: moduleId },
        },
      });

      if (existingModule) {
        throw new ConflictException(`Module with order ${dto.order} already exists`);
      }
    }

    const updatedModule = await this.prisma.pSNModule.update({
      where: { id: moduleId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
        ...(dto.content && { content: dto.content }),
        ...(dto.order && { order: dto.order }),
        ...(dto.weekNumber && { weekNumber: dto.weekNumber }),
        ...(dto.unlockDate && { unlockDate: new Date(dto.unlockDate) }),
      },
    });

    return {
      message: 'Module updated successfully',
      module: updatedModule,
    };
  }

  async deleteModule(adminId: string, moduleId: string) {
    const module = await this.prisma.pSNModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Delete associated progress records
    await this.prisma.pSNProgress.deleteMany({
      where: { moduleId },
    });

    await this.prisma.pSNModule.delete({
      where: { id: moduleId },
    });

    return {
      message: 'Module deleted successfully',
    };
  }

  async getAllModules() {
    const modules = await this.prisma.pSNModule.findMany({
      orderBy: { order: 'asc' },
    });

    return {
      modules,
      totalModules: modules.length,
    };
  }

  async getModuleById(moduleId: string) {
    const module = await this.prisma.pSNModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return module;
  }

  // ============================================
  // FELLOW LEARNING & PROGRESS
  // ============================================

  async getAvailableModules(userId: string) {
    // Check if user is a peer counselor
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isPeerCounselor) {
      throw new ForbiddenException('Access denied. Not a PSN fellow');
    }

    const now = new Date();

    // Get all modules
    const modules = await this.prisma.pSNModule.findMany({
      orderBy: { order: 'asc' },
    });

    // Get user's progress
    const progressRecords = await this.prisma.pSNProgress.findMany({
      where: { userId },
    });

    const progressMap = new Map(progressRecords.map((p) => [p.moduleId, p]));

    // Determine which modules are unlocked
    const enrichedModules = modules.map((module, index) => {
      const progress = progressMap.get(module.id);
      const isUnlocked = module.unlockDate <= now;

      // Check if previous module is completed (if not first module)
      const prevModuleCompleted =
        index === 0 || progressMap.get(modules[index - 1].id)?.completed || false;

      return {
        ...module,
        isUnlocked: isUnlocked && prevModuleCompleted,
        progress: progress || null,
        isCompleted: progress?.completed || false,
        videoWatched: progress?.videoWatched || false,
        assessmentsCompleted: !!(progress?.preAssessment && progress?.postAssessment),
      };
    });

    // Calculate overall progress
    const totalModules = modules.length;
    const completedModules = enrichedModules.filter((m) => m.isCompleted).length;
    const progressPercentage = Math.round((completedModules / totalModules) * 100);

    return {
      modules: enrichedModules,
      stats: {
        totalModules,
        completedModules,
        progressPercentage,
        currentStreak: this.calculateStreak(progressRecords),
      },
    };
  }

  async getModuleDetails(userId: string, moduleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isPeerCounselor) {
      throw new ForbiddenException('Access denied');
    }

    const module = await this.prisma.pSNModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check if module is unlocked
    const now = new Date();
    if (module.unlockDate > now) {
      throw new ForbiddenException('Module is not yet unlocked');
    }

    // Get or create progress record
    let progress = await this.prisma.pSNProgress.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
    });

    if (!progress) {
      progress = await this.prisma.pSNProgress.create({
        data: {
          userId,
          moduleId,
        },
      });
    }

    return {
      module,
      progress,
    };
  }

  async markVideoWatched(userId: string, dto: MarkVideoWatchedDto) {
    const { moduleId } = dto;

    const module = await this.prisma.pSNModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const progress = await this.prisma.pSNProgress.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      update: {
        videoWatched: true,
      },
      create: {
        userId,
        moduleId,
        videoWatched: true,
      },
    });

    return {
      message: 'Video marked as watched',
      progress,
    };
  }

  async submitAssessment(userId: string, moduleId: string, dto: SubmitAssessmentDto) {
    const module = await this.prisma.pSNModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Calculate MCQ score (if provided)
    let mcqScore = 0;
    if (dto.mcqAnswers && dto.mcqAnswers.length > 0) {
      // Here you would validate against correct answers
      // For now, we'll just store them
      mcqScore = 0; // Placeholder
    }

    const assessmentData = {
      mcqAnswers: dto.mcqAnswers || [],
      essayAnswers: dto.essayAnswers || [],
      mcqScore,
      submittedAt: new Date(),
    };

    const updateData = dto.isPreAssessment
      ? { preAssessment: assessmentData }
      : { postAssessment: assessmentData };

    const progress = await this.prisma.pSNProgress.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      update: updateData as any,
      create: {
        userId,
        moduleId,
        ...updateData,
      } as any,
    });

    // Check if module is now complete
    const isComplete = progress.videoWatched && progress.preAssessment && progress.postAssessment;

    if (isComplete && !progress.completed) {
      await this.prisma.pSNProgress.update({
        where: { id: progress.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    return {
      message: `${dto.isPreAssessment ? 'Pre-assessment' : 'Post-assessment'} submitted successfully`,
      progress,
      moduleCompleted: isComplete,
    };
  }

  async getMyProgress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isPeerCounselor) {
      throw new ForbiddenException('Access denied');
    }

    const [modules, progressRecords] = await Promise.all([
      this.prisma.pSNModule.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.pSNProgress.findMany({
        where: { userId },
        include: {
          module: true,
        },
      }),
    ]);

    const totalModules = modules.length;
    const completedModules = progressRecords.filter((p) => p.completed).length;
    const progressPercentage = Math.round((completedModules / totalModules) * 100);

    return {
      totalModules,
      completedModules,
      progressPercentage,
      currentStreak: this.calculateStreak(progressRecords),
      modules: progressRecords,
      eligibleForCertificate: completedModules === totalModules,
    };
  }

  // ============================================
  // ADMIN ANALYTICS
  // ============================================

  async getFellowsProgress(adminId: string, query?: GetProgressQueryDto) {
    const { userId, cohort } = query || {};

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    const progressRecords = await this.prisma.pSNProgress.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        module: true,
      },
    });

    // Group by user
    const fellowsMap = new Map();

    progressRecords.forEach((record) => {
      if (!fellowsMap.has(record.userId)) {
        fellowsMap.set(record.userId, {
          user: record.user,
          progress: [],
          completed: 0,
          total: 0,
        });
      }

      const fellow = fellowsMap.get(record.userId);
      fellow.progress.push(record);
      fellow.total++;
      if (record.completed) {
        fellow.completed++;
      }
    });

    const fellows = Array.from(fellowsMap.values()).map((fellow) => ({
      ...fellow,
      progressPercentage: Math.round((fellow.completed / fellow.total) * 100),
    }));

    return {
      fellows,
      totalFellows: fellows.length,
      averageProgress:
        fellows.reduce((acc, f) => acc + f.progressPercentage, 0) / (fellows.length || 1),
    };
  }

  async getModuleAnalytics(adminId: string) {
    const modules = await this.prisma.pSNModule.findMany({
      orderBy: { order: 'asc' },
    });

    const analytics = await Promise.all(
      modules.map(async (module) => {
        const [totalStarted, totalCompleted, progressRecords] = await Promise.all([
          this.prisma.pSNProgress.count({
            where: { moduleId: module.id },
          }),
          this.prisma.pSNProgress.count({
            where: {
              moduleId: module.id,
              completed: true,
            },
          }),
          this.prisma.pSNProgress.findMany({
            where: { moduleId: module.id },
          }),
        ]);

        const videosWatched = progressRecords.filter((p) => p.videoWatched).length;
        const preAssessmentsCompleted = progressRecords.filter((p) => p.preAssessment).length;
        const postAssessmentsCompleted = progressRecords.filter((p) => p.postAssessment).length;

        return {
          module,
          stats: {
            totalStarted,
            totalCompleted,
            videosWatched,
            preAssessmentsCompleted,
            postAssessmentsCompleted,
            completionRate:
              totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0,
          },
        };
      }),
    );

    return {
      modules: analytics,
      overallStats: {
        totalModules: modules.length,
        averageCompletionRate:
          analytics.reduce((acc, m) => acc + m.stats.completionRate, 0) / (analytics.length || 1),
      },
    };
  }

  // ============================================
  // CERTIFICATE GENERATION
  // ============================================

  async generateCertificate(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isPeerCounselor) {
      throw new ForbiddenException('Access denied');
    }

    // Check if all modules are completed
    const [totalModules, completedModules] = await Promise.all([
      this.prisma.pSNModule.count(),
      this.prisma.pSNProgress.count({
        where: {
          userId,
          completed: true,
        },
      }),
    ]);

    if (completedModules < totalModules) {
      throw new BadRequestException('All modules must be completed to generate certificate');
    }

    // Here you would generate the actual certificate
    // For now, we'll return a placeholder

    const certificateData = {
      userId,
      userName: user.name,
      completionDate: new Date(),
      certificateId: `PSN-CERT-${Date.now()}`,
      programName: 'Peer Support Network Training Program',
      issuer: 'SORO Mental Health Platform',
    };

    // Send certificate via email
    await this.emailService.sendPSNCertificate(user.email, user.name, certificateData);

    return {
      message: 'Certificate generated successfully',
      certificate: certificateData,
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private calculateStreak(progressRecords: any[]): number {
    if (progressRecords.length === 0) return 0;

    // Sort by completion date
    const sorted = progressRecords
      .filter((p) => p.completedAt)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    if (sorted.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = new Date(sorted[i].completedAt);
      const next = new Date(sorted[i + 1].completedAt);

      current.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
