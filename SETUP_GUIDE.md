# Chess Roulette - Setup & Running Guide

## ✅ Application Successfully Built!

Your Chess Roulette web application is now complete and running!

## 🎯 What Was Built

### Features Implemented:
1. ✅ **Real-time Chess Game** - Full chess gameplay with move validation
2. ✅ **Random Matchmaking** - Queue system to find random opponents
3. ✅ **Webcam Video Streaming** - Peer-to-peer video chat using WebRTC
4. ✅ **Live Chat** - Text messaging during games
5. ✅ **Game Controls** - Resign, toggle camera/mic, switch camera
6. ✅ **Responsive Design** - Works on desktop and mobile

### Tech Stack:
- **Frontend**: React 18 + TypeScript + Vite
- **Chess Engine**: chess.js + react-chessboard
- **Backend**: Node.js + Express + Socket.io
- **Video**: WebRTC with STUN servers
- **State Management**: React Context API

## 🚀 Currently Running

### Backend Server
- **Status**: ✅ Running
- **Port**: 3001
- **URL**: http://localhost:3001

### Frontend Dev Server
- **Status**: ✅ Running  
- **Port**: 5173
- **URL**: http://localhost:5173

## 📁 Project Structure

```
chess-roulette/
├── src/
│   ├── components/
│   │   ├── ChessBoardPanel.tsx    # Chess board UI
│   │   ├── VideoPanel.tsx         # Video stream display
│   │   ├── ChatPanel.tsx          # Chat interface
│   │   └── Controls.tsx           # Game controls
│   ├── context/
│   │   └── GameContext.tsx        # Global state management
│   ├── services/
│   │   ├── socket.ts              # Socket.io client
│   │   └── webrtc.ts              # WebRTC video service
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── App.tsx                    # Main app component
│   └── App.css                    # Styles
├── server/
│   ├── index.js                   # Socket.io server
│   └── package.json               # Server dependencies
├── .env                           # Environment config
├── package.json                   # Frontend dependencies
└── README.md                      # Documentation
```

## 🎮 How to Test the Application

### Testing Locally (Same Machine)

1. **Open Multiple Browser Tabs**
   - Open `http://localhost:5173` in Tab 1
   - Open `http://localhost:5173` in Tab 2 (incognito/private mode)

2. **Start Matchmaking**
   - In Tab 1: Click "Find Match"
   - In Tab 2: Click "Find Match"

3. **Game Starts**
   - Both tabs will be matched automatically
   - Tab 1 will be White, Tab 2 will be Black (or vice versa)
   - Video streams will connect between tabs
   - White player moves first

4. **Play Chess**
   - Drag and drop pieces to make moves
   - Use chat to communicate
   - Toggle camera/mic as needed
   - First to checkmate wins!

### Testing with Remote Players

To test with actual remote players over the internet:

1. **Deploy the Backend**
   - Deploy to Heroku, Railway, DigitalOcean, or AWS
   - Make sure port 3001 is accessible
   - Set `CLIENT_URL` environment variable

2. **Deploy the Frontend**
   - Run `npm run build`
   - Deploy `dist` folder to Vercel, Netlify, or similar
   - Update `VITE_SERVER_URL` in `.env` to point to deployed backend

3. **Share the URL**
   - Share your deployed frontend URL with friends
   - They can visit and start playing immediately

## 🎥 Video/Chat Features

### Camera Controls:
- **Camera On/Off**: Toggle video stream
- **Mic On/Muted**: Toggle audio
- **Switch Camera**: Switch between front/back cameras (if available)

### Chat:
- Real-time messaging during the game
- Message history maintained per game
- Disabled until game starts

## 🔧 Troubleshooting

### Camera Not Working?
1. Check browser permissions (camera/microphone)
2. Ensure no other app is using the camera
3. Try refreshing the page
4. Some browsers require HTTPS for WebRTC (localhost is exempt)

### Can't Connect to Server?
1. Verify backend is running: `http://localhost:3001`
2. Check `.env` file has correct `VITE_SERVER_URL`
3. Restart both servers if needed

### Moves Not Valid?
- The game enforces standard chess rules
- You can only move on your turn
- Invalid moves will be rejected automatically

## 🛠️ Development Commands

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend
```bash
cd server

# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload (dev)
npm run dev
```

## 📊 Game Flow

```
1. Player opens app → Connects to Socket.io server
2. Clicks "Find Match" → Added to matchmaking queue
3. Queue has 2+ players → Random pairing occurs
4. Match found → WebRTC connection initiated
5. Game starts → White player can make first move
6. Moves synced → Both boards update in real-time
7. Game ends → Checkmate, resignation, or draw
8. Players can play again or disconnect
```

## 🎨 UI Features

- **Dark theme** with accent colors
- **Responsive design** for all screen sizes
- **Animated transitions** for smooth UX
- **Status indicators** for game state
- **Video panels** with status overlays
- **Chat panel** with message history
- **Control panel** with game actions

## 🔐 Security Notes

- All moves validated server-side
- WebRTC uses secure peer-to-peer connections
- No sensitive data stored
- Session-based matchmaking (no accounts required)

## 📈 Next Steps

To enhance the application, consider adding:

1. **Player Accounts** - Save game history and ratings
2. **Timed Games** - Chess clocks with blitz/rapid/classical
3. **Spectator Mode** - Watch ongoing games
4. **Tournaments** - Bracket-style competitions
5. **Custom Themes** - Different board/piece styles
6. **Move Analysis** - Engine evaluation after games
7. **Friend System** - Invite specific players
8. **Chat Emojis** - Express yourself during games

## 🎉 Success!

Your Chess Roulette application is fully functional and ready to use. Open http://localhost:5173 in your browser and start playing!

---

**Built with ❤️ using React, TypeScript, Socket.io & WebRTC**
