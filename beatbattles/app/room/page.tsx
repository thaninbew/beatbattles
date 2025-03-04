'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import RoomHeader from '@/components/room/RoomHeader';
import WaitingRoom from '@/components/room/WaitingRoom';
import { DAWContainer } from '@/components/game/daw';
import { Room, RoomStatus, User, Composition } from '@/types';
import { Composition as DAWComposition } from '@/lib/types';
import socketClient from '@/lib/socket';

export default function RoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composition, setComposition] = useState<Composition | null>(null);

  useEffect(() => {
    // Get room code from URL
    const roomCode = searchParams.get('code');
    if (!roomCode) {
      setError('No room code provided');
      setLoading(false);
      return;
    }

    // Get username from localStorage
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/');
      return;
    }

    // Create user object
    const userId = localStorage.getItem('userId') || crypto.randomUUID();
    localStorage.setItem('userId', userId);
    
    const currentUser: User = {
      id: userId,
      username,
      isConnected: true,
    };
    
    setUser(currentUser);

    // Set up socket event listeners
    socketClient.onRoomUpdated((updatedRoom) => {
      setRoom(updatedRoom);
      setLoading(false);
    });

    socketClient.onError((error) => {
      setError(error.message);
      setLoading(false);
    });

    // Join the room
    socketClient.joinRoom(roomCode, currentUser);

    // Clean up event listeners on unmount
    return () => {
      socketClient.offRoomUpdated((updatedRoom) => setRoom(updatedRoom));
      socketClient.offError((error) => setError(error.message));
    };
  }, [router, searchParams]);

  const handleLeaveRoom = () => {
    if (room && user) {
      socketClient.leaveRoom(room.code, user.id);
      router.push('/');
    }
  };

  const handleStartGame = () => {
    if (room && user) {
      socketClient.startGame(room.code, user.id);
    }
  };

  const handleSaveComposition = (dawComposition: DAWComposition) => {
    // Convert from lib/types Composition to types Composition
    const adaptedComposition: Composition = {
      id: crypto.randomUUID(),
      userId: dawComposition.userId,
      roomId: room?.id || '',
      tracks: dawComposition.tracks.map(track => ({
        id: track.id,
        instrumentId: track.instrumentType,
        notes: track.notes,
        isMuted: track.muted,
        volume: track.volume,
        pan: 0
      })),
      bpm: dawComposition.bpm,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setComposition(adaptedComposition);
    
    // In a real implementation, we would send this to the server
    console.log('Composition saved:', adaptedComposition);
    
    // Example of how to send to server (to be implemented)
    // socketClient.saveComposition(room.code, user.id, adaptedComposition);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">Joining room...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </PageContainer>
    );
  }

  if (!room || !user) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg">Room not found</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Back to Home
          </button>
        </div>
      </PageContainer>
    );
  }

  // Convert from types Composition to lib/types Composition for DAWContainer
  const dawComposition = composition ? {
    userId: composition.userId,
    tracks: composition.tracks.map(track => ({
      id: track.id,
      instrumentType: track.instrumentId,
      notes: track.notes,
      volume: track.volume,
      muted: track.isMuted
    })),
    bpm: composition.bpm
  } as DAWComposition : undefined;

  return (
    <PageContainer>
      <RoomHeader 
        room={room} 
        username={user.username} 
        onLeaveRoom={handleLeaveRoom} 
      />
      
      {room.status === RoomStatus.WAITING && (
        <WaitingRoom 
          room={room} 
          currentUser={user} 
          onStartGame={handleStartGame} 
        />
      )}
      
      {room.status === RoomStatus.COMPOSING && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Composition Phase</h2>
            {room.theme && (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                <span className="font-semibold">Theme:</span> {room.theme}
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden h-[70vh]">
            {user && (
              <DAWContainer 
                userId={user.id}
                initialComposition={dawComposition}
                onSave={handleSaveComposition}
              />
            )}
          </div>
        </div>
      )}
      
      {room.status === RoomStatus.VOTING && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Voting Phase</h2>
          <p>This is where the voting interface will go</p>
          {/* Voting component will be added here */}
        </div>
      )}
      
      {room.status === RoomStatus.RESULTS && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <p>This is where the results will be displayed</p>
          {/* Results component will be added here */}
        </div>
      )}
    </PageContainer>
  );
} 