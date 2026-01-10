import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const BlogCategory = mongoose.model('blogCategory', categorySchema);

export default BlogCategory;