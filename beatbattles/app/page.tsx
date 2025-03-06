'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';
import { User } from '@/types';
import socketClient from '@/lib/socket';

export default function HomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Check if username is already stored
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    // Set up socket event listeners
    socketClient.onRoomCreated((room) => {
      setIsCreating(false);
      router.push(`/room?code=${room.code}`);
    });
    
    socketClient.onError((error) => {
      setError(error.message);
      setIsCreating(false);
      setIsJoining(false);
    });
    
    // Clean up event listeners on unmount
    return () => {
      socketClient.offRoomCreated(() => {});
      socketClient.offError(() => {});
    };
  }, [router]);

  const handleCreateRoom = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setError(null);
    setIsCreating(true);
    
    // Store username in localStorage
    localStorage.setItem('username', username);
    
    // Get userId from localStorage or create a new one
    const userId = localStorage.getItem('userId') || crypto.randomUUID();
    localStorage.setItem('userId', userId);
    
    const user: User = {
      id: userId,
      username,
      isConnected: true,
    };
    
    // Create a new room
    socketClient.createRoom(user, 4);
  };

  const handleJoinRoom = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    setError(null);
    setIsJoining(true);
    
    // Store username in localStorage
    localStorage.setItem('username', username);
    
    // Get userId from localStorage or create a new one
    const userId = localStorage.getItem('userId') || crypto.randomUUID();
    localStorage.setItem('userId', userId);
    
    const user: User = {
      id: userId,
      username,
      isConnected: true,
    };
    
    // Join the room
    socketClient.joinRoom(roomCode, user);
    
    // Navigate to the room page
    router.push(`/room?code=${roomCode}`);
  };

  const handleBrowseRooms = () => {
    if (!username.trim()) {
      setError('Please enter a username to browse rooms');
      return;
    }
    
    // Store username in localStorage
    localStorage.setItem('username', username);
    
    // Navigate to the lobby page
    router.push('/lobby');
  };

  return (
    <PageContainer maxWidth="sm">
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">BeatBattles</h1>
          
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              disabled={isCreating || isJoining}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-200 mb-1">
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              disabled={isCreating || isJoining}
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-100 rounded">
              {error}
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleCreateRoom}
              disabled={isCreating || isJoining || !username.trim()}
              className="w-full"
            >
              {isCreating ? 'Creating Room...' : 'Create New Room'}
            </Button>
            
            <Button
              onClick={handleJoinRoom}
              disabled={isCreating || isJoining || !username.trim() || !roomCode.trim()}
              variant="secondary"
              className="w-full"
            >
              {isJoining ? 'Joining Room...' : 'Join Room'}
            </Button>
            
            <Button
              onClick={handleBrowseRooms}
              disabled={isCreating || isJoining || !username.trim()}
              variant="outline"
              className="w-full"
            >
              Browse Rooms
            </Button>
            
            <Button
              onClick={() => router.push('/demo')}
              variant="outline"
              className="w-full"
            >
              Try DAW Demo
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
