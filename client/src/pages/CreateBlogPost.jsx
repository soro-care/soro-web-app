import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';
import Loading from '../components/Loading';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import uploadImage from '../utils/UploadImage';

const CreateBlogPost = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.user);
    const { allCategories } = useSelector(state => state.blog);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [tags, setTags] = useState('');
    const [viewImageURL, setViewImageURL] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        categories: [],
        tags: [],
        readTime: 5,
        published: true
    });

    // Fetch categories if not already loaded
    useEffect(() => {
        if (!allCategories || allCategories.length === 0) {
            const fetchCategories = async () => {
                try {
                    const response = await Axios({
                        ...SummaryApi.getAllBlogCategories
                    });
                    if (response.data.success) {
                        dispatch({ type: 'blog/setAllCategories', payload: response.data.data });
                    }
                } catch (error) {
                    console.error("Error fetching categories:", error);
                }
            };
            fetchCategories();
        }
    }, [allCategories, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({
            ...prev,
            content: value,
            excerpt: value.substring(0, 150) + '...'
        }));
    };

    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        try {
            setImageLoading(true);
            const response = await uploadImage(file);
            
            // Now this will work with either structure
            const imageUrl = response.data?.url || response.data?.secure_url;
            
            if (imageUrl) {
                setFormData(prev => ({
                    ...prev,
                    featuredImage: imageUrl
                }));
                setViewImageURL(imageUrl); // Also update the preview
            } else {
                throw new Error("Invalid image URL in response");
            }
        } catch (error) {
            toast.error(error.message || 'Failed to upload image');
            console.error("Upload error:", error);
        } finally {
            setImageLoading(false);
        }
    };

    const handleCategorySelect = (categoryId) => {
        // Verify the category exists
        const categoryExists = allCategories?.some(c => c._id === categoryId);
        if (!categoryExists) {
            toast.error("Invalid category selected");
            return;
        }
    
        setSelectedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId) 
                : [...prev, categoryId]
        );
        
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter(id => id !== categoryId)
                : [...prev.categories, categoryId]
        }));
    };

    const handleTagsChange = (e) => {
        const value = e.target.value;
        setTags(value);
        setFormData(prev => ({
            ...prev,
            tags: value.split(',').map(tag => tag.trim())
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Current user:', user); // Check if user exists
        console.log('User ID:', user?._id); // Check if _id exists

        if (!user?._id) {
            toast.error("Please login to create a post");
            navigate('/login');
            return;
        }
        
        // Frontend validation
        if (!formData.title || !formData.featuredImage || !formData.categories.length || !formData.content) {
            toast.error("Please fill all required fields");
            return;
        }

        const postData = {
            ...formData,
            categories: formData.categories.map(catId => ({ _id: catId })), // Ensure proper structure
            tags: formData.tags.filter(tag => tag.trim() !== ''), // Clean empty tags
            author: user._id // If your backend requires author ID
        };
        
        
        try {
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.createBlogPost,
                data: postData
            });

            if (response.data.success) {
                toast.success('Blog post created successfully');
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen px-4 py-8 md:ml-64 md:px-8 md:py-12 bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7]`}>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-[#30459D] px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">Create New Blog Post</h1>
                    <p className="text-blue-100 mt-1">Share your knowledge with the community</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Post Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30459D] focus:border-[#30459D] transition-all"
                                placeholder="Enter a compelling title"
                                required
                            />
                        </div>

                        {/* Featured Image */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Featured Image
                            </label>
                            <div className="space-y-4">
                                {formData.featuredImage ? (
                                    <div className="relative group">
                                        <img 
                                            src={formData.featuredImage} 
                                            alt="Featured" 
                                            className="w-full h-64 object-cover rounded-lg shadow-sm"
                                            onClick={() => setViewImageURL(formData.featuredImage)}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                                                className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-red-500 text-white p-2 rounded-full"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        {imageLoading ? (
                                            <Loading />
                                        ) : (
                                            <div className="text-center p-6">
                                                <FaCloudUploadAlt className="mx-auto text-gray-400 text-4xl mb-3" />
                                                <p className="text-sm text-gray-500 mb-1">Click to upload or drag and drop</p>
                                                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={handleUploadImage}
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Categories
                            </label>
                            {allCategories && allCategories.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {allCategories.map(category => (
                                        <button
                                            key={category._id}
                                            type="button"
                                            onClick={() => handleCategorySelect(category._id)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                selectedCategories.includes(category._id) 
                                                    ? 'bg-[#30459D] text-white shadow-md' 
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">Loading categories...</div>
                            )}
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                id="tags"
                                value={tags}
                                onChange={handleTagsChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30459D] focus:border-[#30459D]"
                                placeholder="e.g. mindfulness, wellness, self-care"
                            />
                        </div>

                        {/* Read Time */}
                        <div className="space-y-2">
                            <label htmlFor="readTime" className="block text-sm font-medium text-gray-700">
                                Estimated Read Time (minutes)
                            </label>
                            <input
                                type="number"
                                id="readTime"
                                name="readTime"
                                value={formData.readTime}
                                onChange={handleChange}
                                min="1"
                                className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30459D] focus:border-[#30459D]"
                            />
                        </div>

                        {/* Content Editor */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Content
                            </label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <ReactQuill
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                            ['link', 'image'],
                                            ['clean']
                                        ]
                                    }}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        {/* Publish Options */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center">
                                <input
                                    id="published"
                                    name="published"
                                    type="checkbox"
                                    checked={formData.published}
                                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                                    className="h-5 w-5 text-[#30459D] focus:ring-[#30459D] border-gray-300 rounded"
                                />
                                <label htmlFor="published" className="ml-3 text-sm font-medium text-gray-700">
                                    Publish immediately
                                </label>
                            </div>

                            <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-[#30459D] text-white font-medium rounded-lg hover:bg-[#263685] transition-colors shadow-sm disabled:opacity-70"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Publishing...
                                    </span>
                                ) : 'Publish Post'}
                            </button>
                        </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Image Viewer Modal */}
            {viewImageURL && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-4 flex justify-between items-center border-b">
                            <h3 className="text-lg font-medium">Image Preview</h3>
                            <button 
                                onClick={() => setViewImageURL('')}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <img 
                                src={viewImageURL} 
                                alt="Preview" 
                                className="max-w-full max-h-[70vh] mx-auto"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateBlogPost;