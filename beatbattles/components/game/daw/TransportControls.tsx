'use client';

import { useState } from 'react';

interface TransportControlsProps {
  isPlaying: boolean;
  bpm: number;
  onPlayStop: () => void;
  onBpmChange: (bpm: number) => void;
  onSave?: () => void;
}

const TransportControls = ({
  isPlaying,
  bpm,
  onPlayStop,
  onBpmChange,
  onSave
}: TransportControlsProps) => {
  const [localBpm, setLocalBpm] = useState(bpm);
  
  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(e.target.value, 10);
    setLocalBpm(newBpm);
  };
  
  const handleBpmBlur = () => {
    // Ensure BPM is within reasonable limits
    const validBpm = Math.min(Math.max(localBpm, 60), 180);
    setLocalBpm(validBpm);
    onBpmChange(validBpm);
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Play/Stop Button */}
        <button
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
            isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } transition-colors duration-150`}
          onClick={onPlayStop}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
        
        {/* BPM Control */}
        <div className="flex items-center space-x-2">
          <label htmlFor="bpm" className="text-sm font-medium">BPM:</label>
          <input
            id="bpm"
            type="number"
            min="60"
            max="180"
            value={localBpm}
            onChange={handleBpmChange}
            onBlur={handleBpmBlur}
            className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center"
          />
          <input
            type="range"
            min="60"
            max="180"
            value={localBpm}
            onChange={handleBpmChange}
            onMouseUp={handleBpmBlur}
            className="w-32"
          />
        </div>
        
        {/* Metronome Toggle - Will be implemented later */}
        <button
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          title="Toggle Metronome"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      {/* Save Button */}
      {onSave && (
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          onClick={onSave}
        >
          Save Composition
        </button>
      )}
    </div>
  );
};

export default TransportControls; 