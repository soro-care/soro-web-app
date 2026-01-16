// EchoRooms.jsx - FIXED AND OPTIMIZED VERSION
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CookieManager } from '../utils/cookieManager';
import { 
  Send, Heart, MessageSquare, Search, 
  X, ArrowLeft, Sparkles, Clock, Users, 
  ChevronRight, ChevronDown, ChevronUp,
  Calendar, ExternalLink, Share2
} from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import RoomDetail from './RoomDetail';
import StoryDetail from './StoryDetail';

const EchoRooms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, storyId } = useParams();
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomStats, setRoomStats] = useState({});
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showAssuranceModal, setShowAssuranceModal] = useState(false);
  const [crisisResources, setCrisisResources] = useState([]);
  const [authorName, setAuthorName] = useState('');
  const [authorNameError, setAuthorNameError] = useState('');
  
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);
  const lastTapTimeRef = useRef(0);
  const isProcessingTapRef = useRef(false);
  
  // Add this useEffect to initialize from cookies:
  useEffect(() => {
    const storedUsername = CookieManager.getStoredUsername();
    if (storedUsername) {
      setAuthorName(storedUsername);
    }
  }, []);
  
  // FIXED: Apply mobile-specific optimizations
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS || isAndroid) {
      // Add passive touch listeners to improve scrolling
      const addPassiveTouchListeners = () => {
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
        document.addEventListener('touchend', () => {}, { passive: true });
      };
      
      // Fix for iOS 100vh issue
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setVH();
      window.addEventListener('resize', setVH);
      addPassiveTouchListeners();
      
      return () => {
        window.removeEventListener('resize', setVH);
      };
    }
  }, []);

  // Room configuration
  const rooms = [
    {
      id: 'pressure',
      name: 'Room of Pressure',
      emoji: '💥',
      description: 'Academic stress, deadlines, expectations',
      type: 'struggle',
      bgColor: 'bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#30459D]'
    },
    {
      id: 'burnout',
      name: 'Room of Burnout',
      emoji: '🔥',
      description: 'Exhaustion, depletion, empty tank',
      type: 'struggle',
      bgColor: 'bg-gradient-to-br from-[#283593] via-[#30459D] to-[#3949ab]'
    },
    {
      id: 'not-enough',
      name: 'Room of Not-Enough',
      emoji: '🎭',
      description: 'Imposter syndrome & self-doubt',
      type: 'struggle',
      bgColor: 'bg-gradient-to-br from-[#3949ab] via-[#3f51b5] to-[#5c6bc0]'
    },
    {
      id: 'rage',
      name: 'Rage Room',
      emoji: '😤',
      description: 'Anger, frustration, and fury unleashed',
      type: 'struggle',
      bgColor: 'bg-gradient-to-br from-[#880e4f] via-[#c2185b] to-[#d32f2f]'
    },
    {
      id: 'gratitude',
      name: 'Room of Gratitude',
      emoji: '🙏',
      description: 'Thankfulness & appreciation',
      type: 'positive',
      bgColor: 'bg-gradient-to-br from-[#2979ff] via-[#448aff] to-[#82b1ff]'
    },
    {
      id: 'victory',
      name: 'Room of Victory',
      emoji: '🏆',
      description: 'Wins & achievements',
      type: 'positive',
      bgColor: 'bg-gradient-to-br from-[#2962ff] via-[#2979ff] to-[#448aff]'
    },
    {
      id: 'hope',
      name: 'Room of Hope',
      emoji: '🌅',
      description: 'Light & better days ahead',
      type: 'positive',
      bgColor: 'bg-gradient-to-br from-[#304ffe] via-[#3d5afe] to-[#536dfe]'
    },
    {
      id: 'resilience',
      name: 'Room of Resilience',
      emoji: '🌱',
      description: 'Growth through challenges',
      type: 'positive',
      bgColor: 'bg-gradient-to-br from-[#651fff] via-[#7c4dff] to-[#b388ff]'
    }
  ];

  // Effect for roomId param
  useEffect(() => {
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        setSelectedRoom(room);
        fetchStories(roomId);
      }
    } else {
      setSelectedRoom(null);
      setSelectedStory(null);
      fetchRoomStats();
    }
  }, [roomId, location.pathname]);

  // Effect for storyId param
  useEffect(() => {
    if (storyId && selectedRoom) {
      fetchStoryById(storyId);
    }
  }, [storyId, selectedRoom]);

  // Typing animation
  useEffect(() => {
    const fullText = "Soro Echoes.";
    let currentIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    const typeWriter = () => {
      if (!isDeleting && currentIndex <= fullText.length) {
        setTypingText(fullText.substring(0, currentIndex));
        currentIndex++;
        typingSpeed = 100;
      } else if (isDeleting && currentIndex >= 0) {
        setTypingText(fullText.substring(0, currentIndex));
        currentIndex--;
        typingSpeed = 50;
      }
      
      if (!isDeleting && currentIndex === fullText.length) {
        typingSpeed = 1500;
        setTimeout(() => {
          isDeleting = true;
          typeWriter();
        }, typingSpeed);
        return;
      }
      
      if (isDeleting && currentIndex === 0) {
        isDeleting = false;
        typingSpeed = 500;
        setTimeout(() => {
          typeWriter();
        }, typingSpeed);
        return;
      }
      
      setTimeout(typeWriter, typingSpeed);
    };
    
    const timeoutId = setTimeout(typeWriter, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  // Scroll snapping with Intersection Observer
  useEffect(() => {
    if (selectedRoom || storyId) return;
    
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = slidesRef.current.indexOf(entry.target);
          if (index !== -1) {
            setActiveSlide(index);
          }
        }
      });
    }, options);
    
    slidesRef.current.forEach(slide => {
      if (slide) observer.observe(slide);
    });
    
    return () => {
      slidesRef.current.forEach(slide => {
        if (slide) observer.unobserve(slide);
      });
    };
  }, [selectedRoom, storyId]);

  // Improved scroll handler for manual scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling.current || !containerRef.current) return;
      
      clearTimeout(scrollTimeout.current);
      isScrolling.current = true;
      
      scrollTimeout.current = setTimeout(() => {
        if (containerRef.current) {
          const scrollTop = containerRef.current.scrollTop;
          const windowHeight = window.innerHeight;
          const slideIndex = Math.round(scrollTop / windowHeight);
          setActiveSlide(Math.max(0, Math.min(3, slideIndex)));
        }
        isScrolling.current = false;
      }, 100);
    };
    
    const container = containerRef.current;
    if (container && !selectedRoom && !storyId) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(scrollTimeout.current);
    };
  }, [selectedRoom, storyId]);

  // Fetch functions
  const fetchRoomStats = async () => {
    try {
      const response = await Axios({
        url: SummaryApi.getEchoStats.url,
        method: SummaryApi.getEchoStats.method
      });
      
      if (response.data.success) {
        const stats = {};
        response.data.data.rooms.forEach(room => {
          stats[room.roomId] = room;
        });
        setRoomStats(stats);
        setOverallStats(response.data.data.overall);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setOverallStats({
        totalStories: 1256,
        todaysStories: 42,
        totalRooms: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async (roomId) => {
    try {
      const endpoint = `/api/echo/room/${roomId}?limit=50&includeCrisis=true`;
      const response = await Axios.get(endpoint);
      
      if (response.data.success) {
        const sortedStories = response.data.data.echoes.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setStories(sortedStories);
      } else {
        setStories([]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    }
  };

  const fetchStoryById = async (storyId) => {
    try {
      const response = await Axios.get(`/api/echo/story/${storyId}`);
      if (response.data.success) {
        setSelectedStory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
    }
  };

  // FIXED: Optimized click handlers for mobile
  const handleOpenRoom = useCallback((room) => {
  navigate(`/echoes/room/${room.id}`);
}, [navigate]);

  const handleBackToHome = useCallback(() => {
    if (isProcessingTapRef.current) return;
    
    isProcessingTapRef.current = true;
    navigate('/echoes');
    
    setTimeout(() => {
      isProcessingTapRef.current = false;
    }, 100);
  }, [navigate]);

  const handleOpenStory = useCallback((story) => {
    if (isProcessingTapRef.current || !selectedRoom) return;
    
    isProcessingTapRef.current = true;
    navigate(`/echoes/room/${selectedRoom.id}/story/${story._id}`);
    
    setTimeout(() => {
      isProcessingTapRef.current = false;
    }, 100);
  }, [selectedRoom, navigate]);

  // Scroll to slide
  const scrollToSlide = useCallback((index) => {
    if (isProcessingTapRef.current || !containerRef.current || selectedRoom || storyId) return;
    
    isProcessingTapRef.current = true;
    const slide = slidesRef.current[index];
    
    if (slide) {
      isScrolling.current = true;
      slide.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      setTimeout(() => {
        isScrolling.current = false;
        isProcessingTapRef.current = false;
      }, 500);
    } else {
      isProcessingTapRef.current = false;
    }
  }, [selectedRoom, storyId]);

  // Add validation function:
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

// Update handleSubmitStory function to accept authorName parameter:
const handleSubmitStory = async (storyContent, userName = '') => {
  // Validate author name
  const nameError = validateAuthorName(userName);
  if (nameError) {
    setAuthorNameError(nameError);
    return;
  }

  if (storyContent.trim().length < 10) {
    alert('Please share a bit more (at least 10 characters)');
    return;
  }

  // Store username in cookie for future use
  if (userName.trim()) {
    CookieManager.storeUsername(userName.trim());
    setAuthorName(userName.trim());
  }

  setIsSubmitting(true);
  try {
    const response = await Axios.post('/api/echo/share', {
      content: storyContent,
      room: selectedRoom.id,
      authorName: userName.trim()
    });

    if (response.data && response.data.success) {
      const responseData = response.data.data;
      
      setNewStory('');
      setShowSubmitForm(false);
      
      fetchRoomStats();
      
      if (responseData.crisis === true || responseData.crisisFlag === true) {
        setCrisisResources(responseData.resources || [
          "SURPIN Crisis Line: +2349034400009",
          "MANI Support Line: 08091116264",
          "National Suicide Prevention Lifeline: 1-800-273-8255",
          "Immediate help: Go to the nearest emergency room"
        ]);
        
        setShowCrisisModal(true);
        
      } else {
        setTimeout(() => {
          setShowAssuranceModal(true);
        }, 100);
        
        setStories(prev => [responseData, ...prev]);
      }
      
      setTimeout(() => {
        fetchStories(selectedRoom.id);
      }, 1000);
      
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('Error submitting story:', error);
    
    const mockStory = {
      _id: Date.now(),
      content: storyContent,
      createdAt: new Date().toISOString(),
      wordCount: storyContent.trim().split(/\s+/).length,
      reactions: 0,
      emotionTags: selectedRoom.type === 'positive' ? ['positive'] : ['struggle'],
      room: selectedRoom.id,
      authorName: userName.trim() || 'Anonymous'
    };
    
    setStories(prev => [mockStory, ...prev]);
    setNewStory('');
    setShowSubmitForm(false);
    
    setTimeout(() => {
      setShowAssuranceModal(true);
    }, 100);
    
    setRoomStats(prev => ({
      ...prev,
      [selectedRoom.id]: {
        ...prev[selectedRoom.id],
        totalStories: (prev[selectedRoom.id]?.totalStories || 0) + 1
      }
    }));
    
  } finally {
    setIsSubmitting(false);
  }
};


  // Updated Like handler with authorName
  const handleLike = async (storyId, authorName) => {
    try {
      const response = await Axios.post(`/api/echo/${storyId}/like`, {
        authorName: authorName || 'Anonymous'
      });
      
      if (response.data.success) {
        setStories(prev => prev.map(story => {
          if (story._id === storyId) {
            return {
              ...story,
              likesCount: response.data.data.likesCount,
              userHasLiked: response.data.data.userHasLiked
            };
          }
          return story;
        }));
        
        if (selectedStory && selectedStory._id === storyId) {
          setSelectedStory(prev => ({
            ...prev,
            likesCount: response.data.data.likesCount,
            userHasLiked: response.data.data.userHasLiked
          }));
        }
      }
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  // Updated Share handler with authorName
  const handleShare = async (storyId, platform, authorName) => {
    try {
      await Axios.post(`/api/echo/${storyId}/share`, { 
        platform,
        authorName: authorName || 'Anonymous'
      });
      
      setStories(prev => prev.map(story => {
        if (story._id === storyId) {
          return {
            ...story,
            shareCount: (story.shareCount || 0) + 1
          };
        }
        return story;
      }));
      
      if (selectedStory && selectedStory._id === storyId) {
        setSelectedStory(prev => ({
          ...prev,
          shareCount: (prev.shareCount || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  // Format time
  const formatTime = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  // Modal handlers
  const handleReturnToEchoes = () => {
    setShowCrisisModal(false);
    setCrisisResources([]);
    
    setTimeout(() => {
      fetchStories(selectedRoom.id);
    }, 300);
  };

  const handleContinueToSupport = () => {
    setShowCrisisModal(false);
    setCrisisResources([]);
    
    setTimeout(() => {
      setShowAssuranceModal(true);
    }, 300);
  };

  const handleAssuranceModalClose = () => {
    setShowAssuranceModal(false);
    
    setTimeout(() => {
      fetchStories(selectedRoom.id);
    }, 300);
  };

  const handleBookSessionFromCrisis = () => {
    setShowCrisisModal(false);
    navigate('/login');
  };

  const handleBookSessionFromAssurance = () => {
    setShowAssuranceModal(false);
    navigate('/login');
  };

  // ALTERNATIVE: RoomCard as a button-like component
const RoomCard = React.memo(({ room, stats }) => {
  const handleClick = (e) => {
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
    navigate(`/echoes/room/${room.id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onTouchStart={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/echoes/room/${room.id}`);
        }
      }}
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer 
        transition-all duration-150 p-4 md:p-6 w-full text-left 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${room.type === 'positive' 
          ? 'bg-white/90 border border-gray-200 hover:border-blue-200 hover:shadow-lg' 
          : 'bg-white/10 backdrop-blur-lg border border-white/10 hover:border-white/20 hover:bg-white/15'
        }
        select-none
      `}
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className={`
          text-2xl md:text-3xl w-12 h-12 md:w-16 md:h-16 
          rounded-xl md:rounded-2xl flex items-center justify-center 
          flex-shrink-0 select-none
          ${room.type === 'positive' 
            ? 'bg-gradient-to-br from-blue-400/30 to-purple-400/30 border-2 border-blue-200' 
            : 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-white/20'
          }
        `}>
          {room.emoji}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`
            text-base md:text-lg font-bold truncate mb-1 md:mb-2 
            ${room.type === 'positive' ? 'text-gray-900' : 'text-white'}
          `}>
            {room.name}
          </h3>
          
          <p className={`
            text-sm mb-2 md:mb-3 line-clamp-2
            ${room.type === 'positive' ? 'text-gray-600' : 'text-gray-300'}
          `}>
            {room.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <div className={`
                flex items-center gap-1 md:gap-2 
                ${room.type === 'positive' ? 'text-gray-500' : 'text-gray-400'}
              `}>
                <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">{stats?.totalStories || '0'}</span>
              </div>
              <div className={`
                flex items-center gap-1 md:gap-2 
                ${room.type === 'positive' ? 'text-gray-500' : 'text-gray-400'}
              `}>
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">{stats?.todaysStories || '0'}</span>
              </div>
            </div>
            
            <div className={`
              flex items-center gap-1 md:gap-2 
              ${room.type === 'positive' ? 'text-blue-600' : 'text-blue-400'}
            `}>
              <span className="text-xs md:text-sm font-medium">Enter</span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

RoomCard.displayName = 'RoomCard';

  // FIXED: Optimized Button Component for Mobile
  const SimpleButton = React.memo(({ 
    children, 
    onClick, 
    className = '', 
    type = 'button',
    disabled = false 
  }) => {
    const handleClick = useCallback((e) => {
      if (disabled || isProcessingTapRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }, [disabled, onClick]);

    return (
      <button
        type={type}
        onClick={handleClick}
        onTouchStart={handleClick}
        disabled={disabled}
        className={`
          active:scale-[0.97] transition-transform duration-100 
          touch-immediate mobile-btn simple-button select-none
          ${className}
        `}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {children}
      </button>
    );
  });

  SimpleButton.displayName = 'SimpleButton';

  const getPageMetaInfo = () => {
    if (selectedRoom) {
      if (selectedStory) {
        const storyPreview = selectedStory.content.substring(0, 150);
        return {
          title: `"${storyPreview}..." - ${selectedRoom.name} | Soro Echoes`,
          description: `Read this anonymous story about ${selectedRoom.name.toLowerCase()}: ${storyPreview}... Share and find support in Soro Echoes.`,
          url: `https://soro.care${location.pathname}`,
          image: 'https://res.cloudinary.com/dc6ndqxuz/image/upload/v1757350261/soro-logo.png'
        };
      }
      return {
        title: `${selectedRoom.name} - Share Your Story | Soro Echoes`,
        description: `Share anonymous stories and read experiences about ${selectedRoom.description.toLowerCase()}. Find community support in the ${selectedRoom.name}.`,
        url: `https://soro.care${location.pathname}`,
        image: 'https://res.cloudinary.com/dc6ndqxuz/image/upload/v1757350261/soro-logo.png'
      };
    }
    return {
      title: 'Soro Echoes - Anonymous Mental Health Stories & Support',
      description: 'Share and read anonymous stories about mental health struggles and victories. Find your echo in a safe, supportive community. No sign-up needed.',
      url: 'https://soro.care/echoes',
      image: 'https://res.cloudinary.com/dc6ndqxuz/image/upload/v1757350261/soro-logo.png'
    };
  };
  
  const metaInfo = getPageMetaInfo();
  
  // If viewing a specific story
  if (storyId && selectedStory) {
    return (
      <>
        <Helmet>
          <title>{metaInfo.title}</title>
          <meta name="description" content={metaInfo.description} />
          <meta property="og:title" content={metaInfo.title} />
          <meta property="og:description" content={metaInfo.description} />
          <meta property="og:image" content={metaInfo.image} />
          <meta property="og:url" content={metaInfo.url} />
          <meta property="og:type" content="article" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaInfo.title} />
          <meta name="twitter:description" content={metaInfo.description} />
          <meta name="twitter:image" content={metaInfo.image} />
          <link rel="canonical" href={metaInfo.url} />
        </Helmet>
        <StoryDetail
          story={selectedStory}
          room={selectedRoom}
          onBack={() => navigate(`/echoes/room/${selectedRoom.id}`)}
          onLike={handleLike}
          onShare={handleShare}
          formatTime={formatTime}
        />
      </>
    );
  }

  // If viewing a room
  if (selectedRoom) {
    return (
      <>
        <Helmet>
          <title>{metaInfo.title}</title>
          <meta name="description" content={metaInfo.description} />
          <meta property="og:title" content={metaInfo.title} />
          <meta property="og:description" content={metaInfo.description} />
          <meta property="og:image" content={metaInfo.image} />
          <meta property="og:url" content={metaInfo.url} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaInfo.title} />
          <meta name="twitter:description" content={metaInfo.description} />
          <meta name="twitter:image" content={metaInfo.image} />
          <link rel="canonical" href={metaInfo.url} />
        </Helmet>
        <RoomDetail
          selectedRoom={selectedRoom}
          stories={stories}
          newStory={newStory}
          setNewStory={setNewStory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showSubmitForm={showSubmitForm}
          setShowSubmitForm={setShowSubmitForm}
          isSubmitting={isSubmitting}
          handleSubmitStory={handleSubmitStory}
          roomStats={roomStats}
          handleBackToHome={handleBackToHome}
          handleLike={handleLike}
          handleShare={handleShare}
          handleOpenStory={handleOpenStory}
          formatTime={formatTime}
          showCrisisModal={showCrisisModal}
          showAssuranceModal={showAssuranceModal}
          crisisResources={crisisResources}
          handleReturnToEchoes={handleReturnToEchoes}
          handleContinueToSupport={handleContinueToSupport}
          handleBookSessionFromCrisis={handleBookSessionFromCrisis}
          handleBookSessionFromAssurance={handleBookSessionFromAssurance}
          handleAssuranceModalClose={handleAssuranceModalClose}
        />
      </>
    );
  }

  // Home View with Slide Screens
  return (
  <>
    <Helmet>
      <title>{metaInfo.title}</title>
      <meta name="description" content={metaInfo.description} />
      <meta property="og:title" content={metaInfo.title} />
      <meta property="og:description" content={metaInfo.description} />
      <meta property="og:image" content={metaInfo.image} />
      <meta property="og:url" content={metaInfo.url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaInfo.title} />
      <meta name="twitter:description" content={metaInfo.description} />
      <meta name="twitter:image" content={metaInfo.image} />
      <link rel="canonical" href={metaInfo.url} />
    </Helmet>
    
    {/* FIXED: Book Session Button - Fixed position outside slides */}
    <div className="fixed top-1 right-2 z-50">
      <SimpleButton
        onClick={() => navigate('/login')}
        className="flex items-center gap-2  text-gray-500 hover:text-white hover:bg-white/20 transition-colors group rounded-lg touch-immediate px-2 py-1 md:px-4 md:py-3"
      >
        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
        <span className="font-medium ">Book Session</span>
      </SimpleButton>
    </div>
    
    {/* Main container with scroll snapping */}
    <div 
      ref={containerRef}
      className="relative h-screen overflow-y-auto scroll-snap-y scroll-snap-mandatory touch-scroll"
      style={{
        WebkitOverflowScrolling: 'touch',
        overflowScrolling: 'touch',
        scrollBehavior: 'smooth'
      }}
    >
      {/* Slide 1: Hero */}
      <section 
        ref={el => slidesRef.current[0] = el}
        className="relative h-screen scroll-snap-start flex flex-col justify-center"
        style={{ minHeight: '100vh', minHeight: '-webkit-fill-available' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a2a] via-[#1a1a3a] to-[#0a0a2a]"></div>
        
        <div className="relative z-10">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl mx-auto"
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4 md:mb-8 backdrop-blur-lg">
                  <span className="text-sm text-gray-300">• Beta • Anonymous • Secure</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight px-4">
                  <span className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-2 md:pr-6">
                    {typingText}
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-300 mb-6 md:mb-8 leading-relaxed px-4">
                  Drop your <span className="bg-gradient-to-r from-[#3A5F8A] via-[#4677A7] to-[#5D90C5] bg-clip-text text-transparent">burden</span>,
                  <br />find your <span className="bg-gradient-to-r from-[#5FB4C6] via-[#74C8D8] to-[#8CDDED] bg-clip-text text-transparent">echo</span>
                </p>
                
                <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 md:mb-10 flex-wrap px-4">
                  {[
                    { value: overallStats?.totalStories || '0k', label: 'Stories Shared', color: 'from-blue-500 to-cyan-500' },
                    { value: '8', label: 'Emotion Rooms', color: 'from-purple-500 to-pink-300' },
                    { value: overallStats?.todaysStories || '0', label: 'Active Today', color: 'from-teal-500 to-teal-500' }
                  ].map((stat, i) => (
                    <div key={i} className="text-center group">
                      <div className={`text-2xl md:text-3xl font-bold mb-1 md:mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center px-4">
                  <SimpleButton
                    onClick={() => scrollToSlide(1)}
                    className="px-6 py-4 md:px-8 md:py-4 bg-gradient-to-r from-[#0d47a1] via-[#1565c0] to-[#1976d2] text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-[#1565c0]/40 transition-all flex items-center justify-center gap-3 group w-full md:w-auto touch-immediate mobile-btn"
                  >
                    <span>Enter Heavy Rooms</span>
                  </SimpleButton>
                  
                  <SimpleButton
                    onClick={() => scrollToSlide(2)}
                    className="px-6 py-4 md:px-8 md:py-4 bg-gradient-to-r from-[#2979ff] via-[#448aff] to-[#82b1ff] text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-[#448aff]/40 transition-all flex items-center justify-center gap-3 group w-full md:w-auto touch-immediate mobile-btn"
                  >
                    <span>Enter Light Rooms</span>
                  </SimpleButton>
                </div>
                
                <div className="mt-8 md:mt-12 px-4">
                  <ChevronDown className="w-6 h-6 md:w-8 md:h-8 mx-auto text-gray-400 animate-bounce" />
                  <p className="text-xs md:text-sm text-gray-500 mt-2">Scroll to explore rooms</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Slide 2: Heavy Rooms */}
        <section 
          ref={el => slidesRef.current[1] = el}
          className="relative h-screen scroll-snap-start"
          style={{ minHeight: '100vh', minHeight: '-webkit-fill-available' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a2a] via-[#1a1a3a] to-[#0a0a2a]"></div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex-1">
              <div className="mb-6 md:mb-10">
                <div className="flex items-center gap-3 md:gap-4 mb-2">
                  <div className="w-10 h-1 md:w-16 md:h-2 bg-gradient-to-r from-[#0d47a1] via-[#1565c0] to-[#1976d2] rounded-full"></div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Heavy Rooms</h2>
                </div>
                <p className="text-gray-400 text-sm md:text-base">Tap a room to enter</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 md:p-6 animate-pulse">
                      <div className="flex flex-col gap-3 md:gap-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-700/50 rounded-2xl mx-auto"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-3/4 mx-auto"></div>
                        <div className="h-3 bg-gray-700/50 rounded w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  rooms.filter(r => r.type === 'struggle').map((room) => (
                    <RoomCard key={room.id} room={room} stats={roomStats[room.id]} />
                  ))
                )}
              </div>
            </div>

            {activeSlide === 1 && (
              <div className="bottom-nav-mobile md:sticky">
                <div className="relative h-14  bg-gradient-to-r from-[#1a237e] via-[#2463cf] to-[#82b1ff]">
                <div className="absolute inset-0 grid grid-cols-2">
                  <SimpleButton
                    onClick={() => scrollToSlide(0)}
                    className="w-full h-full text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors active:bg-white/20 min-h-[56px] touch-immediate"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm md:text-base">Back Home</span>
                  </SimpleButton>
                  
                  <SimpleButton
                    onClick={() => scrollToSlide(2)}
                    className="w-full h-full text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors active:bg-white/20 border-l border-white/20 min-h-[56px] touch-immediate"
                  >
                    <span className="text-sm md:text-base">Light Rooms</span>
                    <ChevronRight className="w-4 h-4" />
                  </SimpleButton>
                </div>
                <div className="h-14"></div>
              </div>
              </div>
            )}

          </div>
        </section>

        {/* Slide 3: Light Rooms */}
        <section 
          ref={el => slidesRef.current[2] = el}
          className="relative h-screen scroll-snap-start"
          style={{ minHeight: '100vh', minHeight: '-webkit-fill-available' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#b3ccd0] via-[#cfeef4] to-[#eff8f9]"></div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-12 flex-1">
              <div className="mb-6 md:mb-10">
                <div className="flex items-center gap-3 md:gap-4 mb-2">
                  <div className="w-10 h-1 md:w-16 md:h-2 bg-gradient-to-r from-[#2979ff] via-[#448aff] to-[#82b1ff] rounded-full"></div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Light Rooms</h2>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Tap a room to view details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-4 md:p-6 animate-pulse">
                      <div className="flex flex-col gap-3 md:gap-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-700/50 rounded-2xl mx-auto"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-3/4 mx-auto"></div>
                        <div className="h-3 bg-gray-700/50 rounded w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  rooms.filter(r => r.type === 'positive').map((room) => (
                    <RoomCard key={room.id} room={room} stats={roomStats[room.id]} />
                  ))
                )}
              </div>
            </div>

            {activeSlide === 2 && (
              <div className="bottom-nav-mobile md:sticky">
                <div className="relative h-14  bg-gradient-to-r from-[#1a237e] via-[#2463cf] to-[#82b1ff]">
                <div className="absolute inset-0 grid grid-cols-2">
                  <SimpleButton
                    onClick={() => scrollToSlide(0)}
                    className="w-full h-full text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors active:bg-white/20 min-h-[56px] touch-immediate"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm md:text-base">Back Home</span>
                  </SimpleButton>
                  
                  <SimpleButton
                    onClick={() => scrollToSlide(3)}
                    className="w-full h-full text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors active:bg-white/20 border-l border-white/20 min-h-[56px] touch-immediate"
                  >
                    <span className="text-sm md:text-base">How it Works</span>
                    <ChevronRight className="w-4 h-4" />
                  </SimpleButton>
                </div>
                <div className="h-14"></div>
              </div>
              </div>
            )}
          </div>
        </section>

        {/* Slide 4: Stats */}
        <section 
          ref={el => slidesRef.current[3] = el}
          className="relative h-screen scroll-snap-start"
          style={{ minHeight: '100vh', minHeight: '-webkit-fill-available' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a2a] to-[#1a1a3a]"></div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="max-w-7xl mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
              <div className="text-center mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white ">
                  How Soro Echoes Works
                </h2>
              </div>

              <div className="mb-4 md:mb-12">
                <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-8 max-w-5xl mx-auto">
                  {[
                    { 
                      icon: '👁️', 
                      title: 'Read', 
                      desc: 'Browse anonymous stories from people like you',
                      bgColor: 'from-blue-500/10 to-purple-500/10'
                    },
                    { 
                      icon: '💭', 
                      title: 'Reflect', 
                      desc: 'See your struggles reflected in others\' experiences',
                      bgColor: 'from-purple-500/10 to-pink-500/10'
                    },
                    { 
                      icon: '📝', 
                      title: 'Release', 
                      desc: 'Share your story anonymously. No sign-up needed',
                      bgColor: 'from-teal-500/10 to-blue-500/10'
                    }
                  ].map((step, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-r ${step.bgColor} backdrop-blur-lg rounded-2xl p-4 border border-white/10 text-center h-full`}
                    >
                      <div className="text-2xl md:text-3xl mb-1">{step.icon}</div>
                      <h4 className="font-semibold text-white text-lg md:text-xl mb-2">{step.title}</h4>
                      <p className="text-sm md:text-base text-gray-300">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4 md:mb-12">
                <div className="text-center ">
                  <p className="text-gray-400 text-sm md:text-base">
                    Real stories, real impact
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid gap-4 md:gap-8 max-w-5xl mx-auto">
                  {[
                    { 
                      label: 'Stories Shared', 
                      value: overallStats?.totalStories || '0k', 
                      color: 'from-blue-500 to-cyan-600',
                    },
                    { 
                      label: 'Today\'s Echoes', 
                      value: overallStats?.todaysStories || '0', 
                      color: 'from-teal-500 to-teal-600',
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="rounded-2xl p-1 md:p-6 text-center h-full"
                    >
                      <div className={`text-lg md:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent `}>
                        {stat.value}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {activeSlide === 3 && (
              <div className="bottom-nav-mobile md:sticky">
                <div className="relative h-14 bg-gradient-to-r from-[#1a237e] via-[#2463cf] to-[#6094e7]">
                <SimpleButton
                  onClick={() => scrollToSlide(0)}
                  className="w-full h-14 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors active:bg-white/20 touch-immediate"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm md:text-base">Back Home</span>
                </SimpleButton>
              </div>
              </div>
            )}
        
          </div>
        </section>
      </div>
    </>
  );
};

export default EchoRooms;