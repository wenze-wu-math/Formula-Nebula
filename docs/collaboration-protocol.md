# Real-time Collaboration Protocol Specification

## Protocol Version: 1.0

## Overview

This document specifies the WebSocket-based protocol for real-time collaborative proof editing. The protocol enables multiple clients to synchronize edits, cursor positions, and comments with operational transform-based conflict resolution.

## Connection Establishment

### WebSocket Handshake

```
GET ws://server:8080/ HTTP/1.1
Host: server:8080
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: <base64-key>
Sec-WebSocket-Version: 13
```

Optional authentication header:
```
Authorization: Bearer <jwt-token>
```

### Connection Lifecycle

1. **CONNECTING:** TCP handshake in progress
2. **OPEN:** WebSocket established, awaiting join
3. **JOINED:** User joined room, receiving updates
4. **CLOSING:** Graceful shutdown initiated
5. **CLOSED:** Connection terminated

## Message Format

All messages are JSON-encoded with the following structure:

```typescript
interface Message {
  type: string;           // Message type identifier
  timestamp?: number;     // Unix timestamp (milliseconds)
  [key: string]: any;     // Type-specific payload
}
```

## Message Types

### 1. Client → Server Messages

#### JOIN
User joins a proof editing session.

```json
{
  "type": "join",
  "userId": "user-abc123",
  "userName": "Alice",
  "proofId": "proof-xyz789",
  "timestamp": 1698765432000
}
```

**Fields:**
- `userId` (string, required): Unique user identifier
- `userName` (string, required): Display name
- `proofId` (string, optional): Proof document ID (default: "default")
- `timestamp` (number, required): Request timestamp

**Response:** Server sends `WELCOME` message

---

#### EDIT
Send an edit operation to the document.

```json
{
  "type": "edit",
  "operation": {
    "userId": "user-abc123",
    "version": 42,
    "edit": {
      "type": "insert",
      "position": {
        "line": 5,
        "column": 12
      },
      "content": "∀x ∈ ℝ, ",
      "metadata": {
        "selectionStart": 12,
        "selectionEnd": 12
      }
    },
    "timestamp": 1698765433000
  }
}
```

**Edit Types:**

1. **INSERT**
```json
{
  "type": "insert",
  "position": { "line": 5, "column": 12 },
  "content": "text to insert"
}
```

2. **DELETE**
```json
{
  "type": "delete",
  "position": { "line": 5, "column": 12 },
  "length": 10
}
```

3. **REPLACE**
```json
{
  "type": "replace",
  "position": { "line": 5, "column": 12 },
  "length": 10,
  "content": "replacement text"
}
```

4. **ANNOTATE**
```json
{
  "type": "annotate",
  "lineId": "line-5",
  "annotation": {
    "style": "highlight",
    "color": "#FFEB3B",
    "note": "This step needs clarification"
  }
}
```

**Response:** Server sends `ACK` message

---

#### CURSOR
Update cursor position.

```json
{
  "type": "cursor",
  "userId": "user-abc123",
  "position": {
    "line": 5,
    "column": 12,
    "selection": {
      "start": { "line": 5, "column": 12 },
      "end": { "line": 5, "column": 20 }
    }
  },
  "timestamp": 1698765434000
}
```

**Fields:**
- `position.line` (number): 0-indexed line number
- `position.column` (number): 0-indexed column number
- `position.selection` (object, optional): Text selection range

**Response:** Broadcast to all other clients (no ack)

---

#### COMMENT
Post a comment on a specific line.

```json
{
  "type": "comment",
  "comment": {
    "id": "comment-123",
    "lineId": "line-5",
    "author": "Alice",
    "authorId": "user-abc123",
    "text": "Should we use a different approach here?",
    "replyTo": null,
    "timestamp": 1698765435000,
    "resolved": false
  }
}
```

**Fields:**
- `id` (string): Unique comment identifier
- `lineId` (string): Target line identifier
- `author` (string): Display name
- `authorId` (string): User ID
- `text` (string): Comment content (max 1000 chars)
- `replyTo` (string, optional): Parent comment ID for threading
- `resolved` (boolean): Resolution status

**Response:** Broadcast to all clients including sender

---

#### COMMENT-RESOLVE
Mark a comment as resolved.

```json
{
  "type": "comment-resolve",
  "commentId": "comment-123",
  "timestamp": 1698765436000
}
```

**Response:** Broadcast to all clients

---

### 2. Server → Client Messages

#### WELCOME
Sent after successful join with initial room state.

```json
{
  "type": "welcome",
  "proofState": {
    "content": "Theorem: ∀x ∈ ℝ, x² ≥ 0\n\nProof: ...",
    "lines": [
      { "id": "line-1", "content": "Theorem: ∀x ∈ ℝ, x² ≥ 0" },
      { "id": "line-2", "content": "" },
      { "id": "line-3", "content": "Proof: ..." }
    ],
    "annotations": {},
    "edits": []
  },
  "version": 42,
  "users": [
    { "userId": "user-abc123", "userName": "Alice" },
    { "userId": "user-def456", "userName": "Bob" }
  ],
  "comments": {
    "line-5": [
      {
        "id": "comment-100",
        "lineId": "line-5",
        "author": "Bob",
        "authorId": "user-def456",
        "text": "This looks correct",
        "timestamp": 1698765000000,
        "resolved": false
      }
    ]
  }
}
```

---

#### USER-JOINED
Notify clients when a new user joins.

```json
{
  "type": "user-joined",
  "userId": "user-ghi789",
  "userName": "Charlie",
  "timestamp": 1698765437000
}
```

---

#### USER-LEFT
Notify clients when a user disconnects.

```json
{
  "type": "user-left",
  "userId": "user-abc123",
  "timestamp": 1698765438000
}
```

---

#### ACK
Acknowledge received edit operation.

```json
{
  "type": "ack",
  "version": 43,
  "timestamp": 1698765439000
}
```

**Fields:**
- `version` (number): New server document version

---

#### EDIT (Broadcast)
Broadcast edit from another user.

```json
{
  "type": "edit",
  "operation": {
    "userId": "user-def456",
    "version": 43,
    "edit": {
      "type": "insert",
      "position": { "line": 6, "column": 0 },
      "content": "Q.E.D."
    },
    "timestamp": 1698765440000
  }
}
```

---

#### ERROR
Server error notification.

```json
{
  "type": "error",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many operations. Please slow down.",
  "timestamp": 1698765441000
}
```

**Error Codes:**
- `INVALID_MESSAGE`: Malformed message
- `UNAUTHORIZED`: Authentication failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `ROOM_FULL`: Maximum users reached
- `INVALID_OPERATION`: Edit cannot be applied
- `SERVER_ERROR`: Internal server error

---

## Operational Transform Protocol

### Version Synchronization

Each client maintains two version numbers:
- **Local Version:** Next version for local edits
- **Server Version:** Last acknowledged server version

Server maintains authoritative version number.

### Edit Application Flow

1. Client applies edit locally (optimistic update)
2. Client increments local version
3. Client sends EDIT message to server
4. Server transforms edit against concurrent operations
5. Server increments version and applies edit
6. Server sends ACK to originating client
7. Server broadcasts transformed EDIT to other clients
8. Other clients transform and apply received edit

### Transformation Algorithm

When client receives remote edit with version V:

```javascript
function applyRemoteEdit(remoteOp) {
  let transformedOp = remoteOp;
  
  // Transform against all pending local operations
  for (const pendingOp of this.pendingOps) {
    if (pendingOp.version > remoteOp.version) {
      transformedOp = OT.transform(transformedOp, pendingOp);
    }
  }
  
  // Apply transformed operation
  applyToDocument(transformedOp);
  
  // Update server version
  this.serverVersion = remoteOp.version;
}
```

### Conflict Resolution Priority

When two operations conflict:
1. Compare user IDs (lexicographic order)
2. If equal, compare timestamps (earlier wins)
3. Transform lower-priority operation

---

## Position Encoding

### Line-Column Format

Positions use 0-indexed line and column numbers:

```json
{
  "line": 5,    // 0-indexed line number
  "column": 12  // 0-indexed UTF-16 code unit offset
}
```

**Note:** Column offsets are in UTF-16 code units (JavaScript string indices), not Unicode code points or grapheme clusters.

### Selection Ranges

Text selections are encoded as start and end positions:

```json
{
  "start": { "line": 5, "column": 12 },
  "end": { "line": 5, "column": 20 }
}
```

Empty selection (cursor): `start === end`

---

## Rate Limiting

### Client Limits

- **Edits:** 100 operations/minute
- **Cursors:** 10 updates/second (throttled client-side)
- **Comments:** 30 comments/minute
- **Message Size:** Max 10KB per edit, 1KB per comment

### Server Responses

Rate limit exceeded → Send ERROR message with code `RATE_LIMIT_EXCEEDED`

Clients should implement exponential backoff when rate limited.

---

## Connection Management

### Heartbeat

Server sends ping frames every 30 seconds.
Clients must respond with pong.

If no pong received within 10 seconds, server closes connection.

### Reconnection

On disconnect, clients should:
1. Wait 1 second
2. Attempt reconnection
3. On failure, double wait time (max 30 seconds)
4. On success, send JOIN message with last known version

Server should:
- Send WELCOME with current state
- Include operations since client's last version

### Graceful Shutdown

Client initiates close:
```javascript
ws.close(1000, "User closed tab");
```

Server initiates close:
```javascript
ws.close(1001, "Server shutdown");
```

---

## Security

### Authentication

Optional JWT token in initial handshake:
```
Authorization: Bearer <jwt-token>
```

Token should contain:
- `userId`: User identifier
- `exp`: Expiration timestamp
- `rooms`: Allowed proof IDs (optional)

### Message Validation

Server must validate:
- User ID matches authenticated identity
- Message size within limits
- Content properly escaped
- Rate limits not exceeded
- Version numbers sequential

### Content Sanitization

- Escape HTML entities in comments
- Strip control characters from text
- Validate UTF-8 encoding
- Reject messages with null bytes

---

## Examples

### Complete Session Flow

```
Client                          Server                          Other Clients
  │                               │                                  │
  ├─ JOIN ──────────────────────>│                                  │
  │                               │                                  │
  │<────────────────── WELCOME ──┤                                  │
  │                               │                                  │
  │                               ├─ USER-JOINED ─────────────────>│
  │                               │                                  │
  ├─ EDIT ──────────────────────>│                                  │
  │                               │                                  │
  │<─────────────────────── ACK ─┤                                  │
  │                               │                                  │
  │                               ├─ EDIT (broadcast) ────────────>│
  │                               │                                  │
  │                               │<────────────────── CURSOR ──────┤
  │                               │                                  │
  │<───────────────── CURSOR ────┤                                  │
  │                               │                                  │
  ├─ COMMENT ───────────────────>│                                  │
  │                               │                                  │
  │<─────────────────── COMMENT ─┤                                  │
  │                               │                                  │
  │                               ├─ COMMENT ──────────────────────>│
  │                               │                                  │
  │ (disconnect)                  │                                  │
  │                               │                                  │
  │                               ├─ USER-LEFT ────────────────────>│
```

---

## Change Log

### Version 1.0 (2026-11-02)
- Initial protocol specification
- WebSocket-based communication
- Operational transform support
- Cursor synchronization
- Threaded comments
- Rate limiting
- Authentication support

---

## References

- [RFC 6455: The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [Operational Transformation in Real-Time Collaboration](https://dl.acm.org/doi/10.1145/289444.289469)
- [Jupiter: A Toolkit for Collaborative Editing](https://dl.acm.org/doi/10.1145/215585.215706)
