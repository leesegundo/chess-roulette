import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Controls } from '../components/Controls';

// Mock useGame hook
const mockUseGame = vi.hoisted(() => ({
  useGame: vi.fn(),
}));

vi.mock('../context/GameContext', () => ({
  useGame: mockUseGame.useGame,
}));

describe('Controls Component', () => {
  const defaultProps = {
    gameState: {
      isConnected: true,
      isQueued: false,
      isMatched: false,
      isPlaying: false,
      gameOver: false,
    },
    joinQueue: vi.fn(),
    leaveQueue: vi.fn(),
    resign: vi.fn(),
    toggleVideo: vi.fn(),
    toggleAudio: vi.fn(),
    switchCamera: vi.fn(),
    disconnect: vi.fn(),
    isVideoEnabled: true,
    isAudioEnabled: true,
    error: null,
    clearError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection State', () => {
    it('should show connecting message when not connected', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isConnected: false },
      });

      render(<Controls />);

      expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
    });

    it('should show Find Match button when connected and not queued', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<Controls />);

      expect(screen.getByText('Find Match')).toBeInTheDocument();
    });
  });

  describe('Queue Management', () => {
    it('should call joinQueue when Find Match button is clicked', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<Controls />);

      fireEvent.click(screen.getByText('Find Match'));

      expect(defaultProps.joinQueue).toHaveBeenCalled();
    });

    it('should show queueing status when queued', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isQueued: true },
      });

      render(<Controls />);

      expect(screen.getByText('Looking for opponent...')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call leaveQueue when Cancel button is clicked', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isQueued: true },
      });

      render(<Controls />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(defaultProps.leaveQueue).toHaveBeenCalled();
    });
  });

  describe('Game Controls', () => {
    it('should show Resign button when game is playing', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isPlaying: true, gameOver: false },
      });

      render(<Controls />);

      expect(screen.getByText('Resign')).toBeInTheDocument();
    });

    it('should show confirmation dialog when Resign is clicked', () => {
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isPlaying: true, gameOver: false },
      });

      render(<Controls />);

      fireEvent.click(screen.getByText('Resign'));

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to resign?');
      expect(defaultProps.resign).toHaveBeenCalled();

      mockConfirm.mockRestore();
    });

    it('should not resign if user cancels confirmation', () => {
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isPlaying: true, gameOver: false },
      });

      render(<Controls />);

      fireEvent.click(screen.getByText('Resign'));

      expect(defaultProps.resign).not.toHaveBeenCalled();

      mockConfirm.mockRestore();
    });

    it('should show Play Again button when game is over', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, gameOver: true },
      });

      render(<Controls />);

      expect(screen.getByText('Play Again')).toBeInTheDocument();
    });

    it('should reload page when Play Again is clicked', () => {
      const mockReload = vi.spyOn(window.location, 'reload').mockImplementation(vi.fn());
      
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, gameOver: true },
      });

      render(<Controls />);

      fireEvent.click(screen.getByText('Play Again'));

      expect(mockReload).toHaveBeenCalled();

      mockReload.mockRestore();
    });
  });

  describe('Video Controls', () => {
    it('should show video controls when matched', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isMatched: true },
      });

      render(<Controls />);

      expect(screen.getByText('Camera On')).toBeInTheDocument();
      expect(screen.getByText('Mic On')).toBeInTheDocument();
      expect(screen.getByText('Switch')).toBeInTheDocument();
    });

    it('should toggle video when Camera On button is clicked', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isMatched: true },
        isVideoEnabled: true,
      });

      render(<Controls />);

      fireEvent.click(screen.getByText('Camera On'));

      expect(defaultProps.toggleVideo).toHaveBeenCalledWith(false);
    });

    it('should show Camera Off when video is disabled', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isMatched: true },
        isVideoEnabled: false,
      });

      render(<Controls />);

      expect(screen.getByText('Camera Off')).toBeInTheDocument();
    });

    it('should toggle audio when Mic On button is clicked', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isMatched: true },
        isAudioEnabled: true,
      });

      render(<Controls />);

      fireEvent.click(screen.getByText('Mic On'));

      expect(defaultProps.toggleAudio).toHaveBeenCalledWith(false);
    });

    it('should show Muted when audio is disabled', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isMatched: true },
        isAudioEnabled: false,
      });

      render(<Controls />);

      expect(screen.getByText('Muted')).toBeInTheDocument();
    });

    it('should switch camera when Switch button is clicked', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isMatched: true },
      });

      render(<Controls />);

      fireEvent.click(screen.getByText('Switch'));

      expect(defaultProps.switchCamera).toHaveBeenCalled();
    });
  });

  describe('Disconnect', () => {
    it('should show Disconnect button', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<Controls />);

      expect(screen.getByText('Disconnect')).toBeInTheDocument();
    });

    it('should call disconnect when Disconnect button is clicked', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<Controls />);

      fireEvent.click(screen.getByText('Disconnect'));

      expect(defaultProps.disconnect).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should show error banner when there is an error', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        error: 'Connection failed',
      });

      render(<Controls />);

      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('should clear error when close button is clicked', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        error: 'Connection failed',
      });

      render(<Controls />);

      fireEvent.click(screen.getByText('✕'));

      expect(defaultProps.clearError).toHaveBeenCalled();
    });

    it('should not show error banner when there is no error', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<Controls />);

      expect(screen.queryByText('Connection failed')).not.toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should have primary class on Find Match button', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<Controls />);

      expect(screen.getByText('Find Match')).toHaveClass('btn-primary');
    });

    it('should have secondary class on Cancel button', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isQueued: true },
      });

      render(<Controls />);

      expect(screen.getByText('Cancel')).toHaveClass('btn-secondary');
    });

    it('should have danger class on Resign button', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isPlaying: true, gameOver: false },
      });

      render(<Controls />);

      expect(screen.getByText('Resign')).toHaveClass('btn-danger');
    });

    it('should have warning class on Camera Off button', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isMatched: true },
        isVideoEnabled: false,
      });

      render(<Controls />);

      expect(screen.getByText('Camera Off')).toHaveClass('btn-warning');
    });
  });
});
