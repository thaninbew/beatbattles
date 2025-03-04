/**
 * Socket.IO client service for real-time communication with the server
 */
import { default as socketIO } from 'socket.io-client';
import { 
  SocketEvents, 
  Room, 
  User, 
  GameState, 
  Composition, 
  Vote, 
  ErrorResponse 
} from '../types';

// Define event handler types
type RoomCreatedHandler = (room: Room) => void;
type RoomUpdatedHandler = (room: Room) => void;
type GameStateUpdatedHandler = (gameState: GameState) => void;
type CompositionUpdatedHandler = (composition: Composition) => void;
type VoteSubmittedHandler = (vote: Vote) => void;
type ErrorHandler = (error: ErrorResponse) => void;
type ConnectionHandler = () => void;
type DisconnectionHandler = () => void;

// Socket.IO client class
class SocketClient {
  private socket: ReturnType<typeof socketIO> | null = null;
  private isConnected = false;
  
  // Event handlers
  private roomCreatedHandlers: RoomCreatedHandler[] = [];
  private roomUpdatedHandlers: RoomUpdatedHandler[] = [];
  private gameStateUpdatedHandlers: GameStateUpdatedHandler[] = [];
  private compositionUpdatedHandlers: CompositionUpdatedHandler[] = [];
  private voteSubmittedHandlers: VoteSubmittedHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private disconnectionHandlers: DisconnectionHandler[] = [];
  
  /**
   * Initialize the Socket.IO connection
   */
  connect(): void {
    if (this.socket) {
      return;
    }
    
    // Connect to the Socket.IO server
    this.socket = socketIO(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.connectionHandlers.forEach(handler => handler());
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
      this.disconnectionHandlers.forEach(handler => handler());
    });
    
    this.socket.on(SocketEvents.ROOM_CREATED, (room: Room) => {
      this.roomCreatedHandlers.forEach(handler => handler(room));
    });
    
    this.socket.on(SocketEvents.ROOM_UPDATED, (room: Room) => {
      this.roomUpdatedHandlers.forEach(handler => handler(room));
    });
    
    this.socket.on(SocketEvents.GAME_STATE_UPDATED, (gameState: GameState) => {
      this.gameStateUpdatedHandlers.forEach(handler => handler(gameState));
    });
    
    this.socket.on(SocketEvents.COMPOSITION_UPDATED, (composition: Composition) => {
      this.compositionUpdatedHandlers.forEach(handler => handler(composition));
    });
    
    this.socket.on('vote_submitted', (vote: Vote) => {
      this.voteSubmittedHandlers.forEach(handler => handler(vote));
    });
    
    this.socket.on(SocketEvents.ERROR, (error: ErrorResponse) => {
      console.error('Socket error:', error);
      this.errorHandlers.forEach(handler => handler(error));
    });
  }
  
  /**
   * Disconnect from the Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  /**
   * Check if the socket is connected
   */
  isSocketConnected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Create a new room
   */
  createRoom(user: User, maxPlayers: number): void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.emit(SocketEvents.CREATE_ROOM, {
      user,
      maxPlayers,
    });
  }
  
  /**
   * Join an existing room
   */
  joinRoom(roomCode: string, user: User): void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.emit(SocketEvents.JOIN_ROOM, {
      roomCode,
      user,
    });
  }
  
  /**
   * Leave a room
   */
  leaveRoom(roomCode: string, userId: string): void {
    this.socket?.emit(SocketEvents.LEAVE_ROOM, {
      roomCode,
      userId,
    });
  }
  
  /**
   * Start a game (host only)
   */
  startGame(roomCode: string, userId: string): void {
    this.socket?.emit(SocketEvents.START_GAME, {
      roomCode,
      userId,
    });
  }
  
  /**
   * Update a composition
   */
  updateComposition(roomCode: string, composition: Composition): void {
    this.socket?.emit(SocketEvents.SUBMIT_COMPOSITION, {
      roomCode,
      composition,
    });
  }
  
  /**
   * Submit a vote
   */
  submitVote(roomCode: string, vote: Vote): void {
    this.socket?.emit(SocketEvents.SUBMIT_VOTE, {
      roomCode,
      vote,
    });
  }
  
  // Event listeners
  onConnect(handler: ConnectionHandler): void {
    this.connectionHandlers.push(handler);
  }
  
  onDisconnect(handler: DisconnectionHandler): void {
    this.disconnectionHandlers.push(handler);
  }
  
  onRoomCreated(handler: RoomCreatedHandler): void {
    this.roomCreatedHandlers.push(handler);
  }
  
  onRoomUpdated(handler: RoomUpdatedHandler): void {
    this.roomUpdatedHandlers.push(handler);
  }
  
  onGameStateUpdated(handler: GameStateUpdatedHandler): void {
    this.gameStateUpdatedHandlers.push(handler);
  }
  
  onCompositionUpdated(handler: CompositionUpdatedHandler): void {
    this.compositionUpdatedHandlers.push(handler);
  }
  
  onVoteSubmitted(handler: VoteSubmittedHandler): void {
    this.voteSubmittedHandlers.push(handler);
  }
  
  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }
  
  // Remove event listeners
  offRoomCreated(handler: RoomCreatedHandler): void {
    this.roomCreatedHandlers = this.roomCreatedHandlers.filter(h => h !== handler);
  }
  
  offRoomUpdated(handler: RoomUpdatedHandler): void {
    this.roomUpdatedHandlers = this.roomUpdatedHandlers.filter(h => h !== handler);
  }
  
  offGameStateUpdated(handler: GameStateUpdatedHandler): void {
    this.gameStateUpdatedHandlers = this.gameStateUpdatedHandlers.filter(h => h !== handler);
  }
  
  offCompositionUpdated(handler: CompositionUpdatedHandler): void {
    this.compositionUpdatedHandlers = this.compositionUpdatedHandlers.filter(h => h !== handler);
  }
  
  offVoteSubmitted(handler: VoteSubmittedHandler): void {
    this.voteSubmittedHandlers = this.voteSubmittedHandlers.filter(h => h !== handler);
  }
  
  offError(handler: ErrorHandler): void {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
  }
  
  offConnect(handler: ConnectionHandler): void {
    this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
  }
  
  offDisconnect(handler: DisconnectionHandler): void {
    this.disconnectionHandlers = this.disconnectionHandlers.filter(h => h !== handler);
  }
}

// Create a singleton instance
const socketClient = new SocketClient();

export default socketClient; 