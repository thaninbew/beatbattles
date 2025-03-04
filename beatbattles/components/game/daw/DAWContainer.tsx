'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { start, Transport, now } from 'tone';
import { Track, Composition, Note } from '../../../lib/types';
import { 
  initializeToneContext, 
  createMetronome, 
  startTransport, 
  stopTransport,
  createSynth,
  InstrumentType,
  ToneAudioNode,
  ToneLoop,
  ToneInstrument
} from '../../../lib/audio/toneUtils';
import TrackList from './TrackList';
import PianoRoll from './PianoRoll';
import DrumGrid from './instruments/DrumGrid';
import TransportControls from './TransportControls';

// Default instrument configurations
const DEFAULT_INSTRUMENTS = [
  { id: uuidv4(), name: 'Drums', type: InstrumentType.MEMBRANE_SYNTH },
  { id: uuidv4(), name: 'Bass', type: InstrumentType.MONO_SYNTH },
  { id: uuidv4(), name: 'Chords', type: InstrumentType.POLY_SYNTH },
  { id: uuidv4(), name: 'Melody', type: InstrumentType.SYNTH },
];

interface DAWContainerProps {
  userId: string;
  initialComposition?: Composition;
  onSave?: (composition: Composition) => void;
}

const DAWContainer = ({ userId, initialComposition, onSave }: DAWContainerProps) => {
  // State for tracks and composition
  const [tracks, setTracks] = useState<Track[]>(
    initialComposition?.tracks || 
    DEFAULT_INSTRUMENTS.map(instrument => ({
      id: instrument.id,
      instrumentType: instrument.type,
      notes: [],
      volume: 0,
      muted: false
    }))
  );
  
  const [bpm, setBpm] = useState<number>(initialComposition?.bpm || 120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || '');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Refs for Tone.js objects
  const metronomeRef = useRef<ToneLoop | null>(null);
  const synthsRef = useRef<Map<string, ToneAudioNode>>(new Map());
  const currentBeatRef = useRef<number>(0);
  
  // Initialize Tone.js context
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await initializeToneContext();
        
        // Create metronome
        const metronome = createMetronome(bpm, (time, beat) => {
          currentBeatRef.current = beat;
          // Visual metronome update logic will go here
        });
        
        metronomeRef.current = metronome;
        
        // Create synths for each track
        tracks.forEach(track => {
          const instrumentType = track.instrumentType as InstrumentType;
          const synth = createSynth(instrumentType);
          synthsRef.current.set(track.id, synth);
        });
        
        // Set BPM
        Transport.bpm.value = bpm;
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };
    
    initializeAudio();
    
    // Cleanup function
    return () => {
      if (metronomeRef.current) {
        metronomeRef.current.dispose();
      }
      
      synthsRef.current.forEach(synth => {
        if (synth.dispose) {
          synth.dispose();
        }
      });
      
      // Only stop transport if audio was successfully initialized
      if (isInitialized) {
        stopTransport();
      }
    };
  }, []);
  
  // Update BPM when it changes
  useEffect(() => {
    if (isInitialized) {
      Transport.bpm.value = bpm;
    }
  }, [bpm, isInitialized]);
  
  // Handle play/stop
  const handlePlayStop = async () => {
    if (!isInitialized) {
      console.warn('Cannot play/stop: Audio context not initialized');
      return;
    }
    
    try {
      if (isPlaying) {
        stopTransport();
        if (metronomeRef.current) {
          metronomeRef.current.stop();
        }
        setIsPlaying(false);
      } else {
        if (metronomeRef.current) {
          metronomeRef.current.start(0);
        }
        startTransport();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error in play/stop:', error);
      // Reset the playing state if an error occurs
      setIsPlaying(false);
    }
  };
  
  // Handle BPM change
  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
  };
  
  // Handle track selection
  const handleTrackSelect = (trackId: string) => {
    setSelectedTrackId(trackId);
  };
  
  // Handle track mute toggle
  const handleTrackMute = (trackId: string, muted: boolean) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId ? { ...track, muted } : track
      )
    );
    
    // Mute the corresponding synth
    const synth = synthsRef.current.get(trackId);
    if (synth) {
      // @ts-ignore - Tone.js typings don't include mute property on all synths
      synth.volume.value = muted ? -Infinity : 0;
    }
  };
  
  // Handle note add/edit/delete
  const handleNotesChange = (trackId: string, notes: Note[]) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId ? { ...track, notes } : track
      )
    );
  };
  
  // Handle save
  const handleSave = () => {
    if (onSave) {
      const composition: Composition = {
        userId,
        tracks,
        bpm
      };
      onSave(composition);
    }
  };
  
  // Get the selected track
  const selectedTrack = tracks.find(track => track.id === selectedTrackId);
  
  // Render the appropriate editor based on the selected track type
  const renderTrackEditor = () => {
    if (!selectedTrack) return null;
    
    // For drum tracks, use the DrumGrid component
    if (selectedTrack.instrumentType === InstrumentType.MEMBRANE_SYNTH) {
      return (
        <DrumGrid
          track={selectedTrack}
          isPlaying={isPlaying}
          currentBeat={currentBeatRef.current}
          onNotesChange={(notes) => handleNotesChange(selectedTrack.id, notes)}
        />
      );
    }
    
    // For all other tracks, use the PianoRoll component
    return (
      <PianoRoll
        track={selectedTrack}
        isPlaying={isPlaying}
        currentBeat={currentBeatRef.current}
        onNotesChange={(notes) => handleNotesChange(selectedTrack.id, notes)}
      />
    );
  };
  
  return (
    <div className="flex flex-col w-full h-full bg-gray-900 text-white rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Digital Audio Workstation</h2>
        <p className="text-sm text-gray-400">Create your 8-bar masterpiece</p>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Track List */}
        <div className="w-64 border-r border-gray-700 overflow-y-auto">
          <TrackList 
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            onTrackSelect={handleTrackSelect}
            onTrackMute={handleTrackMute}
          />
        </div>
        
        {/* Piano Roll / Grid */}
        <div className="flex-1 overflow-auto">
          {renderTrackEditor()}
        </div>
      </div>
      
      {/* Transport Controls */}
      <div className="p-4 border-t border-gray-700">
        <TransportControls
          isPlaying={isPlaying}
          bpm={bpm}
          onPlayStop={handlePlayStop}
          onBpmChange={handleBpmChange}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default DAWContainer; 