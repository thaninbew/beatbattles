/**
 * Utility functions for Tone.js integration
 * 
 * This module provides utility functions for working with Tone.js,
 * a Web Audio framework for creating interactive music in the browser.
 * 
 * @module toneUtils
 * @see https://tonejs.github.io/
 */
import * as Tone from 'tone';
import { Note, Track } from '../types';

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
 * Type for any Tone.js instrument that can trigger notes
 */
export type ToneInstrument = Tone.Synth | Tone.PolySynth | Tone.FMSynth | Tone.AMSynth | 
  Tone.MembraneSynth | Tone.MetalSynth | Tone.MonoSynth | Tone.PluckSynth | Tone.Sampler;

/**
 * Initialize Tone.js context
 * This must be called after a user interaction (e.g., click)
 * 
 * @returns A promise that resolves when the audio context is started
 * @throws Error if the audio context cannot be started
 */
export const initializeToneContext = async (): Promise<void> => {
  try {
    await Tone.start();
    console.log('Tone.js context started');
  } catch (error) {
    console.error('Failed to start Tone.js context:', error);
    throw new Error('Failed to start audio context. Please try again.');
  }
};

/**
 * Create a metronome that loops every 8 bars
 * 
 * @param bpm - Beats per minute (default: 120)
 * @param callback - Function to call on each beat
 * @returns The metronome object
 */
export const createMetronome = (
  bpm: number = 120,
  callback: (time: number, beat: number) => void
): Tone.Loop => {
  // Set the BPM
  Tone.Transport.bpm.value = bpm;
  
  // Create a loop that fires on each quarter note
  const metronome = new Tone.Loop((time) => {
    // Get the current beat position
    const position = Tone.Transport.position.toString().split(':');
    const bar = parseInt(position[0]);
    const beat = parseInt(position[1]);
    const sixteenth = parseInt(position[2]);
    
    // Calculate the absolute beat number (0-31 for 8 bars of 4/4)
    const absoluteBeat = (bar % 8) * 4 + beat;
    
    // Call the callback with the current time and beat
    callback(time, absoluteBeat);
  }, '4n'); // Quarter note interval
  
  return metronome;
};

/**
 * Start the Tone.js transport
 * 
 * @param startTime - Optional start time in seconds (default: now)
 */
export const startTransport = (startTime?: number): void => {
  if (startTime !== undefined) {
    Tone.Transport.start(startTime);
  } else {
    Tone.Transport.start();
  }
};

/**
 * Stop the Tone.js transport
 * 
 * @param stopTime - Optional stop time in seconds (default: now)
 */
export const stopTransport = (stopTime?: number): void => {
  if (stopTime !== undefined) {
    Tone.Transport.stop(stopTime);
  } else {
    Tone.Transport.stop();
  }
};

/**
 * Convert a MIDI note number to a frequency
 * 
 * @param note - MIDI note number (0-127)
 * @returns Frequency in Hz
 */
export const midiToFrequency = (note: number): number => {
  return Tone.Frequency(note, 'midi').toFrequency();
};

/**
 * Convert a MIDI note number to a note name
 * 
 * @param note - MIDI note number (0-127)
 * @returns Note name (e.g., "C4")
 */
export const midiToNoteName = (note: number): string => {
  return Tone.Frequency(note, 'midi').toNote();
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
  switch (type) {
    case InstrumentType.FM_SYNTH:
      return new Tone.FMSynth(options).toDestination();
    case InstrumentType.AM_SYNTH:
      return new Tone.AMSynth(options).toDestination();
    case InstrumentType.MEMBRANE_SYNTH:
      return new Tone.MembraneSynth(options).toDestination();
    case InstrumentType.METAL_SYNTH:
      return new Tone.MetalSynth(options).toDestination();
    case InstrumentType.MONO_SYNTH:
      return new Tone.MonoSynth(options).toDestination();
    case InstrumentType.PLUCK:
      return new Tone.PluckSynth(options).toDestination();
    case InstrumentType.POLY_SYNTH:
      return new Tone.PolySynth(Tone.Synth, options).toDestination();
    case InstrumentType.SAMPLER:
      // For sampler, options should include a samples object
      return new Tone.Sampler(options).toDestination();
    case InstrumentType.SYNTH:
    default:
      return new Tone.Synth(options).toDestination();
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
): Tone.ToneAudioNode => {
  switch (type) {
    case EffectType.REVERB:
      return new Tone.Reverb(options);
    case EffectType.DELAY:
      return new Tone.FeedbackDelay(options);
    case EffectType.DISTORTION:
      return new Tone.Distortion(options);
    case EffectType.CHORUS:
      return new Tone.Chorus(options);
    case EffectType.PHASER:
      return new Tone.Phaser(options);
    case EffectType.TREMOLO:
      return new Tone.Tremolo(options);
    case EffectType.VIBRATO:
      return new Tone.Vibrato(options);
    case EffectType.AUTO_FILTER:
      return new Tone.AutoFilter(options);
    case EffectType.AUTO_PANNER:
      return new Tone.AutoPanner(options);
    case EffectType.PING_PONG_DELAY:
      return new Tone.PingPongDelay(options);
    default:
      return new Tone.Volume(options);
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
  effects: Tone.ToneAudioNode[]
): ToneInstrument => {
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
  const now = Tone.now();
  
  track.notes.forEach(note => {
    scheduleNote(synth, note, now);
  });
};

/**
 * Dispose of Tone.js resources to prevent memory leaks
 * 
 * @param resources - Array of Tone.js resources to dispose
 */
export const disposeToneResources = (
  resources: (Tone.ToneAudioNode | Tone.Loop)[]
): void => {
  resources.forEach(resource => {
    if (resource && typeof resource.dispose === 'function') {
      resource.dispose();
    }
  });
}; 