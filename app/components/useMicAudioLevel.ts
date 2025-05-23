import { useEffect, useRef, useState } from 'react';

export default function useMicAudioLevel(enabled: boolean) {
  const [level, setLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLevel(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      audioContextRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
      sourceRef.current = null;
      streamRef.current = null;
      return;
    }

    let isMounted = true;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      if (!isMounted) return;
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      dataArrayRef.current = dataArray;
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      function update() {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        // Calculate RMS (root mean square) for volume
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const v = (dataArrayRef.current[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArrayRef.current.length);
        setLevel(rms);
        rafRef.current = requestAnimationFrame(update);
      }
      update();
    });
    return () => {
      isMounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [enabled]);

  return level;
} 