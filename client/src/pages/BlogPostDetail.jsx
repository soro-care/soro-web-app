// BlogPostDetail.js
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import BlogCommentForm from '../components/blog/BlogCommentForm';
import BlogCommentList from '../components/blog/BlogCommentList';

const BlogPostDetail = () => {
    const { postSlug } = useParams();
    const navigate = useNavigate();
    const user = useSelector(state => state.user);
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Skeleton Loaders
    const PostSkeleton = () => (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
        </div>
    );

    const CommentSkeleton = () => (
        <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const fetchPostAndComments = async () => {
        try {
            setLoading(true);
            const response = await Axios.get(`/api/blog/get/${postSlug}`);
            if (response.data.success) {
                setPost(response.data.data);
                setComments(response.data.data.comments || []);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load post');
            console.error('Error fetching post:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewComment = async () => {
        try {
            setCommentsLoading(true);
            const response = await Axios.get(`/api/blog/get/${postSlug}`);
            if (response.data.success) {
                setComments(response.data.data.comments || []);
            }
        } catch (error) {
            console.error("Failed to refresh comments:", error);
        } finally {
            setCommentsLoading(false);
        }
    };

    useEffect(() => {
        fetchPostAndComments();
    }, [postSlug]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Generate description from content if excerpt doesn't exist
    const getDescription = () => {
        if (post?.excerpt) return post.excerpt;
        if (post?.content) {
            // Remove HTML tags and get first 160 characters
            const plainText = post.content.replace(/<[^>]*>/g, '');
            return plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
        }
        return 'Read this article on Soro';
    };

    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
    
    return (
        <div className={`${user?._id ? 'md:ml-64' : ''} bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7] min-h-screen`}>
            {/* Helmet for meta tags */}
            <Helmet>
                <title>{post ? `${post.title} | Soro` : 'Loading... | Soro'}</title>
                <meta name="description" content={getDescription()} />
                
                {/* Open Graph Meta Tags */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={post?.title || 'Soro Article'} />
                <meta property="og:description" content={getDescription()} />
                <meta property="og:image" content={post?.featuredImage || 'https://res.cloudinary.com/dc6ndqxuz/image/upload/v1757350261/soro-logo.png'} />
                <meta property="og:url" content={`https://soro.care/drops/${postSlug}`} />
                <meta property="og:site_name" content="Soro" />
                
                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post?.title || 'Soro Article'} />
                <meta name="twitter:description" content={getDescription()} />
                <meta name="twitter:image" content={post?.featuredImage || 'https://res.cloudinary.com/dc6ndqxuz/image/upload/v1757350261/soro-logo.png'} />
                
                {/* Additional article tags */}
                {post && (
                    <>
                        <meta property="article:published_time" content={post.createdAt} />
                        <meta property="article:author" content={post.writtenBy} />
                        {post.tags && post.tags.map(tag => (
                            <meta key={tag} property="article:tag" content={tag} />
                        ))}
                    </>
                )}
            </Helmet>
            
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Blog Post Content */}
                {loading ? <PostSkeleton /> : post && (
                    <article className="mb-12">
                        <header className="mb-8">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="text-gray-500 text-sm">
                                    {post.readTime || 5} min read • {formatDate(post.createdAt)}
                                </span>
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {post.title}
                            </h1>
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        by {post.writtenBy}
                                    </p>
                                </div>
                            </div>
                        </header>

                        {post.featuredImage && (
                            <figure className="mb-8 rounded-xl overflow-hidden shadow-lg">
                                <img 
                                    src={post.featuredImage} 
                                    alt={post.title}
                                    className="w-full h-auto max-h-[500px] object-cover"
                                    loading="lazy"
                                />
                            </figure>
                        )}

                        <section 
                            className="prose prose-lg max-w-none mb-12"
                            dangerouslySetInnerHTML={{ __html: post.content }} 
                        />

                        {post.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {post.tags.map(tag => (
                                    <span key={tag} className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </article>
                )}

                {/* Comments Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
                    </h2>
                    
                    <BlogCommentForm postId={post?._id} onCommentAdded={handleNewComment} />
                    
                    {commentsLoading ? (
                        <CommentSkeleton />
                    ) : (
                        <BlogCommentList comments={comments} />
                    )}
                </section>
            </div>
        </div>
    );
};

export default BlogPostDetail;