import BlogPost from "../models/blog.model.js";
import BlogComment from "../models/blogComment.model.js";
import BlogCategory from "../models/blogCategory.model.js";
import UserModel from "../models/user.model.js";
import mongoose from 'mongoose';  // Add this import at the top


// Create a new blog post
export const createBlogPost = async (req, res) => {
    try {
        const { title, content, excerpt, featuredImage, categories, tags } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required",
                error: true,
                success: false
            });
        }

        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Calculate read time (approx 200 words per minute)
        const wordCount = content.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200);

        const newPost = new BlogPost({
            title,
            content,
            excerpt: excerpt || content.substring(0, 150) + '...',
            featuredImage,
            categories,
            tags,
            author: req.userId,
            readTime,
            slug
        });

        const savedPost = await newPost.save();

        return res.status(201).json({
            message: "Blog post created successfully",
            data: savedPost,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get all blog posts with pagination
export const getAllBlogPosts = async (req, res) => {
    try {
        let { page = 1, limit = 10, category, search } = req.body;

        const query = {};
        
        if (category) {
            query.categories = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const skip = (page - 1) * limit;

        const [posts, totalCount] = await Promise.all([
            BlogPost.find(query)
                .populate('author', 'name email avatar')
                .populate('categories', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            BlogPost.countDocuments(query)
        ]);

        return res.json({
            message: "Blog posts retrieved successfully",
            data: posts,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get two most recent blog posts for dashboard
export const getRecentBlogPosts = async (req, res) => {
    try {
        const recentPosts = await BlogPost.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(2) // Limit to 2 posts
            .populate('author', 'name avatar') // Only get author name and avatar
            .populate('categories', 'name') // Only get category names
            .select('title excerpt featuredImage slug createdAt readTime'); // Only select necessary fields

        return res.status(200).json({
            message: "Recent blog posts retrieved successfully",
            data: recentPosts,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get single blog post by slug or ID

export const getBlogPost = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                message: "Post slug is required",
                error: true,
                success: false
            });
        }

        const post = await BlogPost.findOne({ slug })
            .populate('author', 'name email avatar')
            .populate('categories', 'name slug')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'name avatar'
                }
            });

        if (!post) {
            return res.status(404).json({
                message: "Blog post not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Blog post retrieved successfully",
            data: post,
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error fetching blog post:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// Add comment to blog post
export const addComment = async (req, res) => {
    try {
        const { postId, content } = req.body;

        if (!postId || !content) {
            return res.status(400).json({
                message: "Post ID and comment content are required",
                error: true,
                success: false
            });
        }

        const newComment = new BlogComment({
            content,
            author: req.userId,
            post: postId
        });

        const savedComment = await newComment.save();

        // Add comment reference to the blog post
        await BlogPost.findByIdAndUpdate(postId, {
            $push: { comments: savedComment._id }
        });

        // Populate author info before returning
        const populatedComment = await BlogComment.findById(savedComment._id)
            .populate('author', 'name avatar');

        return res.status(201).json({
            message: "Comment added successfully",
            data: populatedComment,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get posts by category
export const getPostsByCategory = async (req, res) => {
    try {
        const { categoryId, page = 1, limit = 10 } = req.body;

        if (!categoryId) {
            return res.status(400).json({
                message: "Category ID is required",
                error: true,
                success: false
            });
        }

        const skip = (page - 1) * limit;

        const [posts, totalCount] = await Promise.all([
            BlogPost.find({ categories: categoryId })
                .populate('author', 'name avatar')
                .populate('categories', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            BlogPost.countDocuments({ categories: categoryId })
        ]);

        return res.json({
            message: "Posts retrieved by category",
            data: posts,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Create a new blog category (admin only)
export const createBlogCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required",
                error: true,
                success: false
            });
        }

        // Generate slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const newCategory = new BlogCategory({
            name,
            description,
            slug
        });

        const savedCategory = await newCategory.save();

        return res.status(201).json({
            message: "Blog category created successfully",
            data: savedCategory,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get all blog categories
export const getAllBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find().sort({ name: 1 });

        return res.json({
            message: "Blog categories retrieved successfully",
            data: categories,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Update blog post
export const updateBlogPost = async (req, res) => {
    try {
        const { postId, slug, ...updateData } = req.body;

        if (!postId && !slug) {
            return res.status(400).json({
                message: "Post ID or slug is required",
                error: true,
                success: false
            });
        }

        const query = postId ? { _id: postId } : { slug };
        
        const updatedPost = await BlogPost.findOneAndUpdate(
            query,
            updateData,
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({
                message: "Blog post not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Blog post updated successfully",
            data: updatedPost,
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error updating blog post:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// Delete blog post
export const deleteBlogPost = async (req, res) => {
    try {
        const { postId } = req.body;

        if (!postId) {
            return res.status(400).json({
                message: "Post ID is required",
                error: true,
                success: false
            });
        }

        // First delete all comments associated with this post
        await BlogComment.deleteMany({ post: postId });

        // Then delete the post
        await BlogPost.findByIdAndDelete(postId);

        return res.json({
            message: "Blog post and associated comments deleted successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};