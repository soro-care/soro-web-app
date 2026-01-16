// StoryDetail.jsx - MODERN X/TWITTER-STYLE UI WITH FIXED SCROLLING
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async'; 
import { 
  Heart, ArrowLeft, Clock, MessageCircle, Share,
  MoreHorizontal, X, User, ExternalLink, ChevronUp
} from 'lucide-react';
import {
  FaRegComment,
  FaRegHeart,
  FaHeart,
  FaWhatsapp,
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaCopy
} from 'react-icons/fa';
import Axios from '../utils/Axios';
import { CookieManager } from '../utils/cookieManager';
import { HugButton } from '../components/HugButton';

const StoryDetail = ({ story, room, onBack, onLike, onShare, formatTime, onOpenStory }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [relatedStories, setRelatedStories] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const storyUrl = `https://soro.care/echoes/room/${room.id}/story/${story._id}`;
  const shareText = `${story.content.substring(0, 100)}... Read full story on Soro Echoes`;
  const storyAuthorName = story.authorName || 'Anonymous';

  console.log(story, 'story')
  
  // Initialize username from cookies
  useEffect(() => {
    const storedUsername = CookieManager.getStoredUsername();
    if (storedUsername) {
      setAuthorName(storedUsername);
    }
  }, []);
  
  // Load comments
  useEffect(() => {
    fetchComments();
  }, [story._id]);
  
  // Load related stories
  useEffect(() => {
    const fetchRelatedStories = async () => {
      setLoadingRelated(true);
      try {
        const response = await Axios.get(`/api/echo/room/${room.id}/related`, {
          params: {
            limit: 3,
            exclude: story._id
          }
        });
        
        if (response.data.success) {
          setRelatedStories(response.data.data.echoes || []);
        }
      } catch (error) {
        console.error('Error fetching related stories:', error);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (room.id && story._id) {
      fetchRelatedStories();
    }
  }, [room.id, story._id]);

  // Handle scroll events for scroll-to-top button
  const scrollRef = React.useRef(null);

useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  const handleScroll = () => {
    setShowScrollTop(el.scrollTop > 300);
  };

  el.addEventListener('scroll', handleScroll, { passive: true });
  return () => el.removeEventListener('scroll', handleScroll);
}, []);


  // Scroll to top function - ONLY for the button click
  const scrollToTop = () => {
  scrollRef.current?.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};
  
  const validateAuthorName = (name) => {
    const trimmed = name.trim();
    
    if (!trimmed) {
      return 'Please enter a display name';
    }
    
    if (trimmed.length < 2) {
      return 'Name must be at least 2 characters';
    }
    
    if (trimmed.length > 30) {
      return 'Name cannot exceed 30 characters';
    }
    
    const invalidChars = /[<>{}[\]\\]/;
    if (invalidChars.test(trimmed)) {
      return 'Name contains invalid characters';
    }
    
    return '';
  };
  
  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const userId = CookieManager.getOrCreateUserId();
      const response = await Axios.get(`/api/echo/${story._id}/comments`, {
        headers: {
          'x-anon-user-id': userId
        }
      });
      
      if (response.data.success) {
        setComments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  const handleShareStory = async (platform) => {
    let shareUrl = '';
    
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + storyUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storyUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'instagram':
        await navigator.clipboard.writeText(storyUrl);
        alert('Link copied for Instagram! You can paste it in your Instagram story or post.');
        setShowShareMenu(false);
        return;
      default:
        return;
    }
    
    await onShare(story._id, platform, storyAuthorName);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storyUrl);
      alert('Link copied to clipboard!');
      await onShare(story._id, 'copy', storyAuthorName);
      setShowShareMenu(false);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const handleLikeClick = async () => {
    await onLike(story._id, storyAuthorName);
  };
  
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    // Validate author name
    const nameError = validateAuthorName(authorName);
    if (nameError) {
      alert(nameError);
      return;
    }
    
    if (newComment.trim().length < 3) {
      alert('Comment must be at least 3 characters');
      return;
    }
    
    setIsSubmittingComment(true);
    try {
      const userId = CookieManager.getOrCreateUserId();
      
      // Store username in cookie for future use
      if (authorName.trim()) {
        CookieManager.storeUsername(authorName.trim());
      }

      const response = await Axios.post(
        `/api/echo/${story._id}/comment`,
        {
          content: newComment.trim(),
          username: authorName.trim()
        },
        {
          headers: {
            'x-anon-user-id': userId
          }
        }
      );

      if (response.data.success) {
        setNewComment('');
        fetchComments(); // Refresh comments
        setShowCommentModal(false);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const storyPreview = story.content.substring(0, 150);
  const storyMetaInfo = {
    title: `"${storyPreview}..." - ${room.name} | Soro Echoes`,
    description: `Read this anonymous story about ${room.name.toLowerCase()}: ${storyPreview}... Share and find support in Soro Echoes.`,
    url: storyUrl,
    image: 'https://res.cloudinary.com/dc6ndqxuz/image/upload/v1757350261/soro-logo.png'
  };
  
  const handleOpenRelatedStory = (relatedStory) => {
    if (onOpenStory) {
      onOpenStory(relatedStory);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{storyMetaInfo.title}</title>
        <meta name="description" content={storyMetaInfo.description} />
        <meta property="og:title" content={storyMetaInfo.title} />
        <meta property="og:description" content={storyMetaInfo.description} />
        <meta property="og:image" content={storyMetaInfo.image} />
        <meta property="og:url" content={storyMetaInfo.url} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={storyMetaInfo.title} />
        <meta name="twitter:description" content={storyMetaInfo.description} />
        <meta name="twitter:image" content={storyMetaInfo.image} />
        <link rel="canonical" href={storyMetaInfo.url} />
      </Helmet>
      
      {/* Comment Modal */}
      <AnimatePresence>
        {showCommentModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 ">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-gradient-to-b from-[#0a0a2a] to-[#1a1a3a] backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <h3 className="text-lg font-semibold text-white">Add a comment</h3>
                <div className="w-10"></div>
              </div>
              
              {/* Original Story Preview */}
              <div className="p-4 border-b border-white/10">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{storyAuthorName}</span>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-500 text-sm">{formatTime(story.createdAt)}</span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">{story.content}</p>
                  </div>
                </div>
              </div>
              
              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add your comment..."
                      className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none text-lg"
                      rows={3}
                      autoFocus
                      maxLength={1000}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="Your name"
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          maxLength={30}
                        />
                        <span className="text-gray-500 text-sm">
                          {newComment.length}/1000
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={newComment.trim().length < 3 || isSubmittingComment || !authorName.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-[#1a237e] to-[#30459D] text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#30459D]/30 transition-all"
                      >
                        {isSubmittingComment ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Share Menu Modal - UPDATED WITH INSTAGRAM */}
      <AnimatePresence>
        {showShareMenu && (
          <div 
            className="fixed inset-0 z-[9998] flex items-end justify-center p-4 bg-black/60"
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="relative w-full max-w-lg bg-gradient-to-b from-[#0a0a2a] to-[#1a1a3a] backdrop-blur-xl rounded-t-2xl shadow-2xl border-t border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-1 bg-white/30 rounded-full"></div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Share this Echo</h3>
                
                <div className="grid grid-cols-5 gap-2 mb-6">
                  <button
                    onClick={() => handleShareStory('whatsapp')}
                    className="flex flex-col items-center gap-2 p-3 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center">
                      <FaWhatsapp className="text-2xl text-white" />
                    </div>
                    <span className="text-xs text-gray-300">WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => handleShareStory('twitter')}
                    className="flex flex-col items-center gap-2 p-3 bg-blue-800/10 hover:bg-blue-800/20 rounded-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-800/20 flex items-center justify-center">
                      <FaTwitter className="text-2xl text-white" />
                    </div>
                    <span className="text-xs text-gray-300">Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => handleShareStory('instagram')}
                    className="flex flex-col items-center gap-2 p-3 bg-pink-500/10 hover:bg-pink-500/20 rounded-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <FaInstagram className="text-2xl text-white" />
                    </div>
                    <span className="text-xs text-gray-300">Instagram</span>
                  </button>
                  
                  <button
                    onClick={() => handleShareStory('facebook')}
                    className="flex flex-col items-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <FaFacebookF className="text-2xl text-white" />
                    </div>
                    <span className="text-xs text-gray-300">Facebook</span>
                  </button>
                  
                  <button
                    onClick={handleCopyLink}
                    className="flex flex-col items-center gap-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <FaCopy className="text-2xl text-white" />
                    </div>
                    <span className="text-xs text-gray-300">Copy</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mb-3">
                  Sharing stories spreads hope and reminds others they're not alone
                </p>
                
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="w-full py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Main Content - X/Twitter Style - REMOVED scroll-smooth from container */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a2a] via-[#1a1a3a] to-[#0a0a2a] text-white overflow-hidden">
        {/* Fixed Header */}
        <div className="sticky top-0 z-40 bg-gradient-to-b from-[#0a0a2a]/90 to-[#1a1a3a]/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center px-4 py-3">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/10 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Echo</h1>
            </div>
            
          </div>
        </div>
        
        {/* Story Content */}
        <div
        ref={scrollRef}
        className="h-[calc(100vh-56px)] overflow-y-auto overscroll-contain">
          <div className="max-w-2xl mx-auto">
            {/* Author Info */}
            <div className="px-4 pt-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1a237e] to-[#30459D] flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-medium text-lg">{storyAuthorName}</h2>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(story.createdAt)}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-200 rounded-full text-xs">
                          {room.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Story Text */}
            <div className="py-6 mx-4 my-3">
              <p className="text-xl leading-relaxed whitespace-pre-wrap">{story.content}</p>
              
              
              {/* Stats - NO WORD COUNT */}
              <div className="flex items-center gap-6 text-gray-400 text-sm mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{story.likesCount || 0}</span>
                  <span>Likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{comments.length}</span>
                  <span>Comments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{story.shareCount || 0}</span>
                  <span>Shares</span>
                </div>
              </div>
            </div>
            
            {/* Action Bar - NO BOOKMARK */}
            <div className="px-4 py-3 border-y border-white/10 backdrop-blur-md bg-white/1 my-3">
              <div className="flex items-center justify-around">
                {/* Comment Button */}
                <button
                  onClick={() => setShowCommentModal(true)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-blue-500/10 group"
                >
                  <div className="p-2 rounded-full group-hover:bg-blue-500/20">
                    <FaRegComment className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-blue-400">{comments.length}</span>
                </button>
                
                {/* Like Button */}
                <HugButton
                    count={story.likesCount || 0}
                    isHugged={story.userHasLiked}
                    onHug={() => handleLikeClick(story._id)}
                    size="md"
                    showCount={true}
                 />
                
                {/* Share Button */}
                <button
                  onClick={() => setShowShareMenu(true)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-green-500/10 group"
                >
                  <div className="p-2 rounded-full group-hover:bg-green-500/20">
                    <Share className="w-5 h-5 text-gray-400 group-hover:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-green-400">{story.shareCount || 0}</span>
                </button>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Comments</h3>
              </div>
              
              
              
              {/* Comments List */}
              <div className="space-y-4">
                {isLoadingComments ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-400">Loading comments...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white/5 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-gray-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">No comments yet</h4>
                    <p className="text-gray-400">Be the first to share your thoughts</p>
                  </div>
                ) : (
                  comments.map((comment, index) => (
                    <motion.div
                      key={comment._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gradient-to-br from-[#e8e8eb0e] to-[#30469d00] rounded-2xl border border-white/10"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-800 to-pink-700 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{comment.username}</span>
                              {comment.isMine && (
                                <span className="px-2 py-0.5 bg-gradient-to-r from-[#1a237e] to-[#30459D] text-white rounded-full text-xs">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
                          </div>
                          <p className="text-gray-300">{comment.content}</p>
                          {/* NO LIKE AND REPLY BUTTONS */}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              {/* Load More Comments */}
              {comments.length > 5 && (
                <div className="text-center mt-6">
                  <button className="px-6 py-2 bg-gradient-to-r from-[#1a237e] to-[#30459D] text-white rounded-full hover:shadow-lg hover:shadow-[#30459D]/30 transition-all">
                    Load more comments
                  </button>
                </div>
              )}
            </div>
            
            {/* Related Stories */}
            <div className="px-4 py-6">
              <h3 className="text-xl font-bold mb-4 text-white">More from {room.name}</h3>
              {loadingRelated ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : relatedStories.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No other stories in this room yet</p>
              ) : (
                <div className="space-y-3">
                  {relatedStories.map((relatedStory, index) => (
                    <div 
                      key={relatedStory._id || index}
                      className="p-3 bg-gradient-to-r from-[#e8e8eb0e] to-[#30469d00] rounded-xl hover:from-white/10 hover:to-white/15 transition-all border border-white/10 cursor-pointer"
                      onClick={() => handleOpenRelatedStory(relatedStory)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-800 to-blue-900 flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-400">
                          {relatedStory.authorName || 'Anonymous'} • {formatTime(relatedStory.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-300 line-clamp-2">{relatedStory.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        

       {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="hidden md:flex fixed bottom-20 right-6 z-40 w-12 h-12 bg-gradient-to-r from-[#1a237e] to-[#30459D] text-white rounded-full items-center justify-center shadow-lg hover:shadow-[#30459D]/30 transition-all"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}
      </div>
    </>
  );
};

export default StoryDetail;