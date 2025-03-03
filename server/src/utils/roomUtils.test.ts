import { generateRoomCode, isValidRoomCode, formatRoomCode } from './roomUtils';

describe('Room Utilities', () => {
  describe('generateRoomCode', () => {
    it('should generate a 6-character room code', () => {
      const code = generateRoomCode();
      expect(code.length).toBe(6);
    });

    it('should generate only uppercase letters and numbers', () => {
      const code = generateRoomCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should not contain similar-looking characters (0, 1, I, O)', () => {
      const code = generateRoomCode();
      expect(code).not.toMatch(/[01IO]/);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateRoomCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe('isValidRoomCode', () => {
    it('should return true for valid room codes', () => {
      expect(isValidRoomCode('ABC123')).toBe(true);
      expect(isValidRoomCode('XYZ789')).toBe(true);
      expect(isValidRoomCode('A2B3C4')).toBe(true);
    });

    it('should return false for invalid room codes', () => {
      expect(isValidRoomCode('')).toBe(false);
      expect(isValidRoomCode('abc123')).toBe(false); // lowercase
      expect(isValidRoomCode('ABC12')).toBe(false); // too short
      expect(isValidRoomCode('ABC1234')).toBe(false); // too long
      expect(isValidRoomCode('ABC-12')).toBe(false); // invalid character
      expect(isValidRoomCode('ABC 12')).toBe(false); // space
    });

    test('isValidRoomCode should return false for invalid room codes', () => {
      // Invalid formats
      expect(isValidRoomCode('ABC')).toBe(false);
      expect(isValidRoomCode('ABCDE')).toBe(false);
      expect(isValidRoomCode('AB1D')).toBe(false);
      expect(isValidRoomCode('1234')).toBe(false);
      
      // Invalid types
      // @ts-expect-error Testing invalid input type
      expect(isValidRoomCode(1234)).toBe(false);
      // @ts-expect-error Testing invalid input type
      expect(isValidRoomCode(null)).toBe(false);
    });
  });

  describe('formatRoomCode', () => {
    it('should format a valid room code with a space in the middle', () => {
      expect(formatRoomCode('ABC123')).toBe('ABC 123');
      expect(formatRoomCode('XYZ789')).toBe('XYZ 789');
    });

    it('should return the original code if it is not 6 characters', () => {
      expect(formatRoomCode('ABC12')).toBe('ABC12');
      expect(formatRoomCode('ABC1234')).toBe('ABC1234');
      expect(formatRoomCode('')).toBe('');
    });

    it('should handle null or undefined input', () => {
      expect(formatRoomCode('')).toBe('');
      // @ts-expect-error - Testing null input
      expect(formatRoomCode(null)).toBe(null);
      // @ts-expect-error - Testing undefined input
      expect(formatRoomCode(undefined)).toBe(undefined);
    });
  });
}); 