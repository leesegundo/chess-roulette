import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn((event: string, callback: Function) => {
      if (event === 'connect') {
        setTimeout(() => callback(), 10);
      }
    }),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
    id: 'test-socket-id',
  })),
}));

import { socketService } from '../services/socket';

describe('SocketService Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    socketService.disconnect();
  });

  describe('Connection', () => {
    it('should connect to server successfully', async () => {
      await expect(socketService.connect()).resolves.toBeUndefined();
      expect(socketService.isConnected()).toBe(true);
    });

    it('should have a socket ID after connection', async () => {
      await socketService.connect();
      expect(socketService.getId()).toBe('test-socket-id');
    });

    it('should disconnect from server', async () => {
      await socketService.connect();
      socketService.disconnect();
      expect(socketService.isConnected()).toBe(false);
      expect(socketService.getId()).toBeUndefined();
    });
  });

  describe('Queue Management', () => {
    it('should emit joinQueue event', async () => {
      await socketService.connect();
      const mockSocket = (socketService as any).socket;
      
      socketService.joinQueue();
      
      expect(mockSocket.emit).toHaveBeenCalledWith('joinQueue');
    });

    it('should emit leaveQueue event', async () => {
      await socketService.connect();
      const mockSocket = (socketService as any).socket;
      
      socketService.leaveQueue();
      
      expect(mockSocket.emit).toHaveBeenCalledWith('leaveQueue');
    });
  });

  describe('Game Moves', () => {
    it('should emit makeMove event with correct data', async () => {
      await socketService.connect();
      const mockSocket = (socketService as any).socket;
      
      socketService.makeMove('game-123', 'e4', 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('makeMove', {
        gameId: 'game-123',
        move: 'e4',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      });
    });

    it('should emit resign event', async () => {
      await socketService.connect();
      const mockSocket = (socketService as any).socket;
      
      socketService.resign('game-123');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('resign', { gameId: 'game-123' });
    });
  });

  describe('Chat', () => {
    it('should emit chatMessage event', async () => {
      await socketService.connect();
      const mockSocket = (socketService as any).socket;
      
      socketService.sendChatMessage('game-123', 'Hello opponent!');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('chatMessage', {
        gameId: 'game-123',
        message: 'Hello opponent!',
      });
    });
  });

  describe('WebRTC Signaling', () => {
    it('should emit webrtc-offer event', async () => {
      await socketService.connect();
      const mockSocket = (socketService as any).socket;
      
      const offer = { type: 'offer', sdp: 'mock-sdp' };
      socketService.sendWebRTCOffer('game-123', offer, 'player-1');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('webrtc-offer', {
        gameId: 'game-123',
        offer,
        from: 'player-1',
      });
    });

    it('should emit webrtc-answer event', async () => {
      await socketService.connect();
      const mockSocket = (socketService as any).socket;
      
      const answer = { type: 'answer', sdp: 'mock-sdp' };
      socketService.sendWebRTCAnswer('game-123', answer, 'player-2');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('webrtc-answer', {
        gameId: 'game-123',
        answer,
        from: 'player-2',
      });
    });

    it('should emit webrtc-ice-candidate event', async () => {
      await socketService.connect();
      const mockSocket = (socketService as any).socket;
      
      const candidate = { candidate: 'mock-candidate', sdpMLineIndex: 0 };
      socketService.sendWebRTCIceCandidate('game-123', candidate, 'player-1');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('webrtc-ice-candidate', {
        gameId: 'game-123',
        candidate,
        from: 'player-1',
      });
    });
  });

  describe('Event Listeners', () => {
    it('should register event listener', async () => {
      await socketService.connect();
      const mockCallback = vi.fn();
      
      const unsubscribe = socketService.on('testEvent', mockCallback);
      
      // Trigger event manually (simulating server event)
      (socketService as any).emit('testEvent', { data: 'test' });
      
      expect(mockCallback).toHaveBeenCalledWith({ data: 'test' });
      
      // Cleanup
      unsubscribe();
    });

    it('should remove event listener on unsubscribe', async () => {
      await socketService.connect();
      const mockCallback = vi.fn();
      
      const unsubscribe = socketService.on('testEvent', mockCallback);
      unsubscribe();
      
      // Trigger event after unsubscribe
      (socketService as any).emit('testEvent', { data: 'test' });
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners for same event', async () => {
      await socketService.connect();
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      socketService.on('testEvent', callback1);
      socketService.on('testEvent', callback2);
      
      (socketService as any).emit('testEvent', { data: 'test' });
      
      expect(callback1).toHaveBeenCalledWith({ data: 'test' });
      expect(callback2).toHaveBeenCalledWith({ data: 'test' });
    });
  });

  describe('Server Events', () => {
    it('should listen for queueJoined event', async () => {
      await socketService.connect();
      const mockCallback = vi.fn();
      
      socketService.on('queueJoined', mockCallback);
      
      // Simulate server sending queueJoined
      const mockSocket = (socketService as any).socket;
      const queueJoinedHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'queueJoined'
      );
      if (queueJoinedHandler) {
        queueJoinedHandler[1]({ gameId: 'game-123' });
      }
      
      expect(mockCallback).toHaveBeenCalledWith({ gameId: 'game-123' });
    });

    it('should listen for matchFound event', async () => {
      await socketService.connect();
      const mockCallback = vi.fn();
      
      socketService.on('matchFound', mockCallback);
      
      const mockSocket = (socketService as any).socket;
      const matchFoundHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'matchFound'
      );
      if (matchFoundHandler) {
        matchFoundHandler[1]({
          gameId: 'game-123',
          color: 'white',
          opponentId: 'player-2',
        });
      }
      
      expect(mockCallback).toHaveBeenCalledWith({
        gameId: 'game-123',
        color: 'white',
        opponentId: 'player-2',
      });
    });

    it('should listen for gameStart event', async () => {
      await socketService.connect();
      const mockCallback = vi.fn();
      
      socketService.on('gameStart', mockCallback);
      
      const mockSocket = (socketService as any).socket;
      const gameStartHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'gameStart'
      );
      if (gameStartHandler) {
        gameStartHandler[1]({ color: 'white' });
      }
      
      expect(mockCallback).toHaveBeenCalledWith({ color: 'white' });
    });

    it('should listen for opponentMove event', async () => {
      await socketService.connect();
      const mockCallback = vi.fn();
      
      socketService.on('opponentMove', mockCallback);
      
      const mockSocket = (socketService as any).socket;
      const opponentMoveHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'opponentMove'
      );
      if (opponentMoveHandler) {
        opponentMoveHandler[1]({
          move: 'e5',
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
          isWhite: false,
        });
      }
      
      expect(mockCallback).toHaveBeenCalledWith({
        move: 'e5',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        isWhite: false,
      });
    });

    it('should listen for gameOver event', async () => {
      await socketService.connect();
      const mockCallback = vi.fn();
      
      socketService.on('gameOver', mockCallback);
      
      const mockSocket = (socketService as any).socket;
      const gameOverHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'gameOver'
      );
      if (gameOverHandler) {
        gameOverHandler[1]({ reason: 'checkmate', winner: 'white' });
      }
      
      expect(mockCallback).toHaveBeenCalledWith({
        reason: 'checkmate',
        winner: 'white',
      });
    });

    it('should listen for error event', async () => {
      await socketService.connect();
      const mockCallback = vi.fn();
      
      socketService.on('error', mockCallback);
      
      const mockSocket = (socketService as any).socket;
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'error'
      );
      if (errorHandler) {
        errorHandler[1]({ message: 'Test error' });
      }
      
      expect(mockCallback).toHaveBeenCalledWith({ message: 'Test error' });
    });

    it('should listen for chatMessage event', async () => {
      await socketService.connect();
      const mockCallback = vi.fn();
      
      socketService.on('chatMessage', mockCallback);
      
      const mockSocket = (socketService as any).socket;
      const chatHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'chatMessage'
      );
      if (chatHandler) {
        chatHandler[1]({
          from: 'player-2',
          message: 'Good game!',
          timestamp: Date.now(),
        });
      }
      
      expect(mockCallback).toHaveBeenCalledWith({
        from: 'player-2',
        message: 'Good game!',
        timestamp: expect.any(Number),
      });
    });
  });
});
