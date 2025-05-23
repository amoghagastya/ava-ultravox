'use client';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from "react";
import { MicrophoneIcon } from './MicrophoneIcon';

import { AudioVisualizer } from './AudioVisualizer';
import { CloseIcon } from './CloseIcon';
import useMicAudioLevel from './useMicAudioLevel';


interface AvaVoiceBubbleProps {
  isListening: boolean;
  audioLevel: number; // Expecting a value between 0 and 1
  onClick?: () => void; // Added onClick prop for the container's click handler
  state?: string; // Added state prop to mimic FloatingMicBubble states (optional, adjust as needed)
  onClose?: () => void; // Add onClose prop
}

const AvaVoiceBubble: React.FC<AvaVoiceBubbleProps> = ({
  isListening,
  audioLevel,
  onClick,
  state = 'idle', // Default state if not provided
  onClose, // Use the new onClose prop
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const [audioData, setAudioData] = useState<number[]>(Array(32).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Map isListening to a state similar to FloatingMicBubble for styling
  // const bubbleState = isListening ? 'listening' : 'disconnected'; // Simple mapping, adjust if needed
  // Use the 'state' prop directly for more accurate representation
  const bubbleState = state;

  const micAudioLevel = useMicAudioLevel(bubbleState === 'listening' || bubbleState === 'speaking');

  // For dynamic, randomized speaking glow
  const [glowAnim, setGlowAnim] = useState({ scale: 1, opacity: 0 });
  useEffect(() => {
    let interval: number | undefined;
    // Only run interval when speaking
    if (bubbleState === 'speaking') {
      // Remove initial state set here - let the interval handle the first update
      interval = window.setInterval(() => {
        setGlowAnim({
          scale: 1.2 + Math.random() * 0.6, // Start higher, larger range (1.2 - 1.8)
          opacity: 0.5 + Math.random() * 0.2 // Reduced range and starting value
        });
      }, 200 + Math.random() * 150); // Slightly increased interval (200-350ms) for smoother randomness
    } else {
      // Reset state and clear interval when not speaking
      setGlowAnim({ scale: 1, opacity: 0 }); // Set opacity to 0 when not speaking
      if (interval) clearInterval(interval);
    }
    // Cleanup interval on state change or unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bubbleState]); // Depend on bubbleState

  useEffect(() => {
    // Example: Trigger animation based on a 'connecting' state if you add it
    setIsAnimating(state === 'connecting');

    if (state === 'connecting') {
      setShowExtendedMessage(false);
      timeoutRef.current = window.setTimeout(() => {
        setShowExtendedMessage(true);
      }, 10000); // Show extended message after 10s
    } else {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      setShowExtendedMessage(false);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [state]);

  // Play activation sound when bubble becomes active
  useEffect(() => {
    if (bubbleState === 'listening') {
      // const audio = new Audio('/activation-ding.mp3');
      // audio.play();
    }
  }, [bubbleState]);

  useEffect(() => {
    // console.log('micAudioLevel:', micAudioLevel);
  }, [micAudioLevel]);

  // Start/stop audio visualization based on assistant state
  useEffect(() => {
    if (bubbleState === 'listening' || bubbleState === 'speaking') {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 64;
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          const updateAudioData = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            const processedData = Array.from(dataArray)
              .slice(0, 32)
              .map((value) => value / 255);
            setAudioData(processedData);
            animationFrameRef.current = requestAnimationFrame(updateAudioData);
          };
          updateAudioData();
        } catch (error) {
          setAudioData(Array(32).fill(0));
        }
      })();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      setAudioData(Array(32).fill(0));
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    };
  }, [bubbleState]);

  return (
    <div className="h-[200px] max-w-[90vw] mx-auto flex flex-col items-center justify-center">
      <div className="relative animate-float">
        {/* Speech reactive glow effect - REMOVED */}

        {/* Transparent bubble with gradient border - Style based on bubbleState AND state */}
        <motion.div
          key={bubbleState}
          className="w-[180px] h-[180px] rounded-full backdrop-blur-sm flex items-center justify-center relative cursor-pointer z-20"
          style={{
            background: bubbleState === 'listening' || bubbleState === 'speaking'
              ? 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.32) 100%)'
              : 'linear-gradient(to right, rgba(37, 99, 235, 0.10), rgba(59, 130, 246, 0.18))',
            border: '1.5px solid rgba(59, 130, 246, 0.45)',
          }}
          whileHover={{
            scale: 1.02,
            background:
              'linear-gradient(135deg, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.36) 100%)',
            boxShadow: '0 0 40px 10px rgba(59,130,246,0.25)',
            transition: { duration: 0.1, ease: 'easeOut' },
          }}
          animate={{
            // Explicitly define boxShadow based on state for the main bubble (none in all states now)
            boxShadow: 'none',
          }}
          transition={{
            duration: 0.1,
            ease: 'easeOut'
          }}
          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
          onClick={onClick}
          title="Talk to AVA"
        >
          {/* Active state animations - inner swirl (not jitter) */}
          {state === 'speaking' && (
            <div
              className="absolute inset-[-30%] w-[160%] h-[160%] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)",
              }}
            />
          )}

          {/* Swirling, pulsing, wavy animated blue glow when speaking - uses random jitters */}
          {/* Explicitly tied to speaking state */}
          {bubbleState === 'speaking' && (
            <motion.div
              className="absolute inset-[-40px] rounded-full blur-2xl pointer-events-none z-10"
              animate={{
                opacity: glowAnim.opacity,
                scale: glowAnim.scale,
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 0.6, // Overall duration for other properties
                ease: "easeOut", // Overall ease
                scale: { duration: 0.5, ease: "easeInOut" } // Specific transition for scale with longer duration
              }}
              style={{
                background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%)" // Further reduced opacity for a softer glow
              }}
            />
          )}

          {/* Microphone Icon */}
          <div className="relative z-10">
            <MicrophoneIcon isActive={bubbleState === 'listening' || bubbleState === 'speaking'} />
          </div>

          {/* Consolidated Idle Animation Layer (Subtle glow + color shift) */}
          {/* Render always, control visibility and animation with animate prop */}
          <motion.div
            key="consolidated-idle-animation" // Keep key for layer identity
            className="absolute inset-[-15px] rounded-full pointer-events-none z-10" // Position behind main bubble
            style={{
              overflow: 'hidden', // Keep for color shift effect
              // Gentle color shift animation (will animate based on 'animate' prop)
              background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
              filter: 'blur(10px)',
              mixBlendMode: 'soft-light',
            }}
            initial={{ opacity: 0 }} // Initial state: invisible
            animate={ state === 'idle' || state === 'undefined' ?
              { // Animate to idle/undefined state
                opacity: 0.5, // Make layer visible
                background: [
                  'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
                  'linear-gradient(225deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
                  'linear-gradient(315deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))'
                ],
              }
            :
              { // Animate to non-idle state
                opacity: 0, // Make layer invisible
                background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))', // Static background
              }
            }
            transition={{
              // Separate transitions for opacity and background
              opacity: { duration: 0.3, ease: "easeOut" },
              background: state === 'idle' || state === 'undefined' ? {
                repeat: Infinity,
                duration: 8,
                ease: 'linear'
              } : false, // Disable background animation when not idle/undefined
            }}
          >
            {/* Nested div for the subtle static outer glow */}
            <motion.div
              className="absolute inset-[5px] rounded-full" // Adjust inset as needed to position the glow correctly
              initial={{ boxShadow: 'none' }} // Initial state: no boxShadow
              animate={ state === 'idle' || state === 'undefined' ?
                 { boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)' } // Animate to idle/undefined state boxShadow
                 :
                 { boxShadow: 'none' } // Animate to non-idle state boxShadow
              }
               transition={{
                boxShadow: { duration: 0.3, ease: "easeOut" }, // Smooth transition for boxShadow
               }}
            />
          </motion.div>
        </motion.div>

        {/* Control Bar - Only show when assistant is active (listening or speaking) */}
        {(bubbleState === 'listening' || bubbleState === 'speaking') && (
        <div className="absolute bottom-[-70px] left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-4 py-1 bg-white/15 backdrop-blur-md rounded-full border border-white/30 shadow-lg mt-4">
          {/* Audio Visualizer Animation */}
          <div style={{ width: 48, height: 48 }}>
            <AudioVisualizer audioData={audioData} />
          </div>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-rose-500/60 text-white shadow-lg hover:bg-rose-600/80 transition-colors border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:ring-offset-2 backdrop-blur-sm"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default AvaVoiceBubble;