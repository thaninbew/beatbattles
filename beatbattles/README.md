# BeatBattles

BeatBattles is a multiplayer music game where players join a room and create 8-bar song snippets for a specific theme. After composing, snippets are looped and played back for voting.

## Project Overview

BeatBattles is built with:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Tone.js for audio synthesis
- Socket.IO for real-time multiplayer
- Supabase for data persistence

## Features

- **Digital Audio Workstation (DAW)**: Create music with a piano roll and drum grid
- **Real-time Collaboration**: Join rooms with friends to battle
- **Voting System**: Vote on the best compositions
- **Responsive Design**: Works on desktop and tablet devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/beatbattles.git
cd beatbattles
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
beatbattles/
├── app/                    # Next.js app router
│   ├── demo/               # DAW demo page
│   ├── room/               # Game room pages
│   ├── lobby/              # Room lobby
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── audio/              # Audio-related components
│   ├── game/               # Game-specific components
│   │   └── daw/            # Digital Audio Workstation components
│   ├── layout/             # Layout components
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility functions and shared code
│   ├── audio/              # Audio utilities
│   ├── socket/             # Socket.IO client
│   └── types.ts            # TypeScript types
├── public/                 # Static assets
└── server/                 # Server-side code
    └── socket/             # Socket.IO server
```

## DAW Features

The Digital Audio Workstation (DAW) includes:

- Piano Roll for melodic instruments
- Drum Grid for percussion
- Transport controls (play/stop, BPM)
- Track management (add, select, mute)
- Effects panel (coming soon)
- Save/load compositions

## Development Roadmap

- [x] Basic DAW implementation
- [x] Audio synthesis with Tone.js
- [x] Piano Roll and Drum Grid
- [ ] Complete effects panel
- [ ] Room creation and management
- [ ] Voting system
- [ ] User profiles and authentication
- [ ] Composition history and sharing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Tone.js](https://tonejs.github.io/) for audio synthesis
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Socket.IO](https://socket.io/) for real-time communication
