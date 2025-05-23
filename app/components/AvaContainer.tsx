import { endCall, startCall } from '@/lib/callFunctions';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { UltravoxExperimentalMessageEvent } from 'ultravox-client'; // <-- Added this import
import { demoConfig } from '../demo-config';
import AvaVoiceBubble from './AvaVoiceBubble';

const AvaContainer: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [status, setStatus] = useState('');

  const handleToggleListening = async () => {
    if (!isListening) {
      try {
        await startCall({
          onStatusChange: (status: string | undefined) => {
            setStatus(status || 'undefined'); // Always update status from callback
            console.log('Status:', status); // Added console log for status
          },
          onTranscriptChange: (transcripts: any[] | undefined) => {
            // Handle transcripts if needed
            console.log('Transcripts:', transcripts); // Added console log for transcripts
          },
          onDebugMessage: (message: UltravoxExperimentalMessageEvent) => { // Type is now recognized
            // console.log('Ultravox debug message:', message);
            // Handle debug messages if needed
            if (message.type === 'audio-level') {
              setAudioLevel((message as any).level || 0);
            }
            // Rely on onStatusChange for speaking/listening status
            console.log('Ultravox debug message::', message); // Optional: log debug messages
          }
        }, demoConfig.callConfig, true); // Using demoConfig as discussed

        setIsListening(true);
      } catch (error) {
        console.error('Failed to start call:', error);
        // Optionally reset state or show error to user
        setIsListening(false);
        setAudioLevel(0);
        setStatus('disconnected'); // Set a disconnected status on error
      }
    } else {
      await endCall();
      setIsListening(false);
      setAudioLevel(0); // Reset audio level when call ends
      // Do NOT set status to idle here, rely on onStatusChange
    }
  };

  const handleClose = async () => {
    await endCall();
    setIsListening(false);
    setAudioLevel(0);
    // Do NOT set status to idle here, rely on onStatusChange
  };

  useEffect(() => {
    console.log('audioLevel:', audioLevel);
  }, [audioLevel]);

  return (
    <div className="min-h-screen bg-gray-100/80 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="p-8"
      >
        <AvaVoiceBubble
          isListening={isListening}
          audioLevel={audioLevel}
          onClick={handleToggleListening}
          state={status || (isListening ? 'listening' : 'idle')}
          onClose={handleClose}
        />
      </motion.div>
    </div>
  );
};

export default AvaContainer;