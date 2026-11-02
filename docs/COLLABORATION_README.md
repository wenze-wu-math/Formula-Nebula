# Real-time Collaborative Editing

## Overview

The Formula Nebula collaboration system enables multiple users to simultaneously edit and annotate mathematical proofs in real-time, similar to Google Docs. Features include:

- **Multi-user editing** with operational transform-based conflict resolution
- **Real-time cursor tracking** showing where other users are working
- **Threaded comments** on specific proof lines
- **Live presence indicators** showing active collaborators
- **Automatic synchronization** across all connected clients

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs the `ws` (WebSocket) package required for the collaboration server.

### 2. Start the Collaboration Server

```bash
npm run collab:server
```

The WebSocket server will start on `ws://localhost:8080`.

### 3. Start the Development Server

In a separate terminal:

```bash
npm run dev
```

This starts the Vite dev server on `http://localhost:5173`.

### 4. Open the Demo

Open multiple browser tabs (or different browsers) to:

```
http://localhost:5173/demo-collaboration.html
```

Each tab represents a different user collaborating on the same proof.

### Quick Demo Script

For convenience, run both servers simultaneously:

```bash
npm run collab:demo
```

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  • RealtimeCollaboration (realtime.js)                  │
│  • EventEmitter (utils/EventEmitter.js)                 │
│  • UI Components (demo-collaboration.html)              │
└─────────────────────────────────────────────────────────┘
                            ↕ WebSocket
┌─────────────────────────────────────────────────────────┐
│                  WebSocket Server                       │
│  • CollabServer (server/CollabServer.js)                │
│  • Room Management                                      │
│  • Message Broadcasting                                 │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│             Operational Transform Engine                │
│  • OperationalTransform (ot/transform.js)               │
│  • Conflict Resolution                                  │
│  • Version Control                                      │
└─────────────────────────────────────────────────────────┘
```

## Core Files

### Client-Side

- **`src/collaboration/realtime.js`** - Main collaboration client
  - `RealtimeCollaboration` class
  - WebSocket connection management
  - Event emission and handling
  - Local state management

- **`src/collaboration/utils/EventEmitter.js`** - Event system
  - Simple pub/sub implementation
  - Type-safe event handling

- **`src/collaboration/ot/transform.js`** - Operational Transform
  - Edit transformation algorithms
  - Conflict resolution logic
  - Position calculations

### Server-Side

- **`src/collaboration/server/CollabServer.js`** - WebSocket server
  - Connection management
  - Room (session) management
  - Message routing and broadcasting
  - Operation history

- **`src/collaboration/server/index.js`** - Server entry point
  - Server initialization
  - CLI interface
  - Graceful shutdown

### Demo

- **`demo-collaboration.html`** - Interactive demonstration
  - Proof editor UI
  - User list sidebar
  - Comment panel
  - Real-time cursor visualization

## API Reference

### RealtimeCollaboration

#### Constructor

```javascript
const collab = new RealtimeCollaboration(
  'ws://localhost:8080',  // WebSocket server URL
  'user-123',             // User ID
  'Alice'                 // Display name
);
```

#### Methods

##### connect()
```javascript
await collab.connect();
```
Establishes WebSocket connection and joins the default room.

##### SyncProofEdits(proof, edit)
```javascript
await collab.SyncProofEdits(proofDocument, {
  type: 'insert',
  position: { line: 5, column: 12 },
  content: 'New text'
});
```
Synchronizes an edit operation with other users.

**Edit Types:**
- `insert` - Insert text at position
- `delete` - Delete text from position
- `replace` - Replace text at position
- `annotate` - Add annotation to line

##### ManageCursors(userId, position)
```javascript
collab.ManageCursors('user-123', {
  line: 5,
  column: 12,
  selection: { start: {...}, end: {...} }
});
```
Updates and broadcasts cursor position.

##### ThreadComments(lineId, comment)
```javascript
await collab.ThreadComments('line-5', {
  text: 'This step needs clarification',
  replyTo: null  // or commentId for replies
});
```
Posts a comment on a specific line.

##### ResolveConflicts(edit1, edit2)
```javascript
const merged = collab.ResolveConflicts(edit1, edit2);
```
Resolves conflicting edits using operational transform.

#### Events

```javascript
// Session ready with initial state
collab.on('ready', ({ proofState, users }) => {
  console.log('Joined session with', users.length, 'users');
});

// New user joined
collab.on('user-joined', ({ userId, userName }) => {
  console.log(userName, 'joined');
});

// User left
collab.on('user-left', ({ userId }) => {
  console.log('User left');
});

// Local edit applied
collab.on('local-edit', ({ proof, edit }) => {
  console.log('Edit applied locally');
});

// Remote edit received
collab.on('remote-edit', ({ userId, edit, proof }) => {
  console.log('Remote edit from', userId);
});

// Remote cursor moved
collab.on('remote-cursor', ({ userId, userName, color, position }) => {
  // Update cursor visualization
});

// Remote comment posted
collab.on('remote-comment', ({ comment }) => {
  console.log('New comment:', comment.text);
});

// Conflict resolved
collab.on('conflict-resolved', ({ original, resolved }) => {
  console.log('Conflict resolved');
});

// Disconnected
collab.on('disconnected', () => {
  console.log('Connection lost');
});
```

## Protocol

The system uses a custom WebSocket protocol with JSON messages. See [collaboration-protocol.md](./collaboration-protocol.md) for full specification.

### Message Flow

```
Client                Server                Other Clients
  ├─ JOIN ──────────>│
  │<──────── WELCOME─┤
  │                  ├─ USER-JOINED ──────>│
  ├─ EDIT ─────────>│
  │<────────── ACK ──┤
  │                  ├─ EDIT (broadcast) ─>│
  ├─ CURSOR ───────>│
  │                  ├─ CURSOR ───────────>│
  ├─ COMMENT ──────>│
  │<────── COMMENT ──┤
  │                  ├─ COMMENT ──────────>│
```

## Operational Transform

The system uses Operational Transform (OT) to handle concurrent edits. When two users edit the same location:

1. Each edit is applied locally immediately (optimistic update)
2. Edits are sent to the server
3. Server transforms conflicting operations
4. Transformed operations are broadcast to other clients
5. Clients apply transformed operations

### Example

```
User A: Insert "Hello" at position 0
User B: Insert "World" at position 0 (concurrent)

After transformation:
- User A sees: "Hello"
- User B sees: "World"
- Server state: "HelloWorld" or "WorldHello" (based on priority)
```

Priority is determined by:
1. User ID (lexicographic order)
2. Timestamp (earlier wins)

## Configuration

### Server Configuration

Environment variables:

```bash
COLLAB_PORT=8080        # WebSocket server port
```

### Client Configuration

```javascript
const collab = new RealtimeCollaboration(
  'ws://localhost:8080',  // Server URL
  userId,                 // Must be unique per user
  userName                // Display name
);
```

### Security

For production deployment:

1. **Enable WSS (WebSocket Secure)**
```javascript
const serverUrl = 'wss://your-domain.com/collab';
```

2. **Add Authentication**
```javascript
// Include JWT token in connection
const ws = new WebSocket(serverUrl, {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});
```

3. **Configure Rate Limits** (in server)
```javascript
const server = new CollabServer(8080, {
  rateLimit: {
    editsPerMinute: 100,
    commentsPerMinute: 30
  }
});
```

## Testing

### Manual Testing

1. Open 3-4 browser tabs
2. Join with different names
3. Edit the proof simultaneously
4. Observe cursor positions
5. Post comments on lines
6. Verify synchronization

### Testing Conflict Resolution

1. Open 2 tabs side-by-side
2. Disconnect network on Tab 1 (Dev Tools → Network → Offline)
3. Make edits in both tabs
4. Reconnect Tab 1
5. Verify edits are merged correctly

## Troubleshooting

### "WebSocket connection failed"

**Solution:** Ensure the collaboration server is running:
```bash
npm run collab:server
```

### "No users showing in sidebar"

**Solution:** Make sure you entered a name in the join modal.

### "Edits not syncing"

**Solution:** 
1. Check browser console for errors
2. Verify server is running and accessible
3. Check WebSocket connection status in Network tab

### "Server crashes on startup"

**Solution:**
1. Port 8080 may be in use. Change port:
   ```bash
   COLLAB_PORT=8081 npm run collab:server
   ```
2. Update client URL in demo HTML

## Performance

### Optimizations

1. **Cursor throttling:** Max 10 updates/second
2. **Operation batching:** Group rapid edits
3. **Selective broadcasting:** Only to room members
4. **History pruning:** Keep last 100 operations
5. **Lazy comment loading:** On-demand fetching

### Scalability

Current implementation supports:
- **Users per room:** 50 (comfortable), 100 (maximum)
- **Operations per second:** ~1000 (single server)
- **Message size:** 10KB per edit, 1KB per comment

For larger deployments, consider:
- Redis pub/sub for multi-server setup
- PostgreSQL for persistent storage
- Load balancing with sticky sessions

## Future Enhancements

- [ ] Offline mode with sync on reconnect
- [ ] Persistent storage (PostgreSQL)
- [ ] Video/audio chat (WebRTC)
- [ ] Presence indicators (typing, active line)
- [ ] Version history and playback
- [ ] AI-powered proof suggestions
- [ ] Mobile-optimized UI
- [ ] End-to-end encryption

## Documentation

- [Architecture Diagram](./collaboration-architecture.md) - System design
- [Protocol Specification](./collaboration-protocol.md) - WebSocket protocol
- [API Reference](#api-reference) - Full API documentation

## License

Part of Formula Nebula project. See main project LICENSE file.
