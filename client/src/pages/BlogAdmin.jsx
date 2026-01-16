import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import Loading from '../components/Loading';
import { ArrowRight, Edit2, Trash2 } from 'lucide-react'
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion'


const BlogAdmin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const user = useSelector(state => state.user);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await Axios({ ...SummaryApi.getAllBlogs });
            if (response.data.success) {
                setBlogs(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await Axios({
                ...SummaryApi.deleteBlog,
                data: { postId: postToDelete }
            });
            
            if (response.data.success) {
                toast.success('Blog post deleted successfully');
                fetchBlogs(); // Refresh the list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete post');
        } finally {
            setShowDeleteModal(false);
            setPostToDelete(null);
        }
    };

    const handleEdit = (postSlug) => {
        navigate(`/admin/edit/${postSlug}`);
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const createMarkup = (html) => {
    return { __html: html };
    };



    const BlogSkeleton = () => (
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
            <div className="relative h-48 bg-gray-100 animate-pulse"></div>
            <div className="p-6 space-y-3">
                <div className="flex space-x-3">
                    <div className="h-4 bg-gray-100 rounded-full w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded-full w-24 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-100 rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-12 bg-gray-100 rounded-lg w-full animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-full w-20 animate-pulse"></div>
            </div>
        </div>
    )

    return (
        <div className={`${user?._id ? 'md:ml-64 bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7]' : ''} min-h-screen`}>
            <div className="container mx-auto px-4 py-12">
                {/* Page Header */}
                <div className="mb-8 px-4 sm:px-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#30459D]">
                        Blog Posts
                    </h1>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(6)].map((_, index) => <BlogSkeleton key={index} />)
                    ) : blogs.length > 0 ? (
                        blogs.map((post) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            whileHover={{ y: -5 }}
                            className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group"
                        >
                            {/* Admin Actions */}
                            {user?.role === 'ADMIN' && (
                                <div className="absolute top-2 right-2 flex gap-2 z-10">
                                    <button 
                                        onClick={() => handleEdit(post.slug)}
                                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                        aria-label="Edit post"
                                    >
                                        <Edit2 className="w-4 h-4 text-[#30459D]" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setPostToDelete(post._id);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                        aria-label="Delete post"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            )}

                            {/* Image with overlay */}
                            <div className="relative h-48 overflow-hidden">
                                <img 
                                    src={post.featuredImage || '/images/blog-placeholder.jpg'} 
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex flex-col justify-end p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {post.categories?.slice(0, 2).map(category => (
                                            <span 
                                                key={category._id} 
                                                className="bg-[#30459D] text-white text-xs px-2 py-1 rounded-md"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    <span className="mx-2">•</span>
                                    <span>{post.readTime || 5} min read</span>
                                </div>
                                
                                <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-[#30459D] transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3"
                                    dangerouslySetInnerHTML={createMarkup(post.excerpt || post.content.substring(0, 150) + '...')}
                                />
                                
                                <Link 
                                    to={`/drops/${post.slug || post._id}`} 
                                    className="text-[#30459D] hover:text-[#263685] text-sm font-medium flex items-center gap-1"
                                >
                                    Read more <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <div className="inline-block p-6 bg-white rounded-2xl shadow-sm">
                                <h3 className="text-2xl font-medium text-gray-700 mb-3">No articles yet</h3>
                                <p className="text-gray-500 mb-4">We're brewing some fresh content for you</p>
                                <div className="w-24 h-1 bg-gradient-to-r from-[#30459D] to-[#ff85a2] rounded-full mx-auto"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <Modal 
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Confirm Deletion"
                >
                    <div className="p-4">
                        <p className="mb-6">Are you sure you want to delete this blog post? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Empty State */}
                {blogs?.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No articles yet</h3>
                        <p className="text-gray-500">Check back later for new content</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogAdmin;