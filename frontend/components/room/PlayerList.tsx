import React from 'react';
import { User } from '@/lib/types';

interface PlayerListProps {
  players: User[];
  hostId: string;
  currentUserId?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, hostId, currentUserId }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4">Players ({players.length})</h3>
      
      <div className="space-y-2">
        {players.map((player) => (
          <div 
            key={player.id} 
            className={`flex items-center p-3 rounded-lg ${player.id === currentUserId ? 'bg-gray-600' : 'bg-gray-800'}`}
          >
            {player.avatarUrl ? (
              <img 
                src={player.avatarUrl} 
                alt={player.username} 
                className="w-8 h-8 rounded-full mr-3"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                <span className="text-white font-medium">
                  {player.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <p className="font-medium">
                {player.username}
                {player.id === currentUserId && <span className="text-purple-400 ml-2">(You)</span>}
              </p>
            </div>
            
            {player.id === hostId && (
              <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                Host
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList; 