import { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';

interface VideoPanelProps {
  isLocal?: boolean;
}

export function VideoPanel({ isLocal = true }: VideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { localVideoStream, remoteVideoStream, isVideoEnabled, isAudioEnabled } = useGame();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = isLocal ? localVideoStream : remoteVideoStream;
    }
  }, [isLocal, localVideoStream, remoteVideoStream]);

  const stream = isLocal ? localVideoStream : remoteVideoStream;
  const hasStream = stream && stream.getVideoTracks().length > 0;

  return (
    <div className="video-panel">
      <div className="video-container">
        {hasStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={`video-element ${!isVideoEnabled ? 'video-disabled' : ''}`}
          />
        ) : (
          <div className="video-placeholder">
            <div className="placeholder-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <p>{isLocal ? 'Camera loading...' : 'Waiting for opponent...'}</p>
          </div>
        )}
        
        <div className="video-status">
          <span className="status-indicator">
            {isLocal ? (isVideoEnabled ? '🟢' : '🔴') : '🟢'}
          </span>
          <span className="status-label">
            {isLocal ? (isVideoEnabled ? 'Camera On' : 'Camera Off') : 'Opponent'}
          </span>
          {isLocal && (
            <span className="audio-status">
              {isAudioEnabled ? '🎤' : '🔇'}
            </span>
          )}
        </div>
      </div>
      <div className="video-label">
        {isLocal ? 'You' : 'Opponent'}
      </div>
    </div>
  );
}
