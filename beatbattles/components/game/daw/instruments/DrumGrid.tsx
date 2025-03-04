'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Track, Note } from '../../../../lib/types';

interface DrumGridProps {
  track: Track;
  isPlaying: boolean;
  currentBeat: number;
  onNotesChange: (notes: Note[]) => void;
}

// Drum kit configuration
const DRUM_KIT = [
  { name: 'Kick', pitch: 36 },
  { name: 'Snare', pitch: 38 },
  { name: 'Closed Hi-hat', pitch: 42 },
  { name: 'Open Hi-hat', pitch: 46 },
  { name: 'Low Tom', pitch: 41 },
  { name: 'Mid Tom', pitch: 45 },
  { name: 'High Tom', pitch: 48 },
  { name: 'Crash', pitch: 49 },
  { name: 'Ride', pitch: 51 },
  { name: 'Clap', pitch: 39 },
];

// Grid constants
const GRID_COLS = 32; // 8 bars * 4 beats per bar = 32 beats
const CELL_WIDTH = 40;
const CELL_HEIGHT = 40;
const LABEL_WIDTH = 120;

const DrumGrid = ({ track, isPlaying, currentBeat, onNotesChange }: DrumGridProps) => {
  const [notes, setNotes] = useState<Note[]>(track.notes);
  
  // Update local notes when track notes change
  useEffect(() => {
    setNotes(track.notes);
  }, [track.notes]);
  
  // Update parent component when notes change
  useEffect(() => {
    onNotesChange(notes);
  }, [notes, onNotesChange]);
  
  // Toggle a drum hit at the specified position
  const toggleDrumHit = (drumPitch: number, col: number) => {
    // Check if there's already a note at this position
    const existingNoteIndex = notes.findIndex(
      note => note.startTime === col && note.pitch === drumPitch
    );
    
    if (existingNoteIndex >= 0) {
      // Remove the existing note
      setNotes(prevNotes => prevNotes.filter((_, index) => index !== existingNoteIndex));
    } else {
      // Add a new note
      const newNote: Note = {
        id: uuidv4(),
        pitch: drumPitch,
        startTime: col,
        duration: 1,
        velocity: 100
      };
      
      setNotes(prevNotes => [...prevNotes, newNote]);
    }
  };
  
  // Check if a cell has a note
  const hasNote = (drumPitch: number, col: number): boolean => {
    return notes.some(note => note.pitch === drumPitch && note.startTime === col);
  };
  
  // Render the grid cells
  const renderGrid = () => {
    const rows = [];
    
    for (let rowIndex = 0; rowIndex < DRUM_KIT.length; rowIndex++) {
      const drum = DRUM_KIT[rowIndex];
      const cells = [];
      
      // Add the drum name label
      cells.push(
        <div
          key={`label-${rowIndex}`}
          className="absolute left-0 top-0 h-full border-r border-b border-gray-700 bg-gray-800 flex items-center px-3"
          style={{ width: LABEL_WIDTH, height: CELL_HEIGHT }}
        >
          <span className="text-sm font-medium truncate">{drum.name}</span>
        </div>
      );
      
      // Add the grid cells
      for (let col = 0; col < GRID_COLS; col++) {
        const isBeatStart = col % 4 === 0;
        const isCurrentBeat = col === currentBeat && isPlaying;
        const hasNoteHere = hasNote(drum.pitch, col);
        
        cells.push(
          <div
            key={`cell-${rowIndex}-${col}`}
            className={`absolute border-r border-b border-gray-700 ${
              isBeatStart ? 'border-l border-gray-500' : ''
            } ${isCurrentBeat ? 'bg-blue-900 bg-opacity-30' : ''}`}
            style={{
              left: LABEL_WIDTH + col * CELL_WIDTH,
              top: 0,
              width: CELL_WIDTH,
              height: CELL_HEIGHT
            }}
            onClick={() => toggleDrumHit(drum.pitch, col)}
          >
            {hasNoteHere && (
              <div className="absolute inset-1 bg-blue-500 rounded-full" />
            )}
          </div>
        );
      }
      
      rows.push(
        <div
          key={`row-${rowIndex}`}
          className="relative"
          style={{ height: CELL_HEIGHT }}
        >
          {cells}
        </div>
      );
    }
    
    return rows;
  };
  
  // Render beat numbers
  const renderBeatNumbers = () => {
    const numbers = [];
    
    for (let col = 0; col < GRID_COLS; col += 4) {
      const barNumber = Math.floor(col / 4) + 1;
      
      numbers.push(
        <div
          key={`beat-${col}`}
          className="absolute text-xs text-gray-400 flex items-center justify-center"
          style={{
            left: LABEL_WIDTH + col * CELL_WIDTH,
            top: 0,
            width: CELL_WIDTH * 4,
            height: 20
          }}
        >
          Bar {barNumber}
        </div>
      );
    }
    
    return numbers;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Drum Pattern</h3>
      </div>
      
      <div className="flex-1 overflow-auto relative">
        <div className="sticky top-0 left-0 h-5 bg-gray-900 z-30 pl-[120px]">
          {renderBeatNumbers()}
        </div>
        
        <div 
          className="relative"
          style={{ 
            width: LABEL_WIDTH + GRID_COLS * CELL_WIDTH, 
            height: DRUM_KIT.length * CELL_HEIGHT 
          }}
        >
          {renderGrid()}
        </div>
      </div>
    </div>
  );
};

export default DrumGrid; 