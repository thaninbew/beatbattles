/**
 * Type definitions for the BeatBattles application
 */

// Socket.IO event names
export enum SocketEvents {
  // Client to server events
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  START_GAME = 'start_game',
  SUBMIT_COMPOSITION = 'submit_composition',
  SUBMIT_VOTE = 'submit_vote',
  
  // Server to client events
  ROOM_CREATED = 'room_created',
  ROOM_UPDATED = 'room_updated',
  GAME_STATE_UPDATED = 'game_state_updated',
  COMPOSITION_UPDATED = 'composition_updated',
  ERROR = 'error',
}

// Room status
export enum RoomStatus {
  WAITING = 'waiting',
  COMPOSING = 'composing',
  VOTING = 'voting',
  RESULTS = 'results',
}

// User
export interface User {
  id: string;
  username: string;
  isConnected: boolean;
  socketId?: string;
  avatar?: string;
}

// Room
export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  hostId: string;
  players: User[];
  maxPlayers: number;
  createdAt: Date;
  updatedAt: Date;
  theme?: string;
}

// Note
export interface Note {
  id: string;
  pitch: number;
  startTime: number;
  duration: number;
  velocity: number;
}

// Instrument
export interface Instrument {
  id: string;
  name: string;
  type: string;
  icon?: string;
}

// Track
export interface Track {
  id: string;
  instrumentId: string;
  notes: Note[];
  isMuted: boolean;
  volume: number;
  pan: number;
}

// Composition
export interface Composition {
  id: string;
  userId: string;
  roomId: string;
  tracks: Track[];
  bpm: number;
  createdAt: Date;
  updatedAt: Date;
}

// Vote
export interface Vote {
  id: string;
  userId: string;
  roomId: string;
  compositionId: string;
  score: number;
  createdAt: Date;
}

// Game state
export interface GameState {
  roomId: string;
  theme: string;
  compositions: Composition[];
  votes: Vote[];
  timeRemaining: number;
}

// Error response
export interface ErrorResponse {
  code: string;
  message: string;
}

// Payload types for Socket.IO events
export interface CreateRoomPayload {
  user: User;
  maxPlayers: number;
}

export interface JoinRoomPayload {
  roomCode: string;
  user: User;
}

export interface LeaveRoomPayload {
  roomCode: string;
  userId: string;
}

export interface StartGamePayload {
  roomCode: string;
  userId: string;
}

export interface CompositionPayload {
  roomCode: string;
  composition: Composition;
}

export interface VotePayload {
  roomCode: string;
  vote: Vote;
} 