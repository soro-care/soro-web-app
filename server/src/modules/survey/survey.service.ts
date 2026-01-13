// src/modules/survey/survey.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSurveyDto, UpdateSurveyDto, GetSurveyAnalyticsDto } from './dto';

@Injectable()
export class SurveyService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // SURVEY SUBMISSION
  // ============================================

  async createSurvey(userId: string, dto: CreateSurveyDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has a survey
    const existingSurvey = await this.prisma.survey.findUnique({
      where: { user: userId },
    });

    if (existingSurvey) {
      throw new ConflictException('You have already submitted a survey. Use update instead.');
    }

    // Validate diagnosis details
    if (dto.diagnosed === 'Yes' && !dto.diagnosisDetails) {
      throw new BadRequestException('Diagnosis details are required when diagnosed is Yes');
    }

    // Create survey
    const survey = await this.prisma.survey.create({
      data: {
        user: userId,
        ageRange: dto.ageRange,
        gender: dto.gender,
        concerns: dto.concerns,
        otherConcern: dto.otherConcern,
        diagnosed: dto.diagnosed as any,
        diagnosisDetails: dto.diagnosisDetails,
      },
    });

    return {
      message: 'Survey submitted successfully',
      survey,
      recommendations: this.generateRecommendations(dto),
    };
  }

  async updateSurvey(userId: string, dto: UpdateSurveyDto) {
    const survey = await this.prisma.survey.findUnique({
      where: { user: userId },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found. Please submit a survey first.');
    }

    // Validate diagnosis details
    if (dto.diagnosed === 'Yes' && !dto.diagnosisDetails) {
      throw new BadRequestException('Diagnosis details are required when diagnosed is Yes');
    }

    const updatedSurvey = await this.prisma.survey.update({
      where: { user: userId },
      data: {
        ...(dto.ageRange && { ageRange: dto.ageRange }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.concerns && { concerns: dto.concerns }),
        ...(dto.otherConcern !== undefined && {
          otherConcern: dto.otherConcern,
        }),
        ...(dto.diagnosed && { diagnosed: dto.diagnosed as any }),
        ...(dto.diagnosisDetails !== undefined && {
          diagnosisDetails: dto.diagnosisDetails,
        }),
      },
    });

    return {
      message: 'Survey updated successfully',
      survey: updatedSurvey,
    };
  }

  async getMySurvey(userId: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { user: userId },
      include: {
        userRel: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!survey) {
      return {
        hasSurvey: false,
        survey: null,
      };
    }

    return {
      hasSurvey: true,
      survey,
    };
  }

  async getSurveyStatus(userId: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { user: userId },
    });

    return {
      completed: !!survey,
      submittedAt: survey?.createdAt || null,
    };
  }

  // ============================================
  // RECOMMENDATIONS ENGINE
  // ============================================

  private generateRecommendations(dto: CreateSurveyDto) {
    const recommendations: any = {
      professionals: [],
      resources: [],
      selfCare: [],
      urgency: 'low',
    };

    // Check for high-priority concerns
    const highPriorityConcerns = [
      'Suicidal thoughts',
      'Self-harm',
      'Severe depression',
      'Panic attacks',
    ];

    const hasHighPriority = dto.concerns.some((concern) =>
      highPriorityConcerns.some((priority) =>
        concern.toLowerCase().includes(priority.toLowerCase()),
      ),
    );

    if (hasHighPriority || dto.diagnosed === 'Yes') {
      recommendations.urgency = 'high';
      recommendations.professionals.push('Clinical Psychologist', 'Psychiatrist');
    } else {
      recommendations.urgency = 'medium';
      recommendations.professionals.push('Peer Counselor', 'Therapist');
    }

    // Resource recommendations based on concerns
    dto.concerns.forEach((concern) => {
      const lowerConcern = concern.toLowerCase();

      if (lowerConcern.includes('anxiety')) {
        recommendations.resources.push('Anxiety Management Toolkit', 'Breathing Exercises Guide');
        recommendations.selfCare.push(
          'Practice mindfulness meditation',
          'Try progressive muscle relaxation',
        );
      }

      if (lowerConcern.includes('depression')) {
        recommendations.resources.push('Understanding Depression Guide', 'Mood Tracking Journal');
        recommendations.selfCare.push('Establish a daily routine', 'Engage in physical activity');
      }

      if (lowerConcern.includes('stress')) {
        recommendations.resources.push('Stress Management Workshop');
        recommendations.selfCare.push('Set healthy boundaries', 'Practice time management');
      }

      if (lowerConcern.includes('relationship')) {
        recommendations.resources.push('Healthy Relationships Guide');
        recommendations.selfCare.push('Communicate openly', 'Seek couples counseling if needed');
      }
    });

    return recommendations;
  }

  // ============================================
  // ADMIN ANALYTICS
  // ============================================

  async getSurveyAnalytics(adminId: string, query?: GetSurveyAnalyticsDto) {
    const { ageRange, gender, concern, startDate, endDate } = query || {};

    const where: any = {};

    if (ageRange) {
      where.ageRange = ageRange;
    }

    if (gender) {
      where.gender = gender;
    }

    if (concern) {
      where.concerns = {
        has: concern,
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [surveys, totalCount] = await Promise.all([
      this.prisma.survey.findMany({
        where,
        include: {
          userRel: {
            select: {
              id: true,
              pseudonymousId: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.survey.count({ where }),
    ]);

    // Age range distribution
    const ageRangeDistribution = await this.prisma.survey.groupBy({
      by: ['ageRange'],
      where,
      _count: true,
    });

    // Gender distribution
    const genderDistribution = await this.prisma.survey.groupBy({
      by: ['gender'],
      where,
      _count: true,
    });

    // Diagnosis distribution
    const diagnosisDistribution = await this.prisma.survey.groupBy({
      by: ['diagnosed'],
      where,
      _count: true,
    });

    // Concerns analysis
    const concernsMap = new Map<string, number>();
    surveys.forEach((survey) => {
      survey.concerns.forEach((concern) => {
        concernsMap.set(concern, (concernsMap.get(concern) || 0) + 1);
      });
    });

    const topConcerns = Array.from(concernsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([concern, count]) => ({ concern, count }));

    // Calculate trends over time
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSurveys = await this.prisma.survey.count({
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    return {
      overview: {
        totalSurveys: totalCount,
        surveysLast30Days: recentSurveys,
        completionRate: totalCount > 0 ? 100 : 0,
      },
      demographics: {
        ageRange: ageRangeDistribution.map((item) => ({
          range: item.ageRange,
          count: item._count,
          percentage: ((item._count / totalCount) * 100).toFixed(1),
        })),
        gender: genderDistribution.map((item) => ({
          gender: item.gender,
          count: item._count,
          percentage: ((item._count / totalCount) * 100).toFixed(1),
        })),
      },
      mentalHealth: {
        diagnosed: diagnosisDistribution.map((item) => ({
          status: item.diagnosed,
          count: item._count,
          percentage: ((item._count / totalCount) * 100).toFixed(1),
        })),
        topConcerns,
      },
      surveys: surveys.map((s) => ({
        id: s.id,
        userPseudonymousId: s.userRel.pseudonymousId,
        ageRange: s.ageRange,
        gender: s.gender,
        concerns: s.concerns,
        diagnosed: s.diagnosed,
        submittedAt: s.createdAt,
      })),
    };
  }

  async getAllSurveys(adminId: string) {
    const surveys = await this.prisma.survey.findMany({
      include: {
        userRel: {
          select: {
            id: true,
            pseudonymousId: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      surveys,
      total: surveys.length,
    };
  }

  async deleteSurvey(adminId: string, surveyId: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    await this.prisma.survey.delete({
      where: { id: surveyId },
    });

    return {
      message: 'Survey deleted successfully',
    };
  }
}
