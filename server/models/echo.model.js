// models/Echo.js
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  ipAddress: String,
  userAgent: String,
  likedAt: { type: Date, default: Date.now },
  authorName: { // Add this
    type: String,
    default: 'Anonymous'
  }
});

const shareSchema = new mongoose.Schema({
  platform: String,
  sharedAt: { type: Date, default: Date.now },
  authorName: { // Add this
    type: String,
    default: 'Anonymous'
  }
});

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    minlength: [3, 'Comment must be at least 3 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Display name is required'],
    minlength: [2, 'Display name must be at least 2 characters'],
    maxlength: [30, 'Display name cannot exceed 30 characters'],
    trim: true
  },
  commenterId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const echoSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, "Story content is required"],
        maxlength: [2000, "Story cannot exceed 2000 characters"]
    },
    authorName: {
        type: String,
        required: [true, 'Display name is required'],
        minlength: [2, 'Display name must be at least 2 characters'],
        maxlength: [30, 'Display name cannot exceed 30 characters'],
        trim: true
    },
    room: {
        type: String,
        enum: [
            "pressure", "burnout", "not-enough", "silence", 
            "rage", "exhaustion", "gratitude", 
            "victory", "hope", "resilience"
        ],
        required: true
    },
    sentiment: {
        type: String,
        enum: ["struggle", "positive", "neutral"],
        default: "neutral"
    },
    wordCount: {
        type: Number,
        default: 0
    },
    moderated: {
        type: Boolean,
        default: false
    },
    crisisFlag: {
        type: Boolean,
        default: false
    },
    reportCount: {
        type: Number,
        default: 0
    },
    emotionTags: [{
        type: String,
        default: []
    }],
    isArchived: {
        type: Boolean,
        default: false
    },
    // NEW FIELDS
    likes: [likeSchema],
    comments: [commentSchema],
    shareCount: {
        type: Number,
        default: 0
    },
    shareLogs: [shareSchema]
}, {
    timestamps: true
});

echoSchema.pre('save', function(next) {
  // Skip validation for comments when adding them
  if (this.isModified('comments')) {
    this.skipValidation = true;
  }
  this.wordCount = this.content.trim().split(/\s+/).length;
  next();
});

echoSchema.set('validateBeforeSave', true);
// Text index for search
echoSchema.index({ content: 'text' });
echoSchema.index({ room: 1, createdAt: -1 });
echoSchema.index({ moderated: 1, isArchived: 1 });
echoSchema.index({ "likes.ipAddress": 1 }); // For tracking likes

const Echo = mongoose.model('Echo', echoSchema);

export default Echo;