// routes/echo.routes.js
import { Router } from 'express';
import {
    createEcho,
    getEchoesByRoom,
    getRoomsStats,
    searchEchoes,
    moderateEcho,
    likeEcho,
    trackShare,
    getEchoById,
    addComment,
    getComments,
    getRelatedStories
} from '../controllers/echo.controller.js';
import admin from '../middleware/Admin.js';

const echoRouter = Router();

// Public routes (no authentication required)
echoRouter.post('/share', createEcho);
echoRouter.get('/room/:room', getEchoesByRoom);
echoRouter.get('/stats', getRoomsStats);
echoRouter.get('/search', searchEchoes);
echoRouter.get('/story/:storyId', getEchoById); // New route
echoRouter.post('/:storyId/like', likeEcho); // New route
echoRouter.post('/:storyId/share', trackShare); // New route
echoRouter.post('/:storyId/comment', addComment);
echoRouter.get('/:storyId/comments', getComments);
echoRouter.get('/room/:roomId/related', getRelatedStories);

// Admin routes
echoRouter.post('/moderate', admin, moderateEcho);

export default echoRouter;