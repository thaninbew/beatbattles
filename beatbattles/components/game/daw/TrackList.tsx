'use client';

import React, { useState } from 'react';
import { Track } from '../../../lib/types';
import { InstrumentType } from '../../../lib/audio/toneUtils';

interface TrackListProps {
  tracks: Track[];
  selectedTrackId: string;
  onTrackSelect: (trackId: string) => void;
  onTrackMute: (trackId: string) => void;
}

// Map instrument types to display names
const instrumentNames: Record<string, string> = {
  [InstrumentType.SYNTH]: 'Synth',
  [InstrumentType.FM_SYNTH]: 'FM Synth',
  [InstrumentType.AM_SYNTH]: 'AM Synth',
  [InstrumentType.MEMBRANE_SYNTH]: 'Drums',
  [InstrumentType.METAL_SYNTH]: 'Metal',
  [InstrumentType.MONO_SYNTH]: 'Bass',
  [InstrumentType.PLUCK]: 'Pluck',
  [InstrumentType.POLY_SYNTH]: 'Poly',
};

const TrackList: React.FC<TrackListProps> = ({ 
  tracks, 
  selectedTrackId, 
  onTrackSelect, 
  onTrackMute 
}) => {
  return (
    <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
      <h3 className="text-lg font-semibold mb-4 px-2 text-gray-800">Tracks</h3>
      <div className="space-y-2">
        {tracks.map((track) => (
          <TrackItem
            key={track.id}
            track={track}
            isSelected={track.id === selectedTrackId}
            onSelect={() => onTrackSelect(track.id)}
            onMute={() => onTrackMute(track.id)}
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
  onMute: () => void;
}

const TrackItem: React.FC<TrackItemProps> = ({ 
  track, 
  isSelected, 
  onSelect, 
  onMute 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get display name for the instrument type
  const displayName = instrumentNames[track.instrumentType] || 'Instrument';
  
  // Determine background color based on selection state
  const getBgColor = () => {
    if (isSelected) return 'bg-blue-100 border-blue-500';
    if (isHovered) return 'bg-gray-100';
    return 'bg-white';
  };
  
  return (
    <div
      className={`${getBgColor()} rounded-md p-3 cursor-pointer transition-colors duration-150 border`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${track.muted ? 'bg-red-500' : 'bg-green-500'} mr-3`}></div>
          <span className="font-medium text-gray-800">{displayName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={`p-1 rounded ${
              track.muted 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onMute();
            }}
            title={track.muted ? 'Unmute' : 'Mute'}
          >
            {track.muted ? 'M' : 'M'}
          </button>
        </div>
      </div>
      
      {/* Show additional controls when selected */}
      {isSelected && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center">
            <span className="text-xs text-gray-600 mr-2">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={track.volume}
              className="flex-1"
              onChange={(e) => {
                // Volume control logic will be implemented later
                console.log('Volume changed:', e.target.value);
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