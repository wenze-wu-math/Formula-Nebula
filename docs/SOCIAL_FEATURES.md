# Social Learning Features Documentation

## Overview

The Social Learning Features system adds collaborative and gamified elements to Formula Nebula, enabling users to:
- Track their learning progress
- Connect with other mathematicians
- Share achievements
- Compete on leaderboards
- Earn badges for accomplishments

## Data Schema

### User Profile

```typescript
interface UserProfile {
  userId: string                    // Unique identifier
  username: string                  // Display name
  avatar: AvatarData                // Avatar representation
  bio: string                       // User biography
  joinedAt: Date                    // Registration timestamp
  stats: UserStats                  // Learning statistics
  preferences: UserPreferences      // Privacy/display preferences
  badges: string[]                  // Array of earned badge IDs
  level: number                     // Derived from XP
  xp: number                        // Experience points
}

interface AvatarData {
  type: 'color'                     // Avatar type
  color: string                     // Background color (#hex)
  initials: string                  // User initials
}

interface UserStats {
  proofsViewed: number              // Total proofs viewed
  proofsUnderstood: number          // Proofs marked as understood
  theoremsProved: number            // Formal proofs written
  contributionsCount: number        // Total contributions
  learningStreak: number            // Current daily streak
  totalStudyTime: number            // Total minutes studied
  specializations: string[]         // Mathematical areas mastered
  following: number                 // Count (derived)
  followers: number                 // Count (derived)
}

interface UserPreferences {
  visibility: 'public' | 'followers' | 'private'
  showActivity: boolean             // Show in activity feeds
}
```

### Follow Relationship

```typescript
interface Follow {
  followId: string                  // Unique follow ID
  followerId: string                // User who is following
  followingId: string               // User being followed
  followedAt: Date                  // Timestamp
  notifications: boolean            // Receive notifications
}
```

### Activity

```typescript
interface Activity {
  activityId: string                // Unique activity ID
  userId: string                    // User who performed action
  type: ActivityType                // Activity type (see below)
  metadata: Record<string, any>     // Activity-specific data
  timestamp: Date                   // When it occurred
  visibility: 'public' | 'followers' | 'private'
}

enum ActivityType {
  PROOF_VIEWED = 'proof_viewed',
  PROOF_UNDERSTOOD = 'proof_understood',
  THEOREM_PROVED = 'theorem_proved',
  BADGE_EARNED = 'badge_earned',
  LEVEL_UP = 'level_up',
  CONTRIBUTION = 'contribution',
  FOLLOWED_USER = 'followed_user',
  STARTED_LEARNING_PATH = 'started_learning_path',
  COMPLETED_LEARNING_PATH = 'completed_learning_path',
}
```

### Badge

```typescript
interface Badge {
  badgeId: string                   // Unique identifier
  name: string                      // Badge name
  description: string               // Achievement description
  icon: string                      // Emoji/icon
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  criteria: BadgeCriteria           // Unlock requirements
  rarity: number                    // Percentage of users (0-1)
}

type BadgeCriteria = {
  [key: string]: number             // e.g., { proofsViewed: 50 }
}
```

### Leaderboard Entry

```typescript
interface LeaderboardEntry {
  rank: number                      // Current rank
  userId: string                    // User identifier
  username: string                  // Display name
  avatar: AvatarData                // Avatar
  score: number                     // Score for metric
  badges: string[]                  // Top badges
  level: number                     // User level
  change: 'up' | 'down' | 'same'   // Rank change
  changeAmount: number              // Amount changed
}
```

## API Functions

### Core Functions

#### `getCurrentUserId(): string`
Get or create the current user ID. Creates a demo user if none exists.

#### `GetUserProfile(userId: string): UserProfile | null`
Retrieve a user's profile with derived fields (level, following/followers counts).

#### `updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null`
Update user profile fields.

#### `updateUserStats(userId: string, stats: Partial<UserStats>): UserProfile | null`
Update user statistics, calculate XP gain, check badge unlocks.

### Follow System

#### `FollowUser(userId: string, targetId: string): Follow`
Follow another user. Returns existing follow if already following.

**Throws:** Error if trying to follow yourself

#### `UnfollowUser(userId: string, targetId: string): boolean`
Unfollow a user. Returns true if successful.

#### `isFollowing(userId: string, targetId: string): boolean`
Check if user is following another user.

#### `getFollowing(userId: string): UserProfile[]`
Get list of users that a user is following.

#### `getFollowers(userId: string): UserProfile[]`
Get list of users following a user.

### Activity Feed

#### `GetActivityFeed(userId: string, limit: number = 50): Activity[]`
Get activity feed for a user, filtered by following relationships and visibility settings.

**Returns:** Activities from users the current user follows, sorted by newest first.

#### `recordActivity(userId: string, type: ActivityType, metadata: object): Activity | null`
Record a new activity. Respects user's `showActivity` preference.

### Leaderboards

#### `ComputeLeaderboard(metric: string, limit: number = 100): LeaderboardEntry[]`
Compute rankings for a specific metric.

**Supported metrics:**
- `proofsViewed` - Total proofs viewed
- `proofsUnderstood` - Proofs understood
- `theoremsProved` - Formal proofs written
- `contributions` - Total contributions
- `level` - User level
- `xp` - Total experience points
- `streak` - Current learning streak
- `studyTime` - Total study time

### Badges & Achievements

#### `AwardBadge(userId: string, badgeId: string): AchievementResult`
Award a badge to a user.

**Returns:**
```typescript
{
  success: boolean,
  badge?: Badge,
  xpGained?: number,
  reason?: string
}
```

#### `getUserBadges(userId: string): Badge[]`
Get all badges earned by a user, sorted by tier (highest first).

#### `checkBadgeUnlocks(userId: string, profile: UserProfile): void`
Internal function that checks and awards badges based on user stats. Called automatically when stats are updated.

### Tracking Functions

These functions are meant to be called from the main application when events occur:

#### `trackProofView(proofId: string, proofTitle: string): void`
Track when a user views a proof.

#### `trackProofUnderstood(proofId: string, proofTitle: string): void`
Track when a user marks a proof as understood.

#### `trackTheoremProved(theoremId: string, theoremTitle: string): void`
Track when a user completes a formal proof.

#### `trackContribution(contributionType: string, details: object): void`
Track user contributions (annotations, corrections, etc).

#### `updateLearningStreak(): void`
Update the user's learning streak. Should be called daily or on app startup.

### Utility Functions

#### `searchUsers(query: string, limit: number = 20): UserSearchResult[]`
Search for users by username. Excludes private profiles.

#### `initializeSocialFeatures(): void`
Initialize social features on app startup. Creates user if needed, updates streak.

## Badge Definitions

### Exploration Badges

| Badge | Tier | Criteria | Icon |
|-------|------|----------|------|
| First Steps | Bronze | View 1 proof | 👣 |
| Curious Explorer | Silver | View 50 proofs | 🔍 |
| Theorem Hunter | Gold | View 200 proofs | 🎯 |

### Understanding Badges

| Badge | Tier | Criteria | Icon |
|-------|------|----------|------|
| Apprentice | Bronze | Understand 10 proofs | 🎓 |
| Scholar | Silver | Understand 50 proofs | 📚 |
| Master Mathematician | Gold | Understand 100 proofs | 🏆 |

### Contribution Badges

| Badge | Tier | Criteria | Icon |
|-------|------|----------|------|
| Contributor | Bronze | Make 1 contribution | ✨ |
| Active Contributor | Silver | Make 25 contributions | 🌟 |

### Streak Badges

| Badge | Tier | Criteria | Icon |
|-------|------|----------|------|
| Dedicated | Bronze | 7-day streak | 🔥 |
| Unstoppable | Gold | 30-day streak | ⚡ |

### Formal Verification Badges

| Badge | Tier | Criteria | Icon |
|-------|------|----------|------|
| Proof Writer | Silver | Write 1 formal proof | 📝 |
| Proof Master | Gold | Write 10 formal proofs | 🖋️ |

### Specialization Badges

| Badge | Tier | Criteria | Icon |
|-------|------|----------|------|
| Specialist | Platinum | Master 1 area | 💎 |
| Polymath | Platinum | Master 3 areas | 🌈 |

### Social Badges

| Badge | Tier | Criteria | Icon |
|-------|------|----------|------|
| Networker | Bronze | Follow 10 users | 🤝 |
| Influencer | Gold | Have 50 followers | 👥 |

## XP & Leveling System

### XP Gains

| Action | XP Awarded |
|--------|------------|
| View a proof | 10 XP |
| Understand a proof | 50 XP |
| Prove a theorem | 200 XP |
| Make a contribution | 100 XP |
| Earn bronze badge | 100 XP |
| Earn silver badge | 250 XP |
| Earn gold badge | 500 XP |
| Earn platinum badge | 1000 XP |

### Level Calculation

```
level = floor(sqrt(xp / 100)) + 1
```

**Examples:**
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 400 XP
- Level 5: 1,600 XP
- Level 10: 8,100 XP

## Storage

Data is stored in localStorage with the following keys:

- `social:currentUser` - Current user ID
- `social:profiles:<userId>` - User profiles
- `social:follows:<followId>` - Follow relationships
- `social:activities:<activityId>` - Activities
- `social:badges` - Badge definitions
- `social:userBadges:<userId>` - User badge assignments
- `social:leaderboardCache` - Cached leaderboard data

## UI Components

### Social Hub

Main interface accessed via the social hub button. Contains five tabs:

#### 1. Profile Tab
- Avatar display
- Level and XP progress bar
- Bio editor
- Statistics dashboard
- Recent badges showcase
- Privacy settings

#### 2. Feed Tab
- Activity feed from followed users
- Activity cards with:
  - User avatar and name
  - Activity type icon
  - Activity description
  - Timestamp
- Empty state with "Discover Users" button

#### 3. Leaderboard Tab
- Metric selector (6 metrics)
- Ranked list of users
- Special styling for top 3
- Highlight current user
- Shows badges and level

#### 4. Network Tab
- User search functionality
- Two sub-tabs:
  - Following list
  - Followers list
- Follow/Unfollow buttons
- User cards with stats

#### 5. Badges Tab
- Earned badges section
- Locked badges with progress
- Badge cards showing:
  - Icon
  - Name
  - Description
  - Tier
  - Progress (for locked)
  - Rarity (for earned)

### Integration Button

A button should be added to the main UI to open the social hub:

```javascript
import { showSocialHub } from './socialHub.js'

// Add button to UI
const socialButton = document.createElement('button')
socialButton.textContent = '🌟 Social'
socialButton.onclick = showSocialHub
```

## Integration Points

### 1. Proof Viewer Integration

```javascript
import { trackProofView, trackProofUnderstood } from './social.js'

// When user opens a proof
trackProofView(proofId, proofTitle)

// When user marks proof as understood
trackProofUnderstood(proofId, proofTitle)
```

### 2. Formal Verification Integration

```javascript
import { trackTheoremProved } from './social.js'

// When user completes a formal proof
trackTheoremProved(theoremId, theoremTitle)
```

### 3. Contribution Tracking

```javascript
import { trackContribution } from './social.js'

// When user makes a contribution
trackContribution('annotation', {
  nodeId: 'node_123',
  content: 'User annotation...'
})
```

### 4. App Initialization

```javascript
import { initializeSocialFeatures } from './social.js'

// In main.js or app startup
initializeSocialFeatures()
```

### 5. CSS Import

Add to your main CSS or import in main.js:

```javascript
import './socialHub.css'
```

## Privacy & Visibility

Users can control their visibility through three levels:

1. **Public** - Profile and activities visible to everyone
2. **Followers** - Visible only to users who follow them
3. **Private** - Profile hidden from leaderboards, activities not shown

Users can also toggle whether their activities appear in feeds regardless of visibility level.

## Performance Considerations

- Activities are limited to 50 per feed query
- Leaderboards are limited to 100 entries
- User search is limited to 20 results
- Storage uses in-memory caching for frequently accessed data
- Consider implementing pagination for large datasets in future versions

## Future Enhancements

Potential improvements for future versions:

1. **Server Backend**
   - Move from localStorage to server storage
   - Real-time activity updates via WebSocket
   - Persistent leaderboard rankings

2. **Advanced Features**
   - Study groups/teams
   - Challenges and competitions
   - Mentorship system
   - Comments on activities
   - Achievement showcases

3. **Analytics**
   - Learning trends
   - Time spent on topics
   - Difficulty progression
   - Personalized recommendations

4. **Social Features**
   - Direct messaging
   - Profile customization
   - Badge showcases
   - User-generated content

5. **Gamification**
   - Daily quests
   - Seasonal events
   - Special limited-time badges
   - Multiplayer challenges

## Testing

Key scenarios to test:

1. User profile creation on first use
2. Stat updates and XP calculation
3. Badge unlocking triggers
4. Follow/unfollow flow
5. Activity feed filtering
6. Leaderboard ranking correctness
7. Privacy settings enforcement
8. Streak calculation and maintenance
9. Search functionality
10. UI responsiveness on various screen sizes
