/**
 * Utility functions for room management
 */

/**
 * Generate a random room code
 * @returns A 6-character alphanumeric room code
 */
export const generateRoomCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar-looking characters (0, 1, I, O)
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
};

/**
 * Validate a room code
 * @param code The room code to validate
 * @returns True if the code is valid, false otherwise
 */
export const isValidRoomCode = (code: string): boolean => {
  // Room code should be 6 characters long and only contain uppercase letters and numbers
  const regex = /^[A-Z0-9]{6}$/;
  return regex.test(code);
};

/**
 * Format a room code for display (add a space in the middle)
 * @param code The room code to format
 * @returns The formatted room code
 */
export const formatRoomCode = (code: string): string => {
  if (!code || code.length !== 6) return code;
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}; 