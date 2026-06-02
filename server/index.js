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

// Join a player to a game room
function joinGameRoom(socketId, gameId) {
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.join(gameId);
    console.log(`Player ${socketId} joined game room ${gameId}`);
  }
}

// Leave a game room
function leaveGameRoom(socketId, gameId) {
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.leave(gameId);
    console.log(`Player ${socketId} left game room ${gameId}`);
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
  
  // Join both players to the game room
  joinGameRoom(player1.socketId, gameId);
  joinGameRoom(player2.socketId, gameId);
  
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
      console.error(`Game ${gameId} not found for move from ${playerId}`);
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    // Verify it's the player's turn
    const isWhite = game.white === playerId;
    const isBlack = game.black === playerId;
    
    if (!isWhite && !isBlack) {
      console.error(`Player ${playerId} is not in game ${gameId}`);
      socket.emit('error', { message: 'Not a player in this game' });
      return;
    }
    
    // Determine whose turn it should be (white moves first)
    const moveNumber = game.moves.length;
    const shouldBeWhiteTurn = moveNumber % 2 === 0;
    
    if ((isWhite && !shouldBeWhiteTurn) || (isBlack && shouldBeWhiteTurn)) {
      console.error(`Invalid turn: ${isWhite ? 'White' : 'Black'} tried to move on move ${moveNumber}`);
      socket.emit('error', { message: 'Not your turn' });
      return;
    }
    
    // Record move
    game.moves.push({
      player: playerId,
      move,
      fen,
      timestamp: Date.now(),
    });
    
    console.log(`Move recorded in game ${gameId}: ${move} by ${playerId} (${isWhite ? 'White' : 'Black'})`);
    
    // Broadcast to opponent using game room (more reliable than socket ID)
    socket.to(gameId).emit('opponentMove', {
      move,
      fen,
      isWhite: isWhite,
    });
    
    // Also send confirmation to the player who made the move
    socket.emit('moveConfirmed', {
      move,
      fen,
      isWhite: isWhite,
    });
  });
  
  // Game resignation
  socket.on('resign', (data) => {
    const { gameId } = data;
    const game = activeGames.get(gameId);
    
    if (!game) return;
    
    game.status = 'completed';
    const winner = game.white === playerId ? 'black' : 'white';
    
    // Broadcast to all players in the game room
    io.to(gameId).emit('gameOver', {
      reason: 'resignation',
      winner: winner === 'white' ? 'white' : 'black',
    });
    
    console.log(`Game ${gameId} ended by resignation. Winner: ${winner}`);
    
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
    
    // Broadcast to opponent in the game room
    socket.to(gameId).emit('webrtc-offer', {
      offer,
      from: playerId,
    });
  });
  
  // WebRTC signaling - answer
  socket.on('webrtc-answer', (data) => {
    const { gameId, answer } = data;
    const game = activeGames.get(gameId);
    
    if (!game) return;
    
    // Broadcast to opponent in the game room
    socket.to(gameId).emit('webrtc-answer', {
      answer,
      from: playerId,
    });
  });
  
  // WebRTC signaling - ICE candidate
  socket.on('webrtc-ice-candidate', (data) => {
    const { gameId, candidate } = data;
    const game = activeGames.get(gameId);
    
    if (!game) return;
    
    // Broadcast to opponent in the game room
    socket.to(gameId).emit('webrtc-ice-candidate', {
      candidate,
      from: playerId,
    });
  });
  
  // Chat message
  socket.on('chatMessage', (data) => {
    const { gameId, message } = data;
    const game = activeGames.get(gameId);
    
    if (!game) return;
    
    // Broadcast to all players in the game room (including sender for confirmation)
    io.to(gameId).emit('chatMessage', {
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
        
        console.log(`Game ${gameId} ended due to disconnect. Winner: ${winner}`);
        
        // Notify opponent in the game room
        socket.to(gameId).emit('gameOver', {
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
      
      // Leave game room
      leaveGameRoom(playerId, gameId);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Chess Roulette server running on port ${PORT}`);
  console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
