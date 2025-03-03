import React from 'react';
import { formatRoomCode } from '@/lib/utils/roomUtils';
import { Room, RoomStatus } from '@/lib/types';

interface RoomHeaderProps {
  room: Room;
  username: string;
  onLeaveRoom: () => void;
}

const statusLabels: Record<RoomStatus, string> = {
  [RoomStatus.WAITING]: 'Waiting for Players',
  [RoomStatus.COMPOSING]: 'Composing',
  [RoomStatus.VOTING]: 'Voting',
  [RoomStatus.RESULTS]: 'Results',
};

const statusColors: Record<RoomStatus, string> = {
  [RoomStatus.WAITING]: 'bg-yellow-500',
  [RoomStatus.COMPOSING]: 'bg-green-500',
  [RoomStatus.VOTING]: 'bg-blue-500',
  [RoomStatus.RESULTS]: 'bg-purple-500',
};

const RoomHeader: React.FC<RoomHeaderProps> = ({ room, username, onLeaveRoom }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-gray-800 rounded-lg mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Room: {formatRoomCode(room.code)}</h1>
          <span className={`px-2 py-1 text-xs rounded-full text-white ${statusColors[room.status as RoomStatus]}`}>
            {statusLabels[room.status as RoomStatus]}
          </span>
        </div>
        {room.theme && (
          <p className="text-gray-300 mt-1">Theme: <span className="font-medium">{room.theme}</span></p>
        )}
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="text-right">
          <p className="font-medium">{username}</p>
          <p className="text-sm text-gray-400">Players: {room.players.length}/{room.maxPlayers}</p>
        </div>
        <button
          onClick={onLeaveRoom}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Leave Room
        </button>
      </div>
    </header>
  );
};

export default RoomHeader; 