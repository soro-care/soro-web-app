// RoomDetail.jsx - UPDATED VERSION WITH ALL FIXES
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async'; 
import { 
  Heart, MessageCircle, Search, X, ArrowLeft, Sparkles, 
  Clock, ChevronUp, Share, ExternalLink, Send, AlertTriangle, User,
  Wifi
} from 'lucide-react';
import {
  FaWhatsapp,
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaCopy,
  FaShare
} from 'react-icons/fa';
import { CookieManager } from '../utils/cookieManager';
import { HugButton } from '../components/HugButton';

// Share Modal Component - UPDATED WITH INSTAGRAM
const ShareModal = React.memo(({ 
  story, 
  room, 
  formatTime, 
  onClose,
  onSharePlatform,
  onCopyText,
  copied
}) => {
  if (!story) return null;

  const storyUrl = `https://soro.care/echoes/room/${room.id}/story/${story._id}`;
  const shareText = `${story.content.substring(0, 100)}... Read full story on Soro Echoes`;
  const storyAuthorName = story.authorName || 'Anonymous';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9998] flex items-end justify-center p-4 bg-black/60"
        onClick={onClose}
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
                onClick={() => onSharePlatform('whatsapp')}
                className="flex flex-col items-center gap-2 p-3 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center">
                  <FaWhatsapp className="text-2xl text-white" />
                </div>
                <span className="text-xs text-gray-300">WhatsApp</span>
              </button>
              
              <button
                onClick={() => onSharePlatform('twitter')}
                className="flex flex-col items-center gap-2 p-3 bg-blue-800/10 hover:bg-blue-800/20 rounded-xl transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-800/20 flex items-center justify-center">
                  <FaTwitter className="text-2xl text-white" />
                </div>
                <span className="text-xs text-gray-300">Twitter</span>
              </button>
              
              <button
                onClick={() => onSharePlatform('instagram')}
                className="flex flex-col items-center gap-2 p-3 bg-pink-500/10 hover:bg-pink-500/20 rounded-xl transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <FaInstagram className="text-2xl text-white" />
                </div>
                <span className="text-xs text-gray-300">Instagram</span>
              </button>
              
              <button
                onClick={() => onSharePlatform('facebook')}
                className="flex flex-col items-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FaFacebookF className="text-2xl text-white" />
                </div>
                <span className="text-xs text-gray-300">Facebook</span>
              </button>
              
              <button
                onClick={onCopyText}
                className="flex flex-col items-center gap-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <FaCopy className="text-2xl text-white" />
                </div>
                <span className="text-xs text-gray-300">Copy</span>
              </button>
            </div>
            
            {/* Story Preview */}
            <div className="mb-4 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
              <p className="text-sm text-gray-300 line-clamp-3">
                "{story.content.substring(0, 150)}..."
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatTime(story.createdAt)}</span>
                <span>•</span>
                <span>By: {storyAuthorName}</span>
                <span>•</span>
                <span>{room.name}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-blue-400">
                <ExternalLink className="w-3 h-3" />
                <span className="truncate">{storyUrl}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center mb-3">
              Sharing stories spreads hope and reminds others they're not alone
            </p>
            
            <button
              onClick={onClose}
              className="w-full py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

ShareModal.displayName = 'ShareModal';

const ReleaseEchoModal = React.memo(({
  selectedRoom,
  authorName,
  authorNameError,
  handleAuthorNameChange,
  newStory,
  setNewStory,
  isSubmitting,
  handleSubmit,
  onClose,
}) => {
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-gradient-to-b from-[#0a0a2a] to-[#1a1a3a]
                     backdrop-blur-xl shadow-2xl border-b border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Pull Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-white/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div>
              <h3 className="text-white font-semibold text-lg">
                Release an Echo
              </h3>
              <p className="text-xs text-gray-400">
                Share in {selectedRoom.name}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-6 space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">
                Display Name *
              </label>
              <input
                value={authorName}
                onChange={(e) => handleAuthorNameChange(e.target.value)}
                placeholder="2–30 characters"
                className={`w-full px-4 py-2 bg-black/30 rounded-xl border
                  ${authorNameError ? 'border-red-500/50' : 'border-white/10'}
                  text-white placeholder-gray-500 focus:outline-none`}
              />
              {authorNameError && (
                <p className="text-xs text-red-400 mt-1">{authorNameError}</p>
              )}
            </div>

            {/* Story */}
            <textarea
              value={newStory}
              onChange={(e) => setNewStory(e.target.value)}
              placeholder="What’s on your mind?"
              rows={4}
              className="w-full px-4 py-3 bg-black/30 rounded-xl border border-white/10
                         text-white placeholder-gray-500 resize-none focus:outline-none"
            />

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {newStory.length}/2000
              </span>

              <button
                onClick={handleSubmit}
                disabled={
                  newStory.trim().length < 10 ||
                  !authorName.trim() ||
                  isSubmitting ||
                  authorNameError
                }
                className="px-5 py-2 bg-gradient-to-r from-[#1a237e] to-[#30459D]
                           text-white rounded-lg font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Sharing…' : 'Release Echo'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

ReleaseEchoModal.displayName = 'ReleaseEchoModal';


const CommentModal = React.memo(({
  story,
  room,
  formatTime,
  onClose,
  authorName,
  setAuthorName,
  newComment,
  setNewComment,
  isSubmittingComment,
  handleSubmitComment,
  validateAuthorName
}) => {
  const storyAuthorName = story.authorName || 'Anonymous';
  const authorNameError = validateAuthorName(authorName);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
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
            onClick={onClose}
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
                  disabled={newComment.trim().length < 3 || isSubmittingComment || !authorName.trim() || authorNameError}
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
  );
});

CommentModal.displayName = 'CommentModal';

const CrisisModal = React.memo(({ 
  onReturnToEchoes, 
  onContinueToSupport, 
  onBookSession 
}) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-gradient-to-br from-red-900/30 to-red-800/20 backdrop-blur-xl rounded-3xl border border-red-500/30 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
        
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">We're Here for You</h3>
              <p className="text-gray-300 text-sm">Immediate support is available</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-gray-200">
              We care about your safety. Please reach out to one of these resources immediately:
            </p>
            
            <div className="space-y-3">
              {[
                "Safe Place Nigeria: 0800 800 2000",
                "SURPIN Crisis Line: +2349034400009",
                "MANI Support Line: 08091116264",
                "Immediate help: Go to the nearest emergency room or call emergency services"
              ].map((resource, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                  </div>
                  <p className="text-sm text-gray-300">{resource}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onBookSession}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all"
            >
              Book an Immediate Session
            </button>
            
            <button
              onClick={onContinueToSupport}
              className="w-full py-3 px-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              I'll Reach Out for Help
            </button>
            
            <button
              onClick={onReturnToEchoes}
              className="w-full py-3 px-4 text-gray-400 hover:text-white transition-colors"
            >
              Return to Echoes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

CrisisModal.displayName = 'CrisisModal';

const RoomDetail = React.memo(({ 
  selectedRoom,
  stories,
  newStory,
  setNewStory,
  searchTerm,
  setSearchTerm,
  showSubmitForm,
  setShowSubmitForm,
  isSubmitting,
  handleSubmitStory,
  roomStats,
  handleBackToHome,
  handleLike,
  handleShare,
  handleOpenStory,
  formatTime,
  showCrisisModal,
  showAssuranceModal,
  crisisResources,
  handleReturnToEchoes,
  handleContinueToSupport,
  handleBookSessionFromCrisis,
  handleBookSessionFromAssurance,
  handleAssuranceModalClose,
  animations
}) => {
  const storiesEndRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shareModalData, setShareModalData] = useState(null);
  const [commentModalData, setCommentModalData] = useState(null);
  const [commentAuthorName, setCommentAuthorName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // New state for author name
  const [authorName, setAuthorName] = useState('');
  const [authorNameError, setAuthorNameError] = useState('');

  // Initialize author name from cookies on component mount
  useEffect(() => {
    const storedUsername = CookieManager.getStoredUsername();
    if (storedUsername) {
      setAuthorName(storedUsername);
      setCommentAuthorName(storedUsername);
    }
  }, []);

  // Add smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const openShareModal = useCallback((story) => {
    setShareModalData(story);
    setShowShareModal(story._id);
  }, []);

  const closeShareModal = useCallback(() => {
    setShowShareModal(null);
    setShareModalData(null);
  }, []);

  const openCommentModal = useCallback((story) => {
    setCommentModalData(story);
    setShowCommentModal(story._id);
  }, []);

  const closeCommentModal = useCallback(() => {
    setShowCommentModal(null);
    setCommentModalData(null);
    setNewComment('');
  }, []);

  const handleSharePlatform = useCallback(async (platform) => {
    if (!shareModalData) return;
    
    const storyAuthorName = shareModalData.authorName || 'Anonymous';
    await handleShare(shareModalData._id, platform, storyAuthorName);
    
    let shareUrl = '';
    const storyUrl = `https://soro.care/echoes/room/${selectedRoom.id}/story/${shareModalData._id}`;
    const shareText = `${shareModalData.content.substring(0, 100)}... Read full story: ${storyUrl}`;
    
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
        closeShareModal();
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
    closeShareModal();
  }, [shareModalData, selectedRoom.id, handleShare, closeShareModal]);

  const handleCopyText = useCallback(async () => {
    if (!shareModalData) return;
    
    const storyUrl = `https://soro.care/echoes/room/${selectedRoom.id}/story/${shareModalData._id}`;
    const storyAuthorName = shareModalData.authorName || 'Anonymous';
    
    await navigator.clipboard.writeText(storyUrl);
    setCopied(true);
    
    // Track the share
    await handleShare(shareModalData._id, 'copy', storyAuthorName);
    
    setTimeout(() => {
      setCopied(false);
      closeShareModal();
    }, 2000);
  }, [shareModalData, selectedRoom.id, handleShare, closeShareModal]);

  // Validate author name
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
    
    // Check for invalid characters
    const invalidChars = /[<>{}[\]\\]/;
    if (invalidChars.test(trimmed)) {
      return 'Name contains invalid characters';
    }
    
    return '';
  };

  // Handle author name change
  const handleAuthorNameChange = (value) => {
    setAuthorName(value);
    const error = validateAuthorName(value);
    setAuthorNameError(error);
  };

  // Handle comment author name change
  const handleCommentAuthorNameChange = (value) => {
    setCommentAuthorName(value);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentModalData) return;
    
    // Validate author name
    const nameError = validateAuthorName(commentAuthorName);
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
      if (commentAuthorName.trim()) {
        CookieManager.storeUsername(commentAuthorName.trim());
      }

      const response = await Axios.post(
        `/api/echo/${commentModalData._id}/comment`,
        {
          content: newComment.trim(),
          username: commentAuthorName.trim()
        },
        {
          headers: {
            'x-anon-user-id': userId
          }
        }
      );

      if (response.data.success) {
        setNewComment('');
        closeCommentModal();
        alert('Comment posted successfully!');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Override the handleSubmitStory to include authorName
  const handleSubmitWithAuthorName = async () => {
    // Validate author name
    const nameError = validateAuthorName(authorName);
    if (nameError) {
      setAuthorNameError(nameError);
      return;
    }

    // Validate story content
    if (newStory.trim().length < 10) {
      alert('Please share a bit more (at least 10 characters)');
      return;
    }

    // Store username in cookie for future use
    CookieManager.storeUsername(authorName.trim());

    // Call the original handleSubmitStory with author name
    await handleSubmitStory(newStory, authorName.trim());
  };

  const handleLikeClick = async (storyId) => {
    const story = stories.find(s => s._id === storyId);
    const storyAuthorName = story?.authorName || 'Anonymous';
    await handleLike(storyId, storyAuthorName);
  };

  const handleOpenStoryWithComments = (story) => {
    openCommentModal(story);
  };

  // Fix for roomStats - ensure it's properly accessing the data
  const getRoomStats = () => {
    const stats = roomStats[selectedRoom.id] || {};
    return {
      totalStories: stats.totalStories || '0',
      todaysStories: stats.todaysStories || '0'
    };
  };

  const roomMetaInfo = {
    title: `${selectedRoom.name} - Share Your Story | Soro Echoes`,
    description: `Share anonymous stories and read experiences about ${selectedRoom.description.toLowerCase()}. Find community support in the ${selectedRoom.name}. Join the conversation.`,
    url: `https://soro.care/echoes/room/${selectedRoom.id}`,
    image: 'https://res.cloudinary.com/dc6ndqxuz/image/upload/v1757350261/soro-logo.png'
  };

  return (
    <>
      <Helmet>
        <title>{roomMetaInfo.title}</title>
        <meta name="description" content={roomMetaInfo.description} />
        <meta property="og:title" content={roomMetaInfo.title} />
        <meta property="og:description" content={roomMetaInfo.description} />
        <meta property="og:image" content={roomMetaInfo.image} />
        <meta property="og:url" content={roomMetaInfo.url} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={roomMetaInfo.title} />
        <meta name="twitter:description" content={roomMetaInfo.description} />
        <meta name="twitter:image" content={roomMetaInfo.image} />
        <link rel="canonical" href={roomMetaInfo.url} />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a2a] via-[#1a1a3a] to-[#0a0a2a] relative scroll-smooth">
        {/* Room Header - Glassy Design */}
        <div className="sticky top-0 z-30">
          <div className={`relative ${selectedRoom.bgColor}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
            <div className="relative px-4 md:px-8 py-4 md:py-6 backdrop-blur-md">
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group mb-3 md:mb-4"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm md:text-base font-medium">Back to Rooms</span>
              </button>
              
              <div className="flex items-start gap-4 md:gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-3xl md:text-5xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center border border-white/20 shadow-xl md:shadow-2xl`}
                >
                  {selectedRoom.emoji}
                </motion.div>
                
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-1 md:mb-2"
                  >
                    <h1 className="text-xl md:text-3xl font-bold text-white truncate">{selectedRoom.name}</h1>
                  </motion.div>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm md:text-base text-white/90 mb-2 md:mb-3"
                  >
                    {selectedRoom.description}
                  </motion.p>
                  
                  <div className="flex items-center gap-4 text-xs md:text-sm text-white/80">
                    <div className="flex items-center gap-1 md:gap-2">
                      <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{getRoomStats().totalStories} stories</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{getRoomStats().todaysStories} today</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Anonymous Usernames</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showCrisisModal && (
          <CrisisModal
            onReturnToEchoes={handleReturnToEchoes}
            onContinueToSupport={handleContinueToSupport}
            onBookSession={handleBookSessionFromCrisis}
          />
        )}

        {/* Share Modal */}
        {showShareModal && shareModalData && (
          <ShareModal
            story={shareModalData}
            room={selectedRoom}
            formatTime={formatTime}
            onClose={closeShareModal}
            onSharePlatform={handleSharePlatform}
            onCopyText={handleCopyText}
            copied={copied}
          />
        )}

        {/* Comment Modal */}
        {showCommentModal && commentModalData && (
          <CommentModal
            story={commentModalData}
            room={selectedRoom}
            formatTime={formatTime}
            onClose={closeCommentModal}
            authorName={commentAuthorName}
            setAuthorName={handleCommentAuthorNameChange}
            newComment={newComment}
            setNewComment={setNewComment}
            isSubmittingComment={isSubmittingComment}
            handleSubmitComment={handleSubmitComment}
            validateAuthorName={validateAuthorName}
          />
        )}

         {showSubmitForm && (
            <ReleaseEchoModal
              selectedRoom={selectedRoom}
              authorName={authorName}
              authorNameError={authorNameError}
              handleAuthorNameChange={handleAuthorNameChange}
              newStory={newStory}
              setNewStory={setNewStory}
              isSubmitting={isSubmitting}
              handleSubmit={handleSubmitWithAuthorName}
              onClose={() => setShowSubmitForm(false)}
            />
          )}

        {/* DESKTOP Layout */}
        <div className="hidden md:flex relative z-10 px-8 py-6 gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar - Glassy */}
          <div className="w-80 flex-shrink-0 sticky top-24 self-start">
            <div className="bg-gradient-to-b from-[#e8e8eb0e] to-[#30469d00] rounded-2xl border border-white/10 p-6 shadow-xl">
              {/* Search */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Echoes
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Submit Form */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Share Your Echo
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Your anonymous story might help someone feel less alone
                </p>
                
                {/* Author Name Input */}
                <div className="mb-4">
                  <label className="text-sm text-gray-300 mb-1.5 block flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Your Display Name *
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => handleAuthorNameChange(e.target.value)}
                    placeholder="How should we call you? (2-30 chars)"
                    className={`w-full px-4 py-2.5 bg-black/30 border ${
                      authorNameError ? 'border-red-500/50' : 'border-white/10'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm backdrop-blur-sm`}
                    maxLength={30}
                  />
                  {authorNameError && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {authorNameError}
                    </p>
                  )}
                  {!authorNameError && authorName.trim() && (
                    <p className="text-xs text-green-400 mt-1.5">
                      ✓ Name looks good! It will be saved for future posts.
                    </p>
                  )}
                </div>
                
                {/* Story Content Input */}
                <textarea
                  value={newStory}
                  onChange={(e) => setNewStory(e.target.value)}
                  placeholder={`What's on your mind? Share your ${selectedRoom.type === 'struggle' ? 'struggle' : 'positive moment'}...`}
                  className="w-full h-32 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none text-sm mb-4 backdrop-blur-sm"
                />
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {newStory.length}/2000 characters
                  </div>
                  <button
                    onClick={handleSubmitWithAuthorName}
                    disabled={
                      newStory.trim().length < 10 || 
                      isSubmitting || 
                      !authorName.trim() || 
                      !!authorNameError
                    }
                    className="px-4 py-2 bg-gradient-to-r from-[#1a237e] to-[#30459D] text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#30459D]/30 transition-all"
                  >
                    {isSubmitting ? 'Sharing...' : 'Release Echo'}
                  </button>
                </div>
              </div>

              {/* Desktop Stats - Glassy */}
              <div className="pt-6 border-t border-white/10">
                <div className="text-sm text-gray-400 mb-2">Room Stats</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-gray-400">Total Stories</div>
                    <div className="text-lg font-bold text-white">{getRoomStats().totalStories}</div>
                  </div>
                  <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-gray-400">Today</div>
                    <div className="text-lg font-bold text-white">{getRoomStats().todaysStories}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Stories Feed */}
          <div className="flex-1 min-h-0">
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)] pr-2 scroll-smooth">
              {stories.length === 0 ? (
                <div className="bg-gradient-to-b from-[#e8e8eb0e] to-[#30469d00] rounded-2xl p-12 text-center border border-dashed border-white/10">
                  <div className="text-6xl mb-4">{selectedRoom.emoji}</div>
                  <h3 className="font-semibold text-white text-xl mb-3">
                    {searchTerm ? 'No echoes found' : 'Be the first to share'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm 
                      ? 'Try a different search term' 
                      : 'Your story could help someone feel less alone today'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowSubmitForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-[#1a237e] to-[#30459D] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#30459D]/30 transition-all"
                    >
                      Share Your Echo
                    </button>
                  )}
                </div>
              ) : (
                stories
                  .filter(story => 
                    !searchTerm || 
                    story.content.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((story, index) => (
                    <motion.div
                      key={story._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg border border-white/10 p-6 hover:from-white/10 hover:to-white/15 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                      onClick={() => handleOpenStory(story)}
                    >
                      <p className="text-gray-200 leading-relaxed mb-4 whitespace-pre-wrap line-clamp-4">
                        {story.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span>{formatTime(story.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="font-medium text-gray-300">{story.authorName || 'Anonymous'}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Like Button */}
                          <HugButton
                            count={story.likesCount || 0}
                            isHugged={story.userHasLiked}
                            onHug={() => handleLikeClick(story._id)}
                            size="md"
                            showCount={true}
                          />
                          
                          {/* Comment Count - Opens comment modal */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleOpenStoryWithComments(story);
                            }}
                            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
                          >
                            <div className="p-1.5 rounded-full group-hover:bg-blue-500/10">
                              <MessageCircle size={16} />
                            </div>
                            <span className="font-medium">{story.comments?.length || story.commentCount || 0}</span>
                          </button>
                          
                          {/* Share Button */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              openShareModal(story);
                            }}
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Share size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
              )}
              <div ref={storiesEndRef} />
            </div>
          </div>
        </div>

        {/* MOBILE Layout */}
        <div className="md:hidden relative z-10 px-4 py-6">
          {/* Search Bar - Glassy */}
          <div className="bg-gradient-to-b from-[#e8e8eb0e] to-[#30469d00] rounded-2xl border border-white/10 p-4 mb-6 shadow-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white-400" size={18} />
              <input
                type="text"
                placeholder="Search echoes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Floating Share Button for Mobile */}
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-[#1a237e] to-[#30459D] text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#30459D]/30 transition-all active:scale-95 backdrop-blur-sm"
          >
            {showSubmitForm ? (
              <X size={24} />
            ) : (
              <Wifi className="rotate-45 animate-bounce" size={20} />
            )}
          </button>

          {/* Stories Feed for Mobile */}
          <div 
            className="space-y-3 pb-24 overflow-y-auto scroll-smooth"
            style={{
              WebkitOverflowScrolling: 'touch',
              maxHeight: 'calc(100vh - 200px)'
            }}
          >
            {stories.length === 0 ? (
              <div className="bg-gradient-to-b from-[#e8e8eb0e] to-[#30469d00] rounded-2xl p-8 text-center border border-dashed border-white/10">
                <div className="text-4xl mb-3">{selectedRoom.emoji}</div>
                <h3 className="font-semibold text-white text-lg mb-2">
                  {searchTerm ? 'No echoes found' : 'Be the first to share'}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {searchTerm 
                    ? 'Try a different search term' 
                    : 'Your story could help someone feel less alone today'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#1a237e] to-[#30459D] text-white rounded-xl font-medium text-sm"
                  >
                    Share Your Echo
                  </button>
                )}
              </div>
            ) : (
              stories
                .filter(story => 
                  !searchTerm || 
                  story.content.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((story, index) => (
                  <div
                    key={story._id || index}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8e8eb0e] to-[#30469d00] border border-white/10 p-4 shadow-lg"
                    onClick={() => handleOpenStory(story)}
                    style={{ touchAction: 'pan-y' }}
                  >
                    <div className="relative z-10">
                      <p className="text-gray-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap line-clamp-4">
                        {story.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">
                            {formatTime(story.createdAt)}
                          </span>
                          <span className="text-gray-300 font-medium flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {story.authorName || 'Anonymous'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Like Button */}
                         <HugButton
                          count={story.likesCount || 0}
                          isHugged={story.userHasLiked}
                          onHug={() => handleLikeClick(story._id)}
                          size="sm"
                          showCount={true}
                        />
                          
                          {/* Comment Count - Opens comment modal */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleOpenStoryWithComments(story);
                            }}
                            className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
                          >
                            <MessageCircle size={14} />
                            <span className="font-medium">{story.comments?.length || story.commentCount || 0}</span>
                          </button>
                          
                          {/* Share Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              openShareModal(story);
                            }}
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Share size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
            <div ref={storiesEndRef} />
          </div>
        </div>

        {/* Scroll to top button */}
        {stories.length > 5 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hidden md:flex fixed bottom-8 right-8 z-40 w-12 h-12 bg-gradient-to-r from-[#1a237e] to-[#30459D] text-white rounded-full items-center justify-center shadow-lg hover:shadow-[#30459D]/30 transition-all active:scale-95 backdrop-blur-sm"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}
      </div>
    </>
  );
});

RoomDetail.displayName = 'RoomDetail';
export default RoomDetail;