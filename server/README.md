# BeatBattles Server

Backend server for the BeatBattles multiplayer music game. This server handles room management, real-time communication, and game state management using Socket.IO.

## Directory Structure

```
server/
├── src/
│   ├── controllers/     # Socket.IO event handlers
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Server entry point
├── dist/                # Compiled JavaScript files
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Key Components

### Socket Controller

The Socket.IO controller (`src/controllers/socketController.ts`) handles all real-time communication between clients and the server. It manages events such as:

- Creating and joining rooms
- Starting games
- Updating compositions
- Submitting votes
- Handling errors

### Room Service

The Room Service (`src/services/roomService.ts`) manages all room-related functionality:

- Creating and finding rooms
- Managing players joining and leaving
- Starting games
- Handling game state

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
npm install
```

### Running the Server

Development mode with hot-reloading:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
PORT=4000                      # Server port
CLIENT_URL=http://localhost:3000  # Frontend URL for CORS
NODE_ENV=development           # Environment (development, production)
```

## API Endpoints

- `GET /health` - Health check endpoint

## Socket.IO Events

### Client to Server

- `create_room` - Create a new room
- `join_room` - Join an existing room
- `leave_room` - Leave a room
- `start_game` - Start a game (host only)
- `composition_updated` - Update a player's composition
- `submit_vote` - Submit a vote for a composition

### Server to Client

- `room_created` - Room has been created
- `room_updated` - Room state has changed
- `game_state_updated` - Game state has changed
- `error` - Error occurred

## Current Status

The server currently implements the core functionality for room management and game flow. Future enhancements will include:

- Persistent storage with a database
- Authentication and user accounts
- Advanced game mechanics
- Performance optimizations 