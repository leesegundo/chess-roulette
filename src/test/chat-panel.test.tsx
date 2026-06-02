import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatPanel } from '../components/ChatPanel';

// Mock useGame hook
const mockUseGame = vi.hoisted(() => ({
  useGame: vi.fn(),
}));

vi.mock('../context/GameContext', () => ({
  useGame: mockUseGame.useGame,
}));

describe('ChatPanel Component', () => {
  const defaultProps = {
    chatMessages: [],
    sendChatMessage: vi.fn(),
    gameState: {
      game: { id: 'game-123' },
      isPlaying: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render chat panel when game exists', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      expect(screen.getByText('💬 Chat')).toBeInTheDocument();
    });

    it('should render null when no game exists', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, game: null },
      });

      const { container } = render(<ChatPanel />);

      expect(container.firstChild).toBeNull();
    });

    it('should show "No messages yet" when chat is empty', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      expect(screen.getByText('No messages yet')).toBeInTheDocument();
      expect(screen.getByText('Say hello to your opponent!')).toBeInTheDocument();
    });
  });

  describe('Chat Messages', () => {
    it('should display chat messages', () => {
      const messages = [
        { from: 'player-1', message: 'Hello!', timestamp: 1234567890000, isMe: true },
        { from: 'player-2', message: 'Hi there!', timestamp: 1234567900000, isMe: false },
      ];

      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        chatMessages: messages,
      });

      render(<ChatPanel />);

      expect(screen.getByText('Hello!')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('should label messages as "You" or "Opponent"', () => {
      const messages = [
        { from: 'player-1', message: 'Hello!', timestamp: 1234567890000, isMe: true },
        { from: 'player-2', message: 'Hi there!', timestamp: 1234567900000, isMe: false },
      ];

      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        chatMessages: messages,
      });

      render(<ChatPanel />);

      expect(screen.getByText('You')).toBeInTheDocument();
      expect(screen.getByText('Opponent')).toBeInTheDocument();
    });

    it('should format message timestamps', () => {
      const messages = [
        { from: 'player-1', message: 'Test', timestamp: 1234567890000, isMe: true },
      ];

      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        chatMessages: messages,
      });

      render(<ChatPanel />);

      // Timestamp should be formatted (HH:MM format)
      const timeElement = screen.getByText('12:31'); // Based on timestamp
      expect(timeElement).toBeInTheDocument();
    });

    it('should apply message-me class to my messages', () => {
      const messages = [
        { from: 'player-1', message: 'Hello!', timestamp: 1234567890000, isMe: true },
      ];

      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        chatMessages: messages,
      });

      render(<ChatPanel />);

      const messageElement = screen.getByText('Hello!').closest('.message');
      expect(messageElement).toHaveClass('message-me');
    });

    it('should apply message-opponent class to opponent messages', () => {
      const messages = [
        { from: 'player-2', message: 'Hello!', timestamp: 1234567890000, isMe: false },
      ];

      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        chatMessages: messages,
      });

      render(<ChatPanel />);

      const messageElement = screen.getByText('Hello!').closest('.message');
      expect(messageElement).toHaveClass('message-opponent');
    });
  });

  describe('Sending Messages', () => {
    it('should have a text input for messages', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      const input = screen.getByPlaceholderText('Type a message...');
      expect(input).toBeInTheDocument();
    });

    it('should have a send button', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      expect(screen.getByRole('button', { type: 'submit' })).toBeInTheDocument();
    });

    it('should call sendChatMessage when form is submitted', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByRole('button', { type: 'submit' });

      fireEvent.change(input, { target: { value: 'Good luck!' } });
      fireEvent.click(sendButton);

      expect(defaultProps.sendChatMessage).toHaveBeenCalledWith('Good luck!');
    });

    it('should clear input after sending message', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByRole('button', { type: 'submit' });

      fireEvent.change(input, { target: { value: 'Good luck!' } });
      fireEvent.click(sendButton);

      expect(input).toHaveValue('');
    });

    it('should not send empty messages', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      const sendButton = screen.getByRole('button', { type: 'submit' });

      fireEvent.click(sendButton);

      expect(defaultProps.sendChatMessage).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only messages', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByRole('button', { type: 'submit' });

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(sendButton);

      expect(defaultProps.sendChatMessage).not.toHaveBeenCalled();
    });

    it('should disable send button when input is empty', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      const sendButton = screen.getByRole('button', { type: 'submit' });
      expect(sendButton).toBeDisabled();
    });

    it('should enable send button when input has text', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByRole('button', { type: 'submit' });

      fireEvent.change(input, { target: { value: 'Hello' } });

      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('Game State', () => {
    it('should disable chat input when game is not playing', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isPlaying: false },
      });

      render(<ChatPanel />);

      const input = screen.getByPlaceholderText('Type a message...');
      expect(input).toBeDisabled();
    });

    it('should disable send button when game is not playing', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isPlaying: false },
      });

      render(<ChatPanel />);

      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByRole('button', { type: 'submit' });

      fireEvent.change(input, { target: { value: 'Hello' } });

      expect(sendButton).toBeDisabled();
    });

    it('should show "Chat available during game" when not playing', () => {
      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        gameState: { ...defaultProps.gameState, isPlaying: false },
      });

      render(<ChatPanel />);

      expect(screen.getByText('Chat available during game')).toBeInTheDocument();
    });
  });

  describe('Message Length', () => {
    it('should enforce maximum message length of 200 characters', () => {
      mockUseGame.useGame.mockReturnValue(defaultProps);

      render(<ChatPanel />);

      const input = screen.getByPlaceholderText('Type a message...');
      const longMessage = 'a'.repeat(250);

      fireEvent.change(input, { target: { value: longMessage } });

      expect(input).toHaveValue(longMessage.substring(0, 200));
    });
  });

  describe('Auto-scroll', () => {
    it('should scroll to bottom when new messages arrive', () => {
      const scrollIntoView = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoView;

      const messages = [
        { from: 'player-1', message: 'Message 1', timestamp: 1234567890000, isMe: true },
      ];

      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        chatMessages: messages,
      });

      render(<ChatPanel />);

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      scrollIntoView.mockRestore();
    });
  });

  describe('Multiple Messages', () => {
    it('should display multiple messages in order', () => {
      const messages = [
        { from: 'player-1', message: 'First', timestamp: 1234567890000, isMe: true },
        { from: 'player-2', message: 'Second', timestamp: 1234567891000, isMe: false },
        { from: 'player-1', message: 'Third', timestamp: 1234567892000, isMe: true },
      ];

      mockUseGame.useGame.mockReturnValue({
        ...defaultProps,
        chatMessages: messages,
      });

      render(<ChatPanel />);

      const messageElements = screen.getAllByText(/First|Second|Third/);
      expect(messageElements).toHaveLength(3);
    });
  });
});
