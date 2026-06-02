import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export function ChatPanel() {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { chatMessages, sendChatMessage, gameState } = useGame();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && gameState.game) {
      sendChatMessage(message.trim());
      setMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!gameState.game) {
    return null;
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>💬 Chat</h3>
      </div>
      
      <div className="chat-messages">
        {chatMessages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet</p>
            <p className="hint">Say hello to your opponent!</p>
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.isMe ? 'message-me' : 'message-opponent'}`}
            >
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">
                    {msg.isMe ? 'You' : 'Opponent'}
                  </span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-text">{msg.message}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
          disabled={!gameState.isPlaying}
          maxLength={200}
        />
        <button 
          type="submit" 
          className="chat-send-btn"
          disabled={!message.trim() || !gameState.isPlaying}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      {!gameState.isPlaying && (
        <div className="chat-disabled-overlay">
          <p>Chat available during game</p>
        </div>
      )}
    </div>
  );
}
