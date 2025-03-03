'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { joinRoom, getSocket, SocketEvents } from '@/lib/socket/socketClient';
import { Room, RoomStatus, User } from '@/lib/types';
import PageContainer from '@/components/layout/PageContainer';
import RoomHeader from '@/components/room/RoomHeader';
import WaitingRoom from '@/components/room/WaitingRoom';

export default function RoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if we have a room code
    if (!code) {
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
    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
    };
    setUser(newUser);

    // Initialize socket and join room
    const socket = getSocket();
    
    // Listen for room updates
    socket.on(SocketEvents.ROOM_UPDATED, (updatedRoom: Room) => {
      console.log('Room updated:', updatedRoom);
      setRoom(updatedRoom);
      setLoading(false);
    });

    // Join the room
    joinRoom(code, newUser);

    // Cleanup function
    return () => {
      socket.on(SocketEvents.ROOM_UPDATED, () => {});
    };
  }, [code, router]);

  const handleLeaveRoom = () => {
    router.push('/');
  };

  const handleStartGame = () => {
    // This would be implemented with socket events in a real app
    console.log('Starting game...');
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-xl text-white">Joining room...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
            <p className="text-white mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!room || !user) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl text-center">
            <h1 className="text-2xl font-bold text-yellow-500 mb-4">Room Not Found</h1>
            <p className="text-white mb-6">The room you're trying to join doesn't exist or has expired.</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

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

      {/* Other room states would be implemented here */}
      {room.status === RoomStatus.COMPOSING && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Composition Phase</h2>
          <p className="text-gray-300">
            This feature will be implemented in the next stage.
          </p>
        </div>
      )}

      {room.status === RoomStatus.VOTING && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Voting Phase</h2>
          <p className="text-gray-300">
            This feature will be implemented in a future stage.
          </p>
        </div>
      )}

      {room.status === RoomStatus.RESULTS && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <p className="text-gray-300">
            This feature will be implemented in a future stage.
          </p>
        </div>
      )}
    </PageContainer>
  );
} 