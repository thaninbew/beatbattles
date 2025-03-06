'use client';

import React, { useState } from 'react';
import DAWWrapper from '@/components/game/DAWWrapper';
import PageContainer from '@/components/layout/PageContainer';
import { Composition } from '@/lib/types';

/**
 * Demo page for the DAW implementation
 * This page allows users to test the DAW functionality
 */
export default function DAWDemo() {
  const [savedCompositions, setSavedCompositions] = useState<Composition[]>([]);
  const demoUserId = 'demo-user-123';

  const handleSaveComposition = (composition: Composition) => {
    console.log('Saved composition:', composition);
    setSavedCompositions([...savedCompositions, composition]);
    alert('Composition saved!');
  };

  return (
    <PageContainer maxWidth="full">
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6 text-white">DAW Demo</h1>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-8 border border-gray-700 shadow-lg">
          <DAWWrapper 
            userId={demoUserId}
            onSave={handleSaveComposition}
            initialBpm={120}
          />
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">How to Use the DAW</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>Use the <strong className="text-white">Play/Stop</strong> button to control playback</li>
            <li>Adjust the <strong className="text-white">BPM</strong> (beats per minute) using the slider or input field</li>
            <li>Click on the grid to add notes (Piano Roll) or toggle drum hits (Drum Grid)</li>
            <li>Select a track from the left sidebar to edit it</li>
            <li>Use the mute buttons to silence specific tracks</li>
            <li>Click <strong className="text-white">Save</strong> to store your composition</li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
} 