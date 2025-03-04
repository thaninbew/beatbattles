/**
 * Core types for the BeatBattles application
 */

// User related types
export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

// Room related types
export enum RoomStatus {
  WAITING = 'waiting',
  COMPOSING = 'composing',
  VOTING = 'voting',
  RESULTS = 'results',
}

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  theme?: string;
  hostId: string;
  players: User[];
  maxPlayers: number;
  createdAt: Date;
  updatedAt: Date;
}

// Game related types
export interface GameState {
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  status: RoomStatus;
  theme?: string;
}

// Music/DAW related types
export interface Note {
  id: string;
  pitch: number;
  startTime: number;
  duration: number;
  velocity: number;
}

export interface Track {
  id: string;
  instrumentType: string;
  notes: Note[];
  volume: number;
  muted: boolean;
}

export interface Composition {
  userId: string;
  tracks: Track[];
  bpm: number;
}

// Voting related types
export interface Vote {
  fromUserId: string;
  toUserId: string;
  points: number;
}

export interface Result {
  userId: string;
  username: string;
  points: number;
  rank: number;
} 