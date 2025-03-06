'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  InstrumentType, 
  createSynth, 
  disposeToneResources,
  playTrack
} from '../../../lib/audio/toneUtils';
import { useAudioContext } from '../../../lib/audio/AudioContextProvider';
import { Note, Track, Composition } from '../../../lib/types';
import TrackList from './TrackList';
import TransportControls from './TransportControls';
import PianoRoll from './PianoRoll';
import DrumGrid from './instruments/DrumGrid';
import Piano from './instruments/Piano';
import Metronome from './Metronome';
import EffectsPanel from './EffectsPanel';

// Default instrument configurations
const DEFAULT_INSTRUMENTS = [
  { name: 'Synth', type: InstrumentType.SYNTH },
  { name: 'FM Synth', type: InstrumentType.FM_SYNTH },
  { name: 'AM Synth', type: InstrumentType.AM_SYNTH },
  { name: 'Membrane Synth', type: InstrumentType.MEMBRANE_SYNTH },
  { name: 'Metal Synth', type: InstrumentType.METAL_SYNTH },
  { name: 'Mono Synth', type: InstrumentType.MONO_SYNTH },
  { name: 'Pluck Synth', type: InstrumentType.PLUCK },
  { name: 'Poly Synth', type: InstrumentType.POLY_SYNTH },
];

interface DAWContainerProps {
  userId: string;
  initialComposition?: Composition;
  onSave?: (composition: Composition) => void;
  readOnly?: boolean;
}

const DAWContainer: React.FC<DAWContainerProps> = ({
  userId,
  initialComposition,
  onSave,
  readOnly = false,
}) => {
  // Use the audio context
  const { 
    isInitialized, 
    isPlaying, 
    bpm, 
    initialize, 
    play, 
    stop, 
    setBpm 
  } = useAudioContext();

  // State for tracks
  const [tracks, setTracks] = useState<Track[]>(
    initialComposition?.tracks || [
      {
        id: uuidv4(),
        instrumentType: InstrumentType.SYNTH,
        notes: [],
        volume: 0.8,
        muted: false,
      },
      {
        id: uuidv4(),
        instrumentType: InstrumentType.MEMBRANE_SYNTH,
        notes: [],
        volume: 0.8,
        muted: false,
      },
    ]
  );

  // State for selected track
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    tracks.length > 0 ? tracks[0].id : ''
  );

  // State for current beat (for metronome and recording)
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  
  // State for metronome enabled
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(true);
  
  // State for recording
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Refs for Tone.js objects
  const synthsRef = useRef<Record<string, any>>({});
  const effectsRef = useRef<Record<string, any[]>>({});

  // Initialize audio context on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
    
    // Set initial BPM if provided
    if (initialComposition?.bpm) {
      setBpm(initialComposition.bpm);
    }
    
    // Clean up on unmount
    return () => {
      // Dispose of all synths
      Object.values(synthsRef.current).forEach(synth => {
        if (synth && typeof synth.dispose === 'function') {
          synth.dispose();
        }
      });
      
      // Dispose of all effects
      Object.values(effectsRef.current).forEach(effects => {
        disposeToneResources(effects);
      });
    };
  }, [initialize, isInitialized, initialComposition, setBpm]);

  // Create synths for tracks
  useEffect(() => {
    // Create synths for tracks that don't have one
    tracks.forEach(track => {
      if (!synthsRef.current[track.id]) {
        synthsRef.current[track.id] = createSynth(track.instrumentType as InstrumentType);
      }
    });
    
    // Dispose of synths for tracks that no longer exist
    Object.keys(synthsRef.current).forEach(trackId => {
      if (!tracks.find(track => track.id === trackId)) {
        if (synthsRef.current[trackId] && typeof synthsRef.current[trackId].dispose === 'function') {
          synthsRef.current[trackId].dispose();
        }
        delete synthsRef.current[trackId];
      }
    });
  }, [tracks]);

  // Handle play/stop
  const handlePlayStop = useCallback(() => {
    if (!isInitialized) {
      console.warn('Cannot play/stop: Audio context not initialized');
      return;
    }
    
    if (isPlaying) {
      stop();
      setIsRecording(false);
    } else {
      play();
    }
  }, [isInitialized, isPlaying, play, stop]);

  // Handle BPM change
  const handleBpmChange = useCallback((newBpm: number) => {
    setBpm(newBpm);
  }, [setBpm]);

  // Handle track selection
  const handleTrackSelect = useCallback((trackId: string) => {
    setSelectedTrackId(trackId);
  }, []);

  // Handle track mute toggle
  const handleTrackMuteToggle = useCallback((trackId: string) => {
    setTracks(prevTracks =>
      prevTracks.map(track =>
        track.id === trackId ? { ...track, muted: !track.muted } : track
      )
    );
  }, []);

  // Handle notes change
  const handleNotesChange = useCallback((trackId: string, notes: Note[]) => {
    setTracks(prevTracks =>
      prevTracks.map(track =>
        track.id === trackId ? { ...track, notes } : track
      )
    );
  }, []);

  // Handle adding a new track
  const handleAddTrack = useCallback((instrumentType: InstrumentType) => {
    const newTrack: Track = {
      id: uuidv4(),
      instrumentType,
      notes: [],
      volume: 0.8,
      muted: false,
    };
    
    setTracks(prevTracks => [...prevTracks, newTrack]);
    setSelectedTrackId(newTrack.id);
  }, []);

  // Handle removing a track
  const handleRemoveTrack = useCallback((trackId: string) => {
    setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId));
    
    // If the selected track is removed, select another one
    if (selectedTrackId === trackId) {
      setSelectedTrackId(tracks.find(track => track.id !== trackId)?.id || '');
    }
    
    // Dispose of the synth
    if (synthsRef.current[trackId] && typeof synthsRef.current[trackId].dispose === 'function') {
      synthsRef.current[trackId].dispose();
    }
    delete synthsRef.current[trackId];
    
    // Dispose of effects
    if (effectsRef.current[trackId]) {
      disposeToneResources(effectsRef.current[trackId]);
    }
    delete effectsRef.current[trackId];
  }, [selectedTrackId, tracks]);

  // Handle saving the composition
  const handleSave = useCallback(() => {
    if (onSave) {
      const composition: Composition = {
        userId,
        tracks,
        bpm,
      };
      onSave(composition);
    }
  }, [userId, tracks, bpm, onSave]);

  // Handle metronome beat
  const handleMetronomeBeat = useCallback((beat: number) => {
    setCurrentBeat(beat);
  }, []);

  // Handle effects change
  const handleEffectsChange = useCallback((trackId: string, effects: any[]) => {
    effectsRef.current[trackId] = effects;
  }, []);

  // Handle recording toggle
  const handleRecordingToggle = useCallback(() => {
    setIsRecording(prev => !prev);
  }, []);

  // Get the selected track
  const selectedTrack = tracks.find(track => track.id === selectedTrackId);

  // Render the appropriate editor for the selected track
  const renderTrackEditor = () => {
    if (!selectedTrack) {
      return <div className="p-4 text-gray-500">No track selected</div>;
    }

    // For drum tracks, render the drum grid
    if (selectedTrack.instrumentType === InstrumentType.MEMBRANE_SYNTH) {
      return (
        <DrumGrid
          track={selectedTrack}
          onNotesChange={(notes) => handleNotesChange(selectedTrack.id, notes)}
          isPlaying={isPlaying}
          currentBeat={currentBeat}
        />
      );
    }
    
    // For piano-like instruments, render the piano component
    if ([InstrumentType.SYNTH, InstrumentType.FM_SYNTH, InstrumentType.AM_SYNTH].includes(
      selectedTrack.instrumentType as InstrumentType
    )) {
      return (
        <Piano
          track={selectedTrack}
          onNotesChange={(notes) => handleNotesChange(selectedTrack.id, notes)}
          isRecording={isRecording}
          currentBeat={currentBeat}
        />
      );
    }
    
    // For all other tracks, render the piano roll
    return (
      <PianoRoll
        track={selectedTrack}
        onNotesChange={(notes) => handleNotesChange(selectedTrack.id, notes)}
        isPlaying={isPlaying}
        currentBeat={currentBeat}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Beat Maker</h2>
        <div className="flex items-center space-x-4">
          <Metronome 
            enabled={metronomeEnabled} 
            onBeat={handleMetronomeBeat} 
          />
          <button
            onClick={() => setMetronomeEnabled(prev => !prev)}
            className={`px-3 py-1 rounded-md ${
              metronomeEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {metronomeEnabled ? 'Metronome On' : 'Metronome Off'}
          </button>
          <button
            onClick={handleRecordingToggle}
            className={`px-3 py-1 rounded-md ${
              isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            disabled={!isPlaying}
          >
            {isRecording ? 'Recording' : 'Record'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-4">
        {/* Track list */}
        <div className="col-span-3">
          <TrackList
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            onTrackSelect={handleTrackSelect}
            onTrackMute={handleTrackMuteToggle}
          />
          
          {/* Add track button */}
          {!readOnly && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Track
              </label>
              <div className="flex">
                <select
                  className="flex-1 p-2 border border-gray-300 rounded-l-md"
                  onChange={(e) => handleAddTrack(e.target.value as InstrumentType)}
                  value=""
                >
                  <option value="" disabled>
                    Select instrument...
                  </option>
                  {DEFAULT_INSTRUMENTS.map((instrument) => (
                    <option key={instrument.type} value={instrument.type}>
                      {instrument.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddTrack(InstrumentType.SYNTH)}
                  className="bg-blue-500 text-white px-4 rounded-r-md"
                >
                  +
                </button>
              </div>
            </div>
          )}
          
          {/* Effects panel */}
          {selectedTrack && (
            <div className="mt-4">
              <EffectsPanel
                trackId={selectedTrack.id}
                synth={synthsRef.current[selectedTrack.id]}
                onEffectsChange={(effects) => handleEffectsChange(selectedTrack.id, effects)}
              />
            </div>
          )}
        </div>
        
        {/* Track editor */}
        <div className="col-span-9">
          {renderTrackEditor()}
        </div>
      </div>
      
      {/* Transport controls */}
      <div className="mt-4">
        <TransportControls
          isPlaying={isPlaying}
          bpm={bpm}
          onPlayStop={handlePlayStop}
          onBpmChange={handleBpmChange}
          onSave={!readOnly ? handleSave : undefined}
        />
      </div>
    </div>
  );
};

export default DAWContainer; 