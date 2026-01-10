import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  professional: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // Format: "HH:MM" (24-hour)
  endTime: { type: String, required: true },
  modality: { 
    type: String, 
    required: true,
    enum: ['Video', 'Audio'] 
  },
  concern: { type: String, required: true },
  notes: { type: String },
  meetingLink: { type: String },
  meetingPassword: { type: String },
  status: { 
    type: String, 
    required: true,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Pending'
  },
  cancellationReason: { type: String },
  rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  reminderSent: {
    type: Boolean,
    default: false
  }
});

// Indexes for faster queries
bookingSchema.index({ user: 1 });
bookingSchema.index({ professional: 1 });
bookingSchema.index({ date: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1 });

bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;