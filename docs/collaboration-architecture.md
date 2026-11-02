# Real-time Collaborative Editing Architecture

## System Overview

The collaborative editing system enables multiple users to simultaneously annotate mathematical proofs with real-time synchronization, cursor tracking, threaded comments, and automatic conflict resolution.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │   Browser    │  │   Browser    │          │
│  │   Client 1   │  │   Client 2   │  │   Client 3   │          │
│  │              │  │              │  │              │          │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │          │
│  │ │  Editor  │ │  │ │  Editor  │ │  │ │  Editor  │ │          │
│  │ │   UI     │ │  │ │   UI     │ │  │ │   UI     │ │          │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │          │
│  │      ▲       │  │      ▲       │  │      ▲       │          │
│  │      │       │  │      │       │  │      │       │          │
│  │ ┌────▼────┐  │  │ ┌────▼────┐  │  │ ┌────▼────┐  │          │
│  │ │ Realtime│  │  │ │ Realtime│  │  │ │ Realtime│  │          │
│  │ │  Collab │  │  │ │  Collab │  │  │ │  Collab │  │          │
│  │ └────┬────┘  │  │ └────┬────┘  │  │ └────┬────┘  │          │
│  └──────┼───────┘  └──────┼───────┘  └──────┼───────┘          │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          │    WebSocket    │    WebSocket    │    WebSocket
          │                 │                 │
          └────────────┬────┴────────┬────────┘
                       │             │
┌──────────────────────▼─────────────▼────────────────────────────┐
│                     Transport Layer                              │
│                                                                  │
│              WebSocket Server (ws://host:8080)                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                   Connection Manager                    │    │
│  │  • Maintains active client connections                 │    │
│  │  • Handles join/leave events                           │    │
│  │  • Routes messages to correct recipients               │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                       Business Logic Layer                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │   Room Manager   │  │   OT Engine      │  │   Comment     │ │
│  │                  │  │                  │  │   Manager     │ │
│  │ • Proof sessions │  │ • Transform ops  │  │               │ │
│  │ • User tracking  │  │ • Resolve        │  │ • Thread      │ │
│  │ • Version ctrl   │  │   conflicts      │  │   storage     │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                        Data Layer                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Proof      │  │  Operation   │  │   Comment    │          │
│  │   State      │  │   History    │  │   Threads    │          │
│  │              │  │              │  │              │          │
│  │ • Document   │  │ • Edit log   │  │ • Messages   │          │
│  │ • Versions   │  │ • Versions   │  │ • Metadata   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Client Layer

#### RealtimeCollaboration Class
**Location:** `src/collaboration/realtime.js`

**Responsibilities:**
- Establish and maintain WebSocket connection
- Send local edits to server
- Receive and apply remote edits
- Manage cursor synchronization
- Handle comment operations
- Emit events to UI layer

**Key Methods:**
```javascript
async connect()                                 // Connect to WebSocket server
async SyncProofEdits(proof, edit)              // Broadcast edit operations
ManageCursors(userId, position)                // Sync cursor positions
async ThreadComments(lineId, comment)          // Post threaded comments
ResolveConflicts(edit1, edit2)                 // Local conflict resolution
```

**State Management:**
- `activeUsers`: Map of connected users
- `proofState`: Current document state
- `localVersion`: Local document version
- `serverVersion`: Server acknowledged version
- `pendingOps`: Operations awaiting acknowledgment
- `commentThreads`: Line-indexed comment storage

### 2. Operational Transform (OT) Engine

#### OperationalTransform Class
**Location:** `src/collaboration/ot/transform.js`

**Algorithm:** Based on Jupiter synchronization protocol

**Transformation Rules:**
- INSERT vs INSERT: Position adjustment based on temporal order
- INSERT vs DELETE: Position recalculation considering deletions
- DELETE vs INSERT: Shift delete range for insertions
- DELETE vs DELETE: Calculate non-overlapping portions

**Conflict Resolution Strategy:**
1. Determine operation priority (user ID + timestamp)
2. Transform lower-priority operation against higher-priority
3. Apply both operations in consistent order
4. Emit conflict-resolved event

**Key Methods:**
```javascript
transform(opA, opB)                            // Transform opA against opB
resolve(edit1, edit2)                          // Resolve conflicting edits
transformInsertInsert(opA, opB)                // INSERT-INSERT transformation
transformInsertDelete(opA, opB)                // INSERT-DELETE transformation
transformDeleteInsert(opA, opB)                // DELETE-INSERT transformation
transformDeleteDelete(opA, opB)                // DELETE-DELETE transformation
```

### 3. Server Layer

#### CollabServer Class
**Location:** `src/collaboration/server/CollabServer.js`

**Responsibilities:**
- Accept WebSocket connections
- Manage rooms (proof sessions)
- Broadcast operations to all clients
- Maintain authoritative document version
- Store comment threads
- Handle user presence

**Room Structure:**
```javascript
{
  version: 0,                    // Authoritative version number
  state: ProofDocument,          // Current document state
  users: Set<userId>,            // Active users in room
  comments: Map<lineId, []>      // Comment threads by line
}
```

**Message Types:**
- `join`: User joins session
- `welcome`: Server sends initial state
- `edit`: Document edit operation
- `ack`: Server acknowledges edit
- `cursor`: Cursor position update
- `comment`: New comment
- `comment-resolve`: Mark comment resolved
- `user-joined`: New user notification
- `user-left`: User disconnect notification

### 4. Data Flow

#### Edit Operation Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Client1 │                    │  Server │                    │ Client2 │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ 1. Local edit                │                              │
     ├────────────┐                 │                              │
     │            │                 │                              │
     │<───────────┘                 │                              │
     │                              │                              │
     │ 2. Send edit op              │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ 3. Apply & increment version │
     │                              ├────────────┐                 │
     │                              │            │                 │
     │                              │<───────────┘                 │
     │                              │                              │
     │ 4. Ack                       │                              │
     │<─────────────────────────────┤                              │
     │                              │                              │
     │                              │ 5. Broadcast to others       │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │                              │ 6. Transform
     │                              │                              │    & apply
     │                              │                              ├────────┐
     │                              │                              │        │
     │                              │                              │<───────┘
```

#### Cursor Synchronization Flow

```
Client A                           Server                         Client B
   │                                 │                               │
   │ Move cursor                     │                               │
   ├───────┐                         │                               │
   │       │                         │                               │
   │<──────┘                         │                               │
   │                                 │                               │
   │ Send cursor position            │                               │
   ├────────────────────────────────>│                               │
   │                                 │                               │
   │                                 │ Broadcast to others           │
   │                                 ├──────────────────────────────>│
   │                                 │                               │
   │                                 │                               │ Render remote
   │                                 │                               │ cursor
   │                                 │                               ├──────────┐
   │                                 │                               │          │
   │                                 │                               │<─────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Multiple WebSocket server instances
- Redis pub/sub for inter-server communication
- Shared operation history in distributed cache
- Sticky sessions for connection affinity

### Performance Optimizations
1. **Operation Batching:** Group multiple rapid edits
2. **Cursor Throttling:** Limit cursor update frequency (100ms)
3. **Selective Broadcasting:** Only send to active room members
4. **Operation History Pruning:** Keep last 100 operations per room
5. **Lazy Comment Loading:** Load threads on-demand

### Connection Management
- Automatic reconnection with exponential backoff
- Operation replay after reconnection
- Heartbeat/ping mechanism (30s interval)
- Graceful degradation on network issues

## Security Considerations

1. **Authentication:** JWT tokens in WebSocket handshake
2. **Authorization:** Room-level access control
3. **Rate Limiting:** Max 100 operations/minute per user
4. **Input Validation:** Sanitize all text content
5. **XSS Prevention:** Escape HTML in comments
6. **Size Limits:** 
   - Max edit size: 10KB
   - Max comment: 1000 chars
   - Max proof document: 1MB

## Monitoring & Observability

### Metrics
- Active connections
- Operations per second
- Average latency (edit → ack)
- Conflict resolution rate
- Room statistics

### Logging
- Connection events (join/leave)
- Error events
- Performance bottlenecks
- Conflict resolution details

## Future Enhancements

1. **Persistence Layer:** PostgreSQL for permanent storage
2. **History Playback:** Replay edit history
3. **Video Chat:** WebRTC integration
4. **Presence Indicators:** Typing indicators, active line highlights
5. **Offline Mode:** Local-first with sync on reconnect
6. **Version Control:** Git-like branching and merging
7. **AI Assistance:** Real-time proof suggestions
8. **Mobile Support:** Touch-optimized UI
