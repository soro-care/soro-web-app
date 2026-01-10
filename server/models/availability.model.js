import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  professional: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  day: { 
    type: String, 
    required: true,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  slots: [{
    startTime: { type: String, required: true }, // Format: "HH:MM" (24-hour)
    endTime: { type: String, required: true }
  }],
  available: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one availability document per professional per day
availabilitySchema.index({ professional: 1, day: 1 }, { unique: true });

availabilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;