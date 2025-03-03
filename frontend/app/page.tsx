'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomCode, isValidRoomCode } from '@/lib/utils/roomUtils';
import Button from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsCreating(true);
    try {
      // Generate a room code and navigate to the room
      const newRoomCode = generateRoomCode();
      localStorage.setItem('username', username);
      router.push(`/room?code=${newRoomCode}`);
    } catch (err) {
      setError('Failed to create room. Please try again.');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    if (!isValidRoomCode(roomCode.toUpperCase())) {
      setError('Invalid room code format');
      return;
    }

    setIsJoining(true);
    try {
      // Navigate to the room
      localStorage.setItem('username', username);
      router.push(`/room?code=${roomCode.toUpperCase()}`);
    } catch (err) {
      setError('Failed to join room. Please try again.');
      setIsJoining(false);
    }
  };

  const handleBrowseRooms = () => {
    if (!username.trim()) {
      setError('Please enter a username to browse rooms');
      return;
    }

    localStorage.setItem('username', username);
    router.push('/lobby');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            BeatBattles
          </h1>
          <p className="mt-2 text-gray-300">
            Create and battle with music in real-time
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your username"
              maxLength={20}
            />
          </div>

          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-300">
              Room Code (to join existing room)
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. ABC123"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="p-2 text-sm text-red-500 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-3 pt-2">
            <Button
              variant="gradient"
              fullWidth
              onClick={handleCreateRoom}
              isLoading={isCreating}
            >
              Create New Room
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={handleJoinRoom}
              isLoading={isJoining}
            >
              Join Room
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleBrowseRooms}
            >
              Browse Rooms
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Join a room to create and vote on 8-bar musical snippets</p>
        </div>
      </div>
    </div>
  );
}
