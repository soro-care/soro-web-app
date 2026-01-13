// src/modules/echo/echo.service.ts - FINAL FIXED VERSION

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrisisDetectionService } from './services/crisis-detection.service';
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

@Injectable()
export class EchoService {
  constructor(
    private prisma: PrismaService,
    private crisisDetection: CrisisDetectionService,
  ) {}

  async createEcho(dto: CreateEchoDto, ipAddress?: string, userAgent?: string) {
    const crisisAnalysis = this.crisisDetection.analyzeCrisis(dto.content);
    const sentiment = this.crisisDetection.detectSentiment(dto.content);
    const emotionTags = this.crisisDetection.extractEmotionTags(dto.content);
    const wordCount = dto.content.trim().split(/\s+/).length;

    const echo = await this.prisma.echo.create({
      data: {
        content: dto.content,
        authorName: dto.authorName,
        room: dto.room as any,
        sentiment: sentiment as any,
        wordCount,
        moderated: !crisisAnalysis.isCrisis,
        crisisFlag: crisisAnalysis.isCrisis,
        emotionTags,
        likes: [],
        comments: [],
        shareLogs: [],
      },
    });

    await this.updateRoomStats(dto.room);

    if (crisisAnalysis.isCrisis) {
      return {
        message: 'Story shared. Crisis support resources provided.',
        echo,
        crisisDetected: true,
        severity: crisisAnalysis.severity,
        resources: this.crisisDetection.getCrisisResources(),
        supportMessage:
          "We're here for you. Please consider reaching out to a mental health professional or crisis hotline.",
      };
    }

    return {
      message: 'Story shared successfully',
      echo,
      crisisDetected: false,
    };
  }

  async getEchoesByRoom(room: string, query: GetEchoesQueryDto) {
    const {
      sentiment,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      moderated = true,
      crisisFlag,
    } = query;

    const where: any = {
      room: room as any,
      isArchived: false,
      moderated,
    };

    if (sentiment) where.sentiment = sentiment;
    if (crisisFlag !== undefined) where.crisisFlag = crisisFlag;
    if (search) {
      where.content = { contains: search, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [echoes, total] = await Promise.all([
      this.prisma.echo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.echo.count({ where }),
    ]);

    const parsedEchoes = echoes.map((echo) => ({
      ...echo,
      likes: this.parseJsonField(echo.likes),
      comments: this.parseJsonField(echo.comments),
      shareLogs: this.parseJsonField(echo.shareLogs),
      likeCount: this.parseJsonField(echo.likes).length,
      commentCount: this.parseJsonField(echo.comments).length,
      shareCount: echo.shareCount || 0,
    }));

    return {
      echoes: parsedEchoes,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getEchoById(storyId: string) {
    const echo = await this.prisma.echo.findUnique({
      where: { id: storyId },
    });

    if (!echo) throw new NotFoundException('Story not found');

    return {
      ...echo,
      likes: this.parseJsonField(echo.likes),
      comments: this.parseJsonField(echo.comments),
      shareLogs: this.parseJsonField(echo.shareLogs),
      likeCount: this.parseJsonField(echo.likes).length,
      commentCount: this.parseJsonField(echo.comments).length,
    };
  }

  async searchEchoes(query: GetEchoesQueryDto) {
    const { search, room, sentiment, page = 1, limit = 20, moderated = true } = query;

    const where: any = { isArchived: false, moderated };

    if (room) where.room = room as any;
    if (sentiment) where.sentiment = sentiment;
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { emotionTags: { has: search.toLowerCase() } },
      ];
    }

    const skip = (page - 1) * limit;

    const [echoes, total] = await Promise.all([
      this.prisma.echo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.echo.count({ where }),
    ]);

    const parsedEchoes = echoes.map((echo) => ({
      ...echo,
      likes: this.parseJsonField(echo.likes),
      comments: this.parseJsonField(echo.comments),
      shareLogs: this.parseJsonField(echo.shareLogs),
      likeCount: this.parseJsonField(echo.likes).length,
      commentCount: this.parseJsonField(echo.comments).length,
    }));

    return {
      echoes: parsedEchoes,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getRelatedStories(roomId: string, limit: number = 5) {
    const echoes = await this.prisma.echo.findMany({
      where: {
        room: roomId as any,
        isArchived: false,
        moderated: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      stories: echoes.map((echo) => ({
        ...echo,
        likeCount: this.parseJsonField(echo.likes).length,
        commentCount: this.parseJsonField(echo.comments).length,
      })),
    };
  }

  async likeEcho(dto: LikeEchoDto, ipAddress?: string, userAgent?: string) {
    const echo = await this.prisma.echo.findUnique({
      where: { id: dto.storyId },
    });

    if (!echo) throw new NotFoundException('Story not found');

    const likes = this.parseJsonField(echo.likes);
    const alreadyLiked = likes.some((like: any) => like.ipAddress === ipAddress);

    if (alreadyLiked) {
      const updatedLikes = likes.filter((like: any) => like.ipAddress !== ipAddress);
      await this.prisma.echo.update({
        where: { id: dto.storyId },
        data: { likes: updatedLikes },
      });
      return {
        message: 'Story unliked',
        liked: false,
        likeCount: updatedLikes.length,
      };
    } else {
      const newLike = {
        ipAddress,
        userAgent,
        likedAt: new Date(),
        authorName: 'Anonymous',
      };
      const updatedLikes = [...likes, newLike];
      await this.prisma.echo.update({
        where: { id: dto.storyId },
        data: { likes: updatedLikes },
      });
      return {
        message: 'Story liked',
        liked: true,
        likeCount: updatedLikes.length,
      };
    }
  }

  async addComment(dto: AddEchoCommentDto) {
    const echo = await this.prisma.echo.findUnique({
      where: { id: dto.storyId },
    });

    if (!echo) throw new NotFoundException('Story not found');

    const comments = this.parseJsonField(echo.comments);
    const newComment = {
      content: dto.content,
      username: dto.username,
      commenterId: `anon-${Date.now()}`,
      createdAt: new Date(),
    };

    const updatedComments = [...comments, newComment];
    await this.prisma.echo.update({
      where: { id: dto.storyId },
      data: { comments: updatedComments },
    });

    return {
      message: 'Comment added successfully',
      comment: newComment,
      commentCount: updatedComments.length,
    };
  }

  async getComments(storyId: string) {
    const echo = await this.prisma.echo.findUnique({
      where: { id: storyId },
    });

    if (!echo) throw new NotFoundException('Story not found');

    const comments = this.parseJsonField(echo.comments);
    return { comments, total: comments.length };
  }

  async trackShare(dto: ShareEchoDto) {
    const echo = await this.prisma.echo.findUnique({
      where: { id: dto.storyId },
    });

    if (!echo) throw new NotFoundException('Story not found');

    const shareLogs = this.parseJsonField(echo.shareLogs);
    const newShare = {
      platform: dto.platform,
      sharedAt: new Date(),
      authorName: 'Anonymous',
    };

    const updatedShareLogs = [...shareLogs, newShare];
    await this.prisma.echo.update({
      where: { id: dto.storyId },
      data: {
        shareLogs: updatedShareLogs,
        shareCount: { increment: 1 },
      },
    });

    return {
      message: 'Share tracked successfully',
      shareCount: echo.shareCount + 1,
    };
  }

  async reportEcho(dto: ReportEchoDto, ipAddress?: string) {
    const echo = await this.prisma.echo.findUnique({
      where: { id: dto.storyId },
    });

    if (!echo) throw new NotFoundException('Story not found');

    await this.prisma.echo.update({
      where: { id: dto.storyId },
      data: { reportCount: { increment: 1 } },
    });

    if (echo.reportCount + 1 >= 3) {
      await this.prisma.echo.update({
        where: { id: dto.storyId },
        data: { moderated: false },
      });
    }

    return {
      message: 'Story reported successfully. Thank you for keeping our community safe.',
    };
  }

  async moderateEcho(adminId: string, storyId: string, dto: ModerateEchoDto) {
    const echo = await this.prisma.echo.findUnique({
      where: { id: storyId },
    });

    if (!echo) throw new NotFoundException('Story not found');

    const updatedEcho = await this.prisma.echo.update({
      where: { id: storyId },
      data: {
        moderated: dto.moderated,
        ...(dto.isArchived !== undefined && { isArchived: dto.isArchived }),
      },
    });

    return {
      message: `Story ${dto.moderated ? 'approved' : 'flagged'} successfully`,
      echo: updatedEcho,
    };
  }

  async getFlaggedStories() {
    const echoes = await this.prisma.echo.findMany({
      where: {
        OR: [{ moderated: false }, { reportCount: { gte: 1 } }, { crisisFlag: true }],
      },
      orderBy: [{ reportCount: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      stories: echoes.map((echo) => ({
        ...echo,
        likes: this.parseJsonField(echo.likes),
        comments: this.parseJsonField(echo.comments),
        likeCount: this.parseJsonField(echo.likes).length,
        commentCount: this.parseJsonField(echo.comments).length,
      })),
      total: echoes.length,
    };
  }

  async getRoomsStats(query?: GetRoomStatsQueryDto) {
    const rooms = [
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
    ];

    const stats = await Promise.all(
      rooms.map(async (roomId) => {
        const roomStat = await this.prisma.roomStats.findUnique({
          where: { roomId },
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todaysStories = await this.prisma.echo.count({
          where: {
            room: roomId as any, // FIXED
            createdAt: { gte: todayStart },
          },
        });

        const totalStories = await this.prisma.echo.count({
          where: { room: roomId as any }, // FIXED - Line 508
        });

        const crisisCount = await this.prisma.echo.count({
          where: {
            room: roomId as any,
            crisisFlag: true,
          },
        });

        const trending = todaysStories > 5;

        return {
          roomId,
          totalStories,
          todaysStories,
          crisisCount,
          trending,
          lastUpdated: roomStat?.lastUpdated || new Date(),
        };
      }),
    );

    return {
      rooms: stats,
      totalStories: stats.reduce((sum, room) => sum + room.totalStories, 0),
      todaysTotal: stats.reduce((sum, room) => sum + room.todaysStories, 0),
      trendingRooms: stats.filter((room) => room.trending),
    };
  }

  private async updateRoomStats(roomId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaysStories = await this.prisma.echo.count({
      where: {
        room: roomId as any,
        createdAt: { gte: todayStart },
      },
    });

    const totalStories = await this.prisma.echo.count({
      where: { room: roomId as any }, // FIXED - Line 552
    });

    await this.prisma.roomStats.upsert({
      where: { roomId },
      update: {
        totalStories,
        todaysStories,
        lastUpdated: new Date(),
        trending: todaysStories > 5,
      },
      create: {
        roomId,
        totalStories,
        todaysStories,
        trending: todaysStories > 5,
      },
    });
  }

  private parseJsonField(field: any): any[] {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    if (Array.isArray(field)) return field;
    return [];
  }
}
