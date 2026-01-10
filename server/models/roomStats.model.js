import mongoose from "mongoose";

const roomStatsSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    totalStories: {
        type: Number,
        default: 0
    },
    todaysStories: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    trending: {
        type: Boolean,
        default: false
    },
    averageWordCount: {
        type: Number,
        default: 0
    },
    crisisCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

roomStatsSchema.statics.incrementCount = async function(roomId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const update = {
        $inc: { 
            totalStories: 1,
            todaysStories: 1
        },
        lastUpdated: new Date()
    };
    
    return this.findOneAndUpdate(
        { roomId },
        update,
        { upsert: true, new: true }
    );
};

const RoomStats = mongoose.model('RoomStats', roomStatsSchema);

export default RoomStats;