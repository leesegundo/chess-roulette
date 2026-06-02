import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Socket.IO client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn((event, callback) => {
      // Simulate connection
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

// Mock WebRTC
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

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(async () => mockMediaStream),
  },
  writable: true,
});
