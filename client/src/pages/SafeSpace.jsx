import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Bot, User, RefreshCw, Shield, PinIcon } from 'lucide-react';
import Axios from '../utils/Axios';
import { useSelector } from 'react-redux';
import useMobile from '../hooks/useMobile';
import { FaCaretLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { CancelOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion'


const generateStaticShapes = () => {
  return Array.from({ length: 8 }).map(() => ({
    width: Math.random() * 100 + 50,
    height: Math.random() * 100 + 50,
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity: 0.6
  }));
};


const SafeSpace = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useSelector(state => state.user);
  const [darkMode, setDarkMode] = useState(false);
  const [ isMobile ] = useMobile()



  // Initial greeting from the AI
  useEffect(() => {
    setMessages([{
      id: Date.now(),
      text: "This is a safe space to share what's on your mind🌱",
      sender: 'ai'
    }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await Axios.post('/api/chat', { message: input });
      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Oops! I'm having trouble connecting. Maybe try again? 🌻",
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    try {
      await Axios.delete('/api/chat');
      setMessages([{
        id: Date.now(),
        text: "Conversation refreshed! What would you like to talk about today?",
        sender: 'ai'
      }]);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const quickReplies = [
    { text: "I'm feeling anxious", emoji: "😰" },
    { text: "I need to vent", emoji: "🗣️" },
    { text: "I feel lonely", emoji: "😔" },
    { text: "I'm feeling okay", emoji: "🙂" }
  ];
  
  const staticShapes = useMemo(() => generateStaticShapes(), []);


  return (
    <div className={`fixed inset-0  ${isMobile ? 'z-50 ' : ''} flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${user?._id ? 'md:ml-64' : ''}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {staticShapes.map((shape, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#30459D]/10"
            style={{
              width: `${shape.width}px`,
              height: `${shape.height}px`,
              left: `${shape.left}%`,
              top: `${shape.top}%`,
              opacity: shape.opacity
            }}
          />
        ))}
      </div>
      {/* Header - Fixed */}
      <div className={`flex items-center z-50 justify-between p-3 ${darkMode ? 'bg-gray-700' : 'bg-[#30459D]'} text-white`}>
      <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-white/20'}`}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold">SafeSpace</h1>
            <p className="text-xs opacity-80">Always here to listen</p>
          </div>
        </div>
        {isMobile && (
          <Link 
            to="/dashboard"
            className={`p-2 rounded-full ${darkMode ? 'text-red-300 hover:bg-gray-700' : 'text-white hover:bg-[#30459D]/50'}`}
          >
            <CancelOutlined/>
          </Link>
        )}
      </div>

      {/* Messages area - Scrollable */}
      <div 
        className={`flex-1 overflow-y-auto p-4 ${darkMode ? 'bg-gray-900' : 'bg-[#efeae5]'}`}
        style={{ 
          paddingBottom: isMobile ? '80px' : '0',
          backgroundImage: darkMode 
            ? 'radial-gradient(circle at 10% 20%, rgba(48, 69, 157, 0.1) 0%, rgba(48, 69, 157, 0.05) 90%)' 
            : 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 90%)'
        }}
      >
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-lg p-3 ${message.sender === 'user' 
                ? darkMode 
                  ? 'bg-[#005c4b] text-white rounded-br-none' 
                  : 'bg-[#30459D] text-white rounded-br-none'
                : darkMode 
                  ? 'bg-gray-700 text-white rounded-bl-none' 
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}
            >
              <div className="flex items-start gap-2">
                {message.sender === 'ai' && (
                  <div className={`p-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                {message.sender === 'user' && (
                  <div className={`p-1 rounded-full ${darkMode ? 'bg-[#005c4b]/50' : 'bg-[#30459D]/30'}`}>
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${darkMode ? 'text-gray-400' : message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {new Date(message.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className={`max-w-[85%] rounded-lg p-3 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-bl-none shadow-sm`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'} animate-bounce`}></div>
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'} animate-bounce delay-75`}></div>
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'} animate-bounce delay-150`}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies (only shows at start) */}
      {messages.length <= 1 && (
        <div className={`px-4 py-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex overflow-x-auto space-x-2 hide-scrollbar">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => setInput(reply.text)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 text-sm rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-200'} shadow-sm`}
              >
                <span>{reply.emoji}</span>
                <span>{reply.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area - Fixed */}
      <div className={`p-3 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        {isMobile && (
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'text-yellow-300 hover:bg-gray-700' : 'text-white hover:bg-[#30459D]/50'}`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Type your message..."
            className={`flex-1 py-2 px-4 rounded-full ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-800 placeholder-gray-500'} focus:outline-none`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-full ${!input.trim() || isLoading 
              ? darkMode 
                ? 'text-gray-500 bg-gray-700' 
                : 'text-gray-400 bg-gray-200'
              : darkMode 
                ? 'text-white bg-[#005c4b]' 
                : 'text-white bg-[#30459D]'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className={`flex items-center justify-center gap-1 mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <PinIcon className="w-3 h-3" />
          <span>AI generated, not a substitute for professionals</span>
        </div>
      </div>
    </div>
  );
};

export default SafeSpace;