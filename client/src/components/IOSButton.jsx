// Create a new file: components/IOSButton.jsx
import React from 'react';
import { motion } from 'framer-motion';

const IOSButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const handleTouchStart = (e) => {
    e.preventDefault();
    if (!disabled && onClick) {
      // Simulate click for immediate response
      const rect = e.currentTarget.getBoundingClientRect();
      if (
        e.changedTouches[0].clientX >= rect.left &&
        e.changedTouches[0].clientX <= rect.right &&
        e.changedTouches[0].clientY >= rect.top &&
        e.changedTouches[0].clientY <= rect.bottom
      ) {
        onClick(e);
      }
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      className={`touch-manipulation ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const MotionIOSButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  whileHover = { scale: 1.05 },
  whileTap = { scale: 0.95 },
  ...props 
}) => {
  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onTouchStart={handleTouchStart}
      whileHover={whileHover}
      whileTap={whileTap}
      className={`touch-manipulation ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default IOSButton;