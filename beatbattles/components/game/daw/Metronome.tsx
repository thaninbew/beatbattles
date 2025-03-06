import React, { useEffect, useState, useRef } from 'react';
import { useAudioContext } from '../../../lib/audio/AudioContextProvider';
import { createMetronome } from '../../../lib/audio/toneUtils';
import { Transport } from 'tone';

interface MetronomeProps {
  enabled: boolean;
  volume?: number;
  onBeat?: (beat: number) => void;
}

const Metronome: React.FC<MetronomeProps> = ({
  enabled = true,
  volume = 0.5,
  onBeat,
}) => {
  const { isInitialized, isPlaying, bpm } = useAudioContext();
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const metronomeRef = useRef<any>(null);
  const audioContextInitializedRef = useRef<boolean>(false);

  // Initialize metronome when audio context is initialized
  useEffect(() => {
    if (isInitialized && !audioContextInitializedRef.current) {
      audioContextInitializedRef.current = true;
      
      // Create a metronome that triggers on each beat
      metronomeRef.current = createMetronome(bpm, (time, beat) => {
        // Only trigger sound and visual feedback if enabled
        if (enabled) {
          // Update current beat for visual feedback
          setCurrentBeat(beat);
          
          // Call onBeat callback if provided
          if (onBeat) {
            onBeat(beat);
          }
        }
      });
    }
    
    return () => {
      // Clean up metronome when component unmounts
      if (metronomeRef.current) {
        metronomeRef.current.dispose();
        metronomeRef.current = null;
      }
    };
  }, [isInitialized, bpm, enabled, onBeat]);

  // Update BPM when it changes
  useEffect(() => {
    if (isInitialized && Transport) {
      Transport.bpm.value = bpm;
    }
  }, [isInitialized, bpm]);

  // Render beat indicators
  const renderBeatIndicators = () => {
    const beats = [0, 1, 2, 3]; // 4/4 time signature
    
    return (
      <div className="flex space-x-2">
        {beats.map((beat) => (
          <div
            key={beat}
            className={`w-4 h-4 rounded-full ${
              currentBeat === beat && isPlaying
                ? 'bg-red-500'
                : beat === 0
                ? 'bg-gray-400'
                : 'bg-gray-300'
            } transition-colors duration-100`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm font-medium text-gray-700">Metronome</div>
      {renderBeatIndicators()}
    </div>
  );
};

export default Metronome; 