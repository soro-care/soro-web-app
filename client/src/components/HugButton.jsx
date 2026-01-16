import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Floating particles with smoother animations
const FloatingParticle = ({ delay, index }) => {
  const angle = (index / 16) * Math.PI * 2;
  const distance = 80 + Math.random() * 40;
  const randomX = Math.cos(angle) * distance;
  const randomY = Math.sin(angle) * distance;
  const emojis = ['💕', '✨', '💫', '🌸', '💗', '🫂', '💖', '⭐'];
  const emoji = emojis[index % emojis.length];

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0,
        x: 0, 
        y: 0,
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0],
        x: randomX,
        y: randomY,
      }}
      transition={{
        duration: 1.2,
        delay: delay,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className="absolute text-2xl"
      style={{
        left: '50%',
        top: '50%',
        marginLeft: '-16px',
        marginTop: '-16px',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 2px 8px rgba(30, 69, 157, 0.6))',
      }}
    >
      {emoji}
    </motion.div>
  );
};

// Big animated hug popup - matching Soro Echoes dark theme
const BigHugPopup = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        background: 'radial-gradient(circle at center, rgba(30, 69, 157, 0.15) 0%, transparent 70%)'
      }}
    >
      {/* Main hug emoji with bounce */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ 
          scale: [0, 1.3, 1],
          rotate: [15, -10, 0],
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className="relative"
        style={{ 
          fontSize: '140px',
          filter: 'drop-shadow(0 20px 40px rgba(30, 69, 157, 0.7))',
        }}
      >
        🤗
      </motion.div>

      {/* Particle burst */}
      {[...Array(16)].map((_, i) => (
        <FloatingParticle 
          key={i} 
          delay={i * 0.02} 
          index={i}
        />
      ))}

      {/* Smooth expanding rings - blue theme */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 0.6, 0],
            scale: [0.8, 2.5, 3],
          }}
          transition={{ 
            duration: 1.2, 
            delay: i * 0.1, 
            ease: "easeOut" 
          }}
          className="absolute rounded-full"
          style={{
            width: '100px',
            height: '100px',
            left: 'calc(50% - 50px)',
            top: 'calc(50% - 50px)',
            border: '2px solid rgb(48, 69, 157)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Text pop-up - blue gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ 
          opacity: [0, 1, 1, 0],
          y: [20, -40, -50, -60],
          scale: [0.8, 1, 1, 0.9],
        }}
        transition={{ 
          duration: 1.2,
          times: [0, 0.3, 0.7, 1],
        }}
        className="absolute"
        style={{
          top: 'calc(50% + 100px)',
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #30459D 0%, #1a237e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 10px rgba(30, 69, 157, 0.5)',
        }}
      >
        Sending hugs! 💕
      </motion.div>
    </motion.div>
  );
};

// Mini sparkles for button hover
const MiniSparkles = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos(i * Math.PI * 0.8) * 25,
                y: Math.sin(i * Math.PI * 0.8) * 25,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="absolute text-xs"
              style={{ 
                left: '50%', 
                top: '50%',
                marginLeft: '-6px',
                marginTop: '-6px',
                pointerEvents: 'none',
              }}
            >
              ✨
            </motion.div>
          ))}
        </>
      )}
    </AnimatePresence>
  );
};

const HugButton = React.memo(({ 
  count = 0, 
  isHugged = false, 
  onHug, 
  size = 'md',
  showCount = true 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBigHug, setShowBigHug] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);

  const handleHug = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isAnimating) return;
    
    setIsAnimating(true);
    setShowBigHug(true);
    
    if (onHug) {
      onHug();
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);

    setTimeout(() => {
      setShowBigHug(false);
    }, 1400);
  }, [isAnimating, onHug]);

  const sizeClasses = {
    sm: 'h-7 px-2.5 text-xs gap-1.5',
    md: 'h-8 px-3 text-sm gap-2',
    lg: 'h-10 px-4 text-base gap-2',
  };

  const iconSizes = {
    sm: '14px',
    md: '16px',
    lg: '20px',
  };

  return (
    <>
      <AnimatePresence>
        {showBigHug && <BigHugPopup />}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        onClick={handleHug}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative inline-flex items-center justify-center rounded-full
          ${sizeClasses[size]}
          font-semibold
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-[#30459D]/50 focus:ring-offset-2 focus:ring-offset-transparent
          ${isHugged 
            ? 'bg-gradient-to-r from-[#1a237e] to-[#30459D] text-white shadow-lg shadow-[#30459D]/30' 
            : 'bg-white/5 text-gray-400 hover:bg-gradient-to-r hover:from-[#1a237e]/20 hover:to-[#30459D]/20 hover:text-white border border-white/10 hover:border-[#30459D]/30 backdrop-blur-sm'
          }
        `}
        style={{
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Sparkles on hover */}
        <MiniSparkles isVisible={isHovered && !isHugged} />
        
        {/* Icon */}
        <motion.span
          animate={isAnimating ? { 
            scale: [1, 1.4, 1],
            rotate: [0, 15, -15, 0]
          } : {}}
          transition={{ duration: 0.5 }}
          style={{ 
            fontSize: iconSizes[size], 
            lineHeight: 1,
            display: 'inline-block',
          }}
        >
          {isHugged ? '🫂' : '🤗'}
        </motion.span>

        {/* Count */}
        {showCount && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="font-medium"
            style={{ 
              fontSize: size === 'sm' ? '11px' : size === 'md' ? '13px' : '14px',
            }}
          >
            {count}
          </motion.span>
        )}

        {/* Animated gradient border when hugged */}
        {isHugged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Glow effect when animating */}
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.6, 0],
              scale: [0.8, 1.5, 2],
            }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-full bg-[#30459D]/40 blur-xl"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </motion.button>
    </>
  );
});

HugButton.displayName = 'HugButton';
export { HugButton, BigHugPopup };