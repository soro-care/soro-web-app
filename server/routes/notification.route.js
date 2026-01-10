// server/routes/notification.route.js

import express from 'express';
import auth from '../middleware/auth.js';
import {getNotifications, markAsRead, markAllAsRead, getUnreadCount} from '../controllers/notification.controller.js'
import { Router } from 'express';


const notificationRouter = Router();

// Get notifications
notificationRouter.get(
  '/', 
  auth, 
  getNotifications
);

// Mark notification as read
notificationRouter.put(
  '/:notificationId/read', 
  auth, 
  markAsRead
);

// Mark all notifications as read
notificationRouter.put(
  '/read-all', 
  auth, 
  markAllAsRead
);

// Get unread count
notificationRouter.get(
  '/unread-count', 
  auth, 
  getUnreadCount
);

export default notificationRouter;