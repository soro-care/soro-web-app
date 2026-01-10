import { Router } from 'express';
import auth from '../middleware/auth.js';
import admin from '../middleware/Admin.js';
import {
    createBlogPost,
    getAllBlogPosts,
    getBlogPost,
    addComment,
    getPostsByCategory,
    createBlogCategory,
    getAllBlogCategories,
    updateBlogPost,
    getRecentBlogPosts,
    deleteBlogPost
} from '../controllers/blog.controller.js';

const blogRouter = Router();

// Public routes
blogRouter.get('/get-all', getAllBlogPosts);
blogRouter.get('/recent-posts', getRecentBlogPosts);
blogRouter.get('/get/:slug', getBlogPost);
blogRouter.post('/get-by-category', getPostsByCategory);
blogRouter.get('/categories', getAllBlogCategories);

// Authenticated routes
blogRouter.post('/add-comment', auth, addComment);

// Admin routes
blogRouter.post('/create', auth, admin, createBlogPost);
blogRouter.post('/create-category', auth, admin, createBlogCategory);
blogRouter.put('/update', auth, admin, updateBlogPost);
blogRouter.delete('/delete', auth, admin, deleteBlogPost);

export default blogRouter;