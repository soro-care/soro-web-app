import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CalendarIcon, ArrowRight, X, Sparkles, CalendarHeart, 
  Clock, Phone, Video
} from 'lucide-react';
import BookingForm from './BookingForm';

const UserDashboard = ({
  user,
  isLoading,
  selectedMood,
  setSelectedMood,
  showBookingForm,
  setShowBookingForm,
  pendingSessions,
  upcomingSessions,
  blogs,
  loading,
  handleNewBooking,
  handleCloseBookingForm
}) => {
  const navigate = useNavigate();

  // Safe initials function
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Unified time formatting function for both session types
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Time not set';
    
    try {
      const formattedStart = format(new Date(`2000-01-01T${startTime}`), 'h:mm a');
      const formattedEnd = format(new Date(`2000-01-01T${endTime}`), 'h:mm a');
      return `${formattedStart} - ${formattedEnd}`;
    } catch {
      return `${startTime} - ${endTime}`;
    }
  };
  
  const createMarkup = (html) => {
    return { __html: html };
  };

  return (
    // CHANGED: Removed fixed container classes, added better mobile scrolling
    <div className="space-y-6 px-4 pb-24 md:pb-6 animate-fade-in overflow-visible">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#30459D] flex items-center gap-2">
            Hello, {user?.name?.split(' ')[0] || 'User'}<span className="text-[#30459D] animate-pulse">🌱</span>
          </h1>
          <p className="text-sm md:text-base text-gray-600">Welcome to your wellness sanctuary</p>
        </div>
      </div>
  
      {/* CHANGED: Improved grid for mobile scrolling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Section */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-[#30459D] mb-2">How are you feeling today?</h2>
              <p className="text-gray-600">Tap your current feeling</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-0.5 md:gap-2 mb-8">
              {[
                { emoji: '😊', label: 'Great', color: 'from-yellow-100 to-yellow-200' },
                { emoji: '😌', label: 'Calm', color: 'from-green-100 to-green-200' },
                { emoji: '😐', label: 'Neutral', color: 'from-blue-100 to-blue-200' },
                { emoji: '😔', label: 'Low', color: 'from-purple-100 to-purple-200' },
                { emoji: '😢', label: 'Struggling', color: 'from-red-100 to-red-200' }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMood(item.emoji)}
                  className={`flex flex-col items-center transition-all duration-300 transform ${
                    selectedMood === item.emoji ? 'scale-125' : 'hover:scale-110'
                  }`}
                >
                  <span className={`text-3xl md:text-5xl p-2 rounded-full ${
                    selectedMood === item.emoji 
                      ? `bg-gradient-to-br ${item.color} shadow-lg ring-2 ring-white`
                      : 'hover:bg-white/30'
                  }`}>
                    {item.emoji}
                  </span>
                  <span className="text-xs mt-1 text-gray-600 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => navigate('/safespace')}
              className="bg-gradient-to-r from-[#30459D] to-[#4066D0] text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 mx-auto w-full max-w-md hover:from-[#263685] hover:to-[#30459D]"
            >
              <span>Enter SafeSpace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
    
          {/* Sessions Section - FIXED mobile scrolling */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                  {isLoading ? (
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                  ) : pendingSessions.length > 0 ? 'Pending Approvals' : 'Upcoming Sessions'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isLoading ? (
                    <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2"></div>
                  ) : pendingSessions.length > 0 ? 'Waiting for professional confirmation' : 'Moments of growth and reflection'}
                </p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse"></div>
                        <div className="flex gap-4">
                          <div className="h-3 w-1/4 bg-gray-100 rounded animate-pulse"></div>
                          <div className="h-3 w-1/4 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingSessions.length > 0 ? (
              <div className="space-y-4">
                {pendingSessions.map((session, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-xl hover:bg-gray-50/50 transition-colors border border-gray-100 group hover:border-yellow-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl bg-yellow-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="text-xl font-medium text-yellow-600">
                          {getInitials(session?.professional?.name) || 'SC'}
                        </span>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center">
                          <Clock className="w-3 h-3 text-yellow-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 group-hover:text-yellow-600 transition-colors">
                          {session.professional?.isPeerCounselor 
                          ? `Peer Counselor (ID: ${session.professional.counselorId || 'N/A'})`
                          : session.user?.userId || 'User'}
                        </h3>
                        <p className="text-sm text-gray-500">{session.concern || 'Not specified'}</p>
                        
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                            <span>{session.date ? format(new Date(session.date), 'MMMM d, yyyy') : 'Date not set'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{formatTimeRange(session.startTime, session.endTime)}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-600 text-xs font-medium">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-xl hover:bg-gray-50/50 transition-colors border border-gray-100 group hover:border-[#30459D]/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`relative w-14 h-14 rounded-xl ${session.avatarBg || 'bg-blue-50'} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                        <span className={`text-xl font-medium ${session.avatarText || 'text-[#30459D]'}`}>
                          {getInitials(session?.professional?.counselorId || session?.professional?.name)}
                        </span>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center">
                          {session.modality === 'Video' ? (
                            <Video className="w-3 h-3 text-[#30459D]" />
                          ) : (
                            <Phone className="w-3 h-3 text-[#30459D]" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 group-hover:text-[#30459D] transition-colors">
                          {session.professional?.isPeerCounselor 
                            ? `Peer Counselor (ID: ${session.professional.counselorId || 'N/A'})`
                            : session.user?.userId || 'User'}
                        </h3>
                        <p className="text-sm text-gray-500">{session.concern || 'Not specified'}</p>
                        
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray500">
                            <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                            <span>{session.date ? format(new Date(session.date), 'MMMM d, yyyy') : 'Date not set'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{formatTimeRange(session.startTime, session.endTime)}</span>
                          </div>
                          {session.modality && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {session.modality === 'Video' ? (
                                <Video className="w-4 h-4 flex-shrink-0" />
                              ) : (
                                <Phone className="w-4 h-4 flex-shrink-0" />
                              )}
                              <span>{session.modality} Session</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Link to="/bookings">
                        <button className="text-[#30459D] hover:text-[#263685] p-2 rounded-lg hover:bg-[#30459D]/10 transition-colors">
                          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#30459D]/10 to-[#4066D0]/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <CalendarHeart className="w-10 h-10 text-[#30459D]" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Your journey begins here</h3>
                <p className="text-gray-500 mb-6">Take the step toward healing</p>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="bg-gradient-to-r from-[#30459D] to-[#4066D0] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto hover:from-[#263685] hover:to-[#30459D]"
                >
                  <CalendarHeart className="w-5 h-5" /> Schedule Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Blogs Section - FIXED sticky positioning */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm lg:sticky lg:top-6 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-5">
              {loading ? (
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              ) : (
                <div className="p-2 rounded-xl bg-[#30459D]/10 text-[#30459D] animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-800">
                {loading ? (
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                ) : "Soro Drops"}
              </h2>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="h-36 bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-full bg-gray-100 rounded animate-pulse"></div>
                      <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.map((post, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="relative h-36 md:h-40">
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        {post.categories?.slice(0, 2).map(category => (
                          <span 
                            key={category._id} 
                            className="bg-[#30459D] text-white text-xs px-2 py-1 rounded-md"
                          >
                            {category.name}
                          </span>
                        ))}
                        <span className="ml-2 text-white text-xs bg-black/30 px-2 py-1 rounded-md">
                          {post.readTime} min read
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-2 text-gray-800 group-hover:text-[#30459D] transition-colors">{post.title}</h3>
                      <p className="text-gray-600 text-sm mb-3"
                        dangerouslySetInnerHTML={createMarkup(post.excerpt || post.content.substring(0, 150) + '...')}
                      />
                      <Link to={`/drops/${post.slug || post._id}`}> 
                        <button className="text-[#30459D] hover:text-[#263685] text-sm font-medium flex items-center gap-1">
                          Explore <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Link to="/drops" className="block mt-6">
              <button className="bg-gradient-to-r from-[#30459D] to-[#4066D0] text-white px-6 py-3 rounded-xl flex items-center text-center justify-center gap-2 hover:shadow-lg transition-all duration-300 mx-auto w-full max-w-md hover:from-[#263685] hover:to-[#30459D]">
                {loading ? (
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <>Discover More <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </Link>
          </div>
        </div>
      </div>
  
      {/* Booking Modal - FIXED positioning */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 h-full w-full z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#30459D]">Schedule New Session</h2>
              <button 
                onClick={handleCloseBookingForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              <BookingForm
                onClose={handleCloseBookingForm}
                onBookingSuccess={(booking, professional) => 
                  handleNewBooking(booking, professional)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

UserDashboard.propTypes = {
  user: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  selectedMood: PropTypes.string,
  setSelectedMood: PropTypes.func.isRequired,
  showBookingForm: PropTypes.bool.isRequired,
  setShowBookingForm: PropTypes.func.isRequired,
  pendingSessions: PropTypes.array.isRequired,
  upcomingSessions: PropTypes.array.isRequired,
  blogs: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  handleNewBooking: PropTypes.func.isRequired,
  handleCloseBookingForm: PropTypes.func.isRequired
};