import { Router } from 'express'
import auth from '../middleware/auth.js'
import admin from '../middleware/Admin.js'
import { 
  preAuthorizeUserController, 
  getPreauthorizedUsersController,
  deletePreauthorizationController,
  getAdminDashboardStatsController,
  getAllUsersController,
  updateUserStatusController,
  updateUserDetailsAdminController,
  deleteUserController,
  getAllBookingsController,
  updateBookingStatusController
} from '../controllers/admin.controller.js'

const adminRouter = Router()

// Pre-authorization routes
adminRouter.post('/preauthorize', auth, admin, preAuthorizeUserController);
adminRouter.get('/preauthorized', auth, admin, getPreauthorizedUsersController);
adminRouter.delete('/preauthorize/:id', auth, admin, deletePreauthorizationController);

// Dashboard stats
adminRouter.get('/dashboard/stats', auth, admin, getAdminDashboardStatsController);

// User management routes
adminRouter.get('/users', auth, admin, getAllUsersController);
adminRouter.patch('/users/:id/status', auth, admin, updateUserStatusController);
adminRouter.put('/users/:id', auth, admin, updateUserDetailsAdminController);
adminRouter.delete('/users/:id', auth, admin, deleteUserController);

// Booking management routes
adminRouter.get('/bookings', auth, admin, getAllBookingsController);
adminRouter.patch('/bookings/:id/status', auth, admin, updateBookingStatusController);

export default adminRouter;