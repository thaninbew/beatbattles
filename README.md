# BeatBattles

BeatBattles is a multiplayer music game where players join a room and compete in musical rounds. Each round challenges players to create an 8-bar song snippet for a given theme. After the composition phase, players listen to all submissions in a looped playback and vote on their favorite snippet, culminating in a podium display based on placements.

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS, TypeScript
- **Backend:** Node.js, Express.js, Socket.IO
- **Audio Engine:** Tone.js
- **Real-time Communication:** Socket.IO

## Project Structure

The project is organized into a modular structure:

```
/beatbattles
├── frontend/                # Next.js frontend application
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Basic UI components
│   │   ├── game/            # Game-related components
│   │   ├── room/            # Room-related components
│   │   └── layout/          # Layout components
│   ├── lib/                 # Utility libraries and modules
│   │   ├── audio/           # Tone.js integration
│   │   ├── socket/          # Socket.IO client
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper functions
│   └── public/              # Static assets
└── server/                  # Express.js backend (to be implemented)
    ├── api/                 # API endpoints
    └── socket/              # Socket.IO server
```

## Development Roadmap

The project is being developed in stages:

1. **Stage 1 – Foundation & Environment Setup** (Current)
   - Set up Next.js with Tailwind and TypeScript
   - Basic project structure with clean, documented folders and modules
   - Initial UI components and page layouts

2. **Stage 2 – Room Management & Multiplayer Integration**
   - Build room creation and joining logic
   - Implement real-time communication with Socket.IO for room state updates

3. **Stage 3 – DAW Prototype (Core Audio Engine)**
   - Implement a basic Tone.js-driven metronome and looping system
   - Create the initial DAW layout with tracks and a grid system for note placement

4. **Stage 4 – Note Editing & Live Updates**
   - Implement interactive note editing: adding, moving, and deleting notes
   - Ensure real-time registration of changes during playback

5. **Stage 5 – Voting System & Results Display**
   - Develop the voting interface and logic
   - Implement playback of each snippet for voting and compile results

6. **Stage 6 – UI/UX Refinements & Modular Extensions**
   - Refactor components for reusability
   - Add options for custom themes and additional instrument modules

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/beatbattles.git
   cd beatbattles
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Room Management:** Create or join rooms with a unique code
- **Real-time Updates:** See players joining and leaving in real-time
- **Composition Interface:** Create music using a simple grid-based interface (coming soon)
- **Voting System:** Listen to and vote on other players' compositions (coming soon)
- **Results Display:** See the final rankings and scores (coming soon)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tone.js](https://tonejs.github.io/)
- [Socket.IO](https://socket.io/) 