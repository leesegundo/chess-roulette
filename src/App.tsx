import { useEffect, useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { ChessBoardPanel } from './components/ChessBoardPanel';
import { VideoPanel } from './components/VideoPanel';
import { ChatPanel } from './components/ChatPanel';
import { Controls } from './components/Controls';
import './App.css';

function AppContent() {
  const { connect, gameState } = useGame();
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const initConnection = async () => {
      try {
        await connect();
        setIsConnecting(false);
      } catch (error) {
        console.error('Failed to connect:', error);
        setIsConnecting(false);
      }
    };

    initConnection();
  }, [connect]);

  if (isConnecting) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="logo">
            <h1>CHESS ROULETTE</h1>
            <p className="subtitle">CODING CHALLENGE</p>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <h1>CHESS ROULETTE</h1>
          <p className="subtitle">CODING CHALLENGE</p>
        </div>
        <div className="header-info">
          <div className="info-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>1v1</span>
          </div>
          <div className="info-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Real-time</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="game-area">
          <ChessBoardPanel />
        </div>

        {gameState.isMatched && (
          <div className="video-area">
            <div className="video-panels">
              <VideoPanel isLocal={true} />
              <VideoPanel isLocal={false} />
            </div>
          </div>
        )}

        <div className="sidebar">
          <Controls />
          {gameState.isMatched && <ChatPanel />}
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React, TypeScript, Socket.io & WebRTC</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
