import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { useGame } from '../context/GameContext';

export function ChessBoardPanel() {
  const { gameState, chess, makeMove } = useGame();

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    if (!gameState.isPlaying || !gameState.isMyTurn || gameState.gameOver) {
      return false;
    }

    try {
      // Check if the move is valid
      const tempChess = new Chess(chess.fen());
      const result = tempChess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Always promote to queen for simplicity
      });
      
      if (result) {
        makeMove(result);
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
      return '🎯 Practice Mode - Free Play';
    }

    if (gameState.isMyTurn) {
      return 'Your turn';
    } else {
      return "Opponent's turn";
    }
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
        <Chessboard
          id="ChessBoard"
          position={gameState.fen}
          onPieceDrop={gameState.isPlaying ? onDrop : undefined}
          boardOrientation={getBoardOrientation()}
          animationDuration={300}
          customDarkSquareStyle={{ backgroundColor: '#779556' }}
          customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
          arePiecesDraggable={gameState.isMyTurn && !gameState.gameOver && gameState.isPlaying}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>

      <div className="game-info">
        {gameState.isPlaying ? (
          <>
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
          </>
        ) : (
          <div className="practice-mode">
            <span>🎯 Practice Mode</span>
          </div>
        )}
      </div>
    </div>
  );
}
