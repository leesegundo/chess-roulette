import { io, Socket } from 'socket.io-client';
import { MatchData, ChatMessage } from '../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket?.id);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
      });

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    const events = [
      'queueJoined',
      'queueLeft',
      'matchFound',
      'gameStart',
      'opponentMove',
      'gameOver',
      'error',
      'chatMessage',
      'webrtc-offer',
      'webrtc-answer',
      'webrtc-ice-candidate',
    ];

    events.forEach((event) => {
      this.socket!.on(event, (data) => {
        this.emit(event, data);
      });
    });
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event) || new Set();
    listeners.forEach((listener) => listener(data));
  }

  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  joinQueue() {
    this.socket?.emit('joinQueue');
  }

  leaveQueue() {
    this.socket?.emit('leaveQueue');
  }

  makeMove(gameId: string, move: string, fen: string) {
    this.socket?.emit('makeMove', { gameId, move, fen });
  }

  resign(gameId: string) {
    this.socket?.emit('resign', { gameId });
  }

  sendChatMessage(gameId: string, message: string) {
    this.socket?.emit('chatMessage', { gameId, message });
  }

  // WebRTC signaling
  sendWebRTCOffer(gameId: string, offer: RTCSessionDescriptionInit, from: string) {
    this.socket?.emit('webrtc-offer', { gameId, offer, from });
  }

  sendWebRTCAnswer(gameId: string, answer: RTCSessionDescriptionInit, from: string) {
    this.socket?.emit('webrtc-answer', { gameId, answer, from });
  }

  sendWebRTCIceCandidate(gameId: string, candidate: RTCIceCandidateInit, from: string) {
    this.socket?.emit('webrtc-ice-candidate', { gameId, candidate, from });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }

  getId(): string | undefined {
    return this.socket?.id;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
