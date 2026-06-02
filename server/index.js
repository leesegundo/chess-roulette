import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Game state management
const waitingPlayers = new Map(); // playerId -> { id, socketId, joinedAt }
const activeGames = new Map(); // gameId -> { id, white, black, moves, status, createdAt }
const playerToGame = new Map(); // playerId -> gameId

// Matchmaking queue
function addToQueue(playerId, socketId) {
  waitingPlayers.set(playerId, {
    id: playerId,
    socketId,
    joinedAt: Date.now(),
  });
  
  console.log(`Player ${playerId} added to queue. Queue size: ${waitingPlayers.size}`);
  
  // Try to match if we have at least 2 players
  if (waitingPlayers.size >= 2) {
    matchPlayers();
  }
}

function removeFromQueue(playerId) {
  waitingPlayers.delete(playerId);
}

function matchPlayers() {
  if (waitingPlayers.size < 2) return;
  
  const players = Array.from(waitingPlayers.values());
  const player1 = players[0];
  const player2 = players[1];
  
  // Remove from queue
  removeFromQueue(player1.id);
  removeFromQueue(player2.id);
  
  // Create game
  const gameId = uuidv4();
  const game = {
    id: gameId,
    white: player1.id,
    black: player2.id,
    whiteSocketId: player1.socketId,
    blackSocketId: player2.socketId,
    moves: [],
    status: 'waiting', // waiting, playing, completed
    createdAt: Date.now(),
  };
  
  activeGames.set(gameId, game);
  playerToGame.set(player1.id, gameId);
  playerToGame.set(player2.id, gameId);
  
  console.log(`Matched: ${player1.id} (white) vs ${player2.id} (black) in game ${gameId}`);
  
  // Notify both players
  io.to(player1.socketId).emit('matchFound', {
    gameId,
    color: 'white',
    opponentId: player2.id,
  });
  
  io.to(player2.socketId).emit('matchFound', {
    gameId,
    color: 'black',
    opponentId: player1.id,
  });
  
  // Start the game after a short delay
  setTimeout(() => {
    game.status = 'playing';
    io.to(player1.socketId).emit('gameStart', {
      gameId,
      color: 'white',
      opponentId: player2.id,
    });
    
    io.to(player2.socketId).emit('gameStart', {
      gameId,
      color: 'black',
      opponentId: player1.id,
    });
  }, 2000);
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  const playerId = socket.id;
  
  // Player joins matchmaking queue
  socket.on('joinQueue', () => {
    console.log(`Player ${playerId} joining queue`);
    addToQueue(playerId, socket.id);
    socket.emit('queueJoined', { position: waitingPlayers.size });
  });
  
  // Player leaves queue
  socket.on('leaveQueue', () => {
    console.log(`Player ${playerId} leaving queue`);
    removeFromQueue(playerId);
    socket.emit('queueLeft');
  });
  
  // Chess move
  socket.on('makeMove', (data) => {
    const { gameId, move, fen } = data;
    const game = activeGames.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    // Verify it's the player's turn
    const isWhite = game.white === playerId;
    const isBlack = game.black === playerId;
    
    if (!isWhite && !isBlack) {
      socket.emit('error', { message: 'Not a player in this game' });
      return;
    }
    
    // Record move
    game.moves.push({
      player: playerId,
      move,
      fen,
      timestamp: Date.now(),
    });
    
    // Broadcast to opponent
    const opponentId = isWhite ? game.black : game.white;
    const opponentSocketId = isWhite ? game.blackSocketId : game.whiteSocketId;
    
    io.to(opponentSocketId).emit('opponentMove', {
      move,
      fen,
      isWhite: !isWhite,
    });
  });
  
  // Game resignation
  socket.on('resign', (data) => {
    const { gameId } = data;
    const game = activeGames.get(gameId);
    
    if (!game) return;
    
    game.status = 'completed';
    const winner = game.white === playerId ? 'black' : 'white';
    
    io.to(game.whiteSocketId).emit('gameOver', {
      reason: 'resignation',
      winner: winner === 'white' ? 'white' : 'black',
    });
    
    io.to(game.blackSocketId).emit('gameOver', {
      reason: 'resignation',
      winner: winner === 'white' ? 'white' : 'black',
    });
    
    // Clean up
    playerToGame.delete(game.white);
    playerToGame.delete(game.black);
    activeGames.delete(gameId);
  });
  
  // WebRTC signaling - offer
  socket.on('webrtc-offer', (data) => {
    const { gameId, offer } = data;
    const game = activeGames.get(gameId);
    
    if (!game) return;
    
    const targetSocketId = data.from === game.whiteSocketId ? game.blackSocketId : game.whiteSocketId;
    io.to(targetSocketId).emit('webrtc-offer', {
      offer,
      from: data.from,
    });
  });
  
  // WebRTC signaling - answer
  socket.on('webrtc-answer', (data) => {
    const { gameId, answer } = data;
    const game = activeGames.get(gameId);
    
    if (!game) return;
    
    const targetSocketId = data.from === game.whiteSocketId ? game.blackSocketId : game.whiteSocketId;
    io.to(targetSocketId).emit('webrtc-answer', {
      answer,
      from: data.from,
    });
  });
  
  // WebRTC signaling - ICE candidate
  socket.on('webrtc-ice-candidate', (data) => {
    const { gameId, candidate } = data;
    const game = activeGames.get(gameId);
    
    if (!game) return;
    
    const targetSocketId = data.from === game.whiteSocketId ? game.blackSocketId : game.whiteSocketId;
    io.to(targetSocketId).emit('webrtc-ice-candidate', {
      candidate,
      from: data.from,
    });
  });
  
  // Chat message
  socket.on('chatMessage', (data) => {
    const { gameId, message } = data;
    const game = activeGames.get(gameId);
    
    if (!game) return;
    
    io.to(game.whiteSocketId).emit('chatMessage', {
      from: playerId,
      message,
      timestamp: Date.now(),
    });
    
    io.to(game.blackSocketId).emit('chatMessage', {
      from: playerId,
      message,
      timestamp: Date.now(),
    });
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${playerId}`);
    
    // Remove from queue
    removeFromQueue(playerId);
    
    // Handle active game
    const gameId = playerToGame.get(playerId);
    if (gameId) {
      const game = activeGames.get(gameId);
      if (game && game.status === 'playing') {
        game.status = 'completed';
        const winner = game.white === playerId ? 'black' : 'white';
        
        const opponentSocketId = playerId === game.whiteSocketId ? game.blackSocketId : game.whiteSocketId;
        io.to(opponentSocketId).emit('gameOver', {
          reason: 'opponent_disconnected',
          winner,
        });
        
        // Also notify the disconnected player
        socket.emit('gameOver', {
          reason: 'disconnected',
          winner: winner === 'white' ? 'black' : 'white',
        });
        
        // Clean up
        playerToGame.delete(game.white);
        playerToGame.delete(game.black);
        activeGames.delete(gameId);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Chess Roulette server running on port ${PORT}`);
  console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
