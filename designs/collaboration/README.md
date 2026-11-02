# Study Group Hub - Quick Start Guide

## Overview

Real-time collaboration platform for Formula Nebula students. Form study groups, discuss theorems, solve problems together, and track collective progress.

## Features

1. **Study Groups** - Create topic-focused groups with up to 50 members
2. **Voice Chat** - WebRTC-powered audio communication
3. **Whiteboard** - Shared drawing canvas for visual collaboration
4. **Problem Sets** - Auto-generated quizzes from knowledge graph
5. **Progress Tracking** - Member contributions and group analytics

## Quick Start

### 1. Launch Demo

```bash
cd "Formula Nebula/designs"
npm run dev
```

Open: http://localhost:5173/collaboration/

### 2. Explore Features

**Groups Sidebar**
- 3 pre-loaded demo groups
- Click any group to switch

**Chat Tab**
- Type messages and press Enter
- Demo messages already loaded

**Whiteboard Tab**
- Click and drag to draw
- Clear button resets canvas
- Export saves as JSON

**Problems Tab**
- View generated problem sets
- Click "View Problems" to see details
- Leaderboard shows top performers

**Progress Tab**
- Group statistics
- Member contributions
- Recent activity feed

### 3. Create Your Own Group

1. Click "+ Create Group" in header
2. Enter group name and topic
3. Group appears in sidebar
4. Auto-initialized with whiteboard and progress tracking

## API Examples

### Create a Group

```javascript
import { CreateGroup } from './study-group.js'

const groupId = CreateGroup(
  'Algebraic Geometry 101',
  'Schemes and Varieties',
  ['alice', 'bob', 'charlie']
)
// Returns: 'group_1730577600000_abc123def'
```

### Initialize Voice

```javascript
import { InitializeVoiceChannel, JoinVoiceChannel } from './study-group.js'

const rtcOffer = InitializeVoiceChannel(groupId)
// Returns WebRTC config with STUN servers

const peerInfo = JoinVoiceChannel(groupId, 'alice')
// Returns: { groupId, userId, peers: ['bob', 'charlie'], config }
```

### Draw on Whiteboard

```javascript
import { DrawOnWhiteboard } from './study-group.js'

const broadcastEvent = DrawOnWhiteboard(groupId, {
  points: [{ x: 100, y: 100 }, { x: 150, y: 150 }],
  color: '#007bff',
  width: 2,
  userId: 'alice'
})
// Returns broadcast event for real-time sync
```

### Create Problem Set

```javascript
import { CreateGroupProblemSet } from './study-group.js'

const theorems = [
  'Riemann-Roch',
  'Bezout',
  'Chow',
  'Hirzebruch-Riemann-Roch'
]

const problemSetId = CreateGroupProblemSet(groupId, theorems)
// Auto-generates 4 problems with varying difficulty
```

### Track Progress

```javascript
import { TrackGroupProgress } from './study-group.js'

const stats = TrackGroupProgress(groupId)
// Returns: {
//   stats: { totalProblems, totalStudyTime, theoremsCount, activeDays },
//   members: [{ userId, problemsSolved, contributionScore }],
//   theoremsCovered: [...],
//   recentActivity: [...]
// }
```

## Architecture Overview

```
┌─────────────────┐
│   UI Layer      │  demo.js + index.html + styles.css
│  (Rendering)    │
└────────┬────────┘
         │
┌────────▼────────┐
│  API Layer      │  study-group.js
│  (Business)     │  - CreateGroup, DrawOnWhiteboard, etc.
└────────┬────────┘
         │
┌────────▼────────┐
│  State Layer    │  Maps (studyGroups, problemSets, etc.)
│  (Storage)      │  In-memory for demo, DB for production
└────────┬────────┘
         │
┌────────▼────────┐
│ Knowledge Base  │  shared/kb.js → src/data/knowledge.js
│  (Theorems)     │
└─────────────────┘
```

## Key Functions

### Group Management
- `CreateGroup(name, topic, members)` → groupId
- `GetGroup(groupId)` → group object
- `ListGroups(filters)` → array of groups
- `AddMember(groupId, userId)` → boolean

### Voice Communication
- `InitializeVoiceChannel(groupId)` → RTC config
- `JoinVoiceChannel(groupId, userId)` → peer info
- `LeaveVoiceChannel(groupId, userId)`
- `GetVoiceStatus(groupId)` → status object

### Whiteboard
- `DrawOnWhiteboard(groupId, path)` → broadcast event
- `AddWhiteboardObject(groupId, object)` → broadcast event
- `ClearWhiteboard(groupId, userId)` → boolean
- `ExportWhiteboard(groupId)` → JSON data

### Problem Sets
- `CreateGroupProblemSet(groupId, theorems)` → problemSetId
- `SubmitAnswer(problemSetId, userId, problemId, answer)` → result
- `GetLeaderboard(problemSetId)` → rankings

### Progress Tracking
- `TrackGroupProgress(groupId)` → stats object
- `UpdateMemberProgress(groupId, userId, updates)`
- `GetActivityFeed(groupId, limit)` → activities

### Chat
- `SendMessage(groupId, userId, message)` → message object
- `GetMessages(groupId, limit)` → messages array
- `AddReaction(messageId, userId, emoji)` → boolean

## Demo Data

### Pre-loaded Groups

1. **Algebraic Geometry Basics**
   - Topic: Schemes and Varieties
   - Members: 4
   - Problem sets: 1

2. **Cohomology Theory**
   - Topic: Sheaf Cohomology
   - Members: 3
   - Problem sets: 1

3. **Riemann-Roch Theorem**
   - Topic: Classical Algebraic Geometry
   - Members: 3
   - Problem sets: 1

Each group includes:
- Demo chat messages
- Initialized whiteboard
- Progress tracking data
- 1 problem set with 4-5 problems

## File Structure

```
collaboration/
├── study-group.js      # Core API (418 lines)
├── demo.js             # UI & event handlers (463 lines)
├── index.html          # HTML structure (121 lines)
├── styles.css          # CSS styling (573 lines)
├── ARCHITECTURE.md     # Technical documentation
└── README.md           # This file
```

## Customization

### Change Voice Quality

```javascript
// In study-group.js, modify InitializeVoiceChannel
const channel = {
  quality: 'high',  // Options: 'high', 'medium', 'low'
  codec: 'opus',
  bitrate: 32000    // Adjust for quality/bandwidth tradeoff
}
```

### Customize Problem Types

```javascript
// In study-group.js, modify selectProblemType weights
const types = ['multiple-choice', 'true-false', 'connection', 'application']
const weights = [0.4, 0.2, 0.2, 0.2]  // Adjust distribution
```

### Adjust Whiteboard Size

```javascript
// In index.html, modify canvas dimensions
<canvas id="whiteboard-canvas" width="1200" height="600"></canvas>
```

### Change Group Capacity

```javascript
// In study-group.js, modify CreateGroup defaults
settings: {
  maxMembers: 50  // Change to desired limit
}
```

## Troubleshooting

### Canvas not drawing
- Check browser console for errors
- Ensure canvas element is fully loaded
- Verify whiteboard tab is active

### Voice not connecting
- WebRTC requires HTTPS or localhost
- Check browser permissions for microphone
- STUN servers may be blocked by firewall

### Problem sets empty
- Ensure theorems exist in knowledge graph
- Check `getGraph()` returns valid data
- Verify theorem IDs match knowledge base

### Progress not updating
- Call `UpdateMemberProgress()` after actions
- Check group and user IDs are correct
- Verify progress object initialized

## Performance Tips

1. **Limit whiteboard complexity**
   - Clear canvas periodically
   - Batch path updates
   - Use lower resolution for complex drawings

2. **Optimize chat rendering**
   - Paginate messages (default: 50)
   - Virtual scroll for large histories
   - Debounce render calls

3. **Reduce problem set size**
   - Start with 5-10 problems
   - Load more on demand
   - Cache generated problems

## Next Steps

1. **Try Creating Groups** - Experiment with different topics
2. **Test Voice** - Connect with multiple browser tabs
3. **Draw on Whiteboard** - Collaborate visually
4. **Solve Problems** - Test problem generation
5. **View Progress** - Check analytics dashboard

## Integration with Main Project

### Use Study Groups in Atlas

```javascript
// In designs/atlas/index.js
import { CreateGroup } from '../collaboration/study-group.js'

function createStudyGroupForTheorem(theoremId) {
  const node = graph.nodes.find(n => n.id === theoremId)
  const groupId = CreateGroup(
    `Study: ${node.name}`,
    node.family,
    [currentUser]
  )
  // Launch collaboration/index.html with groupId
}
```

### Link Problem Sets to Map

```javascript
// In designs/map/index.js
import { CreateGroupProblemSet } from '../collaboration/study-group.js'

function generateQuizForPath(path) {
  const theorems = path.map(nodeId => nodeId)
  const problemSetId = CreateGroupProblemSet(currentGroup, theorems)
  // Redirect to collaboration/index.html#problems
}
```

## API Cheat Sheet

| Function | Input | Output |
|----------|-------|--------|
| `CreateGroup` | name, topic, members | groupId |
| `InitializeVoiceChannel` | groupId | rtcOffer |
| `DrawOnWhiteboard` | groupId, path | broadcast |
| `CreateGroupProblemSet` | groupId, theorems | problemSetId |
| `TrackGroupProgress` | groupId | stats |
| `SendMessage` | groupId, userId, message | messageObj |

## Resources

- **Full Documentation**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Main Project**: [../../README.md](../../README.md)
- **Knowledge Base**: [../shared/kb.js](../shared/kb.js)
- **Designs Overview**: [../README.md](../README.md)

## License

Part of Formula Nebula project. See main project LICENSE.

---

**Version**: 1.0.0  
**Created**: 2026-11-02  
**Status**: Demo Ready
