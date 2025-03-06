import React, { useState, useEffect, useCallback } from 'react';
import { InstrumentType, createSynth, midiToNoteName } from '../../../../lib/audio/toneUtils';
import { Note, Track } from '../../../../lib/types';
import { v4 as uuidv4 } from 'uuid';

interface PianoProps {
  track: Track;
  onNotesChange: (notes: Note[]) => void;
  isRecording: boolean;
  currentBeat?: number;
}

// Define piano key layout
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];
const OCTAVE_START = 3;
const OCTAVE_END = 5;

// Generate all keys in the range
const generateKeys = () => {
  const keys: { note: string; midi: number; isBlack: boolean }[] = [];
  
  for (let octave = OCTAVE_START; octave <= OCTAVE_END; octave++) {
    WHITE_KEYS.forEach(note => {
      const fullNote = `${note}${octave}`;
      const midi = getMidiNumber(fullNote);
      keys.push({ note: fullNote, midi, isBlack: false });
    });
  }
  
  for (let octave = OCTAVE_START; octave <= OCTAVE_END; octave++) {
    BLACK_KEYS.forEach(note => {
      const fullNote = `${note}${octave}`;
      const midi = getMidiNumber(fullNote);
      keys.push({ note: fullNote, midi, isBlack: true });
    });
  }
  
  // Sort by MIDI number
  return keys.sort((a, b) => a.midi - b.midi);
};

// Convert note name to MIDI number
const getMidiNumber = (note: string): number => {
  const noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  
  const noteName = note.slice(0, -1);
  const octave = parseInt(note.slice(-1));
  
  return (octave + 1) * 12 + noteMap[noteName];
};

const Piano: React.FC<PianoProps> = ({
  track,
  onNotesChange,
  isRecording,
  currentBeat = 0,
}) => {
  const [activeKeys, setActiveKeys] = useState<number[]>([]);
  const [synth, setSynth] = useState<any>(null);
  const keys = generateKeys();
  
  // Initialize synth
  useEffect(() => {
    const newSynth = createSynth(track.instrumentType as InstrumentType);
    setSynth(newSynth);
    
    return () => {
      if (newSynth && typeof newSynth.dispose === 'function') {
        newSynth.dispose();
      }
    };
  }, [track.instrumentType]);
  
  // Handle key press
  const handleKeyPress = useCallback((midi: number) => {
    if (!synth) return;
    
    // Play the note
    const frequency = midi;
    synth.triggerAttackRelease(frequency, '8n');
    
    // Add to active keys
    setActiveKeys(prev => [...prev, midi]);
    
    // If recording, add note to track
    if (isRecording) {
      const newNote: Note = {
        id: uuidv4(),
        pitch: midi,
        startTime: currentBeat,
        duration: 0.5, // Eighth note
        velocity: 100,
      };
      
      onNotesChange([...track.notes, newNote]);
    }
  }, [synth, isRecording, currentBeat, track.notes, onNotesChange]);
  
  // Handle key release
  const handleKeyRelease = useCallback((midi: number) => {
    setActiveKeys(prev => prev.filter(key => key !== midi));
  }, []);
  
  // Render piano keys
  const renderKeys = () => {
    // First render white keys as the base
    const whiteKeys = keys.filter(key => !key.isBlack);
    const blackKeys = keys.filter(key => key.isBlack);
    
    return (
      <div className="relative h-48 flex">
        {/* White keys */}
        {whiteKeys.map(key => (
          <div
            key={key.note}
            className={`w-12 h-full border border-gray-300 rounded-b-md flex items-end justify-center pb-2 ${
              activeKeys.includes(key.midi) ? 'bg-blue-100' : 'bg-white'
            } cursor-pointer`}
            onMouseDown={() => handleKeyPress(key.midi)}
            onMouseUp={() => handleKeyRelease(key.midi)}
            onMouseLeave={() => handleKeyRelease(key.midi)}
          >
            <span className="text-xs text-gray-500">{key.note}</span>
          </div>
        ))}
        
        {/* Black keys (overlaid) */}
        <div className="absolute top-0 left-0 flex h-2/3">
          {blackKeys.map(key => {
            // Calculate position based on the corresponding white key
            const noteWithoutOctave = key.note.slice(0, -1).replace('#', '');
            const octave = key.note.slice(-1);
            const prevWhiteKey = `${noteWithoutOctave}${octave}`;
            const index = whiteKeys.findIndex(k => k.note === prevWhiteKey);
            
            return (
              <div
                key={key.note}
                className={`w-8 h-full bg-gray-800 rounded-b-md absolute flex items-end justify-center pb-1 ${
                  activeKeys.includes(key.midi) ? 'bg-gray-600' : 'bg-gray-800'
                } cursor-pointer z-10`}
                style={{ left: `${index * 48 + 36}px` }}
                onMouseDown={() => handleKeyPress(key.midi)}
                onMouseUp={() => handleKeyRelease(key.midi)}
                onMouseLeave={() => handleKeyRelease(key.midi)}
              >
                <span className="text-xs text-gray-300">{key.note}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
      <h3 className="text-lg font-medium mb-4">Piano</h3>
      {renderKeys()}
    </div>
  );
};

export default Piano; 