import React, { useEffect, useRef, useState } from 'react';

interface VoiceWaveformProps {
  audioLevel: number; // 0 to 1
}

const BAR_COUNT = 5;
const MIN_HEIGHT = 10;
const MAX_HEIGHT = 32;

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ audioLevel }) => {
  const [barHeights, setBarHeights] = useState<number[]>(Array(BAR_COUNT).fill(MIN_HEIGHT));
  const audioLevelRef = useRef(audioLevel);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    let running = true;
    function animate() {
      const now = Date.now();
      const newHeights = Array.from({ length: BAR_COUNT }).map((_, i) => {
        const phase = (i / BAR_COUNT) * Math.PI * 2;
        // Wavy effect: sin(time + phase)
        const wave = Math.sin(now / 180 + phase);
        // Modulate with audioLevel
        const mod = audioLevelRef.current * (0.7 + 0.3 * wave);
        return MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * mod;
      });
      setBarHeights(newHeights);
      if (running) requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'end', height: MAX_HEIGHT }}>
      {barHeights.map((height, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: `${height}px`,
            background: 'linear-gradient(180deg, #60a5fa 0%, #818cf8 100%)',
            borderRadius: 2,
            margin: '0 2px',
            transition: 'height 0.1s cubic-bezier(0.4,0,0.2,1)',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWaveform; 