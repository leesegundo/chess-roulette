# Chess Roulette 🎮♟️

A real-time online chess game with random matchmaking and live webcam video streaming. Think video-chat roulette, but across a chessboard.

## Features

✅ **Hosted Server** - Runs online on a server both players reach over the internet  
✅ **Live 1v1 Chess** - Two players play a complete, rule-valid game in real time  
✅ **Random Matchmaking** - Players are matched randomly from the queue  
✅ **Webcam Video** - Live video streaming between opponents during the match  
✅ **Real-time Chat** - Text chat during the game  
✅ **Move Validation** - All moves are validated using chess.js  

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Chess Logic**: chess.js, react-chessboard
- **Real-time Communication**: Socket.io
- **Video Streaming**: WebRTC
- **Backend**: Node.js, Express, Socket.io

## Project Structure

```
chess-roulette/
├── src/                    # Frontend React code
│   ├── components/         # React components
│   │   ├── ChessBoardPanel.tsx
│   │   ├── VideoPanel.tsx
│   │   ├── ChatPanel.tsx
│   │   └── Controls.tsx
│   ├── context/            # React Context
│   │   └── GameContext.tsx
│   ├── services/           # Socket.io & WebRTC services
│   │   ├── socket.ts
│   │   └── webrtc.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   └── App.css
├── server/                 # Backend Node.js server
│   └── index.js
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js v16+ and npm
- Modern web browser with WebRTC support
- Webcam and microphone

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment (optional):**
   ```bash
   # Copy .env.example to .env in the root directory
   cp .env.example .env
   ```

### Running the Application

You'll need two terminal windows:

**Terminal 1 - Start the backend server:**
```bash
cd server
npm start
```
The server will start on `http://localhost:3001`

**Terminal 2 - Start the frontend dev server:**
```bash
npm run dev
```
The frontend will start on `http://localhost:5173`

### How to Play

1. Open `http://localhost:5173` in your browser
2. Click **"Find Match"** to join the matchmaking queue
3. Wait for a random opponent to be found
4. Once matched, grant camera/microphone permissions
5. Play chess! White moves first
6. Use the chat to communicate with your opponent
7. First to checkmate wins, or you can resign at any time

### Game Controls

- **Find Match**: Join the random matchmaking queue
- **Camera On/Off**: Toggle your video stream
- **Mic On/Muted**: Toggle your audio
- **Switch Camera**: Switch between front/back cameras
- **Resign**: Forfeit the game
- **Disconnect**: Leave the game and disconnect from server

## How It Works

### Matchmaking
- Players join a queue via Socket.io
- When 2 players are in the queue, they're randomly paired
- One player is assigned white, the other black
- Game starts automatically after a brief delay

### Chess Gameplay
- Moves are validated server-side using chess.js
- Move data is synced in real-time via Socket.io
- Board orientation adjusts based on your color
- Game detects checkmate, stalemate, and draws

### Video Streaming (WebRTC)
- Peer-to-peer video connection between players
- Signaling happens through the Socket.io server
- Uses Google's STUN servers for NAT traversal
- Video and audio can be toggled during the game

### Chat
- Real-time text chat during the game
- Messages are relayed through the server
- Chat history is maintained per game session

## Deployment

### Backend Deployment

The server can be deployed to any Node.js hosting platform:

- **Heroku**: Add a Procfile with `web: node server/index.js`
- **Railway**: Connect your repo and set the start command
- **DigitalOcean**: Deploy as a Node.js app
- **AWS**: Use EC2 or Elastic Beanstalk

Make sure to set the `CLIENT_URL` environment variable to your frontend URL.

### Frontend Deployment

Build the frontend for production:

```bash
npm run build
```

Deploy the `dist` folder to:

- **Vercel**: Auto-deploys from Git
- **Netlify**: Drag and drop or connect Git
- **GitHub Pages**: Use gh-pages package
- **Cloudflare Pages**: Connect Git repository

Update `VITE_SERVER_URL` in `.env` to point to your deployed backend.

## Troubleshooting

### Camera/Microphone Issues
- Ensure you've granted browser permissions
- Check that no other app is using your camera
- Try refreshing the page
- Some browsers require HTTPS for WebRTC (except localhost)

### Connection Issues
- Make sure both frontend and backend servers are running
- Check that the server URL in `.env` is correct
- Verify firewall settings allow connections on port 3001

### Move Validation Errors
- Ensure you're making legal chess moves
- Wait for your turn (you can only move when it's your turn)
- The game enforces standard chess rules

## Future Enhancements

- [ ] Player ratings and matchmaking by skill level
- [ ] Game history and replay feature
- [ ] Timed games with chess clocks
- [ ] Spectator mode
- [ ] Tournament mode
- [ ] Custom board themes
- [ ] Move annotations and analysis
- [ ] Friend invites and private games

## License

MIT License - feel free to use this for learning or building your own chess platform!

## Credits

Built as part of a coding challenge demonstrating real-time web application development with React, TypeScript, Socket.io, and WebRTC.
