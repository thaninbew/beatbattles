/**
 * Utility functions for room management
 */

/**
 * Generates a random room code of specified length
 * @param length Length of the room code (default: 6)
 * @returns A random alphanumeric room code
 */
export const generateRoomCode = (length: number = 6): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters (0, 1, I, O)
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
};

/**
 * Validates a room code format
 * @param code The room code to validate
 * @returns Boolean indicating if the code is valid
 */
export const isValidRoomCode = (code: string): boolean => {
  // Room codes should be 6 characters, alphanumeric, and uppercase
  const regex = /^[A-Z0-9]{6}$/;
  return regex.test(code);
};

/**
 * Formats a room code for display (adds hyphens)
 * @param code The room code to format
 * @returns Formatted room code (e.g., "ABC-123")
 */
export const formatRoomCode = (code: string): string => {
  if (code.length !== 6) return code;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}; 