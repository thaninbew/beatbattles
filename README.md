# BeatBattles

BeatBattles is a multiplayer music game where up to 10 players join a room—either via a private code or through quick-play—to compete in creating an 8-bar song snippet. Each round challenges players to compose a song for a specific theme (for example, “song for when you're in the elevator” or “song to use when getting married”). After the composition phase, all snippets are played in a loop for the players, who then vote on their favorites. The game culminates in a podium display showing the final rankings.

## Game Concept

- **Multiplayer Competition:** Up to 10 players can join a game room and compete in rounds.
- **Musical Creativity:** In each round, players are tasked with creating a short musical piece that fits a given theme.
- **DAW Interface:** Players use a digital audio workstation (DAW)-style interface, simplified for beginners yet offering a high skill ceiling. In this intial stage, the game supports: Drums, Piano Chords, Melody (single note synth), and Bass.
- **Voting & Results:** After each round, song snippets are played back for a timed voting period. The game then displays the results and overall rankings.

## Tech Stack

- **Frontend:** Next.js with Tailwind CSS and TypeScript  
- **Backend:** Express.js with Socket.IO for real-time communication  
- **Audio Engine:** Tone.js for audio playback and DAW functionality  
- **Database:** Supabase

## Built By

Thanin Kongkiatsophon (Bew) 

## License

This project is proprietary. For full license details, please see the LICENSE file.
