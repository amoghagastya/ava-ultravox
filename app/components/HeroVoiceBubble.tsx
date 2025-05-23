'use client';
import { motion } from 'framer-motion';
import React from 'react';
import { MicrophoneIcon } from './MicrophoneIcon'; // Assuming MicrophoneIcon is in the same directory

interface HeroVoiceBubbleProps {
  onClick?: () => void; // Optional click handler
  size?: number; // Optional size prop (defaults to 180)
}

const HeroVoiceBubble: React.FC<HeroVoiceBubbleProps> = ({ onClick, size = 180 }) => {
  const bubbleSizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div className="relative flex items-center justify-center" style={bubbleSizeStyle}>
      {/* Base bubble structure */}
      <motion.div
        className="absolute inset-0 rounded-full backdrop-blur-sm overflow-hidden border border-white/20 shadow-lg"
        style={{
          // Base transparent background
          background: 'rgba(255, 255, 255, 0.05)',
        }}
        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
        onClick={onClick}
      >
        {/* Swirling Animation Layer */}
        <div
          className="absolute inset-[-50%] w-[200%] h-[200%] animate-spin-slow" // Make larger and animate rotation
          style={{
            background: 'conic-gradient(from 0deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3), rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.3))', // Example gradient - adjust colors as needed
          }}
        />
      </motion.div>

      {/* Microphone Icon - Centered on top */}
      <div className="relative z-10 scale-75">
        {/* Use isActive={true} or a neutral state for the icon */}
        <MicrophoneIcon isActive={false} />
      </div>
    </div>
  );
};

export default HeroVoiceBubble;