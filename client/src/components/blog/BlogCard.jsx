import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/formatDate'
import { valideURLConvert } from '../../utils/valideURLConvert'

const BlogCard = ({ post, featured = false }) => {
    const postUrl = `/blog/${valideURLConvert(post.title)}-${post._id}`

    return (
        <div className={`bg-white rounded-xl shadow-md overflow-hidden ${featured ? 'md:col-span-2' : ''}`}>
            <Link to={postUrl} className="block h-48 overflow-hidden">
                <img 
                    src={post.featuredImage || '/images/blog-placeholder.jpg'} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
            </Link>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                    {post.categories.map(category => (
                        <span 
                            key={category._id} 
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                        >
                            {category.name}
                        </span>
                    ))}
                    <span className="text-gray-500 text-sm">{post.readTime} min read</span>
                </div>
                <Link to={postUrl}>
                    <h3 className={`font-bold mb-2 ${featured ? 'text-xl' : 'text-lg'} hover:text-primary-200`}>
                        {post.title}
                    </h3>
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium text-sm">
                            {post.author?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{post.author?.name}</p>
                            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                        </div>
                    </div>
                    <Link 
                        to={postUrl} 
                        className="text-primary-200 hover:text-primary-300 font-medium text-sm"
                    >
                        Read →
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default BlogCard