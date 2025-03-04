/**
 * Tests for Tone.js utility functions
 * 
 * @jest-environment jsdom
 */

import { 
  initializeToneContext, 
  createSynth, 
  startTransport, 
  stopTransport, 
  disposeToneResources,
  InstrumentType
} from '../toneUtils';

// Add type declarations for Jest globals
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any[]> {
      mockImplementationOnce: (fn: (...args: Y) => T) => Mock<T, Y>;
      mockResolvedValue: (value: T) => Mock<T, Y>;
      mockRejectedValueOnce: (value: any) => Mock<T, Y>;
      mockReturnThis: () => Mock<T, Y>;
      mockReturnValue: (value: T) => Mock<T, Y>;
    }
  }
}

// Mock Tone.js
jest.mock('tone', () => {
  return {
    start: jest.fn().mockResolvedValue(undefined),
    Transport: {
      start: jest.fn(),
      stop: jest.fn(),
      cancel: jest.fn(),
      position: 0,
      bpm: { value: 120 }
    },
    context: {
      state: 'suspended'
    },
    Synth: jest.fn().mockImplementation(() => ({
      toDestination: jest.fn().mockReturnThis(),
      connect: jest.fn(),
      triggerAttackRelease: jest.fn(),
      dispose: jest.fn()
    })),
    FMSynth: jest.fn().mockImplementation(() => ({
      toDestination: jest.fn().mockReturnThis(),
      connect: jest.fn(),
      triggerAttackRelease: jest.fn(),
      dispose: jest.fn()
    })),
    MembraneSynth: jest.fn().mockImplementation(() => ({
      toDestination: jest.fn().mockReturnThis(),
      connect: jest.fn(),
      triggerAttackRelease: jest.fn(),
      dispose: jest.fn()
    })),
    PolySynth: jest.fn().mockImplementation(() => ({
      toDestination: jest.fn().mockReturnThis(),
      connect: jest.fn(),
      triggerAttackRelease: jest.fn(),
      dispose: jest.fn()
    })),
    Reverb: jest.fn().mockImplementation(() => ({
      toDestination: jest.fn().mockReturnThis(),
      connect: jest.fn(),
      dispose: jest.fn()
    })),
    Loop: jest.fn().mockImplementation((callback: (time: number) => void) => ({
      start: jest.fn(),
      stop: jest.fn(),
      dispose: jest.fn()
    })),
    now: jest.fn().mockReturnValue(0),
    Frequency: jest.fn().mockImplementation((value: number, unit: string) => ({
      toFrequency: jest.fn().mockReturnValue(440),
      toNote: jest.fn().mockReturnValue('A4')
    }))
  };
});

// Create a reference to the mocked Tone module for use in tests
const mockedTone = jest.requireMock('tone');

describe('Tone.js Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Tone.context.state for each test
    mockedTone.context.state = 'suspended';
  });

  describe('initializeToneContext', () => {
    it('should start the Tone.js context if it is suspended', async () => {
      await initializeToneContext();
      expect(mockedTone.start).toHaveBeenCalled();
      expect(mockedTone.Transport.cancel).toHaveBeenCalled();
      expect(mockedTone.Transport.position).toBe(0);
    });

    it('should not start the Tone.js context if it is already running', async () => {
      mockedTone.context.state = 'running';
      await initializeToneContext();
      expect(mockedTone.start).not.toHaveBeenCalled();
    });

    it('should handle errors when starting the context', async () => {
      const error = new Error('Failed to start audio context');
      (mockedTone.start as jest.Mock).mockRejectedValueOnce(error);
      
      await expect(initializeToneContext()).rejects.toThrow();
      expect(mockedTone.start).toHaveBeenCalled();
    });
  });

  describe('createSynth', () => {
    it('should create a synth based on the specified type', () => {
      const synth = createSynth(InstrumentType.SYNTH);
      expect(mockedTone.Synth).toHaveBeenCalled();
    });

    it('should create an FM synth when specified', () => {
      const synth = createSynth(InstrumentType.FM_SYNTH);
      expect(mockedTone.FMSynth).toHaveBeenCalled();
    });

    it('should handle errors and return a fallback synth', () => {
      (mockedTone.FMSynth as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to create synth');
      });
      
      const synth = createSynth(InstrumentType.FM_SYNTH);
      // Should fall back to Synth
      expect(mockedTone.Synth).toHaveBeenCalled();
    });
  });

  describe('startTransport and stopTransport', () => {
    it('should start the transport', () => {
      startTransport();
      expect(mockedTone.Transport.start).toHaveBeenCalled();
    });

    it('should stop the transport', () => {
      stopTransport();
      expect(mockedTone.Transport.stop).toHaveBeenCalled();
    });

    it('should handle errors when starting the transport', () => {
      (mockedTone.Transport.start as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to start transport');
      });
      
      startTransport();
      // Should attempt to reset and restart
      expect(mockedTone.Transport.cancel).toHaveBeenCalled();
      expect(mockedTone.Transport.position).toBe(0);
      expect(mockedTone.Transport.start).toHaveBeenCalledTimes(2);
    });

    it('should handle errors when stopping the transport', () => {
      (mockedTone.Transport.stop as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to stop transport');
      });
      
      stopTransport();
      // Should attempt to reset
      expect(mockedTone.Transport.cancel).toHaveBeenCalled();
      expect(mockedTone.Transport.position).toBe(0);
    });
  });

  describe('disposeToneResources', () => {
    it('should dispose of Tone.js resources', () => {
      const synth = createSynth(InstrumentType.SYNTH);
      disposeToneResources([synth]);
      expect(synth.dispose).toHaveBeenCalled();
    });

    it('should handle resources without a dispose method', () => {
      const invalidResource = { foo: 'bar' };
      // This should not throw an error
      expect(() => disposeToneResources([invalidResource as any])).not.toThrow();
    });
  });
}); 