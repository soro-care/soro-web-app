// BlogCommentList.js
import React from 'react';
import { formatDate } from '../../utils/formatDate';

const BlogCommentList = ({ comments }) => {
    if (!comments || comments.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center border border-gray-100">
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {comments.map(comment => (
                <div key={comment._id} className="bg-[#e9eaef3f] p-4 rounded-lg  border border-[#e9eaef78]">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#30459D] text-white flex items-center justify-center font-medium">
                            {comment.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline justify-between mb-1">
                                <p className="font-medium text-gray-800">
                                    {comment.author?.name || 'Anonymous'}
                                </p>
                                <span className="text-xs text-gray-500">
                                    {formatDate(comment.createdAt)}
                                </span>
                            </div>
                            <p className="text-gray-700 text-[15px] leading-relaxed">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BlogCommentList;