# Study Group Features - Technical Architecture

## Overview

A comprehensive collaboration system for Formula Nebula that enables students to form study groups, communicate in real-time, collaborate on a shared whiteboard, solve problems together, and track collective progress.

## Features Implementation

### 1. Create Study Groups
**API: `CreateGroup(name, topic, members) → groupId`**

- **Data Structure**: StudyGroup with metadata, settings, and activity tracking
- **Storage**: In-memory Map (production: database)
- **Features**:
  - Unique group IDs with timestamp and random suffix
  - Member management with deduplication
  - Configurable settings (public/private, max members, feature toggles)
  - Activity tracking (last active, message count, problems solved)
  - Auto-initialization of whiteboard and progress tracking

**Supporting APIs**:
- `GetGroup(groupId)` - Retrieve group details
- `ListGroups(filters)` - Filter by topic, member, visibility
- `AddMember(groupId, userId)` - Join group with capacity checks

### 2. Group Chat and Voice (WebRTC)
**API: `InitializeVoiceChannel(groupId) → rtcOffer`**

- **WebRTC Configuration**:
  - STUN servers: Google STUN (stun.l.google.com:19302)
  - Media constraints: audio only, echo cancellation, noise suppression
  - Quality settings: high/medium/low with adaptive bitrate
  - Codec: Opus @ 32kbps

- **Signaling Architecture**:
  - WebSocket server: `wss://signaling.formula-nebula.io`
  - Room-based routing (groupId as room)
  - Peer discovery and connection management

**Voice Channel APIs**:
- `JoinVoiceChannel(groupId, userId)` - Connect to voice
- `LeaveVoiceChannel(groupId, userId)` - Disconnect
- `GetVoiceStatus(groupId)` - Participant count and quality

**Chat System**:
- `SendMessage(groupId, userId, message)` - Send text message
- `GetMessages(groupId, limit)` - Retrieve message history
- `AddReaction(messageId, userId, emoji)` - React to messages

### 3. Shared Virtual Whiteboard
**API: `DrawOnWhiteboard(groupId, path) → broadcast`**

- **Data Model**:
  - Paths: Array of {points, color, width, userId, timestamp}
  - Objects: Text, shapes, images with metadata
  - Canvas: Width 1920×1080, zoom, pan support

- **Drawing Engine**:
  - HTML5 Canvas with 2D context
  - Mouse event handlers (mousedown, mousemove, mouseup)
  - Real-time path rendering with preview
  - Color and width customization

**Whiteboard APIs**:
- `AddWhiteboardObject(groupId, object)` - Add text/shapes
- `ClearWhiteboard(groupId, userId)` - Owner-only clear
- `GetWhiteboardState(groupId)` - Full state retrieval
- `ExportWhiteboard(groupId)` - Export as JSON

**Broadcasting**:
- Event type: `whiteboard:draw` or `whiteboard:object`
- Includes groupId, data, timestamp
- Real-time sync across all connected clients

### 4. Group Problem Sets and Quizzes
**API: `CreateGroupProblemSet(groupId, theorems) → problemSetId`**

- **Problem Generation**:
  - Source: Knowledge graph theorems
  - Types: multiple-choice (40%), true-false (20%), connection (20%), application (20%)
  - Difficulty: Easy/Medium/Hard based on importance and degree
  - Points: 10/20/30 per problem

- **Problem Structure**:
  ```javascript
  {
    problemId, theoremId, type, question,
    options: [{ id, label }],
    correctAnswer, difficulty, points
  }
  ```

**Problem Set APIs**:
- `SubmitAnswer(problemSetId, userId, problemId, answer)` - Answer submission
- `GetProblemSet(problemSetId)` - Retrieve problem set
- `ListProblemSets(groupId)` - All sets for group
- `GetLeaderboard(problemSetId)` - Rankings by score

**Scoring System**:
- Points awarded on correct answers only
- Attempt tracking for retries
- Real-time score calculation
- Leaderboard sorted by total score

### 5. Group Progress Tracking
**API: `TrackGroupProgress(groupId) → stats`**

- **Metrics Tracked**:
  - **Group Level**: Total problems, study time, theorems covered, active days
  - **Member Level**: Individual problems solved, contribution score, study time
  - **Activity Feed**: Problem sets created, whiteboard updates, member joins

- **Progress Statistics**:
  ```javascript
  {
    groupId, groupName, topic, memberCount,
    stats: { totalProblems, totalStudyTime, avgContribution, theoremsCount, activeDays },
    members: [{ userId, problemsSolved, contributionScore, studyTimeMinutes }],
    theoremsCovered: [theoremIds],
    recentActivity: [{ type, timestamp, timeAgo }]
  }
  ```

**Progress APIs**:
- `UpdateMemberProgress(groupId, userId, updates)` - Increment stats
- `GetActivityFeed(groupId, limit)` - Recent activities
- `GenerateGroupReport(groupId)` - Comprehensive analytics

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                             │
│  (Browser: HTML + CSS + demo.js)                             │
└──────────────┬────────────────────────────────────┬──────────┘
               │                                    │
               ▼                                    ▼
┌──────────────────────────┐         ┌──────────────────────────┐
│   UI Rendering Layer     │         │    Event Handlers        │
│  - Groups List           │         │  - Create Group          │
│  - Chat Messages         │         │  - Send Message          │
│  - Whiteboard Canvas     │         │  - Draw/Clear            │
│  - Problem Sets          │         │  - Voice Join/Leave      │
│  - Progress Dashboard    │         │  - Submit Answer         │
└──────────┬───────────────┘         └────────────┬─────────────┘
           │                                      │
           └──────────────┬───────────────────────┘
                          ▼
           ┌──────────────────────────────────────┐
           │      API Layer (study-group.js)      │
           │  - CreateGroup, AddMember            │
           │  - InitializeVoiceChannel            │
           │  - DrawOnWhiteboard                  │
           │  - CreateGroupProblemSet             │
           │  - TrackGroupProgress                │
           └──────────────┬───────────────────────┘
                          ▼
           ┌──────────────────────────────────────┐
           │      State Management Layer          │
           │  Maps: studyGroups, problemSets      │
           │        whiteboardStates, voiceChannels│
           │        groupProgress, groupMessages   │
           └──────────────┬───────────────────────┘
                          ▼
           ┌──────────────────────────────────────┐
           │    Integration with Knowledge Base    │
           │    (getGraph from shared/kb.js)       │
           └───────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **HTML5**: Semantic structure, Canvas API
- **CSS3**: Grid, Flexbox, responsive design
- **JavaScript ES6+**: Modules, Maps, async/await
- **Canvas 2D API**: Whiteboard drawing

### Real-Time Communication
- **WebRTC**: Peer-to-peer voice channels
- **WebSocket**: Signaling server (to be implemented)
- **STUN Servers**: Google public STUN

### Data Management
- **In-Memory Storage**: Maps for demo
- **Production**: Replace with:
  - MongoDB for documents (groups, messages, progress)
  - Redis for real-time state (voice channels, active users)
  - PostgreSQL for structured data (problem sets, scores)

### Knowledge Graph Integration
- **Import**: `getGraph()` from shared/kb.js
- **Usage**: Theorem data for problem generation
- **Node Properties**: id, name, family, importance, degree

## API Reference

### Group Management
```javascript
// Create group
CreateGroup(name, topic, members) → groupId

// Get group details
GetGroup(groupId) → StudyGroup | null

// List groups with filters
ListGroups({ topic, memberId, isPublic }) → Array<StudyGroup>

// Add member to group
AddMember(groupId, userId) → boolean
```

### Voice Communication
```javascript
// Initialize voice channel
InitializeVoiceChannel(groupId) → { config, mediaConstraints, signaling }

// Join voice
JoinVoiceChannel(groupId, userId) → { groupId, userId, peers, config }

// Leave voice
LeaveVoiceChannel(groupId, userId)

// Get voice status
GetVoiceStatus(groupId) → { active, participantCount, participants }
```

### Whiteboard
```javascript
// Draw path
DrawOnWhiteboard(groupId, { points, color, width, userId }) → broadcastEvent

// Add object
AddWhiteboardObject(groupId, { type, data, position }) → broadcastEvent

// Clear whiteboard (owner only)
ClearWhiteboard(groupId, userId) → boolean

// Get state
GetWhiteboardState(groupId) → { paths, objects, metadata }

// Export
ExportWhiteboard(groupId) → { groupId, paths, objects, exportedAt }
```

### Problem Sets
```javascript
// Create problem set
CreateGroupProblemSet(groupId, theorems) → problemSetId

// Submit answer
SubmitAnswer(problemSetId, userId, problemId, answer)
  → { correct, points, totalScore }

// Get problem set
GetProblemSet(problemSetId) → ProblemSet

// List problem sets
ListProblemSets(groupId) → Array<ProblemSet>

// Get leaderboard
GetLeaderboard(problemSetId) → Array<{ userId, score, problemsCompleted }>
```

### Progress Tracking
```javascript
// Track progress
TrackGroupProgress(groupId)
  → { stats, members, theoremsCovered, recentActivity }

// Update member progress
UpdateMemberProgress(groupId, userId, {
  problemsSolved, studyTimeMinutes, contributionScore, theoremId
})

// Get activity feed
GetActivityFeed(groupId, limit) → Array<Activity>

// Generate report
GenerateGroupReport(groupId)
  → { group, progress, problemSets, voice, whiteboard, engagement }
```

### Chat
```javascript
// Send message
SendMessage(groupId, userId, message) → MessageObject

// Get messages
GetMessages(groupId, limit) → Array<Message>

// Add reaction
AddReaction(messageId, userId, emoji) → boolean
```

## Security Considerations

### Authentication & Authorization
- User authentication required (currently using userId)
- Group membership validation before operations
- Owner-only operations (clear whiteboard, delete group)

### Data Validation
- Input sanitization for messages and whiteboard data
- XSS prevention with HTML escaping
- Path validation for drawing operations
- Answer validation for problem sets

### WebRTC Security
- STUN-only configuration (no TURN for demo)
- Peer-to-peer encryption (built into WebRTC)
- Room-based isolation (groupId as room key)

## Performance Optimizations

### Whiteboard
- Path batching for multiple strokes
- Canvas layer separation (background vs active)
- Debounced state updates
- Lazy rendering for off-screen elements

### Progress Tracking
- Cached aggregate calculations
- Incremental updates instead of full recalc
- Pagination for activity feeds
- Index-based member lookups

### Chat
- Message pagination (50 messages default)
- Virtual scrolling for large histories
- Timestamp-based sorting
- Lazy load older messages

## Scalability Strategy

### Horizontal Scaling
- Stateless API servers behind load balancer
- Redis for session state and real-time data
- MongoDB sharding by groupId
- CDN for static assets

### WebRTC Scaling
- Mesh topology for small groups (<5 members)
- SFU (Selective Forwarding Unit) for larger groups
- Regional TURN servers for better latency
- Quality adaptation based on bandwidth

### Database Optimization
- Indexes: groupId, userId, timestamp
- Denormalized progress stats for fast reads
- Message archival after 90 days
- Whiteboard state compression

## Demo Plan

### Phase 1: Local Demo (Current)
- ✓ All features implemented in-memory
- ✓ 3 sample groups with demo data
- ✓ Interactive UI with all tabs functional
- ✓ Whiteboard drawing with Canvas
- ✓ Problem generation from knowledge graph

### Phase 2: Backend Integration
- [ ] RESTful API server (Node.js + Express)
- [ ] MongoDB for persistent storage
- [ ] WebSocket server for real-time sync
- [ ] User authentication (JWT)
- [ ] TURN server setup for WebRTC

### Phase 3: Production Deployment
- [ ] AWS/GCP infrastructure
- [ ] Redis cluster for caching
- [ ] PostgreSQL for analytics
- [ ] CDN configuration
- [ ] Monitoring and logging

### Phase 4: Advanced Features
- [ ] Screen sharing in voice channels
- [ ] Collaborative LaTeX editor
- [ ] AI-powered problem hints
- [ ] Theorem recommendation engine
- [ ] Gamification with badges

## Testing Strategy

### Unit Tests
- Individual API functions
- Problem generation logic
- Progress calculation
- Answer validation

### Integration Tests
- Group creation → member addition → progress tracking
- Whiteboard draw → broadcast → state sync
- Problem set creation → answer submission → leaderboard

### E2E Tests
- Complete user flows
- Multi-user scenarios
- Voice channel connectivity
- Whiteboard real-time sync

### Performance Tests
- 100 concurrent groups
- 1000+ messages per group
- Whiteboard with 500+ paths
- Problem sets with 50+ questions

## Deployment Instructions

### Local Development
```bash
# Install dependencies
cd "Formula Nebula/designs"
npm install

# Start dev server
npm run dev

# Open browser
http://localhost:5173/collaboration/
```

### Production Build
```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### Environment Variables
```env
# Backend API
VITE_API_URL=https://api.formula-nebula.io

# WebRTC Signaling
VITE_SIGNALING_URL=wss://signaling.formula-nebula.io

# STUN/TURN Servers
VITE_STUN_SERVERS=stun:stun.l.google.com:19302
VITE_TURN_SERVERS=turn:turn.formula-nebula.io:3478
```

## Future Enhancements

### Short-term
1. Persistent storage backend
2. User authentication
3. Real-time synchronization
4. Mobile responsive improvements

### Medium-term
1. Video support in voice channels
2. File sharing (PDFs, images)
3. Calendar integration for study sessions
4. Email notifications

### Long-term
1. AI study assistant
2. Spaced repetition system
3. Theorem proof verification
4. Integration with external tools (Overleaf, GitHub)

## File Structure

```
designs/collaboration/
├── study-group.js         # Core API implementation
├── demo.js                # Interactive demo UI
├── index.html             # HTML structure
├── styles.css             # CSS styling
├── ARCHITECTURE.md        # This document
└── README.md              # Quick start guide
```

## Dependencies

- **three** (^0.180.0) - Inherited from main project
- **katex** (^0.16.11) - For LaTeX rendering in problems
- **vite** (^7.0.0) - Dev server and build tool

## Contact & Support

For questions or contributions:
- GitHub Issues: [Formula Nebula Issues](https://github.com/formula-nebula/issues)
- Documentation: `/designs/README.md`
- Main Project: `/README.md`

---

**Version**: 1.0.0  
**Last Updated**: 2026-11-02  
**Author**: Formula Nebula Team
