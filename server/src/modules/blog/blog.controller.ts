// src/modules/blog/blog.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Post('posts')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create blog post',
    description: 'Create a new blog post (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'content', 'categoryId'],
      properties: {
        title: {
          type: 'string',
          minLength: 5,
          maxLength: 200,
          example: 'Understanding Mental Health Basics',
        },
        slug: {
          type: 'string',
          example: 'understanding-mental-health-basics',
        },
        excerpt: {
          type: 'string',
          maxLength: 300,
          example: 'An introduction to mental health fundamentals...',
        },
        content: {
          type: 'string',
          example: 'Full blog content here...',
        },
        categoryId: {
          type: 'string',
          example: 'cat_123abc',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['mental-health', 'wellness', 'self-care'],
        },
        featuredImage: {
          type: 'string',
          example: 'https://example.com/image.jpg',
        },
        isPublished: {
          type: 'boolean',
          example: true,
        },
        metaTitle: {
          type: 'string',
          example: 'Mental Health Basics - Complete Guide',
        },
        metaDescription: {
          type: 'string',
          example: 'Learn about mental health fundamentals...',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Blog post created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        postId: { type: 'string' },
        slug: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid blog post data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createBlogPost(@CurrentUser('id') userId: string, @Body() dto: CreateBlogPostDto) {
    return this.blogService.createBlogPost(userId, dto);
  }

  @Get('posts')
  @ApiOperation({
    summary: 'Get all blog posts',
    description: 'Retrieve paginated blog posts with filtering options',
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
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'tag',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'views', 'likes'],
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Blog posts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        posts: { type: 'array' },
        meta: { type: 'object' },
      },
    },
  })
  async getAllBlogPosts(@Query() query: GetBlogPostsQueryDto) {
    return this.blogService.getAllBlogPosts(query);
  }

  @Get('posts/recent')
  @ApiOperation({
    summary: 'Get recent blog posts',
    description: 'Retrieve most recently published blog posts',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Recent posts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        posts: { type: 'array' },
        count: { type: 'number' },
      },
    },
  })
  async getRecentBlogPosts(@Query('limit') limit?: number) {
    return this.blogService.getRecentBlogPosts(limit ? +limit : 5);
  }

  @Get('posts/popular')
  @ApiOperation({
    summary: 'Get popular blog posts',
    description: 'Retrieve most viewed blog posts',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Popular posts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        posts: { type: 'array' },
        count: { type: 'number' },
      },
    },
  })
  async getPopularBlogPosts(@Query('limit') limit?: number) {
    return this.blogService.getPopularBlogPosts(limit ? +limit : 5);
  }

  @Get('posts/slug/:slug')
  @ApiOperation({
    summary: 'Get blog post by slug',
    description: 'Retrieve blog post using its slug',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    example: 'understanding-mental-health-basics',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        post: { type: 'object' },
        relatedPosts: { type: 'array' },
        comments: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async getBlogPostBySlug(@Param('slug') slug: string) {
    return this.blogService.getBlogPostBySlug(slug);
  }

  @Get('posts/:postId')
  @ApiOperation({
    summary: 'Get blog post by ID',
    description: 'Retrieve blog post using its ID',
  })
  @ApiParam({
    name: 'postId',
    type: String,
    example: 'post_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async getBlogPostById(@Param('postId') postId: string) {
    return this.blogService.getBlogPostById(postId);
  }

  @Put('posts/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update blog post',
    description: 'Update an existing blog post',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'postId',
    type: String,
    example: 'post_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        excerpt: { type: 'string' },
        categoryId: { type: 'string' },
        tags: { type: 'array' },
        featuredImage: { type: 'string' },
        isPublished: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to update',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async updateBlogPost(
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.blogService.updateBlogPost(userId, postId, dto);
  }

  @Delete('posts/:postId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete blog post',
    description: 'Delete a blog post (Admin or author only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'postId',
    type: String,
    example: 'post_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async deleteBlogPost(@CurrentUser('id') userId: string, @Param('postId') postId: string) {
    return this.blogService.deleteBlogPost(userId, postId);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create blog category',
    description: 'Create a new blog category (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        name: { type: 'string', example: 'Mental Health' },
        slug: { type: 'string', example: 'mental-health' },
        description: { type: 'string', example: 'Articles about mental health' },
        parentId: { type: 'string', example: 'cat_parent123' },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createCategory(@CurrentUser('id') userId: string, @Body() dto: CreateBlogCategoryDto) {
    return this.blogService.createCategory(userId, dto);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve all blog categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        categories: { type: 'array' },
        count: { type: 'number' },
      },
    },
  })
  async getAllCategories() {
    return this.blogService.getAllCategories();
  }

  @Get('categories/:slug')
  @ApiOperation({
    summary: 'Get category by slug',
    description: 'Retrieve blog category using its slug',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    example: 'mental-health',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        category: { type: 'object' },
        posts: { type: 'array' },
        postCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.blogService.getCategoryBySlug(slug);
  }

  @Put('categories/:categoryId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Update category',
    description: 'Update an existing blog category (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'categoryId',
    type: String,
    example: 'cat_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async updateCategory(
    @CurrentUser('id') userId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateBlogCategoryDto,
  ) {
    return this.blogService.updateCategory(userId, categoryId, dto);
  }

  @Delete('categories/:categoryId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete category',
    description: 'Delete a blog category (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'categoryId',
    type: String,
    example: 'cat_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Category has posts, cannot delete',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async deleteCategory(@CurrentUser('id') userId: string, @Param('categoryId') categoryId: string) {
    return this.blogService.deleteCategory(userId, categoryId);
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create blog comment',
    description: 'Add a comment to a blog post',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['postId', 'content'],
      properties: {
        postId: { type: 'string', example: 'post_123abc' },
        content: {
          type: 'string',
          minLength: 1,
          maxLength: 1000,
          example: 'Great article! Very informative.',
        },
        parentId: {
          type: 'string',
          example: 'comment_parent123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        commentId: { type: 'string' },
        requiresApproval: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid comment data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async createComment(@CurrentUser('id') userId: string, @Body() dto: CreateBlogCommentDto) {
    return this.blogService.createComment(userId, dto);
  }

  @Get('posts/:postId/comments')
  @ApiOperation({
    summary: 'Get comments by post',
    description: 'Retrieve comments for a specific blog post',
  })
  @ApiParam({
    name: 'postId',
    type: String,
    example: 'post_123abc',
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
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'likes'],
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        comments: { type: 'array' },
        meta: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async getCommentsByPost(
    @Param('postId') postId: string,
    @Query() query: GetBlogCommentsQueryDto,
  ) {
    return this.blogService.getCommentsByPost(postId, query);
  }

  @Put('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update comment',
    description: 'Update an existing comment',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'commentId',
    type: String,
    example: 'comment_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'string',
          minLength: 1,
          maxLength: 1000,
          example: 'Updated comment content...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to update',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async updateComment(
    @CurrentUser('id') userId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateBlogCommentDto,
  ) {
    return this.blogService.updateComment(userId, commentId, dto);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete comment',
    description: 'Delete a comment (Admin or author only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'commentId',
    type: String,
    example: 'comment_123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async deleteComment(@CurrentUser('id') userId: string, @Param('commentId') commentId: string) {
    return this.blogService.deleteComment(userId, commentId);
  }

  @Put('comments/:commentId/approve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Approve comment',
    description: 'Approve or reject a comment (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'commentId',
    type: String,
    example: 'comment_123abc',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approved'],
      properties: {
        approved: { type: 'boolean', example: true },
        rejectionReason: {
          type: 'string',
          example: 'Contains inappropriate content',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Comment status updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async approveComment(
    @CurrentUser('id') userId: string,
    @Param('commentId') commentId: string,
    @Body() dto: ApproveCommentDto,
  ) {
    return this.blogService.approveComment(userId, commentId, dto);
  }
}
