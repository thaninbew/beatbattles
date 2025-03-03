/**
 * Tests for the Socket.IO controller
 */
import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { Socket } from 'socket.io-client';
import { SocketEvents, RoomStatus, GameState } from '../types';
import { initializeSocketController } from './socketController';
import { Room, User, ErrorResponse } from '../types';
import * as roomService from '../services/roomService';

// Use require for socket.io-client to avoid TypeScript issues
const { io } = require('socket.io-client');

jest.mock('../services/roomService');
// Set timeout for all tests
jest.setTimeout(15000);

describe('Socket Controller', () => {
  let httpServer: HttpServer;
  let ioServer: Server;
  let clientSocket: any;
  let serverSocket: any;

  beforeEach((done) => {
    httpServer = createServer();
    ioServer = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = io(`http://localhost:${port}`);
      
      ioServer.on('connection', (socket) => {
        serverSocket = socket;
      });

      clientSocket.on('connect', done);
    });

    // Initialize socket controller
    initializeSocketController(ioServer);

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach((done) => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    ioServer.close();
    httpServer.close(done);
  });

  // Helper function to compare rooms while handling date serialization
  const compareRooms = (received: any, expected: Room) => {
    // Create a copy of the expected room with dates converted to strings
    const expectedWithStringDates = {
      ...expected,
      createdAt: expected.createdAt instanceof Date ? expected.createdAt.toISOString() : expected.createdAt,
      updatedAt: expected.updatedAt instanceof Date ? expected.updatedAt.toISOString() : expected.updatedAt
    };
    
    // Create a copy of the received room with dates converted to strings if they aren't already
    const receivedWithStringDates = {
      ...received,
      createdAt: received.createdAt instanceof Date ? received.createdAt.toISOString() : received.createdAt,
      updatedAt: received.updatedAt instanceof Date ? received.updatedAt.toISOString() : received.updatedAt
    };
    
    expect(receivedWithStringDates).toEqual(expectedWithStringDates);
  };

  test('should handle creating a room', (done) => {
    // Mock room service
    const mockRoom: Room = {
      id: 'room-id',
      code: 'ABC123',
      hostId: 'user-id',
      players: [
        {
          id: 'user-id',
          username: 'User',
          isConnected: true,
          socketId: 'socket-id',
        },
      ],
      status: RoomStatus.WAITING,
      maxPlayers: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (roomService.createRoom as jest.Mock).mockReturnValue(mockRoom);

    // Listen for room created event
    clientSocket.on(SocketEvents.ROOM_CREATED, (room: any) => {
      compareRooms(room, mockRoom);
      expect(roomService.createRoom).toHaveBeenCalledWith({
        id: 'user-id',
        username: 'User',
        isConnected: true,
        socketId: expect.any(String),
      }, 4);
      done();
    });

    // Emit create room event
    clientSocket.emit(SocketEvents.CREATE_ROOM, {
      user: {
        id: 'user-id',
        username: 'User'
      },
      maxPlayers: 4
    });
  }, 20000); // Increase timeout to 20 seconds

  test('should handle error when creating a room', (done) => {
    // Mock room service to throw an error
    (roomService.createRoom as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to create room');
    });

    // Listen for error event
    clientSocket.on(SocketEvents.ERROR, (error: ErrorResponse) => {
      expect(error).toEqual({
        code: 'CREATE_ROOM_ERROR',
        message: 'Failed to create room',
      });
      done();
    });

    // Emit create room event
    clientSocket.emit(SocketEvents.CREATE_ROOM, {
      user: {
        id: 'user-id',
        username: 'User'
      },
      maxPlayers: 4
    });
  }, 20000); // Increase timeout to 20 seconds

  test('should handle joining a room', (done) => {
    // Mock room service
    const mockRoom: Room = {
      id: 'room-id',
      code: 'ABC123',
      hostId: 'host-id',
      players: [
        {
          id: 'host-id',
          username: 'Host',
          isConnected: true,
          socketId: 'socket-id',
        },
        {
          id: 'user-id',
          username: 'User',
          isConnected: true,
          socketId: 'socket-id',
        },
      ],
      status: RoomStatus.WAITING,
      maxPlayers: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (roomService.getRoomByCode as jest.Mock).mockReturnValue(mockRoom);
    (roomService.joinRoom as jest.Mock).mockReturnValue(mockRoom);

    // Listen for room updated event
    clientSocket.on(SocketEvents.ROOM_UPDATED, (room: any) => {
      compareRooms(room, mockRoom);
      expect(roomService.joinRoom).toHaveBeenCalledWith(
        'ABC123',
        expect.objectContaining({
          id: 'user-id',
          username: 'User',
        })
      );
      done();
    });

    // Emit join room event
    clientSocket.emit(SocketEvents.JOIN_ROOM, {
      roomCode: 'ABC123',
      user: {
        id: 'user-id',
        username: 'User',
      },
    });
  }, 20000); // Increase timeout to 20 seconds

  test('should handle error when joining a room', (done) => {
    // Mock room service to return null
    (roomService.joinRoom as jest.Mock).mockReturnValue(null);
    
    // Listen for error event
    clientSocket.on(SocketEvents.ERROR, (error: ErrorResponse) => {
      expect(error).toEqual({
        code: 'JOIN_ROOM_ERROR',
        message: 'Failed to join room. Room may not exist, be full, or game already started.',
      });
      done();
    });

    // Emit join room event
    clientSocket.emit(SocketEvents.JOIN_ROOM, {
      roomCode: 'ABC123',
      user: {
        id: 'user-id',
        username: 'User',
      },
    });
  }, 20000); // Increase timeout to 20 seconds

  test('should handle leaving a room', (done) => {
    // Mock room service
    const mockRoom: Room = {
      id: 'room-id',
      code: 'ABC123',
      hostId: 'host-id',
      players: [
        {
          id: 'host-id',
          username: 'Host',
          isConnected: true,
          socketId: 'socket-id',
        },
      ],
      status: RoomStatus.WAITING,
      maxPlayers: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Setup mocks
    const roomBeforeLeave = {
      ...mockRoom,
      players: [
        ...mockRoom.players,
        {
          id: 'user-id',
          username: 'User',
          isConnected: true,
          socketId: clientSocket.id,
        }
      ]
    };
    
    (roomService.getRoomByCode as jest.Mock).mockReturnValue(roomBeforeLeave);
    (roomService.leaveRoom as jest.Mock).mockReturnValue(mockRoom);

    // Manually join the socket room
    clientSocket.emit('join', mockRoom.id);
    
    // Setup a spy on the socket.io server's to method
    const toSpy = jest.spyOn(ioServer, 'to').mockReturnValue({
      emit: (event: string, data: any) => {
        if (event === SocketEvents.ROOM_UPDATED) {
          compareRooms(data, mockRoom);
          expect(roomService.leaveRoom).toHaveBeenCalledWith(
            'ABC123',
            'user-id'
          );
          toSpy.mockRestore();
          done();
        }
      }
    } as any);

    // Emit leave room event
    clientSocket.emit(SocketEvents.LEAVE_ROOM, {
      roomCode: 'ABC123',
      userId: 'user-id',
    });
  }, 20000); // Increase timeout to 20 seconds

  test('should handle error when leaving a room', (done) => {
    // Mock room service to return null
    (roomService.getRoomByCode as jest.Mock).mockReturnValue(null);
    
    // Listen for error event
    clientSocket.on(SocketEvents.ERROR, (error: ErrorResponse) => {
      expect(error).toEqual({
        code: 'LEAVE_ROOM_ERROR',
        message: 'Room not found',
      });
      done();
    });

    // Emit leave room event
    clientSocket.emit(SocketEvents.LEAVE_ROOM, {
      roomCode: 'ABC123',
      userId: 'user-id',
    });
  }, 20000); // Increase timeout to 20 seconds

  test('should handle starting a game', (done) => {
    // Mock room service
    const mockRoom: Room = {
      id: 'room-id',
      code: 'ABC123',
      hostId: 'host-id',
      players: [
        {
          id: 'host-id',
          username: 'Host',
          isConnected: true,
          socketId: clientSocket.id,
        },
        {
          id: 'user-id',
          username: 'User',
          isConnected: true,
          socketId: 'socket-id',
        },
      ],
      status: RoomStatus.COMPOSING,
      theme: 'Space Adventure',
      maxPlayers: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const mockGameState: GameState = {
      roomId: 'room-id',
      status: RoomStatus.COMPOSING,
      theme: 'Space Adventure',
      timeRemaining: 300,
    };
    
    // Setup mocks
    (roomService.getRoomByCode as jest.Mock).mockReturnValue({...mockRoom, status: RoomStatus.WAITING});
    (roomService.startGame as jest.Mock).mockReturnValue(mockRoom);
    (roomService.getGameState as jest.Mock).mockReturnValue(mockGameState);

    // Manually join the socket room
    clientSocket.emit('join', mockRoom.id);
    
    // Track emitted events
    let emittedEvents = 0;
    
    // Setup a spy on the socket.io server's to method
    const toSpy = jest.spyOn(ioServer, 'to').mockReturnValue({
      emit: (event: string, data: any) => {
        if (event === SocketEvents.ROOM_UPDATED) {
          compareRooms(data, mockRoom);
          emittedEvents++;
        } else if (event === SocketEvents.GAME_STATE_UPDATED) {
          expect(data).toEqual(mockGameState);
          emittedEvents++;
        }
        
        if (emittedEvents === 2) {
          expect(roomService.startGame).toHaveBeenCalledWith(
            'ABC123',
            'host-id'
          );
          toSpy.mockRestore();
          done();
        }
      }
    } as any);

    // Emit start game event
    clientSocket.emit(SocketEvents.START_GAME, {
      roomCode: 'ABC123',
      userId: 'host-id',
    });
  }, 20000); // Increase timeout to 20 seconds

  test('should handle error when starting a game', (done) => {
    // Mock room service to return null
    (roomService.startGame as jest.Mock).mockReturnValue(null);
    
    // Listen for error event
    clientSocket.on(SocketEvents.ERROR, (error: ErrorResponse) => {
      expect(error).toEqual({
        code: 'START_GAME_ERROR',
        message: 'Failed to start game. You may not be the host or there are not enough players.',
      });
      done();
    });

    // Emit start game event
    clientSocket.emit(SocketEvents.START_GAME, {
      roomCode: 'ABC123',
      userId: 'user-id',
    });
  }, 20000); // Increase timeout to 20 seconds
}); 