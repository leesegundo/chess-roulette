import { useGame } from '../context/GameContext';

export function Controls() {
  const { 
    gameState, 
    joinQueue, 
    leaveQueue, 
    resign, 
    toggleVideo, 
    toggleAudio, 
    switchCamera,
    isVideoEnabled,
    isAudioEnabled,
    disconnect,
    error,
    clearError 
  } = useGame();

  const handleResign = () => {
    if (window.confirm('Are you sure you want to resign?')) {
      resign();
    }
  };

  return (
    <div className="controls-panel">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="close-error">✕</button>
        </div>
      )}

      <div className="control-section">
        <h3>🎮 Game Controls</h3>
        
        {!gameState.isConnected ? (
          <div className="connection-status">
            <p>Connecting to server...</p>
          </div>
        ) : !gameState.isPlaying && !gameState.gameOver ? (
          !gameState.isQueued ? (
            <button onClick={joinQueue} className="btn btn-primary btn-queue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Find Match
            </button>
          ) : (
            <div className="queueing-status">
              <div className="spinner"></div>
              <p>Looking for opponent...</p>
              <button onClick={leaveQueue} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          )
        ) : null}

        {gameState.isPlaying && !gameState.gameOver && (
          <button onClick={handleResign} className="btn btn-danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l18 18M3 21L21 3" />
            </svg>
            Resign
          </button>
        )}

        {gameState.gameOver && (
          <div className="game-over-actions">
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Play Again
            </button>
          </div>
        )}
      </div>

      {gameState.isMatched && (
        <div className="control-section">
          <h3>📹 Video Controls</h3>
          
          <div className="video-controls">
            <button 
              onClick={toggleVideo} 
              className={`btn ${isVideoEnabled ? 'btn-secondary' : 'btn-warning'}`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  Camera On
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Camera Off
                </>
              )}
            </button>

            <button 
              onClick={toggleAudio} 
              className={`btn ${isAudioEnabled ? 'btn-secondary' : 'btn-warning'}`}
              title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isAudioEnabled ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Mic On
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Muted
                </>
              )}
            </button>

            <button 
              onClick={switchCamera} 
              className="btn btn-secondary"
              title="Switch camera"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Switch
            </button>
          </div>
        </div>
      )}

      <div className="control-section">
        <button onClick={disconnect} className="btn btn-outline">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Disconnect
        </button>
      </div>
    </div>
  );
}
