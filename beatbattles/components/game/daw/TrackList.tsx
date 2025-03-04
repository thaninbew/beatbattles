'use client';

import { useState } from 'react';
import { Track } from '../../../lib/types';

interface TrackListProps {
  tracks: Track[];
  selectedTrackId: string;
  onTrackSelect: (trackId: string) => void;
  onTrackMute: (trackId: string, muted: boolean) => void;
}

// Map instrument types to display names
const instrumentNames: Record<string, string> = {
  'synth': 'Melody',
  'poly': 'Chords',
  'mono': 'Bass',
  'membrane': 'Drums',
};

const TrackList = ({ tracks, selectedTrackId, onTrackSelect, onTrackMute }: TrackListProps) => {
  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold mb-4 px-2">Tracks</h3>
      <div className="space-y-2">
        {tracks.map((track) => (
          <TrackItem
            key={track.id}
            track={track}
            isSelected={track.id === selectedTrackId}
            onSelect={() => onTrackSelect(track.id)}
            onMute={(muted) => onTrackMute(track.id, muted)}
          />
        ))}
      </div>
    </div>
  );
};

interface TrackItemProps {
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onMute: (muted: boolean) => void;
}

const TrackItem = ({ track, isSelected, onSelect, onMute }: TrackItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get display name for the instrument type
  const displayName = instrumentNames[track.instrumentType] || 'Instrument';
  
  // Determine background color based on instrument type
  const getBgColor = () => {
    if (isSelected) return 'bg-blue-700';
    if (isHovered) return 'bg-gray-700';
    return 'bg-gray-800';
  };
  
  return (
    <div
      className={`${getBgColor()} rounded-md p-3 cursor-pointer transition-colors duration-150`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${track.muted ? 'bg-red-500' : 'bg-green-500'} mr-3`}></div>
          <span className="font-medium">{displayName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={`p-1 rounded ${track.muted ? 'bg-red-700 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
            onClick={(e) => {
              e.stopPropagation();
              onMute(!track.muted);
            }}
            title={track.muted ? 'Unmute' : 'Mute'}
          >
            {track.muted ? 'M' : 'M'}
          </button>
        </div>
      </div>
      
      {/* Show additional controls when selected */}
      {isSelected && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="flex items-center">
            <span className="text-xs text-gray-400 mr-2">Volume</span>
            <input
              type="range"
              min="-60"
              max="0"
              value={track.volume}
              className="flex-1"
              onChange={(e) => {
                // Volume control logic will be implemented later
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackList; 