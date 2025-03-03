import { 
  createRoom, 
  getRoomByCode, 
  getRoomById, 
  joinRoom, 
  leaveRoom, 
  startGame, 
  getAvailableRooms,
  updateUserConnection,
  getGameState,
  _resetRoomStorageForTesting
} from './roomService';
import { User, RoomStatus } from '../types';
import { generateRoomCode } from '../utils/roomUtils';

// Mock uuid to return predictable values
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid')
}));

// Mock the room code generator to return predictable values
jest.mock('../utils/roomUtils', () => ({
  generateRoomCode: jest.fn().mockReturnValue('ABC123'),
  isValidRoomCode: (code: string) => /^[A-Z0-9]{6}$/.test(code),
  formatRoomCode: (code: string) => {
    if (!code || code.length !== 6) return code;
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
}));

describe('Room Service', () => {
  // Reset mocks and clear room storage before each test
  beforeEach(() => {
    jest.clearAllMocks();
    _resetRoomStorageForTesting();
  });

  describe('createRoom', () => {
    it('should create a new room with the provided host', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const room = createRoom(host);

      expect(room).toBeDefined();
      expect(room.id).toBe('test-uuid');
      expect(room.code).toBe('ABC123');
      expect(room.status).toBe(RoomStatus.WAITING);
      expect(room.hostId).toBe(host.id);
      expect(room.players).toHaveLength(1);
      expect(room.players[0]).toEqual(host);
      expect(room.maxPlayers).toBe(10);
      expect(room.createdAt).toBeInstanceOf(Date);
      expect(room.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a room with custom max players', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const room = createRoom(host, 5);

      expect(room.maxPlayers).toBe(5);
    });

    it('should generate a new code if the first one is already taken', () => {
      const host1: User = { id: 'host1-id', username: 'Host1', isConnected: true };
      const host2: User = { id: 'host2-id', username: 'Host2', isConnected: true };
      
      // First call returns 'ABC123'
      const room1 = createRoom(host1);
      
      // Mock the second call to return a different code
      (generateRoomCode as jest.Mock).mockReturnValueOnce('DEF456');
      
      const room2 = createRoom(host2);
      
      expect(room1.code).toBe('ABC123');
      expect(room2.code).toBe('DEF456');
      expect(generateRoomCode).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRoomByCode', () => {
    it('should return the room with the given code', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const createdRoom = createRoom(host);
      
      const room = getRoomByCode(createdRoom.code);
      
      expect(room).toBeDefined();
      expect(room?.id).toBe(createdRoom.id);
    });
    
    it('should return undefined for an invalid code', () => {
      const room = getRoomByCode('invalid');
      expect(room).toBeUndefined();
    });
    
    it('should return undefined for a non-existent code', () => {
      const room = getRoomByCode('XYZ789');
      expect(room).toBeUndefined();
    });
  });

  describe('getRoomById', () => {
    it('should return the room with the given ID', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const createdRoom = createRoom(host);
      
      const room = getRoomById(createdRoom.id);
      
      expect(room).toBeDefined();
      expect(room?.code).toBe(createdRoom.code);
    });
    
    it('should return undefined for a non-existent ID', () => {
      const room = getRoomById('non-existent');
      expect(room).toBeUndefined();
    });
  });

  describe('joinRoom', () => {
    it('should add a user to an existing room', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const user: User = { id: 'user-id', username: 'User', isConnected: true };
      
      const createdRoom = createRoom(host);
      const updatedRoom = joinRoom(createdRoom.code, user);
      
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.players).toHaveLength(2);
      expect(updatedRoom?.players[1].id).toBe(user.id);
    });
    
    it('should update an existing user in the room', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const user: User = { id: 'user-id', username: 'User', isConnected: false };
      
      const createdRoom = createRoom(host);
      joinRoom(createdRoom.code, user);
      
      const updatedUser: User = { id: 'user-id', username: 'Updated User', isConnected: true };
      const updatedRoom = joinRoom(createdRoom.code, updatedUser);
      
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.players).toHaveLength(2);
      expect(updatedRoom?.players[1].username).toBe('Updated User');
      expect(updatedRoom?.players[1].isConnected).toBe(true);
    });
    
    it('should return undefined for a non-existent room', () => {
      const user: User = { id: 'user-id', username: 'User', isConnected: true };
      const room = joinRoom('XYZ789', user);
      expect(room).toBeUndefined();
    });
    
    it('should return undefined if the room is full', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const createdRoom = createRoom(host, 1); // Max 1 player
      
      const user: User = { id: 'user-id', username: 'User', isConnected: true };
      const updatedRoom = joinRoom(createdRoom.code, user);
      
      expect(updatedRoom).toBeUndefined();
    });
    
    it('should return undefined if the room is not in WAITING status', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const user1: User = { id: 'user1-id', username: 'User1', isConnected: true };
      const user2: User = { id: 'user2-id', username: 'User2', isConnected: true };
      
      // Create a room
      const createdRoom = createRoom(host);
      
      // Add a second user to meet the minimum player requirement
      joinRoom(createdRoom.code, user1);
      
      // Start the game
      const startedRoom = startGame(createdRoom.code, host.id);
      
      // Verify the game started successfully
      expect(startedRoom).toBeDefined();
      expect(startedRoom?.status).toBe(RoomStatus.COMPOSING);
      
      // Try to join with a new user
      const updatedRoom = joinRoom(createdRoom.code, user2);
      
      expect(updatedRoom).toBeUndefined();
    });
  });

  describe('leaveRoom', () => {
    it('should remove a user from a room', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const user: User = { id: 'user-id', username: 'User', isConnected: true };
      
      const createdRoom = createRoom(host);
      joinRoom(createdRoom.code, user);
      
      const updatedRoom = leaveRoom(createdRoom.code, user.id);
      
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.players).toHaveLength(1);
      expect(updatedRoom?.players[0].id).toBe(host.id);
    });
    
    it('should assign a new host if the host leaves', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const user: User = { id: 'user-id', username: 'User', isConnected: true };
      
      const createdRoom = createRoom(host);
      joinRoom(createdRoom.code, user);
      
      const updatedRoom = leaveRoom(createdRoom.code, host.id);
      
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.hostId).toBe(user.id);
      expect(updatedRoom?.players).toHaveLength(1);
      expect(updatedRoom?.players[0].id).toBe(user.id);
    });
    
    it('should delete the room if the last user leaves', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      
      const createdRoom = createRoom(host);
      const updatedRoom = leaveRoom(createdRoom.code, host.id);
      
      expect(updatedRoom).toBeUndefined();
      expect(getRoomByCode(createdRoom.code)).toBeUndefined();
    });
    
    it('should return undefined for a non-existent room', () => {
      const room = leaveRoom('XYZ789', 'user-id');
      expect(room).toBeUndefined();
    });
    
    it('should return the room unchanged if the user is not in the room', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      
      const createdRoom = createRoom(host);
      const updatedRoom = leaveRoom(createdRoom.code, 'non-existent');
      
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.players).toHaveLength(1);
      expect(updatedRoom?.players[0].id).toBe(host.id);
    });
  });

  describe('startGame', () => {
    it('should update the room status to COMPOSING and set a theme', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const user: User = { id: 'user-id', username: 'User', isConnected: true };
      
      const createdRoom = createRoom(host);
      joinRoom(createdRoom.code, user);
      
      const updatedRoom = startGame(createdRoom.code, host.id);
      
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.status).toBe(RoomStatus.COMPOSING);
      expect(updatedRoom?.theme).toBeDefined();
    });
    
    it('should return undefined if the user is not the host', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const user: User = { id: 'user-id', username: 'User', isConnected: true };
      
      const createdRoom = createRoom(host);
      joinRoom(createdRoom.code, user);
      
      const updatedRoom = startGame(createdRoom.code, user.id);
      
      expect(updatedRoom).toBeUndefined();
    });
    
    it('should return undefined if there are not enough players', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      
      const createdRoom = createRoom(host);
      const updatedRoom = startGame(createdRoom.code, host.id);
      
      expect(updatedRoom).toBeUndefined();
    });
    
    it('should return undefined for a non-existent room', () => {
      const room = startGame('XYZ789', 'host-id');
      expect(room).toBeUndefined();
    });
  });

  describe('getAvailableRooms', () => {
    it('should return all rooms in WAITING status with space available', () => {
      const host1: User = { id: 'host1-id', username: 'Host1', isConnected: true };
      const host2: User = { id: 'host2-id', username: 'Host2', isConnected: true };
      const user: User = { id: 'user-id', username: 'User', isConnected: true };
      
      // Create two rooms
      (generateRoomCode as jest.Mock).mockReturnValueOnce('ABC123');
      const room1 = createRoom(host1, 1); // Full room
      
      (generateRoomCode as jest.Mock).mockReturnValueOnce('DEF456');
      const room2 = createRoom(host2); // Available room
      
      // Fill the first room
      joinRoom(room1.code, user);
      
      // Start the game in the second room
      startGame(room2.code, host2.id);
      
      // Create a third available room
      (generateRoomCode as jest.Mock).mockReturnValueOnce('GHI789');
      const host3: User = { id: 'host3-id', username: 'Host3', isConnected: true };
      const room3 = createRoom(host3);
      
      const availableRooms = getAvailableRooms();
      
      expect(availableRooms).toHaveLength(1);
      expect(availableRooms[0].code).toBe(room3.code);
    });
    
    it('should return an empty array if there are no available rooms', () => {
      const availableRooms = getAvailableRooms();
      expect(availableRooms).toHaveLength(0);
    });
  });

  describe('updateUserConnection', () => {
    it('should update a user\'s connection status', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      
      const createdRoom = createRoom(host);
      const updatedRoom = updateUserConnection(createdRoom.id, host.id, false);
      
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.players[0].isConnected).toBe(false);
      expect(updatedRoom?.players[0].socketId).toBeUndefined();
    });
    
    it('should update a user\'s socket ID when connecting', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: false };
      
      const createdRoom = createRoom(host);
      const updatedRoom = updateUserConnection(createdRoom.id, host.id, true, 'socket-id');
      
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.players[0].isConnected).toBe(true);
      expect(updatedRoom?.players[0].socketId).toBe('socket-id');
    });
    
    it('should return undefined for a non-existent room', () => {
      const room = updateUserConnection('non-existent', 'user-id', true);
      expect(room).toBeUndefined();
    });
    
    it('should return the room unchanged if the user is not in the room', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      
      const createdRoom = createRoom(host);
      const updatedRoom = updateUserConnection(createdRoom.id, 'non-existent', true);
      
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.players).toHaveLength(1);
      expect(updatedRoom?.players[0].id).toBe(host.id);
    });
  });

  describe('getGameState', () => {
    it('should return the game state for a room', () => {
      const host: User = { id: 'host-id', username: 'Host', isConnected: true };
      const user: User = { id: 'user-id', username: 'User', isConnected: true };
      
      const createdRoom = createRoom(host);
      joinRoom(createdRoom.code, user);
      startGame(createdRoom.code, host.id);
      
      const gameState = getGameState(createdRoom.id);
      
      expect(gameState).toBeDefined();
      expect(gameState?.roomId).toBe(createdRoom.id);
      expect(gameState?.status).toBe(RoomStatus.COMPOSING);
      expect(gameState?.theme).toBeDefined();
      expect(gameState?.timeRemaining).toBe(300); // 5 minutes for composing
    });
    
    it('should return undefined for a non-existent room', () => {
      const gameState = getGameState('non-existent');
      expect(gameState).toBeUndefined();
    });
  });
}); 