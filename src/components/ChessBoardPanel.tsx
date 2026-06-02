import React from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Move as ChessMove } from 'chess.js';
import { useGame } from '../context/GameContext';

export function ChessBoardPanel() {
  const { gameState, chess, makeMove } = useGame();

  function onDrop(sourceSquare: string, targetSquare: string, piece: string): boolean {
    if (!gameState.isPlaying || !gameState.isMyTurn || gameState.gameOver) {
      return false;
    }

    try {
      const move: ChessMove = {
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Always promote to queen for simplicity
      };

      // Check if the move is valid
      const tempChess = new Chess(chess.fen());
      const result = tempChess.move(move);
      
      if (result) {
        makeMove(move);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  const getBoardOrientation = () => {
    return gameState.playerColor === 'black' ? 'black' : 'white';
  };

  const getStatusMessage = () => {
    if (gameState.gameOver) {
      if (gameState.winner) {
        if (gameState.winner === gameState.playerColor) {
          return '🎉 You won!';
        } else {
          return '😔 You lost';
        }
      } else {
        return '🤝 Draw';
      }
    }

    if (!gameState.isPlaying) {
      if (gameState.isMatched) {
        return 'Waiting for game to start...';
      }
      return '';
    }

    if (gameState.isMyTurn) {
      return 'Your turn';
    } else {
      return "Opponent's turn";
    }
  };

  const customPieces = () => {
    const pieces: { [piece: string]: React.FC<{ squareWidth: number }> } = {};
    return pieces;
  };

  return (
    <div className="chess-panel">
      <div className="game-status">
        <div className="status-text">{getStatusMessage()}</div>
        {gameState.isPlaying && !gameState.gameOver && (
          <div className="turn-indicator">
            {gameState.isMyTurn ? (
              <span className="my-turn">⏱️ Your turn</span>
            ) : (
              <span className="opponent-turn">⏳ Waiting...</span>
            )}
          </div>
        )}
      </div>

      <div className="chessboard-container">
        {gameState.isPlaying ? (
          <Chessboard
            id="ChessBoard"
            position={gameState.fen}
            onPieceDrop={onDrop}
            boardOrientation={getBoardOrientation()}
            animationDuration={300}
            customDarkSquareStyle={{ backgroundColor: '#779556' }}
            customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
            arePiecesDraggable={gameState.isMyTurn && !gameState.gameOver}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          />
        ) : (
          <div className="waiting-placeholder">
            <div className="placeholder-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <p>
              {gameState.isMatched 
                ? 'Waiting for game to start...' 
                : 'Join the queue to find a match'}
            </p>
          </div>
        )}
      </div>

      {gameState.isPlaying && (
        <div className="game-info">
          <div className="player-info">
            <span className="player-color">
              {gameState.playerColor === 'white' ? '⚪ White' : '⚫ Black'}
            </span>
            <span className="player-you">(You)</span>
          </div>
          <div className="vs">VS</div>
          <div className="player-info">
            <span className="player-color">
              {gameState.playerColor === 'white' ? '⚫ Black' : '⚪ White'}
            </span>
            <span className="player-opponent">(Opponent)</span>
          </div>
        </div>
      )}
    </div>
  );
}
