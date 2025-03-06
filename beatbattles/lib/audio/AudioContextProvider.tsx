import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { initializeToneContext, startTransport, stopTransport, disposeToneResources } from './toneUtils';

interface AudioContextState {
  isInitialized: boolean;
  isPlaying: boolean;
  bpm: number;
  initialize: () => Promise<void>;
  play: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  error: Error | null;
}

const defaultAudioContextState: AudioContextState = {
  isInitialized: false,
  isPlaying: false,
  bpm: 120,
  initialize: async () => {},
  play: () => {},
  stop: () => {},
  setBpm: () => {},
  error: null,
};

const AudioContext = createContext<AudioContextState>(defaultAudioContextState);

export const useAudioContext = () => useContext(AudioContext);

interface AudioContextProviderProps {
  children: ReactNode;
  initialBpm?: number;
}

export const AudioContextProvider: React.FC<AudioContextProviderProps> = ({
  children,
  initialBpm = 120,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(initialBpm);
  const [error, setError] = useState<Error | null>(null);

  // Initialize Tone.js context
  const initialize = useCallback(async () => {
    try {
      await initializeToneContext();
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize audio context:', err);
      setError(err instanceof Error ? err : new Error('Unknown error initializing audio context'));
    }
  }, []);

  // Start playback
  const play = useCallback(() => {
    if (!isInitialized) {
      console.warn('Cannot play: Audio context not initialized');
      return;
    }

    try {
      startTransport();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error starting playback:', err);
      setError(err instanceof Error ? err : new Error('Unknown error starting playback'));
    }
  }, [isInitialized]);

  // Stop playback
  const stop = useCallback(() => {
    if (!isInitialized) {
      console.warn('Cannot stop: Audio context not initialized');
      return;
    }

    try {
      stopTransport();
      setIsPlaying(false);
    } catch (err) {
      console.error('Error stopping playback:', err);
      setError(err instanceof Error ? err : new Error('Unknown error stopping playback'));
    }
  }, [isInitialized]);

  // Update BPM
  const handleSetBpm = useCallback((newBpm: number) => {
    setBpm(newBpm);
    // BPM update is handled in the DAWContainer component
  }, []);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (isInitialized) {
        try {
          stopTransport();
          // Note: We don't dispose of all resources here as they might be managed by child components
          // Child components should handle their own resource disposal
        } catch (err) {
          console.error('Error cleaning up audio resources:', err);
        }
      }
    };
  }, [isInitialized]);

  const value: AudioContextState = {
    isInitialized,
    isPlaying,
    bpm,
    initialize,
    play,
    stop,
    setBpm: handleSetBpm,
    error,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export default AudioContextProvider; 