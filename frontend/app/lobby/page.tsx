'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';
import { Room, User, RoomStatus } from '@/types';
import socketClient from '@/lib/socket';

export default function LobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      router.push('/');
      return;
    }
    
    setUsername(storedUsername);
    
    // In a real implementation, we would fetch rooms from the server
    // For now, we'll use mock data
    const mockRooms: Room[] = [
      {
        id: '1',
        code: 'ABC123',
        status: RoomStatus.WAITING,
        hostId: 'host1',
        players: [
          { id: 'host1', username: 'Host1', isConnected: true },
          { id: 'player1', username: 'Player1', isConnected: true },
        ],
        maxPlayers: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        code: 'DEF456',
        status: RoomStatus.WAITING,
        hostId: 'host2',
        players: [
          { id: 'host2', username: 'Host2', isConnected: true },
        ],
        maxPlayers: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    setRooms(mockRooms);
    setLoading(false);
    
    // In a real implementation, we would listen for room updates
    // socketClient.onRoomUpdated((updatedRoom) => {
    //   setRooms(prevRooms => {
    //     const roomIndex = prevRooms.findIndex(r => r.id === updatedRoom.id);
    //     if (roomIndex >= 0) {
    //       const newRooms = [...prevRooms];
    //       newRooms[roomIndex] = updatedRoom;
    //       return newRooms;
    //     } else {
    //       return [...prevRooms, updatedRoom];
    //     }
    //   });
    // });
    
    // return () => {
    //   socketClient.offRoomUpdated(() => {});
    // };
  }, [router]);

  const handleJoinRoom = (roomCode: string) => {
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

  const handleCreateRoom = () => {
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
    
    // Listen for room created event
    socketClient.onRoomCreated((room) => {
      router.push(`/room?code=${room.code}`);
    });
    
    // Clean up event listener
    return () => {
      socketClient.offRoomCreated(() => {});
    };
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">Loading rooms...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Rooms</h1>
        <p className="text-gray-600">Join an existing room or create a new one</p>
      </div>
      
      <div className="mb-6">
        <Button onClick={handleCreateRoom} className="w-full md:w-auto">
          Create New Room
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {rooms.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <div key={room.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Room: {room.code}</h3>
                  <p className="text-sm text-gray-500">
                    Players: {room.players.length}/{room.maxPlayers} • 
                    Host: {room.players.find(p => p.id === room.hostId)?.username}
                  </p>
                </div>
                <Button 
                  onClick={() => handleJoinRoom(room.code)}
                  variant="outline"
                >
                  Join
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No rooms available</p>
            <Button onClick={handleCreateRoom}>
              Create a Room
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
} 