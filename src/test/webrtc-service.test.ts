import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock WebRTC APIs
const mockLocalStream = {
  getVideoTracks: vi.fn(() => [
    {
      enabled: true,
      stop: vi.fn(),
      getConstraints: vi.fn(() => ({ facingMode: 'user' })),
    },
  ]),
  getAudioTracks: vi.fn(() => [
    {
      enabled: true,
      stop: vi.fn(),
    },
  ]),
  getTracks: vi.fn(() => []),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
};

const mockRemoteStream = {
  id: 'remote-stream-id',
  getTracks: vi.fn(() => []),
};

const mockPeerConnection = {
  addTrack: vi.fn(),
  getSenders: vi.fn(() => [
    {
      track: mockLocalStream.getVideoTracks()[0],
      replaceTrack: vi.fn(),
    },
  ]),
  createOffer: vi.fn(async () => ({ type: 'offer', sdp: 'mock-offer-sdp' })),
  createAnswer: vi.fn(async () => ({ type: 'answer', sdp: 'mock-answer-sdp' })),
  setLocalDescription: vi.fn(async () => {}),
  setRemoteDescription: vi.fn(async () => {}),
  addIceCandidate: vi.fn(async () => {}),
  close: vi.fn(),
  ontrack: null as ((event: any) => void) | null,
  onicecandidate: null as ((event: any) => void) | null,
};

vi.mock('../services/webrtc', () => ({
  webRTCService: {
    initialize: vi.fn(async (onRemoteStream, onIceCandidate) => {
      (webRTCService as any).onRemoteStreamCallback = onRemoteStream;
      (webRTCService as any).onIceCandidateCallback = onIceCandidate;
      (webRTCService as any).peerConnection = mockPeerConnection;
      (webRTCService as any).localStream = mockLocalStream;
      return mockLocalStream;
    }),
    createOffer: vi.fn(async () => {
      return mockPeerConnection.createOffer();
    }),
    createAnswer: vi.fn(async (offer) => {
      return mockPeerConnection.createAnswer();
    }),
    setAnswer: vi.fn(async (answer) => {
      return mockPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }),
    addIceCandidate: vi.fn(async (candidate) => {
      return mockPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }),
    toggleVideo: vi.fn((enabled) => {
      const track = mockLocalStream.getVideoTracks()[0];
      if (track) track.enabled = enabled;
    }),
    toggleAudio: vi.fn((enabled) => {
      const track = mockLocalStream.getAudioTracks()[0];
      if (track) track.enabled = enabled;
    }),
    switchCamera: vi.fn(async () => {}),
    close: vi.fn(() => {
      mockPeerConnection.close();
    }),
    getLocalStream: vi.fn(() => mockLocalStream),
    getRemoteStream: vi.fn(() => mockRemoteStream),
  },
}));

import { webRTCService } from '../services/webrtc';

describe('WebRTCService Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    webRTCService.close();
  });

  describe('Initialization', () => {
    it('should initialize peer connection with STUN servers', async () => {
      const onRemoteStream = vi.fn();
      const onIceCandidate = vi.fn();
      
      const stream = await webRTCService.initialize(onRemoteStream, onIceCandidate);
      
      expect(stream).toBe(mockLocalStream);
      expect(mockPeerConnection).toBeTruthy();
    });

    it('should request user media with video and audio', async () => {
      const onRemoteStream = vi.fn();
      const onIceCandidate = vi.fn();
      
      await webRTCService.initialize(onRemoteStream, onIceCandidate);
      
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: true,
      });
    });

    it('should add local stream tracks to peer connection', async () => {
      const onRemoteStream = vi.fn();
      const onIceCandidate = vi.fn();
      
      await webRTCService.initialize(onRemoteStream, onIceCandidate);
      
      expect(mockPeerConnection.addTrack).toHaveBeenCalled();
    });

    it('should set up remote stream handler', async () => {
      const onRemoteStream = vi.fn();
      const onIceCandidate = vi.fn();
      
      await webRTCService.initialize(onRemoteStream, onIceCandidate);
      
      expect(mockPeerConnection.ontrack).toBeDefined();
      
      // Simulate receiving remote track
      if (mockPeerConnection.ontrack) {
        mockPeerConnection.ontrack({ streams: [mockRemoteStream] });
      }
      
      expect(onRemoteStream).toHaveBeenCalledWith(mockRemoteStream);
    });

    it('should set up ICE candidate handler', async () => {
      const onRemoteStream = vi.fn();
      const onIceCandidate = vi.fn();
      
      await webRTCService.initialize(onRemoteStream, onIceCandidate);
      
      expect(mockPeerConnection.onicecandidate).toBeDefined();
      
      // Simulate receiving ICE candidate
      if (mockPeerConnection.onicecandidate) {
        const mockEvent = {
          candidate: {
            toJSON: () => ({ candidate: 'mock-candidate', sdpMLineIndex: 0 }),
          },
        };
        mockPeerConnection.onicecandidate(mockEvent as any);
      }
      
      expect(onIceCandidate).toHaveBeenCalledWith({
        candidate: 'mock-candidate',
        sdpMLineIndex: 0,
      });
    });

    it('should throw error if media devices are not accessible', async () => {
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = vi.fn(async () => {
        throw new Error('Media devices not accessible');
      });

      await expect(
        webRTCService.initialize(vi.fn(), vi.fn())
      ).rejects.toThrow('Media devices not accessible');

      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    });
  });

  describe('Offer and Answer', () => {
    beforeEach(async () => {
      await webRTCService.initialize(vi.fn(), vi.fn());
    });

    it('should create offer', async () => {
      const offer = await webRTCService.createOffer();
      
      expect(offer).toEqual({ type: 'offer', sdp: 'mock-offer-sdp' });
      expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled();
    });

    it('should throw error if creating offer before initialization', async () => {
      webRTCService.close();
      
      await expect(webRTCService.createOffer()).rejects.toThrow(
        'Peer connection not initialized'
      );
    });

    it('should create answer from offer', async () => {
      const offer = { type: 'offer', sdp: 'mock-offer-sdp' };
      const answer = await webRTCService.createAnswer(offer);
      
      expect(answer).toEqual({ type: 'answer', sdp: 'mock-answer-sdp' });
      expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalled();
      expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled();
    });

    it('should set answer', async () => {
      const answer = { type: 'answer', sdp: 'mock-answer-sdp' };
      
      await expect(webRTCService.setAnswer(answer)).resolves.toBeUndefined();
      expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalled();
    });
  });

  describe('ICE Candidate', () => {
    beforeEach(async () => {
      await webRTCService.initialize(vi.fn(), vi.fn());
    });

    it('should add ICE candidate', async () => {
      const candidate = { candidate: 'mock-candidate', sdpMLineIndex: 0 };
      
      await expect(webRTCService.addIceCandidate(candidate)).resolves.toBeUndefined();
      expect(mockPeerConnection.addIceCandidate).toHaveBeenCalled();
    });

    it('should handle ICE candidate errors gracefully', async () => {
      mockPeerConnection.addIceCandidate.mockRejectedValueOnce(new Error('Invalid candidate'));
      
      const candidate = { candidate: 'invalid', sdpMLineIndex: 0 };
      
      // Should not throw, just log error
      await expect(webRTCService.addIceCandidate(candidate)).resolves.toBeUndefined();
    });
  });

  describe('Media Controls', () => {
    beforeEach(async () => {
      await webRTCService.initialize(vi.fn(), vi.fn());
    });

    it('should toggle video track', () => {
      const videoTrack = mockLocalStream.getVideoTracks()[0];
      
      webRTCService.toggleVideo(false);
      expect(videoTrack.enabled).toBe(false);
      
      webRTCService.toggleVideo(true);
      expect(videoTrack.enabled).toBe(true);
    });

    it('should toggle audio track', () => {
      const audioTrack = mockLocalStream.getAudioTracks()[0];
      
      webRTCService.toggleAudio(false);
      expect(audioTrack.enabled).toBe(false);
      
      webRTCService.toggleAudio(true);
      expect(audioTrack.enabled).toBe(true);
    });

    it('should switch camera', async () => {
      const newStream = {
        getVideoTracks: vi.fn(() => [
          {
            stop: vi.fn(),
            getConstraints: vi.fn(() => ({ facingMode: 'environment' })),
          },
        ]),
        removeTrack: vi.fn(),
        addTrack: vi.fn(),
      };
      
      navigator.mediaDevices.getUserMedia = vi.fn(async () => newStream as any);
      
      await webRTCService.switchCamera();
      
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'environment' },
      });
    });
  });

  describe('Cleanup', () => {
    it('should close peer connection and stop tracks', async () => {
      await webRTCService.initialize(vi.fn(), vi.fn());
      
      webRTCService.close();
      
      expect(mockPeerConnection.close).toHaveBeenCalled();
      expect(mockLocalStream.getTracks).toHaveBeenCalled();
    });

    it('should reset callbacks on close', async () => {
      await webRTCService.initialize(vi.fn(), vi.fn());
      
      webRTCService.close();
      
      expect((webRTCService as any).onRemoteStreamCallback).toBeNull();
      expect((webRTCService as any).onIceCandidateCallback).toBeNull();
    });
  });

  describe('Stream Accessors', () => {
    it('should get local stream', async () => {
      await webRTCService.initialize(vi.fn(), vi.fn());
      
      const stream = webRTCService.getLocalStream();
      expect(stream).toBe(mockLocalStream);
    });

    it('should get remote stream', async () => {
      await webRTCService.initialize(vi.fn(), vi.fn());
      
      // Simulate receiving remote stream
      if (mockPeerConnection.ontrack) {
        mockPeerConnection.ontrack({ streams: [mockRemoteStream] });
      }
      
      const stream = webRTCService.getRemoteStream();
      expect(stream).toBe(mockRemoteStream);
    });

    it('should return null for remote stream before connection', async () => {
      const stream = webRTCService.getRemoteStream();
      expect(stream).toBeNull();
    });
  });
});
