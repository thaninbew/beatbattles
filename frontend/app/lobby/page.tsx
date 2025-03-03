'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatRoomCode } from '@/lib/utils/roomUtils';
import { Room } from '@/lib/types';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';

// Mock data for available rooms
const mockRooms: Room[] = [
  {
    id: '1',
    code: 'ABC123',
    status: 'waiting' as any,
    hostId: 'user_1',
    players: [{ id: 'user_1', username: 'Player1' }],
    maxPlayers: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    code: 'DEF456',
    status: 'waiting' as any,
    hostId: 'user_2',
    players: [
      { id: 'user_2', username: 'Player2' },
      { id: 'user_3', username: 'Player3' },
    ],
    maxPlayers: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function LobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      router.push('/');
      return;
    }
    setUsername(storedUsername);

    // In a real app, we would fetch rooms from the server
    // For now, use mock data
    setRooms(mockRooms);
    setLoading(false);
  }, [router]);

  const handleJoinRoom = (roomCode: string) => {
    router.push(`/room?code=${roomCode}`);
  };

  const handleCreateRoom = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-xl text-white">Loading rooms...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <header className="flex justify-between items-center mb-8 p-4 bg-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold">BeatBattles Lobby</h1>
        <div className="flex items-center space-x-4">
          <p className="font-medium">Welcome, {username}</p>
          <Button 
            variant="gradient" 
            onClick={handleCreateRoom}
          >
            Create Room
          </Button>
        </div>
      </header>

      <main className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Available Rooms</h2>
        
        {rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No rooms available. Create a new room to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{formatRoomCode(room.code)}</h3>
                    <p className="text-sm text-gray-400">Host: {room.players.find(p => p.id === room.hostId)?.username}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-500 text-xs rounded-full">
                    {room.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">{room.players.length}/{room.maxPlayers} players</p>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleJoinRoom(room.code)}
                  >
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </PageContainer>
  );
} 