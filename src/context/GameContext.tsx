import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Chess, Move as ChessMove } from 'chess.js';
import { socketService } from '../services/socket';
import { webRTCService } from '../services/webrtc';
import { GameState, ChatMessage } from '../types';

interface GameContextType {
  gameState: GameState;
  chess: Chess;
  connect: () => Promise<void>;
  disconnect: () => void;
  joinQueue: () => void;
  leaveQueue: () => void;
  makeMove: (move: ChessMove) => void;
  resign: () => void;
  sendChatMessage: (message: string) => void;
  chatMessages: ChatMessage[];
  localVideoStream: MediaStream | null;
  remoteVideoStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
  switchCamera: () => void;
  error: string | null;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_GAME_STATE: GameState = {
  isConnected: false,
  isQueued: false,
  isMatched: false,
  isPlaying: false,
  game: null,
  playerColor: null,
  opponentId: null,
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  lastMove: null,
  isMyTurn: false,
  gameOver: false,
  winner: null,
  gameOverReason: null,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [chess] = useState(new Chess());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [remoteVideoStream, setRemoteVideoStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const connect = useCallback(async () => {
    try {
      await socketService.connect();
      setGameState((prev) => ({ ...prev, isConnected: true }));
    } catch (err) {
      setError('Failed to connect to server');
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    webRTCService.close();
    setGameState(INITIAL_GAME_STATE);
    setChatMessages([]);
    setLocalVideoStream(null);
    setRemoteVideoStream(null);
  }, []);

  const joinQueue = useCallback(() => {
    socketService.joinQueue();
    setGameState((prev) => ({ ...prev, isQueued: true }));
  }, []);

  const leaveQueue = useCallback(() => {
    socketService.leaveQueue();
    setGameState((prev) => ({ ...prev, isQueued: false }));
  }, []);

  const makeMove = useCallback((move: ChessMove) => {
    if (!gameState.game || !gameState.isPlaying) return;

    try {
      const chessMove = chess.move(move);
      if (chessMove) {
        const fen = chess.fen();
        socketService.makeMove(gameState.game.id, chessMove.san, fen);
        
        setGameState((prev) => ({
          ...prev,
          fen,
          lastMove: { from: move.from, to: move.to },
          isMyTurn: false,
        }));

        // Check for game over
        if (chess.isGameOver()) {
          let winner: 'white' | 'black' | 'draw' | null = null;
          let reason = '';

          if (chess.isCheckmate()) {
            winner = chess.turn() === 'w' ? 'black' : 'white';
            reason = 'checkmate';
          } else if (chess.isDraw()) {
            reason = 'draw';
          } else if (chess.isStalemate()) {
            reason = 'stalemate';
          }

          setGameState((prev) => ({
            ...prev,
            gameOver: true,
            winner,
            gameOverReason: reason,
          }));
        }
      }
    } catch (err) {
      console.error('Invalid move:', err);
    }
  }, [gameState.game, gameState.isPlaying, chess]);

  const resign = useCallback(() => {
    if (!gameState.game) return;
    socketService.resign(gameState.game.id);
    setGameState((prev) => ({
      ...prev,
      gameOver: true,
      winner: prev.playerColor === 'white' ? 'black' : 'white',
      gameOverReason: 'resignation',
    }));
  }, [gameState.game, gameState.playerColor]);

  const sendChatMessage = useCallback((message: string) => {
    if (!gameState.game) return;
    socketService.sendChatMessage(gameState.game.id, message);
    setChatMessages((prev) => [
      ...prev,
      { from: socketService.getId() || 'me', message, timestamp: Date.now(), isMe: true },
    ]);
  }, [gameState.game]);

  const toggleVideo = useCallback(() => {
    webRTCService.toggleVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  }, [isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    webRTCService.toggleAudio(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
  }, [isAudioEnabled]);

  const switchCamera = useCallback(async () => {
    await webRTCService.switchCamera();
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    const setupListeners = () => {
      unsubscribers.push(
        socketService.on('queueJoined', (_data: any) => {
          console.log('Queue joined');
        })
      );

      unsubscribers.push(
        socketService.on('queueLeft', () => {
          setGameState((prev) => ({ ...prev, isQueued: false }));
        })
      );

      unsubscribers.push(
        socketService.on('matchFound', async (data: { gameId: string; color: 'white' | 'black'; opponentId: string }) => {
          console.log('Match found:', data);
          
          setGameState((prev) => ({
            ...prev,
            isMatched: true,
            isQueued: false,
            game: {
              id: data.gameId,
              white: data.color === 'white' ? socketService.getId()! : data.opponentId,
              black: data.color === 'black' ? socketService.getId()! : data.opponentId,
              whiteSocketId: '',
              blackSocketId: '',
              moves: [],
              status: 'waiting',
              createdAt: Date.now(),
            },
            playerColor: data.color,
            opponentId: data.opponentId,
          }));

          // Initialize WebRTC
          try {
            const localStream = await webRTCService.initialize(
              (remoteStream) => {
                setRemoteVideoStream(remoteStream);
              },
              (candidate) => {
                if (gameState.game) {
                  socketService.sendWebRTCIceCandidate(gameState.game.id, candidate, socketService.getId()!);
                }
              }
            );
            setLocalVideoStream(localStream);

            // Create offer if white (first player)
            if (data.color === 'white') {
              const offer = await webRTCService.createOffer();
              socketService.sendWebRTCOffer(data.gameId, offer, socketService.getId()!);
            }
          } catch (err) {
            console.error('WebRTC initialization failed:', err);
            setError('Failed to initialize video chat. You can still play without video.');
          }
        })
      );

      unsubscribers.push(
        socketService.on('gameStart', (data: { color: 'white' | 'black' }) => {
          console.log('Game started:', data);
          setGameState((prev) => ({
            ...prev,
            isPlaying: true,
            playerColor: data.color,
            isMyTurn: data.color === 'white',
            gameOver: false,
            winner: null,
            gameOverReason: null,
          }));
          chess.reset();
        })
      );

      unsubscribers.push(
        socketService.on('opponentMove', (data: { move: string; fen: string; isWhite: boolean }) => {
          console.log('Opponent move:', data);
          
          try {
            chess.move({ from: data.move.substring(0, 2), to: data.move.substring(2, 4), promotion: 'q' });
            
            setGameState((prev) => ({
              ...prev,
              fen: data.fen,
              isMyTurn: true,
            }));

            // Check for game over
            if (chess.isGameOver()) {
              let winner: 'white' | 'black' | 'draw' | null = null;
              let reason = '';

              if (chess.isCheckmate()) {
                winner = chess.turn() === 'w' ? 'black' : 'white';
                reason = 'checkmate';
              } else if (chess.isDraw()) {
                reason = 'draw';
              }

              setGameState((prev) => ({
                ...prev,
                gameOver: true,
                winner,
                gameOverReason: reason,
              }));
            }
          } catch (err) {
            console.error('Error processing opponent move:', err);
          }
        })
      );

      unsubscribers.push(
        socketService.on('gameOver', (data: { reason: string; winner: 'white' | 'black' }) => {
          console.log('Game over:', data);
          setGameState((prev) => ({
            ...prev,
            isPlaying: false,
            gameOver: true,
            winner: data.winner,
            gameOverReason: data.reason,
          }));
        })
      );

      unsubscribers.push(
        socketService.on('error', (data: { message: string }) => {
          console.error('Server error:', data);
          setError(data.message);
        })
      );

      unsubscribers.push(
        socketService.on('chatMessage', (data: ChatMessage) => {
          setChatMessages((prev) => [...prev, { ...data, isMe: data.from === socketService.getId() }]);
        })
      );

      unsubscribers.push(
        socketService.on('webrtc-offer', async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
          console.log('Received WebRTC offer');
          try {
            const answer = await webRTCService.createAnswer(data.offer);
            if (gameState.game) {
              socketService.sendWebRTCAnswer(gameState.game.id, answer, socketService.getId()!);
            }
          } catch (err) {
            console.error('Error creating answer:', err);
          }
        })
      );

      unsubscribers.push(
        socketService.on('webrtc-answer', async (data: { answer: RTCSessionDescriptionInit }) => {
          console.log('Received WebRTC answer');
          try {
            await webRTCService.setAnswer(data.answer);
          } catch (err) {
            console.error('Error setting answer:', err);
          }
        })
      );

      unsubscribers.push(
        socketService.on('webrtc-ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
          try {
            await webRTCService.addIceCandidate(data.candidate);
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        })
      );
    };

    if (gameState.isConnected) {
      setupListeners();
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [gameState.isConnected, gameState.game, chess]);

  const value = {
    gameState,
    chess,
    connect,
    disconnect,
    joinQueue,
    leaveQueue,
    makeMove,
    resign,
    sendChatMessage,
    chatMessages,
    localVideoStream,
    remoteVideoStream,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
    switchCamera,
    error,
    clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
