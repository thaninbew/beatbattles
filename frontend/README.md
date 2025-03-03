# BeatBattles Frontend

This is the frontend application for BeatBattles, built with Next.js, TypeScript, and Tailwind CSS.

## Directory Structure

```
frontend/
├── app/                 # Next.js app router pages
│   ├── lobby/           # Lobby page for browsing rooms
│   └── room/            # Room page for game sessions
├── components/          # Reusable UI components
│   ├── ui/              # Basic UI components (buttons, inputs, etc.)
│   ├── game/            # Game-related components (DAW, tracks, etc.)
│   ├── room/            # Room-related components (player list, etc.)
│   └── layout/          # Layout components (containers, headers, etc.)
├── lib/                 # Utility libraries and modules
│   ├── audio/           # Tone.js integration for audio playback
│   ├── socket/          # Socket.IO client for real-time communication
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
└── public/              # Static assets
```

## Key Components

### UI Components

- **Button**: Reusable button component with various styles and states
- **PageContainer**: Layout container for consistent page structure

### Room Components

- **RoomHeader**: Header component for room pages
- **PlayerList**: Component for displaying the list of players in a room
- **WaitingRoom**: Component for the waiting room state

### Pages

- **Home**: Landing page with options to create or join a room
- **Lobby**: Page for browsing available rooms
- **Room**: Page for the game room with different states (waiting, composing, voting, results)

## Development

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```
npm run build
```

### Running Production Build

```
npm start
```

## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Tone.js**: Web Audio framework for creating interactive music
- **Socket.IO**: Library for real-time web applications

## Current Status

The frontend is currently in Stage 1 of development, with the following features implemented:

- Basic UI components
- Home page with room creation and joining
- Lobby page for browsing rooms
- Room page with waiting room state
- Mock Socket.IO client for development

Next steps include implementing the actual Socket.IO integration, the DAW interface, and the voting system.
