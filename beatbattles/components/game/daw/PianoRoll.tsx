'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Track, Note } from '../../../lib/types';
import { midiToNoteName } from '../../../lib/audio/toneUtils';

interface PianoRollProps {
  track: Track;
  isPlaying: boolean;
  currentBeat: number;
  onNotesChange: (notes: Note[]) => void;
}

// Constants for the piano roll
const GRID_COLS = 32; // 8 bars * 4 beats per bar = 32 beats
const GRID_ROWS = 24; // 2 octaves
const CELL_WIDTH = 40;
const CELL_HEIGHT = 24;
const PIANO_KEY_WIDTH = 60;
const LOWEST_NOTE = 48; // C3

// Helper function to check if a note is a black key
const isBlackKey = (noteNumber: number): boolean => {
  const noteInOctave = noteNumber % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
};

const PianoRoll = ({ track, isPlaying, currentBeat, onNotesChange }: PianoRollProps) => {
  const [notes, setNotes] = useState<Note[]>(track.notes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startCell, setStartCell] = useState<{ col: number; row: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Update local notes when track notes change
  useEffect(() => {
    setNotes(track.notes);
  }, [track.notes]);
  
  // Update parent component when notes change
  useEffect(() => {
    onNotesChange(notes);
  }, [notes, onNotesChange]);
  
  // Handle cell click to add/select notes
  const handleCellClick = (col: number, row: number) => {
    const pitch = LOWEST_NOTE + (GRID_ROWS - 1 - row);
    
    // Check if there's already a note at this position
    const existingNoteIndex = notes.findIndex(
      note => note.startTime === col && note.pitch === pitch
    );
    
    if (existingNoteIndex >= 0) {
      // Select the existing note
      setSelectedNoteId(notes[existingNoteIndex].id);
    } else {
      // Create a new note
      const newNote: Note = {
        id: uuidv4(),
        pitch,
        startTime: col,
        duration: 1,
        velocity: 100
      };
      
      setNotes(prevNotes => [...prevNotes, newNote]);
      setSelectedNoteId(newNote.id);
    }
  };
  
  // Handle note deletion
  const handleDeleteNote = (noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    setSelectedNoteId(null);
  };
  
  // Handle mouse down on a note to start dragging
  const handleNoteMouseDown = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNoteId(noteId);
    setIsDragging(true);
  };
  
  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    setStartCell(null);
  };
  
  // Render the grid cells
  const renderGridCells = () => {
    const cells = [];
    
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const pitch = LOWEST_NOTE + (GRID_ROWS - 1 - row);
        const isBlack = isBlackKey(pitch);
        const isBeatStart = col % 4 === 0;
        const isCurrentBeat = col === currentBeat && isPlaying;
        
        cells.push(
          <div
            key={`cell-${row}-${col}`}
            className={`absolute border-r border-b border-gray-700 ${
              isBlack ? 'bg-gray-800' : 'bg-gray-700'
            } ${isBeatStart ? 'border-l border-gray-500' : ''} ${
              isCurrentBeat ? 'bg-blue-900 bg-opacity-30' : ''
            }`}
            style={{
              left: PIANO_KEY_WIDTH + col * CELL_WIDTH,
              top: row * CELL_HEIGHT,
              width: CELL_WIDTH,
              height: CELL_HEIGHT
            }}
            onClick={() => handleCellClick(col, row)}
          />
        );
      }
    }
    
    return cells;
  };
  
  // Render the piano keys
  const renderPianoKeys = () => {
    const keys = [];
    
    for (let row = 0; row < GRID_ROWS; row++) {
      const pitch = LOWEST_NOTE + (GRID_ROWS - 1 - row);
      const isBlack = isBlackKey(pitch);
      const noteName = midiToNoteName(pitch);
      
      keys.push(
        <div
          key={`key-${row}`}
          className={`absolute border-b border-r border-gray-700 flex items-center justify-end pr-2 ${
            isBlack ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
          }`}
          style={{
            left: 0,
            top: row * CELL_HEIGHT,
            width: PIANO_KEY_WIDTH,
            height: CELL_HEIGHT
          }}
        >
          <span className="text-xs font-medium">{noteName}</span>
        </div>
      );
    }
    
    return keys;
  };
  
  // Render the notes
  const renderNotes = () => {
    return notes.map(note => {
      const row = GRID_ROWS - 1 - (note.pitch - LOWEST_NOTE);
      const isSelected = note.id === selectedNoteId;
      
      return (
        <div
          key={note.id}
          className={`absolute rounded-sm ${
            isSelected ? 'bg-blue-500' : 'bg-blue-600'
          } cursor-move`}
          style={{
            left: PIANO_KEY_WIDTH + note.startTime * CELL_WIDTH,
            top: row * CELL_HEIGHT,
            width: note.duration * CELL_WIDTH - 2,
            height: CELL_HEIGHT - 2,
            zIndex: isSelected ? 20 : 10
          }}
          onMouseDown={(e) => handleNoteMouseDown(note.id, e)}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNoteId(note.id);
          }}
        >
          {isSelected && (
            <button
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNote(note.id);
              }}
            >
              ×
            </button>
          )}
        </div>
      );
    });
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
            left: PIANO_KEY_WIDTH + col * CELL_WIDTH,
            top: -20,
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
        <h3 className="text-lg font-semibold">
          {track.instrumentType === 'membrane' ? 'Drum Pattern' : 'Piano Roll'}
        </h3>
      </div>
      
      <div className="flex-1 overflow-auto relative">
        <div className="sticky top-0 left-0 h-5 bg-gray-900 z-30">
          {renderBeatNumbers()}
        </div>
        
        <div 
          className="relative"
          style={{ 
            width: PIANO_KEY_WIDTH + GRID_COLS * CELL_WIDTH, 
            height: GRID_ROWS * CELL_HEIGHT 
          }}
          ref={gridRef}
          onMouseUp={handleMouseUp}
        >
          {/* Grid cells */}
          {renderGridCells()}
          
          {/* Piano keys */}
          {renderPianoKeys()}
          
          {/* Notes */}
          {renderNotes()}
        </div>
      </div>
    </div>
  );
};

export default PianoRoll; 