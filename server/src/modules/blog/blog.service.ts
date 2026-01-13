// src/modules/blog/blog.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  CreateBlogCommentDto,
  UpdateBlogCommentDto,
  GetBlogPostsQueryDto,
  GetBlogCommentsQueryDto,
  ApproveCommentDto,
} from './dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // BLOG POST MANAGEMENT
  // ============================================

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  async createBlogPost(authorId: string, dto: CreateBlogPostDto) {
    // Check if user is admin or professional
    const user = await this.prisma.user.findUnique({
      where: { id: authorId },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      throw new ForbiddenException('Only admins can create blog posts');
    }

    // Generate slug from title
    let slug = this.generateSlug(dto.title);

    // Check if slug exists and make it unique
    let slugExists = await this.prisma.blogPost.findUnique({
      where: { slug },
    });

    let counter = 1;
    while (slugExists) {
      slug = `${this.generateSlug(dto.title)}-${counter}`;
      slugExists = await this.prisma.blogPost.findUnique({
        where: { slug },
      });
      counter++;
    }

    // Calculate read time if not provided
    const readTime = dto.readTime || this.calculateReadTime(dto.content);

    // Generate excerpt if not provided
    const excerpt = dto.excerpt || dto.content.substring(0, 200).trim() + '...';

    // Handle categories
    let categoryConnections = [];
    if (dto.categories && dto.categories.length > 0) {
      categoryConnections = dto.categories.map((categoryId) => ({
        id: categoryId,
      }));
    }

    const blogPost = await this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt,
        featuredImage: dto.featuredImage,
        author: authorId,
        tags: dto.tags || [],
        readTime,
        published: dto.published ?? true,
        categories: {
          connect: categoryConnections,
        },
      },
      include: {
        authorRel: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        categories: true,
      },
    });

    return {
      message: 'Blog post created successfully',
      post: blogPost,
    };
  }

  async updateBlogPost(userId: string, postId: string, dto: UpdateBlogPostDto) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    // Check if user is author or admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (post.author !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Not authorized to update this post');
    }

    // Update slug if title changed
    let slug = post.slug;
    if (dto.title && dto.title !== post.title) {
      slug = this.generateSlug(dto.title);

      // Ensure slug is unique
      let slugExists = await this.prisma.blogPost.findFirst({
        where: {
          slug,
          id: { not: postId },
        },
      });

      let counter = 1;
      while (slugExists) {
        slug = `${this.generateSlug(dto.title)}-${counter}`;
        slugExists = await this.prisma.blogPost.findFirst({
          where: {
            slug,
            id: { not: postId },
          },
        });
        counter++;
      }
    }

    // Recalculate read time if content changed
    let readTime = post.readTime;
    if (dto.content && dto.content !== post.content) {
      readTime = dto.readTime || this.calculateReadTime(dto.content);
    }

    // Handle category updates
    const updateData: any = {
      ...(dto.title && { title: dto.title }),
      ...(dto.title && { slug }),
      ...(dto.content && { content: dto.content, readTime }),
      ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
      ...(dto.featuredImage !== undefined && {
        featuredImage: dto.featuredImage,
      }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.published !== undefined && { published: dto.published }),
    };

    // Handle categories separately if provided
    if (dto.categories !== undefined) {
      // Disconnect all existing categories
      await this.prisma.blogPost.update({
        where: { id: postId },
        data: {
          categories: {
            set: [],
          },
        },
      });

      // Connect new categories
      if (dto.categories.length > 0) {
        updateData.categories = {
          connect: dto.categories.map((catId) => ({ id: catId })),
        };
      }
    }

    const updatedPost = await this.prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        authorRel: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        categories: true,
      },
    });

    return {
      message: 'Blog post updated successfully',
      post: updatedPost,
    };
  }

  async deleteBlogPost(userId: string, postId: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    // Check if user is author or admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (post.author !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Not authorized to delete this post');
    }

    // Delete associated comments first
    await this.prisma.blogComment.deleteMany({
      where: { post: postId },
    });

    await this.prisma.blogPost.delete({
      where: { id: postId },
    });

    return {
      message: 'Blog post deleted successfully',
    };
  }

  async getAllBlogPosts(query: GetBlogPostsQueryDto) {
    const {
      search,
      category,
      tags,
      published,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      author,
    } = query;

    const where: any = {};

    // Search in title, content, excerpt
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Filter by category
    if (category) {
      where.categories = {
        some: {
          id: category,
        },
      };
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    // Filter by published status
    if (published !== undefined) {
      where.published = published;
    }

    // Filter by author
    if (author) {
      where.author = author;
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          authorRel: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          categories: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getBlogPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        authorRel: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        categories: true,
        comments: {
          where: { approved: true },
          include: {
            authorRel: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    // Increment view count
    await this.prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return post;
  }

  async getBlogPostById(postId: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        authorRel: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        categories: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  async getRecentBlogPosts(limit: number = 5) {
    const posts = await this.prisma.blogPost.findMany({
      where: { published: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        authorRel: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        categories: true,
      },
    });

    return { posts };
  }

  async getPopularBlogPosts(limit: number = 5) {
    const posts = await this.prisma.blogPost.findMany({
      where: { published: true },
      take: limit,
      orderBy: { views: 'desc' },
      include: {
        authorRel: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        categories: true,
      },
    });

    return { posts };
  }

  // ============================================
  // CATEGORY MANAGEMENT
  // ============================================

  async createCategory(adminId: string, dto: CreateBlogCategoryDto) {
    // Check if user is admin
    const user = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      throw new ForbiddenException('Only admins can create categories');
    }

    // Generate slug
    const slug = this.generateSlug(dto.name);

    // Check if category exists
    const existingCategory = await this.prisma.blogCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = await this.prisma.blogCategory.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
      },
    });

    return {
      message: 'Category created successfully',
      category,
    };
  }

  async updateCategory(adminId: string, categoryId: string, dto: UpdateBlogCategoryDto) {
    const category = await this.prisma.blogCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Generate new slug if name changed
    let slug = category.slug;
    if (dto.name && dto.name !== category.name) {
      slug = this.generateSlug(dto.name);

      // Check if new slug exists
      const existingCategory = await this.prisma.blogCategory.findFirst({
        where: {
          slug,
          id: { not: categoryId },
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    const updatedCategory = await this.prisma.blogCategory.update({
      where: { id: categoryId },
      data: {
        ...(dto.name && { name: dto.name, slug }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    return {
      message: 'Category updated successfully',
      category: updatedCategory,
    };
  }

  async deleteCategory(adminId: string, categoryId: string) {
    const category = await this.prisma.blogCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.posts > 0) {
      throw new BadRequestException(
        'Cannot delete category with associated posts. Reassign posts first.',
      );
    }

    await this.prisma.blogCategory.delete({
      where: { id: categoryId },
    });

    return {
      message: 'Category deleted successfully',
    };
  }

  async getAllCategories() {
    const categories = await this.prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return { categories };
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.blogCategory.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { published: true },
          include: {
            authorRel: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // ============================================
  // COMMENT MANAGEMENT
  // ============================================

  async createComment(userId: string, dto: CreateBlogCommentDto) {
    // Check if post exists
    const post = await this.prisma.blogPost.findUnique({
      where: { id: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    const comment = await this.prisma.blogComment.create({
      data: {
        content: dto.content,
        author: userId,
        post: dto.postId,
        approved: true, // Auto-approve for now, can add moderation later
      },
      include: {
        authorRel: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return {
      message: 'Comment added successfully',
      comment,
    };
  }

  async updateComment(userId: string, commentId: string, dto: UpdateBlogCommentDto) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is comment author
    if (comment.author !== userId) {
      throw new ForbiddenException('Not authorized to update this comment');
    }

    const updatedComment = await this.prisma.blogComment.update({
      where: { id: commentId },
      data: {
        content: dto.content,
      },
      include: {
        authorRel: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return {
      message: 'Comment updated successfully',
      comment: updatedComment,
    };
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is comment author or admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (comment.author !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    await this.prisma.blogComment.delete({
      where: { id: commentId },
    });

    return {
      message: 'Comment deleted successfully',
    };
  }

  async getCommentsByPost(postId: string, query: GetBlogCommentsQueryDto) {
    const { page = 1, limit = 20, approved } = query;

    const where: any = { post: postId };

    if (approved !== undefined) {
      where.approved = approved;
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.blogComment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          authorRel: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.blogComment.count({ where }),
    ]);

    return {
      comments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async approveComment(adminId: string, commentId: string, dto: ApproveCommentDto) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const updatedComment = await this.prisma.blogComment.update({
      where: { id: commentId },
      data: { approved: dto.approved },
    });

    return {
      message: `Comment ${dto.approved ? 'approved' : 'unapproved'} successfully`,
      comment: updatedComment,
    };
  }
}
