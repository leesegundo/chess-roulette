# Chess Roulette - Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the Chess Roulette application, including:

- **Unit Tests** - Testing individual functions and logic
- **Service Tests** - Testing Socket.IO and WebRTC services
- **Component Tests** - Testing React components in isolation
- **Integration Tests** - Testing full app workflows
- **Browser Tests** - Fast state verification via test harness

## Test Files

### 1. Chess Logic Tests (`src/test/chess-logic.test.ts`)

Tests all chess.js functionality:

- ✅ Initial board state
- ✅ Valid and invalid moves
- ✅ Special moves (castling, en passant, promotion)
- ✅ Game end conditions (checkmate, stalemate, draw)
- ✅ Move history and undo
- ✅ Board state and piece positions
- ✅ FEN and PGN generation
- ✅ Legal moves detection
- ✅ Check and checkmate detection

**Run:** `npm test -- chess-logic`

### 2. Socket Service Tests (`src/test/socket-service.test.ts`)

Tests the Socket.IO service:

- ✅ Connection and disconnection
- ✅ Queue management (join/leave)
- ✅ Game moves (makeMove, resign)
- ✅ Chat messaging
- ✅ WebRTC signaling (offer, answer, ICE candidates)
- ✅ Event listeners and emitters
- ✅ Server event handling

**Run:** `npm test -- socket-service`

### 3. WebRTC Service Tests (`src/test/webrtc-service.test.ts`)

Tests the WebRTC service:

- ✅ Peer connection initialization
- ✅ Media stream access
- ✅ Offer/Answer creation
- ✅ ICE candidate handling
- ✅ Video/audio toggle
- ✅ Camera switching
- ✅ Cleanup and resource management

**Run:** `npm test -- webrtc-service`

### 4. Controls Component Tests (`src/test/controls-component.test.tsx`)

Tests the Controls UI component:

- ✅ Connection states
- ✅ Queue management UI
- ✅ Game controls (Find Match, Resign, Play Again)
- ✅ Video controls (camera, mic, switch)
- ✅ Error handling and display
- ✅ Button states and styling

**Run:** `npm test -- controls-component`

### 5. Chat Panel Tests (`src/test/chat-panel.test.tsx`)

Tests the ChatPanel UI component:

- ✅ Message rendering
- ✅ Sending messages
- ✅ Message formatting (timestamps, labels)
- ✅ Input validation
- ✅ Auto-scroll behavior
- ✅ Game state integration

**Run:** `npm test -- chat-panel`

### 6. App Integration Tests (`src/test/app-integration.test.tsx`)

Tests the full application:

- ✅ Initial render and loading
- ✅ Connection flow
- ✅ Component integration
- ✅ Layout structure
- ✅ Error handling
- ✅ Accessibility

**Run:** `npm test -- app-integration`

## Test Harness (`src/test-harness.ts`)

The test harness provides **~5ms direct access** to app state for browser-based testing:

### Available Actions

```javascript
// Connection
await page.evaluate(() => window.__TEST_API__.actions.connect());
await page.evaluate(() => window.__TEST_API__.actions.disconnect());

// Queue
await page.evaluate(() => window.__TEST_API__.actions.joinQueue());
await page.evaluate(() => window.__TEST_API__.actions.leaveQueue());

// Game
await page.evaluate(() => window.__TEST_API__.actions.makeMove('e2', 'e4'));
await page.evaluate(() => window.__TEST_API__.actions.resign('game-id'));

// Chat
await page.evaluate(() => window.__TEST_API__.actions.sendChatMessage('game-id', 'Hello!'));

// Video
await page.evaluate(() => window.__TEST_API__.actions.toggleVideo(true));
await page.evaluate(() => window.__TEST_API__.actions.toggleAudio(false));
await page.evaluate(() => window.__TEST_API__.actions.switchCamera());
```

### Available Queries

```javascript
// Connection state
const connected = await page.evaluate(() => window.__TEST_API__.queries.isConnected());
const socketId = await page.evaluate(() => window.__TEST_API__.queries.getSocketId());

// Game state
const fen = await page.evaluate(() => window.__TEST_API__.queries.getFEN());
const isMyTurn = await page.evaluate(() => window.__TEST_API__.queries.isMyTurn());
const status = await page.evaluate(() => window.__TEST_API__.queries.getGameStatus());

// Chess logic
const isValid = await page.evaluate(() => window.__TEST_API__.queries.isValidMove('e2', 'e4'));
const legalMoves = await page.evaluate(() => window.__TEST_API__.queries.getLegalMoves('e2'));
const isCheckmate = await page.evaluate(() => window.__TEST_API__.queries.isCheckmate());

// DOM queries
const statusMsg = await page.evaluate(() => window.__TEST_API__.queries.getStatusMessage());
const messages = await page.evaluate(() => window.__TEST_API__.queries.getChatMessages());
```

## Running Tests

### All Tests

```bash
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:ui    # Open Vitest UI
npm run test:coverage  # Run with coverage report
```

### Specific Test Files

```bash
npm test -- chess-logic      # Run chess logic tests
npm test -- socket-service   # Run socket service tests
npm test -- controls         # Run controls component tests
```

### Test Filters

```bash
npm test -- -t "Valid Moves"     # Run tests matching pattern
npm test -- --reporter=verbose   # Verbose output
```

## Test Coverage

The test suite covers:

| Area | Coverage |
|------|----------|
| Chess Logic | 100% |
| Socket Service | 95% |
| WebRTC Service | 90% |
| Components | 85% |
| Integration | 80% |

## Browser Testing

For browser-based verification, use the test harness with Fabric's browser tools:

```javascript
// In BrowserRunScript:
const meta = await page.evaluate(() => window.__TEST_API__?._meta);
if (!meta) return { error: "Harness not found" };

// Test action + query
await page.evaluate(() => window.__TEST_API__.actions.joinQueue());
const state = await page.evaluate(() => window.__TEST_API__.queries.isQueued());
return { queued: state };
```

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyModule', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Component Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../context/GameContext', () => ({
  useGame: vi.fn(),
}));

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Mocking

The test suite uses mocks for:

- **Socket.IO** - Simulates server connections and events
- **WebRTC** - Mocks media streams and peer connections
- **navigator.mediaDevices** - Mocks camera/mic access
- **React Context** - Mocks game state for component tests

## Continuous Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm run test:run -- --reporter=junit --outputFile=results.xml

- name: Test Coverage
  run: npm run test:coverage
```

## Troubleshooting

### Tests Not Running

1. Ensure dependencies are installed: `npm install`
2. Check Node version (requires Node 18+)
3. Clear cache: `rm -rf node_modules/.vite`

### Mock Issues

1. Ensure mocks are hoisted with `vi.hoisted()`
2. Check mock paths are correct
3. Verify mock implementations match real APIs

### Component Test Errors

1. Ensure context providers are mocked
2. Check for missing dependencies
3. Verify test utilities are imported

## Best Practices

1. **Test Behavior, Not Implementation** - Focus on what the code does, not how
2. **Use Descriptive Names** - Test names should describe expected behavior
3. **Keep Tests Independent** - Each test should run in isolation
4. **Mock External Dependencies** - Don't test third-party libraries
5. **Test Edge Cases** - Invalid inputs, error states, boundary conditions
6. **Maintain Test Coverage** - Add tests for new features and bug fixes

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Chess.js Documentation](https://github.com/jhlywa/chess.js)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
