import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { ArrowRight, Clock, Calendar, Heart, Send } from 'lucide-react'
import { motion } from 'framer-motion'

const Blog = () => {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const user = useSelector(state => state.user)

    const fetchBlogs = async () => {
        try {
            setLoading(true)
            const response = await Axios({ ...SummaryApi.getAllBlogs })
            if (response.data.success) {
                setBlogs(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching blogs:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBlogs()
    }, [])

    const createMarkup = (html) => {
    return { __html: html };
    };

    // Blog Skeleton Loader Component
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
        <div className={`${user?._id ? 'p-4 py-8 md:ml-64 md:px-8 md:py-12' : ''} min-h-screen bg-transparent`}>
            <div className="container mx-auto px-4 py-12 relative">
                {/* Page Header with Animation */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-3xl md:text-3xl font-bold text-[#190D39] mb-4 font-Literata italic tracking-tight">
                        Soro <span className="text-[#190D39]">Drops</span>
                    </h1>
                    {/* <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Dive into our collection of mental wellness stories, mindfulness tips, and personal growth journeys
                    </p> */}
                    <div className="mt-3 text-2xl md:text-3xl">
                        <div className="inline-block h-1 w-20 bg-[#190D39] rounded-full"></div>
                        <div className="inline-block h-1 w-6 bg-[#190D39] rounded-full mx-1"></div>
                        <div className="inline-block h-1 w-3 bg-[#190D39] rounded-full"></div>
                    </div>
                </motion.div>

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
                                {/* Image with overlay */}
                                <div className="relative h-48 overflow-hidden">
                                    <img 
                                        src={post.featuredImage || '/images/blog-placeholder.jpg'} 
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {post.categories?.slice(0, 2).map(category => (
                                                <span 
                                                    key={category._id} 
                                                    className="bg-[#30459D] text-white text-xs px-3 py-1 rounded-full font-medium"
                                                >
                                                    {category.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex items-center text-sm text-gray-500 mb-3 space-x-3">
                                        <span className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {post.readTime || 5} min read
                                        </span>
                                        <span className="flex items-center ml-auto">
                                            <Heart className="w-4 h-4 mr-1 text-[#30459D]" />
                                            {post.likes || 0}
                                        </span>
                                    </div>
                                    
                                    <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-[#30459D] transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    
                                    <p className="text-gray-600 mb-5 line-clamp-3"
                                        dangerouslySetInnerHTML={createMarkup(post.excerpt || post.content.substring(0, 150) + '...')}
                                    />
                                    
                                    <Link 
                                        to={`/drops/${post.slug || post._id}`} 
                                        className="inline-flex items-center text-[#30459D] hover:text-[#263685] font-medium group-hover:underline"
                                    >
                                        Continue reading 
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
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

                {!user?._id && !loading && blogs.length > 0 && (
                    // <motion.div
                    //     initial={{ opacity: 0 }}
                    //     animate={{ opacity: 1 }}
                    //     transition={{ delay: 0.3 }}
                    //     className="mt-16 bg-gradient-to-r from-[#30459D] to-[#190D39] rounded-2xl p-8 text-white overflow-hidden relative"
                    // >
                    //     <div className="relative z-10 max-w-2xl">
                    //         <h2 className="text-2xl md:text-3xl font-bold mb-3">Want more Soro Drops?</h2>
                    //         <p className="text-lg mb-6 opacity-90">Subscribe to get notified when we publish new articles</p>
                    //         <div className="flex flex-col sm:flex-row gap-3">
                    //             <input 
                    //                 type="email" 
                    //                 placeholder="Your email address" 
                    //                 className="flex-grow px-4 py-3 rounded-lg text-gray-800 focus:outline-none"
                    //             />
                    //             <button className="bg-white text-[#30459D] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    //                 Subscribe
                    //             </button>
                    //         </div>
                    //     </div>
                    //     <div className="absolute -right-10 -bottom-10 opacity-20">
                    //         <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    //             <path d="M100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200Z" fill="white"/>
                    //         </svg>
                    //     </div>
                    // </motion.div>
                    <section className="py-12 px-4 sm:px-6">
                    <div className="max-w-6xl mx-auto bg-gradient-to-l from-[#30459D] to-[#190D39] rounded-3xl p-8 sm:p-12 text-center">
                        <h2 className="text-2xl sm:text-3xl font-semibold font-Literata  italic text-white mb-4 sm:mb-6">
                        Ready to start your mental wellness journey?
                        </h2>
                        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of others who've found support through Soro.
                        </p>
                        <Link 
                        to="/register" 
                        className="bg-white hover:bg-gray-100 text-[#30459D] px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                        >
                        Get Started <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                    </section>
                )}
            </div>
        </div>
    )
}

export default Blog