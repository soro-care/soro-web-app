import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';
import toast from 'react-hot-toast';

const BlogCommentForm = ({ postId, onCommentAdded }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const user = useSelector(state => state.user);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.addBlogComment,
                data: {
                    postId,
                    content
                }
            });

            if (response.data.success) {
                toast.success('Comment added successfully');
                setContent('');
                if (onCommentAdded) {
                    await onCommentAdded();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add comment');
        } finally {
            setLoading(false);
        }
    };

    if (!user?._id) {
        return (
            <div className="bg-[#eff8f9] p-4 rounded-lg mb-6 border border-[#30459D]/20">
                <p className="text-center text-gray-700">
                    Please <a href="/login" className="text-[#30459D] font-medium hover:underline">login</a> to post a comment.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave a comment</h3>
            <form onSubmit={handleSubmit}>
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#30459D] text-white flex items-center justify-center font-medium flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows="4"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30459D] focus:border-transparent transition-all"
                            required
                        ></textarea>
                        {/* <p className="text-xs text-gray-500 mt-1">Markdown formatting supported</p> */}
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#30459D] hover:bg-[#23367a] text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 transition-colors flex items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Posting...
                            </>
                        ) : 'Post Comment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BlogCommentForm;