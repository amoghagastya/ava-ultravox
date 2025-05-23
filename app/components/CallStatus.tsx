'use client';

import React from 'react';

interface CallStatusProps {
  isCallActive: boolean;
  agentStatus: string;
  onStartCall: () => void;
  onEndCall: () => void;
}

const CallStatus: React.FC<CallStatusProps> = ({
  isCallActive,
  agentStatus,
  onStartCall,
  onEndCall,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        {/* Replace nested buttons with a single button */}
        <button
          onClick={onStartCall}
          disabled={isCallActive}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCallActive ? "Call in Progress" : "Start Training Call"}
        </button>
        
        {isCallActive && (
          <button
            onClick={onEndCall}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            End Call
          </button>
        )}
      </div>
      
      <div className="text-gray-400 text-sm">
        Status: {agentStatus}
      </div>
    </div>
  );
};

export default CallStatus;