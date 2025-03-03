/**
 * Socket.IO controller for handling real-time communication
 */
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { 
  SocketEvents, 
  User, 
  JoinRoomPayload, 
  LeaveRoomPayload, 
  CreateRoomPayload,
  StartGamePayload,
  CompositionPayload,
  VotePayload,
  ErrorResponse
} from '../types';
import * as roomService from '../services/roomService';

/**
 * Initialize Socket.IO controller
 * @param io The Socket.IO server instance
 */
export const initializeSocketController = (io: Server): void => {
  // Set up connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Additional disconnect logic would go here
    });
    
    // Handle create room
    socket.on(SocketEvents.CREATE_ROOM, (payload: CreateRoomPayload) => {
      try {
        // Ensure the user has an ID
        const user: User = {
          ...payload.user,
          id: payload.user.id || uuidv4(),
          isConnected: true,
          socketId: socket.id,
        };
        
        // Create the room
        const room = roomService.createRoom(user, payload.maxPlayers);
        
        // Join the socket to the room
        socket.join(room.id);
        
        // Emit room created event
        socket.emit(SocketEvents.ROOM_CREATED, room);
        
        // Emit room updated event to all clients in the room
        io.to(room.id).emit(SocketEvents.ROOM_UPDATED, room);
        
        console.log(`Room created: ${room.code} by user ${user.username}`);
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit(SocketEvents.ERROR, {
          code: 'CREATE_ROOM_ERROR',
          message: 'Failed to create room',
        } as ErrorResponse);
      }
    });
    
    // Handle join room
    socket.on(SocketEvents.JOIN_ROOM, (payload: JoinRoomPayload) => {
      try {
        const { roomCode, user } = payload;
        
        // Ensure the user has an ID
        const updatedUser: User = {
          ...user,
          id: user.id || uuidv4(),
          isConnected: true,
          socketId: socket.id,
        };
        
        // Join the room
        const room = roomService.joinRoom(roomCode, updatedUser);
        
        if (!room) {
          socket.emit(SocketEvents.ERROR, {
            code: 'JOIN_ROOM_ERROR',
            message: 'Failed to join room. Room may not exist, be full, or game already started.',
          } as ErrorResponse);
          return;
        }
        
        // Join the socket to the room
        socket.join(room.id);
        
        // Emit room updated event to all clients in the room
        io.to(room.id).emit(SocketEvents.ROOM_UPDATED, room);
        
        // Get the game state if the room is not in WAITING status
        if (room.status !== 'waiting') {
          const gameState = roomService.getGameState(room.id);
          if (gameState) {
            socket.emit(SocketEvents.GAME_STATE_UPDATED, gameState);
          }
        }
        
        console.log(`User ${updatedUser.username} joined room ${roomCode}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit(SocketEvents.ERROR, {
          code: 'JOIN_ROOM_ERROR',
          message: 'Failed to join room',
        } as ErrorResponse);
      }
    });
    
    // Handle leave room
    socket.on(SocketEvents.LEAVE_ROOM, (payload: LeaveRoomPayload) => {
      try {
        const { roomCode, userId } = payload;
        
        // Get the room before the user leaves
        const roomBefore = roomService.getRoomByCode(roomCode);
        
        if (!roomBefore) {
          socket.emit(SocketEvents.ERROR, {
            code: 'LEAVE_ROOM_ERROR',
            message: 'Room not found',
          } as ErrorResponse);
          return;
        }
        
        // Leave the room
        const room = roomService.leaveRoom(roomCode, userId);
        
        // Leave the socket room
        socket.leave(roomBefore.id);
        
        // If the room still exists, emit room updated event to all clients in the room
        if (room) {
          io.to(room.id).emit(SocketEvents.ROOM_UPDATED, room);
        }
        
        console.log(`User ${userId} left room ${roomCode}`);
      } catch (error) {
        console.error('Error leaving room:', error);
        socket.emit(SocketEvents.ERROR, {
          code: 'LEAVE_ROOM_ERROR',
          message: 'Failed to leave room',
        } as ErrorResponse);
      }
    });
    
    // Handle start game
    socket.on(SocketEvents.START_GAME, (payload: StartGamePayload) => {
      try {
        const { roomCode, userId } = payload;
        
        // Start the game
        const room = roomService.startGame(roomCode, userId);
        
        if (!room) {
          socket.emit(SocketEvents.ERROR, {
            code: 'START_GAME_ERROR',
            message: 'Failed to start game. You may not be the host or there are not enough players.',
          } as ErrorResponse);
          return;
        }
        
        // Get the game state
        const gameState = roomService.getGameState(room.id);
        
        // Emit room updated event to all clients in the room
        io.to(room.id).emit(SocketEvents.ROOM_UPDATED, room);
        
        // Emit game state updated event to all clients in the room
        if (gameState) {
          io.to(room.id).emit(SocketEvents.GAME_STATE_UPDATED, gameState);
        }
        
        console.log(`Game started in room ${roomCode} by user ${userId}`);
        
        // In a real implementation, we would set up a timer to transition to the next phase
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit(SocketEvents.ERROR, {
          code: 'START_GAME_ERROR',
          message: 'Failed to start game',
        } as ErrorResponse);
      }
    });
    
    // Handle composition updated
    socket.on(SocketEvents.COMPOSITION_UPDATED, (payload: CompositionPayload) => {
      try {
        const { roomCode, composition } = payload;
        
        // Get the room
        const room = roomService.getRoomByCode(roomCode);
        
        if (!room) {
          socket.emit(SocketEvents.ERROR, {
            code: 'COMPOSITION_UPDATE_ERROR',
            message: 'Room not found',
          } as ErrorResponse);
          return;
        }
        
        // In a real implementation, we would store the composition
        
        // Emit composition updated event to all clients in the room
        io.to(room.id).emit(SocketEvents.COMPOSITION_UPDATED, composition);
        
        console.log(`Composition updated in room ${roomCode} by user ${composition.userId}`);
      } catch (error) {
        console.error('Error updating composition:', error);
        socket.emit(SocketEvents.ERROR, {
          code: 'COMPOSITION_UPDATE_ERROR',
          message: 'Failed to update composition',
        } as ErrorResponse);
      }
    });
    
    // Handle submit vote
    socket.on(SocketEvents.SUBMIT_VOTE, (payload: VotePayload) => {
      try {
        const { roomCode, vote } = payload;
        
        // Get the room
        const room = roomService.getRoomByCode(roomCode);
        
        if (!room) {
          socket.emit(SocketEvents.ERROR, {
            code: 'SUBMIT_VOTE_ERROR',
            message: 'Room not found',
          } as ErrorResponse);
          return;
        }
        
        // In a real implementation, we would store the vote
        
        // Emit vote submitted event to the user
        socket.emit('vote_submitted', vote);
        
        console.log(`Vote submitted in room ${roomCode} by user ${vote.userId}`);
        
        // In a real implementation, we would check if all votes are in and transition to the results phase
      } catch (error) {
        console.error('Error submitting vote:', error);
        socket.emit(SocketEvents.ERROR, {
          code: 'SUBMIT_VOTE_ERROR',
          message: 'Failed to submit vote',
        } as ErrorResponse);
      }
    });
  });
}; 