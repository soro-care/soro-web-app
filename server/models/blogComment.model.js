import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'blogPost',
        required: true
    },
    approved: {
        type: Boolean,
        default: true
    },
    replies: [{
        type: mongoose.Schema.ObjectId,
        ref: 'blogComment'
    }]
}, {
    timestamps: true
});

const BlogComment = mongoose.model('blogComment', commentSchema);

export default BlogComment;