'use client';

import React from 'react';
import { AudioContextProvider } from '@/lib/audio/AudioContextProvider';
import { DAWContainer } from '@/components/game/daw';
import { Composition } from '@/lib/types';

interface DAWWrapperProps {
  userId: string;
  initialComposition?: Composition;
  onSave: (composition: Composition) => void;
  readOnly?: boolean;
  initialBpm?: number;
}

/**
 * DAWWrapper component that provides the AudioContextProvider to the DAWContainer
 * This ensures that the audio context is properly initialized and managed
 */
const DAWWrapper: React.FC<DAWWrapperProps> = ({
  userId,
  initialComposition,
  onSave,
  readOnly = false,
  initialBpm = 120,
}) => {
  return (
    <AudioContextProvider initialBpm={initialBpm}>
      <div className="w-full h-full">
        <DAWContainer
          userId={userId}
          initialComposition={initialComposition}
          onSave={onSave}
          readOnly={readOnly}
        />
      </div>
    </AudioContextProvider>
  );
};

export default DAWWrapper; 