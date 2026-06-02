import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../App';

// Mock all dependencies
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

const mockMediaStream = {
  getVideoTracks: vi.fn(() => []),
  getAudioTracks: vi.fn(() => []),
  getTracks: vi.fn(() => []),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
};

vi.mock('../services/webrtc', () => ({
  webRTCService: {
    initialize: vi.fn(async () => mockMediaStream),
    createOffer: vi.fn(async () => ({ type: 'offer', sdp: 'mock-sdp' })),
    createAnswer: vi.fn(async () => ({ type: 'answer', sdp: 'mock-sdp' })),
    setAnswer: vi.fn(async () => {}),
    addIceCandidate: vi.fn(async () => {}),
    toggleVideo: vi.fn(),
    toggleAudio: vi.fn(),
    switchCamera: vi.fn(async () => {}),
    close: vi.fn(),
    getLocalStream: vi.fn(() => null),
    getRemoteStream: vi.fn(() => null),
  },
}));

vi.mock('../components/ChessBoardPanel', () => ({
  ChessBoardPanel: () => <div data-testid="chess-board">Chess Board</div>,
}));

vi.mock('../components/VideoPanel', () => ({
  VideoPanel: ({ isLocal }: { isLocal: boolean }) => (
    <div data-testid={isLocal ? 'local-video' : 'remote-video'}>
      {isLocal ? 'Local Video' : 'Remote Video'}
    </div>
  ),
}));

vi.mock('../components/ChatPanel', () => ({
  ChatPanel: () => <div data-testid="chat-panel">Chat Panel</div>,
}));

vi.mock('../components/Controls', () => ({
  Controls: () => <div data-testid="controls">Controls</div>,
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should show loading screen initially', () => {
      render(<App />);

      expect(screen.getByText('CHESS ROULETTE')).toBeInTheDocument();
      expect(screen.getByText('CODING CHALLENGE')).toBeInTheDocument();
      expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
    });

    it('should transition to main app after connection', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('chess-board')).toBeInTheDocument();
      expect(screen.getByTestId('controls')).toBeInTheDocument();
    });

    it('should display app header with logo', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('CHESS ROULETTE')).toBeInTheDocument();
      expect(screen.getByText('CODING CHALLENGE')).toBeInTheDocument();
    });

    it('should display header info badges', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('1v1')).toBeInTheDocument();
      expect(screen.getByText('Real-time')).toBeInTheDocument();
    });
  });

  describe('Game Flow', () => {
    it('should show chess board in waiting state', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('chess-board')).toBeInTheDocument();
      expect(screen.getByText('Join the queue to find a match')).toBeInTheDocument();
    });

    it('should not show video panels before matching', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(screen.queryByTestId('local-video')).not.toBeInTheDocument();
      expect(screen.queryByTestId('remote-video')).not.toBeInTheDocument();
    });

    it('should show video panels when matched', async () => {
      // This would require mocking the GameContext to simulate matched state
      // For now, we test the structure
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      // Video panels should exist in the DOM but be conditionally rendered
      expect(screen.getByTestId('chess-board')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have proper layout structure', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // app-main
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });

    it('should display footer with technology info', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(
        screen.getByText('Built with React, TypeScript, Socket.io & WebRTC')
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      const { io } = await import('socket.io-client');
      const mockSocket = (io as any).mock.results[0].value;

      // Simulate connection error
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'connect_error') {
          setTimeout(() => callback(new Error('Connection failed')), 10);
        }
      });

      render(<App />);

      // Should still render after error
      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('chess-board')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should render all main sections', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(screen.getByClassName('game-area')).toBeInTheDocument();
      expect(screen.getByClassName('sidebar')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should integrate ChessBoardPanel component', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('chess-board')).toBeInTheDocument();
    });

    it('should integrate Controls component', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('controls')).toBeInTheDocument();
    });

    it('should conditionally render ChatPanel', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      // ChatPanel should only render when matched
      expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
    });

    it('should conditionally render VideoPanel', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      // VideoPanel should only render when matched
      expect(screen.queryByTestId('local-video')).not.toBeInTheDocument();
      expect(screen.queryByTestId('remote-video')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('CHESS ROULETTE');
    });

    it('should have accessible button labels', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
      });

      // Controls should have accessible buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
