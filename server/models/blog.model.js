import mongoose from "mongoose";
import slugify from 'slugify';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        default: ""
    },
    featuredImage: {
        type: String,
        default: ""
    },
    categories: [{
        type: mongoose.Schema.ObjectId,
        ref: 'blogCategory'
    }],
    tags: {
        type: [String],
        default: []
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    readTime: {
        type: Number, // in minutes
        default: 5
    },
    published: {
        type: Boolean,
        default: true
    },
    slug: {
        type: String,
        unique: true
    },
    writtenBy: { type: String },
    comments: [{
        type: mongoose.Schema.ObjectId,
        ref: 'blogComment'
    }],
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    }],
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Text index for search functionality
blogSchema.index({
    title: "text",
    content: "text",
    excerpt: "text",
    tags: "text"
}, {
    weights: {
        title: 10,
        content: 5,
        excerpt: 7,
        tags: 3
    }
});

blogSchema.pre('save', function(next) {
  if (this.isModified('title') && (!this.slug || this.slug === '')) {
    // Create a basic slug without special characters
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }
  next();
});

const BlogPost = mongoose.model('blogPost', blogSchema);

export default BlogPost;