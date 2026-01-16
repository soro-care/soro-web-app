// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import notFoundImage from '../assets/404.png';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-[#E7F5F7] to-[#F3E8DE] flex flex-col items-center justify-center p-4 text-center"
    >
      <div className="max-w-md mx-auto">
        <img 
          src={notFoundImage} 
          alt="404 illustration" 
          className="w-full max-w-xs mx-auto mb-8"
        />
        
        <h2 className="text-2xl font-medium text-gray-700 mb-6">Oops! Page not found</h2>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-[#30459D] hover:bg-[#23367D] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/support"
            className="border-2 border-[#30459D] text-[#30459D] hover:bg-[#E7F5F7] px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </motion.div>
  );
}