import UserModel from '../models/user.model.js'
import Booking from "../models/booking.model.js";
import Availability from "../models/availability.model.js";
// import { generateMeetLink } from "../utils/meetGenerator.js";
// import sendEmail from "../config/sendEmail.js";

// Check if professional has initialized availability
export async function checkAvailabilityInitialized(req, res) {
  try {
    const professionalId = req.params.professionalId || req.userId;
    
    const count = await Availability.countDocuments({ professional: professionalId });
    const isInitialized = count > 0;
    
    res.status(200).json({ isInitialized });
  } catch (error) {
    res.status(500).json({ message: 'Error checking availability initialization', error: error.message });
  }
};

// Initialize availability for a professional
export async function initializeAvailability(req, res) {
  try {
    const professionalId = req.userId;
    
    if (!professionalId) {
      return res.status(400).json({ message: 'Professional ID is required' });
    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Check if availability already exists
    const existingAvailability = await Availability.findOne({ professional: professionalId });
    if (existingAvailability) {
      return res.status(400).json({ message: 'Availability already initialized for this professional' });
    }

    // Create empty availability for each day
    const availabilityDocs = daysOfWeek.map(day => ({
      professional: professionalId,
      day,
      slots: [],
      available: false
    }));

    // Insert all at once
    await Availability.insertMany(availabilityDocs);
    
    res.status(201).json({ message: 'Availability initialized successfully' });
  } catch (error) {
    console.error('Initialize availability error:', error);
    res.status(500).json({ 
      message: 'Error initializing availability', 
      error: error.message 
    });
  }
}

// Get professional availability
export async function getAvailability(req, res) {
  try {
    const professionalId = req.params.professionalId || req.userId;
    const availability = await Availability.find({ professional: professionalId })
      .sort({ day: 1 }); // Sort by day order
    
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
};

// Update availability for a specific day
export async function updateAvailability(req, res) {
  try {
    const { dayId } = req.params;
    const { slots = [], available } = req.body;

    // Determine final availability status
    const finalAvailable = slots.length > 0 
      ? (available !== undefined ? available : true) 
      : false;

    const updateData = {
      slots,
      available: finalAvailable,
      updatedAt: Date.now()
    };

    const updatedAvailability = await Availability.findByIdAndUpdate(
      dayId,
      updateData,
      { new: true }
    );

    if (!updatedAvailability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    res.status(200).json(updatedAvailability);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating availability', 
      error: error.message 
    });
  }
};

// Check if a specific slot is available
export async function checkSlotAvailability(req, res) {

  try {
    const { professionalId, day, startTime, endTime } = req.params;
    
    const availability = await Availability.findOne({
      professional: professionalId,
      day,
      available: true
    });

    if (!availability) {
      return res.status(200).json({ isAvailable: false });
    }

    // Check if the exact slot exists
    const slotExists = availability.slots.some(slot => 
      slot.startTime === startTime && 
      slot.endTime === endTime
    );

    // Check if this slot is booked in any booking
    const isBooked = await Booking.exists({
      professional: professionalId,
      date: { 
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999)
      },
      startTime,
      endTime,
      status: { $in: ['Pending', 'Confirmed', 'Rescheduled'] }
    });

    res.status(200).json({ 
      isAvailable: slotExists && !isBooked 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking slot availability', error: error.message });
  }
};

// Get all professionals with their availability
export async function getAllProfessionalsWithAvailability(req, res) {

  try {
    const professionals = await UserModel.find({ role: 'PROFESSIONAL' })
      .select('-password')
      .populate({
        path: 'availability',
        select: 'day slots available'
      });

    res.status(200).json(professionals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching professionals', error: error.message });
  }
};

export async function getAllAvailableSlots(req, res) {
    try {
        // Get all professionals first
        const professionals = await UserModel.find({ 
            role: 'PROFESSIONAL',
            status: 'Active'
        }).select('-password -refresh_token');

        // Get all availability records that are available
        const availableDays = await Availability.find({ available: true });

        // Get all bookings to check availability
        const bookings = await Booking.find({
            date: { $gte: new Date() }, // Future bookings only
            status: { $in: ['Pending', 'Confirmed', 'Rescheduled'] }
        });

        // Process the data to get available slots
        const availableSlots = [];

        for (const professional of professionals) {
            // Find availability for this professional
            const professionalAvailability = availableDays.filter(
                day => day.professional.toString() === professional._id.toString()
            );

            for (const day of professionalAvailability) {
                // Get the next occurrence of this day
                const nextDate = getNextDateForDay(day.day);

                for (const slot of day.slots) {
                    // Check if this slot is booked
                    const isBooked = bookings.some(booking => 
                        booking.professional.toString() === professional._id.toString() &&
                        isSameDay(booking.date, nextDate) &&
                        booking.startTime === slot.startTime &&
                        booking.endTime === slot.endTime
                    );

                    if (!isBooked) {
                        availableSlots.push({
                            id: `${professional._id}-${day.day}-${slot.startTime}`,
                            date: nextDate,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            professional: {
                                _id: professional._id,
                                counselorId: professional.counselorId,
                                name: professional.name,
                                avatar: professional.avatar,
                                specialization: professional.specialization,
                                bio: professional.bio,
                                yearsOfExperience: professional.yearsOfExperience
                            }
                        });
                    }
                }
            }
        }

        res.status(200).json(availableSlots);
    } catch (error) {
        console.error('Error in getAllAvailableSlots:', error);
        res.status(500).json({ 
            message: 'Error fetching available slots', 
            error: error.message 
        });
    }
}

// Helper functions
function getNextDateForDay(dayOfWeek) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = days.indexOf(dayOfWeek);
    const today = new Date();
    const todayIndex = today.getDay();
    
    let daysToAdd = targetDayIndex - todayIndex;
    if (daysToAdd <= 0) daysToAdd += 7;
    
    return addDays(today, daysToAdd);
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function isSameDay(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}