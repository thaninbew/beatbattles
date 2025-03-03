/**
 * Room service for managing game rooms
 */
import { v4 as uuidv4 } from 'uuid';
import { Room, User, RoomStatus, GameState } from '../types';
import { generateRoomCode, isValidRoomCode } from '../utils/roomUtils';

// In-memory storage for rooms (in a real app, this would be a database)
const rooms: Map<string, Room> = new Map();
const roomsByCode: Map<string, string> = new Map(); // Maps room codes to room IDs

/**
 * Create a new room
 * @param host The user creating the room
 * @param maxPlayers Maximum number of players allowed in the room
 * @returns The created room
 */
export const createRoom = (host: User, maxPlayers: number = 10): Room => {
  // Generate a unique room code
  let roomCode = generateRoomCode();
  while (roomsByCode.has(roomCode)) {
    roomCode = generateRoomCode();
  }

  const roomId = uuidv4();
  const now = new Date();

  const room: Room = {
    id: roomId,
    code: roomCode,
    status: RoomStatus.WAITING,
    hostId: host.id,
    players: [host],
    maxPlayers,
    createdAt: now,
    updatedAt: now,
  };

  // Store the room
  rooms.set(roomId, room);
  roomsByCode.set(roomCode, roomId);

  return room;
};

/**
 * Get a room by its code
 * @param code The room code
 * @returns The room, or undefined if not found
 */
export const getRoomByCode = (code: string): Room | undefined => {
  if (!isValidRoomCode(code)) return undefined;
  
  const roomId = roomsByCode.get(code);
  if (!roomId) return undefined;
  
  return rooms.get(roomId);
};

/**
 * Get a room by its ID
 * @param id The room ID
 * @returns The room, or undefined if not found
 */
export const getRoomById = (id: string): Room | undefined => {
  return rooms.get(id);
};

/**
 * Add a user to a room
 * @param roomCode The room code
 * @param user The user to add
 * @returns The updated room, or undefined if the room is not found or full
 */
export const joinRoom = (roomCode: string, user: User): Room | undefined => {
  const room = getRoomByCode(roomCode);
  
  if (!room) return undefined;
  if (room.players.length >= room.maxPlayers) return undefined;
  if (room.status !== RoomStatus.WAITING) return undefined;
  
  // Check if the user is already in the room
  const existingUserIndex = room.players.findIndex(p => p.id === user.id);
  
  if (existingUserIndex >= 0) {
    // Update the existing user
    room.players[existingUserIndex] = {
      ...room.players[existingUserIndex],
      ...user,
      isConnected: true,
    };
  } else {
    // Add the new user
    room.players.push({
      ...user,
      isConnected: true,
    });
  }
  
  room.updatedAt = new Date();
  rooms.set(room.id, room);
  
  return room;
};

/**
 * Remove a user from a room
 * @param roomCode The room code
 * @param userId The ID of the user to remove
 * @returns The updated room, or undefined if the room is not found
 */
export const leaveRoom = (roomCode: string, userId: string): Room | undefined => {
  const room = getRoomByCode(roomCode);
  
  if (!room) return undefined;
  
  // Find the user in the room
  const userIndex = room.players.findIndex(p => p.id === userId);
  
  if (userIndex < 0) return room; // User not in room
  
  // If the user is the host and there are other players, assign a new host
  if (room.hostId === userId && room.players.length > 1) {
    // Find the first connected player who is not the current host
    const newHost = room.players.find(p => p.id !== userId && p.isConnected);
    
    if (newHost) {
      room.hostId = newHost.id;
    }
  }
  
  // Remove the user from the room
  room.players = room.players.filter(p => p.id !== userId);
  
  // If the room is empty, delete it
  if (room.players.length === 0) {
    rooms.delete(room.id);
    roomsByCode.delete(room.code);
    return undefined;
  }
  
  room.updatedAt = new Date();
  rooms.set(room.id, room);
  
  return room;
};

/**
 * Start the game in a room
 * @param roomCode The room code
 * @param userId The ID of the user starting the game (must be the host)
 * @returns The updated room, or undefined if the room is not found or the user is not the host
 */
export const startGame = (roomCode: string, userId: string): Room | undefined => {
  const room = getRoomByCode(roomCode);
  
  if (!room) return undefined;
  if (room.hostId !== userId) return undefined;
  if (room.players.length < 2) return undefined; // Need at least 2 players
  
  // Generate a random theme
  const themes = [
    'Space Adventure',
    'Underwater Journey',
    'Jungle Expedition',
    'Desert Mirage',
    'Cyberpunk City',
    'Medieval Castle',
    'Haunted Mansion',
    'Tropical Paradise',
    'Arctic Wilderness',
    'Steampunk Factory',
  ];
  
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  
  // Update the room status
  room.status = RoomStatus.COMPOSING;
  room.theme = randomTheme;
  room.updatedAt = new Date();
  
  rooms.set(room.id, room);
  
  return room;
};

/**
 * Get all available rooms (in WAITING status)
 * @returns Array of available rooms
 */
export const getAvailableRooms = (): Room[] => {
  return Array.from(rooms.values())
    .filter(room => room.status === RoomStatus.WAITING && room.players.length < room.maxPlayers)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation time (newest first)
};

/**
 * Update a user's connection status in a room
 * @param roomId The room ID
 * @param userId The user ID
 * @param isConnected Whether the user is connected
 * @param socketId The socket ID of the connected user
 * @returns The updated room, or undefined if the room or user is not found
 */
export const updateUserConnection = (
  roomId: string,
  userId: string,
  isConnected: boolean,
  socketId?: string
): Room | undefined => {
  const room = getRoomById(roomId);
  
  if (!room) return undefined;
  
  // Find the user in the room
  const userIndex = room.players.findIndex(p => p.id === userId);
  
  if (userIndex < 0) return room; // User not in room
  
  // Update the user's connection status
  room.players[userIndex] = {
    ...room.players[userIndex],
    isConnected,
    socketId: isConnected ? socketId : undefined,
  };
  
  room.updatedAt = new Date();
  rooms.set(room.id, room);
  
  return room;
};

/**
 * Get the initial game state for a room
 * @param roomId The room ID
 * @returns The game state, or undefined if the room is not found
 */
export const getGameState = (roomId: string): GameState | undefined => {
  const room = getRoomById(roomId);
  
  if (!room) return undefined;
  
  return {
    roomId: room.id,
    status: room.status,
    theme: room.theme,
    timeRemaining: getTimeRemaining(room),
  };
};

/**
 * Get the time remaining for the current phase
 * @param room The room
 * @returns The time remaining in seconds, or undefined if not applicable
 */
const getTimeRemaining = (room: Room): number | undefined => {
  // In a real implementation, this would calculate the actual time remaining
  // based on when the phase started and the total duration
  
  switch (room.status) {
    case RoomStatus.COMPOSING:
      return 300; // 5 minutes
    case RoomStatus.VOTING:
      return 120; // 2 minutes
    default:
      return undefined;
  }
};

/**
 * Clean up disconnected users from all rooms
 * This would typically be run on a schedule
 */
export const cleanupDisconnectedUsers = (): void => {
  for (const [roomId, room] of rooms.entries()) {
    // Remove disconnected users who have been disconnected for more than 5 minutes
    // In a real implementation, we would track when they disconnected
    
    const updatedPlayers = room.players.filter(p => p.isConnected);
    
    if (updatedPlayers.length !== room.players.length) {
      room.players = updatedPlayers;
      room.updatedAt = new Date();
      
      // If the room is empty, delete it
      if (room.players.length === 0) {
        rooms.delete(roomId);
        roomsByCode.delete(room.code);
      } else {
        // If the host is gone, assign a new host
        if (!room.players.some(p => p.id === room.hostId)) {
          room.hostId = room.players[0].id;
        }
        
        rooms.set(roomId, room);
      }
    }
  }
};

/**
 * Reset the room storage (for testing only)
 */
export const _resetRoomStorageForTesting = (): void => {
  rooms.clear();
  roomsByCode.clear();
}; 