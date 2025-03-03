/**
 * Socket.IO client integration for real-time communication
 * 
 * This module provides both a mock Socket.IO client for development
 * and a real Socket.IO client for production. The mock client simulates
 * Socket.IO behavior for local development without requiring a backend server.
 * 
 * @module socketClient
 */
import { Room, User, GameState, Composition, Vote } from '../types';
// We'll add the real Socket.IO client import when we're ready to implement it
// import { io, Socket } from "socket.io-client";

/**
 * Socket.IO event types enum
 * These events are used for communication between the client and server
 */
export enum SocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  ROOM_UPDATED = 'room_updated',
  GAME_STATE_UPDATED = 'game_state_updated',
  COMPOSITION_UPDATED = 'composition_updated',
  SUBMIT_VOTE = 'submit_vote',
  RESULTS_UPDATED = 'results_updated',
  ERROR = 'error',
}

/**
 * Interface for join room payload
 */
export interface JoinRoomPayload {
  roomCode: string;
  user: User;
}

/**
 * Interface for leave room payload
 */
export interface LeaveRoomPayload {
  roomCode: string;
  userId: string;
}

/**
 * Interface for composition update payload
 */
export interface CompositionPayload {
  roomCode: string;
  composition: Composition;
}

/**
 * Interface for vote submission payload
 */
export interface VotePayload {
  roomCode: string;
  vote: Vote;
}

/**
 * Interface for socket client
 * This interface is implemented by both the mock and real socket clients
 */
export interface ISocketClient {
  on(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  disconnect(): void;
}

/**
 * Mock socket client for development
 * This class simulates Socket.IO behavior for local development
 */
class MockSocketClient implements ISocketClient {
  private eventHandlers: Record<string, Array<(...args: any[]) => void>> = {};
  private connected = false;
  private url: string;

  /**
   * Create a new mock socket client
   * @param url The Socket.IO server URL
   */
  constructor(url: string) {
    this.url = url;
    console.log(`Creating mock socket client for ${url}`);
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.connected = true;
      this.emit(SocketEvents.CONNECT);
      console.log('Mock socket connected');
    }, 500);
  }

  /**
   * Register an event handler
   * @param event The event name
   * @param callback The event handler function
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
  }

  /**
   * Emit an event
   * @param event The event name
   * @param args The event arguments
   */
  emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers[event];
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  /**
   * Disconnect the socket
   */
  disconnect(): void {
    this.connected = false;
    this.emit(SocketEvents.DISCONNECT);
    console.log('Mock socket disconnected');
  }
}

/**
 * Real Socket.IO client for production
 * This class wraps the Socket.IO client for use in production
 */
class RealSocketClient implements ISocketClient {
  // We'll define the socket property when we implement the real client
  // private socket: Socket;

  /**
   * Create a new real socket client
   * @param url The Socket.IO server URL
   */
  constructor(url: string) {
    console.log(`Creating real socket client for ${url}`);
    // In a real implementation, we would use:
    // this.socket = io(url, {
    //   reconnectionAttempts: 5,
    //   reconnectionDelay: 1000,
    //   autoConnect: true,
    // });
    
    // For now, we'll throw an error since we're not ready to use the real client
    throw new Error('Real Socket.IO client not implemented yet. Use the mock client for development.');
  }

  /**
   * Register an event handler
   * @param event The event name
   * @param callback The event handler function
   */
  on(event: string, callback: (...args: any[]) => void): void {
    // In a real implementation, we would use:
    // this.socket.on(event, callback);
    throw new Error('Real Socket.IO client not implemented yet. Use the mock client for development.');
  }

  /**
   * Emit an event
   * @param event The event name
   * @param args The event arguments
   */
  emit(event: string, ...args: any[]): void {
    // In a real implementation, we would use:
    // this.socket.emit(event, ...args);
    throw new Error('Real Socket.IO client not implemented yet. Use the mock client for development.');
  }

  /**
   * Disconnect the socket
   */
  disconnect(): void {
    // In a real implementation, we would use:
    // this.socket.disconnect();
    throw new Error('Real Socket.IO client not implemented yet. Use the mock client for development.');
  }
}

// Socket client singleton
let socketInstance: ISocketClient | null = null;

/**
 * Initialize the Socket.IO client
 * @param url The Socket.IO server URL
 * @param useMock Whether to use the mock client (default: true in development, false in production)
 * @returns The Socket.IO client instance
 */
export const initializeSocket = (
  url: string = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  useMock: boolean = process.env.NODE_ENV === 'development'
): ISocketClient => {
  if (!socketInstance) {
    // Create either a mock or real socket client
    socketInstance = useMock 
      ? new MockSocketClient(url)
      : new RealSocketClient(url);
    
    // Set up default event handlers
    socketInstance.on(SocketEvents.CONNECT, () => {
      console.log('Connected to Socket.IO server');
    });
    
    socketInstance.on(SocketEvents.DISCONNECT, () => {
      console.log('Disconnected from Socket.IO server');
    });
    
    socketInstance.on(SocketEvents.ERROR, (error: Error) => {
      console.error('Socket.IO error:', error);
    });
  }
  
  return socketInstance;
};

/**
 * Get the Socket.IO client instance
 * @returns The Socket.IO client instance
 */
export const getSocket = (): ISocketClient => {
  if (!socketInstance) {
    return initializeSocket();
  }
  return socketInstance;
};

/**
 * Join a room
 * @param roomCode The room code
 * @param user The user joining the room
 */
export const joinRoom = (roomCode: string, user: User): void => {
  const socket = getSocket();
  const payload: JoinRoomPayload = { roomCode, user };
  socket.emit(SocketEvents.JOIN_ROOM, payload);
  
  // Mock response for development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      const mockRoom: Room = {
        id: '123',
        code: roomCode,
        status: 'waiting' as any,
        hostId: user.id,
        players: [user],
        maxPlayers: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      socket.emit(SocketEvents.ROOM_UPDATED, mockRoom);
    }, 1000);
  }
};

/**
 * Leave a room
 * @param roomCode The room code
 * @param userId The ID of the user leaving the room
 */
export const leaveRoom = (roomCode: string, userId: string): void => {
  const socket = getSocket();
  const payload: LeaveRoomPayload = { roomCode, userId };
  socket.emit(SocketEvents.LEAVE_ROOM, payload);
};

/**
 * Update a composition
 * @param roomCode The room code
 * @param composition The updated composition
 */
export const updateComposition = (roomCode: string, composition: Composition): void => {
  const socket = getSocket();
  const payload: CompositionPayload = { roomCode, composition };
  socket.emit(SocketEvents.COMPOSITION_UPDATED, payload);
};

/**
 * Submit a vote
 * @param roomCode The room code
 * @param vote The vote to submit
 */
export const submitVote = (roomCode: string, vote: Vote): void => {
  const socket = getSocket();
  const payload: VotePayload = { roomCode, vote };
  socket.emit(SocketEvents.SUBMIT_VOTE, payload);
}; 