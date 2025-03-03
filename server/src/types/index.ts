/**
 * Type definitions for the BeatBattles server
 */

// User type
export interface User {
  id: string;
  username: string;
  avatar?: string;
  isConnected: boolean;
  socketId?: string;
}

// Room status enum
export enum RoomStatus {
  WAITING = 'waiting',
  COMPOSING = 'composing',
  VOTING = 'voting',
  RESULTS = 'results',
}

// Room type
export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  hostId: string;
  players: User[];
  maxPlayers: number;
  theme?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Note type
export interface Note {
  id: string;
  pitch: number; // MIDI note number
  startTime: number; // in beats
  duration: number; // in beats
  velocity: number; // 0-127
}

// Track type
export interface Track {
  id: string;
  instrumentType: string;
  notes: Note[];
  effects: string[];
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
}

// Composition type
export interface Composition {
  id: string;
  userId: string;
  roomId: string;
  tracks: Track[];
  bpm: number;
  createdAt: Date;
  updatedAt: Date;
}

// Vote type
export interface Vote {
  id: string;
  userId: string;
  compositionId: string;
  roomId: string;
  score: number; // 1-5
  createdAt: Date;
}

// Game state type
export interface GameState {
  roomId: string;
  status: RoomStatus;
  theme?: string;
  timeRemaining?: number; // in seconds
  compositions?: Composition[];
  votes?: Vote[];
  results?: CompositionResult[];
}

// Composition result type
export interface CompositionResult {
  compositionId: string;
  userId: string;
  username: string;
  averageScore: number;
  totalVotes: number;
}

// Socket.IO event types
export enum SocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  CREATE_ROOM = 'create_room',
  ROOM_CREATED = 'room_created',
  ROOM_UPDATED = 'room_updated',
  GAME_STATE_UPDATED = 'game_state_updated',
  START_GAME = 'start_game',
  COMPOSITION_UPDATED = 'composition_updated',
  SUBMIT_VOTE = 'submit_vote',
  RESULTS_UPDATED = 'results_updated',
  ERROR = 'error',
}

// Socket.IO event payload types
export interface JoinRoomPayload {
  roomCode: string;
  user: User;
}

export interface LeaveRoomPayload {
  roomCode: string;
  userId: string;
}

export interface CreateRoomPayload {
  user: User;
  maxPlayers?: number;
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

// Error response type
export interface ErrorResponse {
  code: string;
  message: string;
} 