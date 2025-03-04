/**
 * Utility functions for Tone.js integration
 * 
 * This module provides utility functions for working with Tone.js,
 * a Web Audio framework for creating interactive music in the browser.
 * 
 * @module toneUtils
 * @see https://tonejs.github.io/
 */
import { 
  start, 
  now, 
  Transport, 
  Synth, 
  FMSynth, 
  AMSynth, 
  MembraneSynth, 
  MetalSynth, 
  MonoSynth, 
  PluckSynth, 
  PolySynth, 
  Sampler,
  Reverb,
  FeedbackDelay,
  Distortion,
  Chorus,
  Phaser,
  Tremolo,
  Vibrato,
  AutoFilter,
  AutoPanner,
  PingPongDelay,
  Volume,
  Loop,
  Frequency,
  context
} from 'tone';
import { Note, Track } from '../types';

// Define type aliases for Tone.js types to avoid TypeScript errors
// These are simplified versions that match how we use them in our code
export type ToneAudioNode = any; // Simplified for our usage
export type ToneLoop = any; // Simplified for our usage
export type ToneInstrument = any; // Simplified for our usage, represents any Tone.js instrument

/**
 * Available instrument types for synthesis
 */
export enum InstrumentType {
  SYNTH = 'synth',
  FM_SYNTH = 'fm',
  AM_SYNTH = 'am',
  MEMBRANE_SYNTH = 'membrane',
  METAL_SYNTH = 'metal',
  MONO_SYNTH = 'mono',
  PLUCK = 'pluck',
  POLY_SYNTH = 'poly',
  SAMPLER = 'sampler',
}

/**
 * Available effect types
 */
export enum EffectType {
  REVERB = 'reverb',
  DELAY = 'delay',
  DISTORTION = 'distortion',
  CHORUS = 'chorus',
  PHASER = 'phaser',
  TREMOLO = 'tremolo',
  VIBRATO = 'vibrato',
  AUTO_FILTER = 'autoFilter',
  AUTO_PANNER = 'autoPanner',
  PING_PONG_DELAY = 'pingPongDelay',
}

/**
 * Initialize Tone.js context
 * This must be called after a user interaction (e.g., click)
 * 
 * @returns A promise that resolves when the audio context is started
 * @throws Error if the audio context cannot be started
 */
export const initializeToneContext = async (): Promise<void> => {
  try {
    // Check if context is already running
    if (context.state === 'running') {
      console.log('Tone.js context already running');
      return;
    }
    
    // Start the context
    await start();
    console.log('Tone.js context started');
    
    // Reset transport state to ensure clean state
    Transport.cancel();
    Transport.position = 0;
  } catch (error) {
    console.error('Failed to start Tone.js context:', error);
    throw new Error('Failed to start audio context. Please try again or ensure your browser supports Web Audio API.');
  }
};

/**
 * Create a metronome that triggers on each beat
 * 
 * @param bpm - Beats per minute
 * @param callback - Function to call on each beat
 * @returns The metronome loop
 */
export const createMetronome = (
  bpm: number = 120,
  callback: (time: number, beat: number) => void
): ToneLoop => {
  // Set the BPM
  Transport.bpm.value = bpm;
  
  // Create a loop that fires on each quarter note
  const metronome = new Loop((time: number) => {
    // Get the current beat position
    const position = Transport.position.toString().split(':');
    const bar = parseInt(position[0]);
    const beat = parseInt(position[1]);
    
    // Call the callback with the current time and beat
    callback(time, beat);
  }, '4n').start(0);
  
  return metronome;
};

/**
 * Start the Tone.js transport
 * 
 * @param startTime - Optional start time in seconds (default: now)
 */
export const startTransport = (startTime?: number): void => {
  try {
    if (startTime !== undefined) {
      Transport.start(startTime);
    } else {
      Transport.start();
    }
  } catch (error) {
    console.warn('Error starting Tone.Transport:', error);
    // Attempt to reset and restart
    try {
      Transport.cancel();
      Transport.position = 0;
      Transport.start();
    } catch (resetError) {
      console.error('Failed to reset and restart Transport:', resetError);
    }
  }
};

/**
 * Stop the Tone.js transport
 * 
 * @param stopTime - Optional stop time in seconds (default: now)
 */
export const stopTransport = (stopTime?: number): void => {
  try {
    if (stopTime !== undefined) {
      Transport.stop(stopTime);
    } else {
      Transport.stop();
    }
  } catch (error) {
    console.warn('Error stopping Tone.Transport:', error);
    // Attempt to reset the transport state
    try {
      Transport.cancel();
      Transport.position = 0;
    } catch (resetError) {
      console.error('Failed to reset Transport state:', resetError);
    }
  }
};

/**
 * Convert a MIDI note number to a frequency
 * 
 * @param note - MIDI note number (0-127)
 * @returns Frequency in Hz
 */
export const midiToFrequency = (note: number): number => {
  return Frequency(note, 'midi').toFrequency();
};

/**
 * Convert a MIDI note number to a note name
 * 
 * @param note - MIDI note number (0-127)
 * @returns Note name (e.g., "C4")
 */
export const midiToNoteName = (note: number): string => {
  return Frequency(note, 'midi').toNote();
};

/**
 * Schedule a note to be played
 * 
 * @param synth - The Tone.js instrument
 * @param note - The note to play
 * @param now - The current time
 */
export const scheduleNote = (
  synth: ToneInstrument,
  note: Note,
  now: number
): void => {
  const frequency = midiToFrequency(note.pitch);
  const duration = `${note.duration * 4}n`; // Convert to note duration (e.g., 1 = quarter note)
  
  synth.triggerAttackRelease(frequency, duration, now + note.startTime);
};

/**
 * Create a synthesizer based on the specified type
 * 
 * @param type - The type of synthesizer to create
 * @param options - Optional configuration options
 * @returns The created synthesizer
 */
export const createSynth = (
  type: InstrumentType = InstrumentType.SYNTH,
  options: Record<string, any> = {}
): ToneInstrument => {
  try {
    switch (type) {
      case InstrumentType.FM_SYNTH:
        return new FMSynth(options).toDestination();
      case InstrumentType.AM_SYNTH:
        return new AMSynth(options).toDestination();
      case InstrumentType.MEMBRANE_SYNTH:
        return new MembraneSynth(options).toDestination();
      case InstrumentType.METAL_SYNTH:
        return new MetalSynth(options).toDestination();
      case InstrumentType.MONO_SYNTH:
        return new MonoSynth(options).toDestination();
      case InstrumentType.PLUCK:
        return new PluckSynth(options).toDestination();
      case InstrumentType.POLY_SYNTH:
        // Use a more generic approach to avoid issues with Tone.Synth
        return new PolySynth(options).toDestination();
      case InstrumentType.SAMPLER:
        // For sampler, options should include a samples object
        return new Sampler(options).toDestination();
      case InstrumentType.SYNTH:
      default:
        return new Synth(options).toDestination();
    }
  } catch (error) {
    console.error(`Error creating synth of type ${type}:`, error);
    // Fallback to a basic synth if the requested type fails
    try {
      return new Synth().toDestination();
    } catch (fallbackError) {
      console.error('Failed to create fallback synth:', fallbackError);
      // Return a dummy object that won't break the app
      return {
        triggerAttackRelease: () => console.warn('Using dummy synth - audio unavailable'),
        dispose: () => {},
        toDestination: () => ({}),
      };
    }
  }
};

/**
 * Create an effect based on the specified type
 * 
 * @param type - The type of effect to create
 * @param options - Optional configuration options
 * @returns The created effect
 */
export const createEffect = (
  type: EffectType,
  options: Record<string, any> = {}
): ToneAudioNode => {
  try {
    switch (type) {
      case EffectType.REVERB:
        return new Reverb(options);
      case EffectType.DELAY:
        return new FeedbackDelay(options);
      case EffectType.DISTORTION:
        return new Distortion(options);
      case EffectType.CHORUS:
        return new Chorus(options);
      case EffectType.PHASER:
        return new Phaser(options);
      case EffectType.TREMOLO:
        return new Tremolo(options);
      case EffectType.VIBRATO:
        return new Vibrato(options);
      case EffectType.AUTO_FILTER:
        return new AutoFilter(options);
      case EffectType.AUTO_PANNER:
        return new AutoPanner(options);
      case EffectType.PING_PONG_DELAY:
        return new PingPongDelay(options);
      default:
        return new Volume(options);
    }
  } catch (error) {
    console.error(`Error creating effect of type ${type}:`, error);
    // Return a dummy effect that won't break the app
    return {
      connect: () => ({}),
      toDestination: () => ({}),
      dispose: () => {},
    };
  }
};

/**
 * Create an audio chain with effects
 * 
 * @param instrument - The instrument to connect to the effects
 * @param effects - Array of effects to connect in series
 * @returns The instrument with effects connected
 */
export const connectEffects = (
  instrument: ToneInstrument,
  effects: ToneAudioNode[]
): ToneInstrument => {
  try {
    if (effects.length === 0) {
      return instrument.toDestination();
    }

    // Connect the instrument to the first effect
    instrument.connect(effects[0]);
    
    // Connect effects in series
    for (let i = 0; i < effects.length - 1; i++) {
      effects[i].connect(effects[i + 1]);
    }
    
    // Connect the last effect to the destination
    effects[effects.length - 1].toDestination();
    
    return instrument;
  } catch (error) {
    console.error('Error connecting effects:', error);
    // If there's an error, try to connect the instrument directly to the destination
    try {
      return instrument.toDestination();
    } catch (fallbackError) {
      console.error('Failed to connect instrument to destination:', fallbackError);
      return instrument;
    }
  }
};

/**
 * Play all notes in a track
 * 
 * @param track - The track containing notes to play
 * @param synth - The synthesizer to use
 */
export const playTrack = (
  track: Track,
  synth: ToneInstrument
): void => {
  const currentTime = now();
  
  track.notes.forEach(note => {
    scheduleNote(synth, note, currentTime);
  });
};

/**
 * Dispose of Tone.js resources to prevent memory leaks
 * 
 * @param resources - Array of Tone.js resources to dispose
 */
export const disposeToneResources = (
  resources: any[]
): void => {
  resources.forEach(resource => {
    if (resource && typeof resource.dispose === 'function') {
      resource.dispose();
    }
  });
}; 