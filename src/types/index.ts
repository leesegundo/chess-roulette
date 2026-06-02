export interface Player {
  id: string;
  socketId: string;
}

export interface Game {
  id: string;
  white: string;
  black: string;
  whiteSocketId: string;
  blackSocketId: string;
  moves: Move[];
  status: 'waiting' | 'playing' | 'completed';
  createdAt: number;
}

export interface Move {
  player: string;
  move: string;
  fen: string;
  timestamp: number;
}

export interface MatchData {
  gameId: string;
  color: 'white' | 'black';
  opponentId: string;
}

export interface GameState {
  isConnected: boolean;
  isQueued: boolean;
  isMatched: boolean;
  isPlaying: boolean;
  game: Game | null;
  playerColor: 'white' | 'black' | null;
  opponentId: string | null;
  fen: string;
  lastMove: { from: string; to: string } | null;
  isMyTurn: boolean;
  gameOver: boolean;
  winner: 'white' | 'black' | 'draw' | null;
  gameOverReason: string | null;
}

export interface ChatMessage {
  from: string;
  message: string;
  timestamp: number;
  isMe?: boolean;
}
