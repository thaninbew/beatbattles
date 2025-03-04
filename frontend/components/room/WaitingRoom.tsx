import React from 'react';
import { Room, User } from '@/lib/types';
import PlayerList from './PlayerList';

interface WaitingRoomProps {
  room: Room;
  currentUser: User;
  onStartGame: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ room, currentUser, onStartGame }) => {
  const isHost = currentUser.id === room.hostId;
  const canStartGame = room.players.length >= 2; // Require at least 2 players to start

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Waiting for Players</h2>
        <p className="mb-6">
          Share this code with friends: 
          <span className="font-mono text-xl bg-gray-700 px-3 py-1 rounded ml-2">
            {(room.code)}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlayerList 
            players={room.players} 
            hostId={room.hostId} 
            currentUserId={currentUser.id} 
          />
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4">Game Settings</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Max Players</p>
              <p className="font-medium">{room.maxPlayers}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Room Status</p>
              <p className="font-medium capitalize">{room.status}</p>
            </div>
            
            {isHost && (
              <div className="pt-4">
                <button
                  onClick={onStartGame}
                  disabled={!canStartGame}
                  className={`w-full px-4 py-2 rounded-md text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500
                    ${canStartGame 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                      : 'bg-gray-600 cursor-not-allowed opacity-70'
                    }`}
                >
                  Start Game
                </button>
                
                {!canStartGame && (
                  <p className="text-xs text-yellow-400 mt-2 text-center">
                    Need at least 2 players to start
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom; 