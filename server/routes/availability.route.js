import { Router } from 'express';
import {
  checkAvailabilityInitialized,
  initializeAvailability,
  getAvailability,
  updateAvailability,
  checkSlotAvailability,
  getAllAvailableSlots,
  getAllProfessionalsWithAvailability
} from '../controllers/availability.controller.js';
import auth from '../middleware/auth.js';

const availabilityRouter = Router();



// Check if professional has initialized availability
availabilityRouter.get(
  '/check-initialized/:professionalId?', 
  auth, 
  checkAvailabilityInitialized
);

// Initialize availability for professional
availabilityRouter.post(
  '/initialize', 
  auth, 
  initializeAvailability
);

// Get professional availability
availabilityRouter.get(
  '/:professionalId?', 
  auth, 
  getAvailability
);

// Update availability for a day
availabilityRouter.put(
  '/:dayId', 
  auth, 
  updateAvailability
);

// Check slot availability
availabilityRouter.get(
  '/check-slot/:professionalId/:day/:startTime/:endTime',
  auth,
  checkSlotAvailability
);

// Get all professionals with availability
availabilityRouter.get(
  '/professionals/all', 
  auth, 
  getAllProfessionalsWithAvailability
);

availabilityRouter.get(
  '/slots/all', 
  auth, 
  getAllAvailableSlots
);

export default availabilityRouter;