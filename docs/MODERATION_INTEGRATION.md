# Moderation System Integration Guide
## Integrating Content Moderation with Formula Nebula

### Quick Start

```javascript
// Import moderation system
import {
  FlagContent,
  CommunityVote,
  AutoModerationScore,
  GetContentStatus,
  AppealDecision
} from './src/moderation.js';

import {
  createFlagUI,
  createVotingUI,
  createAutoModBadge,
  createModerationDashboard
} from './src/moderationUI.js';
```

---

## 1. Integrating with Proofs

### 1.1 Add Moderation to Proof Submission

```javascript
// In your proof submission handler
function submitProof(proofText, userId) {
  // Auto-moderate before submission
  const modResult = AutoModerationScore(proofText, {
    authorReputation: getUserReputation(userId)
  });
  
  if (modResult.recommendation === 'auto_hide') {
    showNotification('Your proof contains inappropriate content and cannot be submitted.');
    return null;
  }
  
  if (modResult.recommendation === 'flag_for_review') {
    showWarning('Your proof will be reviewed before publication.');
  }
  
  // Create proof with moderation metadata
  const proof = {
    id: generateProofId(),
    text: proofText,
    userId,
    timestamp: Date.now(),
    moderation: {
      autoModScore: modResult.toxicityScore,
      level: modResult.level,
      status: modResult.recommendation === 'flag_for_review' ? 'pending_review' : 'active'
    }
  };
  
  return proof;
}
```

### 1.2 Display Moderation Indicators

```javascript
function renderProof(proof) {
  const container = document.createElement('div');
  container.className = 'proof-container';
  
  // Main proof content
  const content = document.createElement('div');
  content.innerHTML = renderMathML(proof.text);
  container.appendChild(content);
  
  // Moderation badge
  if (proof.moderation && proof.moderation.autoModScore > 0) {
    const badge = createAutoModBadge(proof.text);
    container.appendChild(badge);
  }
  
  // Flag button
  const flagButton = document.createElement('button');
  flagButton.textContent = '🚩 Report';
  flagButton.onclick = () => showFlagDialog(proof.id, 'proof');
  container.appendChild(flagButton);
  
  return container;
}
```

### 1.3 Implement Flag Dialog

```javascript
function showFlagDialog(proofId, itemType) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const flagUI = createFlagUI(proofId, itemType, {
    userId: getCurrentUserId(),
    onSubmit: (flagId) => {
      modal.remove();
      showNotification('Report submitted successfully');
      
      // Optionally hide content for reporter
      markAsReported(proofId);
    },
    onCancel: () => {
      modal.remove();
    }
  });
  
  modal.appendChild(flagUI);
  document.body.appendChild(modal);
}
```

---

## 2. Integrating with Comments

### 2.1 Real-time Comment Moderation

```javascript
function handleCommentSubmit(commentText, userId, targetId) {
  // Pre-submit check
  const modResult = AutoModerationScore(commentText, {
    authorReputation: getUserReputation(userId)
  });
  
  // Block high-toxicity comments
  if (modResult.toxicityScore >= 0.85) {
    showError('Your comment violates community guidelines and cannot be posted.');
    return false;
  }
  
  // Warn on medium toxicity
  if (modResult.level === 'medium') {
    const confirmed = confirm(
      'Your comment may contain inappropriate content. Are you sure you want to post it?'
    );
    if (!confirmed) return false;
  }
  
  // Create comment
  const comment = {
    id: generateCommentId(),
    text: commentText,
    userId,
    targetId,
    timestamp: Date.now(),
    moderation: modResult
  };
  
  // Auto-flag if needed
  if (modResult.recommendation === 'flag_for_review') {
    FlagContent(comment.id, 'comment', 'auto_flagged', 'system', 
      `Auto-flagged: toxicity score ${modResult.toxicityScore.toFixed(2)}`);
  }
  
  return comment;
}
```

### 2.2 Display Comment with Voting

```javascript
function renderComment(comment) {
  const container = document.createElement('div');
  container.className = 'comment-container';
  
  // Comment text
  const text = document.createElement('p');
  text.textContent = comment.text;
  container.appendChild(text);
  
  // Check if comment is flagged
  const status = GetContentStatus(comment.id);
  
  if (status.status === 'under_review' || status.flags.length > 0) {
    // Show voting UI for flagged content
    const votingUI = createVotingUI(status.flags[0].flagId, {
      userId: getCurrentUserId(),
      userRole: getUserRole(),
      onVote: (result) => {
        if (result.actionTaken) {
          // Refresh comment status
          refreshCommentDisplay(comment.id);
        }
      }
    });
    container.appendChild(votingUI);
  } else {
    // Normal flag button
    const flagButton = document.createElement('button');
    flagButton.textContent = 'Flag';
    flagButton.onclick = () => showFlagDialog(comment.id, 'comment');
    container.appendChild(flagButton);
  }
  
  return container;
}
```

---

## 3. Moderation Dashboard

### 3.1 Create Admin Dashboard

```javascript
// In admin panel
function initModerationDashboard() {
  const dashboardContainer = document.getElementById('moderation-dashboard');
  
  const dashboard = createModerationDashboard(dashboardContainer);
  
  // Optionally add custom controls
  const refreshButton = document.createElement('button');
  refreshButton.textContent = 'Refresh';
  refreshButton.onclick = () => dashboard.refresh();
  
  dashboardContainer.prepend(refreshButton);
  
  return dashboard;
}
```

### 3.2 Moderator Tools

```javascript
// For moderators reviewing flagged content
function renderModerationQueue() {
  const stats = GetModerationStats();
  const pendingFlags = stats.flags.byStatus.pending || 0;
  
  const queue = document.createElement('div');
  queue.className = 'moderation-queue';
  
  // Queue header
  const header = document.createElement('h2');
  header.textContent = `Review Queue (${pendingFlags} pending)`;
  queue.appendChild(header);
  
  // Load and display pending flags
  // (In production, this would fetch from database)
  const flags = Array.from(moderationStore.flags.values())
    .filter(f => f.status === 'pending')
    .sort((a, b) => b.timestamp - a.timestamp);
  
  flags.forEach(flag => {
    const item = createFlagReviewItem(flag);
    queue.appendChild(item);
  });
  
  return queue;
}

function createFlagReviewItem(flag) {
  const item = document.createElement('div');
  item.className = 'flag-review-item';
  
  item.innerHTML = `
    <div class="flag-details">
      <strong>Item:</strong> ${flag.itemId}<br>
      <strong>Reason:</strong> ${flag.reason}<br>
      <strong>Reporter:</strong> ${flag.reporterId}<br>
      <strong>Details:</strong> ${flag.details || 'None'}
    </div>
    <div class="flag-actions">
      <button onclick="resolveFlag('${flag.flagId}', 'approved')">Approve</button>
      <button onclick="resolveFlag('${flag.flagId}', 'hidden')">Hide</button>
      <button onclick="resolveFlag('${flag.flagId}', 'deleted')">Delete</button>
    </div>
  `;
  
  return item;
}
```

---

## 4. User Reputation Integration

### 4.1 Track User Actions

```javascript
// Update reputation based on user actions
function onProofApproved(userId) {
  updateUserReputation(userId, +0.02);
}

function onContentFlagged(userId, upheld) {
  if (upheld) {
    updateUserReputation(userId, -0.15);
  }
}

function onFlagSubmitted(userId, accurate) {
  if (accurate) {
    updateUserReputation(userId, +0.05);
  } else {
    updateUserReputation(userId, -0.10);
  }
}

function updateUserReputation(userId, delta) {
  const currentRep = getUserReputation(userId);
  const newRep = Math.max(0, Math.min(1, currentRep + delta));
  setUserReputation(userId, newRep);
  
  // Update user's moderation treatment
  updateModerationThresholds(userId, newRep);
}
```

### 4.2 Display Reputation Badges

```javascript
function getUserBadge(reputation) {
  if (reputation >= 0.8) {
    return '<span class="badge trusted">🌟 Trusted</span>';
  } else if (reputation >= 0.6) {
    return '<span class="badge good">✓ Good</span>';
  } else if (reputation <= 0.2) {
    return '<span class="badge restricted">⚠ Restricted</span>';
  }
  return '';
}
```

---

## 5. Appeal Workflow

### 5.1 User Appeal Interface

```javascript
function showAppealInterface(flagId) {
  const status = GetContentStatus(itemId);
  
  if (!status.isAppealable) {
    alert('This content cannot be appealed');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const appealUI = createAppealUI(flagId, {
    userId: getCurrentUserId(),
    onSubmit: (reviewId) => {
      modal.remove();
      showNotification('Appeal submitted for review. You will be notified of the decision within 24 hours.');
    }
  });
  
  modal.appendChild(appealUI);
  document.body.appendChild(modal);
}
```

### 5.2 Moderator Appeal Review

```javascript
import { ReviewAppeal } from './src/moderation.js';

function handleAppealReview(reviewId, grant, notes) {
  const decision = ReviewAppeal(reviewId, getCurrentModeratorId(), grant, notes);
  
  // Notify user
  notifyUser(decision.userId, {
    title: grant ? 'Appeal Granted' : 'Appeal Rejected',
    message: notes,
    reviewId: decision.reviewId
  });
  
  // If granted, restore content
  if (grant) {
    restoreContent(decision.itemId);
  }
  
  return decision;
}
```

---

## 6. Statistics and Monitoring

### 6.1 Dashboard Widgets

```javascript
function createStatsWidget() {
  const widget = document.createElement('div');
  widget.className = 'stats-widget';
  
  const stats = GetModerationStats();
  
  widget.innerHTML = `
    <h3>Moderation Statistics</h3>
    <ul>
      <li>Total Flags: ${stats.flags.total}</li>
      <li>Pending Review: ${stats.flags.byStatus.pending || 0}</li>
      <li>Auto-Moderated: ${stats.summary.autoModerated}</li>
      <li>Community Moderated: ${stats.summary.communityModerated}</li>
      <li>Active Appeals: ${stats.appeals.total - stats.summary.appealsGranted - stats.summary.appealsRejected}</li>
    </ul>
    <div class="performance-metrics">
      <h4>Performance</h4>
      <p>Auto-Mod Accuracy: ${(stats.performance.autoModerationAccuracy * 100).toFixed(1)}%</p>
      <p>Avg Resolution Time: ${(stats.performance.averageResolutionTime / 3600000).toFixed(1)}h</p>
    </div>
  `;
  
  return widget;
}
```

### 6.2 Real-time Monitoring

```javascript
// Poll for statistics updates
function startModerationMonitoring(interval = 60000) {
  setInterval(() => {
    const stats = GetModerationStats();
    
    // Alert on anomalies
    if (stats.flags.byStatus.pending > 50) {
      alertModerators('High volume of pending flags!');
    }
    
    // Update dashboard
    updateDashboardStats(stats);
  }, interval);
}
```

---

## 7. Event Hooks

### 7.1 Moderation Events

```javascript
// Set up event listeners for moderation actions
document.addEventListener('moderationAction', (event) => {
  const { action, itemId, result } = event.detail;
  
  switch (action) {
    case 'flagged':
      console.log(`Content ${itemId} flagged`);
      break;
      
    case 'hidden':
      hideContentInUI(itemId);
      break;
      
    case 'deleted':
      removeContentFromUI(itemId);
      break;
      
    case 'approved':
      showContentInUI(itemId);
      break;
      
    case 'appeal_granted':
      restoreContentInUI(itemId);
      notifyContentAuthor(itemId, 'Your appeal was granted');
      break;
  }
});
```

---

## 8. Configuration

### 8.1 Customize Thresholds

```javascript
import { MODERATION_CONFIG } from './src/moderation.js';

// Adjust thresholds for your community
MODERATION_CONFIG.toxicityThresholds = {
  low: 0.25,    // More strict
  medium: 0.55,
  high: 0.80
};

MODERATION_CONFIG.votingThresholds.minVotesForAction = 3;  // Lower threshold for smaller community
```

### 8.2 Custom Patterns

```javascript
// Add domain-specific toxic patterns
MODERATION_CONFIG.toxicPatterns.push(
  /plagiarism/gi,
  /copied\s+from/gi
);
```

---

## 9. Testing Integration

```javascript
// Run moderation tests
import './tests/moderation.test.js';

// Or integrate into your test suite
describe('Proof Moderation', () => {
  it('should flag inappropriate proofs', () => {
    const proof = submitProof('This is offensive content', 'user123');
    expect(proof.moderation.level).not.toBe('safe');
  });
  
  it('should allow clean mathematical content', () => {
    const proof = submitProof('Let f(x) be a continuous function...', 'user123');
    expect(proof.moderation.level).toBe('safe');
  });
});
```

---

## 10. Production Deployment

### 10.1 Database Schema

```sql
-- Flags table
CREATE TABLE moderation_flags (
  flag_id VARCHAR(64) PRIMARY KEY,
  item_id VARCHAR(64) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  reason VARCHAR(50) NOT NULL,
  reporter_id VARCHAR(64) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  resolution VARCHAR(20),
  auto_mod_score FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_item (item_id),
  INDEX idx_status (status)
);

-- Votes table
CREATE TABLE moderation_votes (
  vote_id INT AUTO_INCREMENT PRIMARY KEY,
  flag_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  vote BOOLEAN NOT NULL,
  weight INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vote (flag_id, user_id),
  FOREIGN KEY (flag_id) REFERENCES moderation_flags(flag_id)
);

-- Appeals table
CREATE TABLE moderation_appeals (
  review_id VARCHAR(64) PRIMARY KEY,
  flag_id VARCHAR(64) NOT NULL,
  appellant_id VARCHAR(64) NOT NULL,
  appeal_text TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  moderator_id VARCHAR(64),
  decision BOOLEAN,
  moderator_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMP,
  FOREIGN KEY (flag_id) REFERENCES moderation_flags(flag_id)
);
```

### 10.2 API Endpoints

```javascript
// Express.js example
app.post('/api/moderation/flag', async (req, res) => {
  const { itemId, itemType, reason, details } = req.body;
  const userId = req.user.id;
  
  const flagId = FlagContent(itemId, itemType, reason, userId, details);
  await saveFlagToDatabase(flagId);
  
  res.json({ success: true, flagId });
});

app.post('/api/moderation/vote', async (req, res) => {
  const { flagId, vote } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;
  
  const result = CommunityVote(flagId, userId, vote, userRole);
  await saveVoteToDatabase(flagId, userId, vote);
  
  res.json({ success: true, result });
});
```

---

## Summary

The moderation system is now fully integrated with Formula Nebula. Key integration points:

1. ✅ Auto-moderation on submission
2. ✅ Flag/report UI for users
3. ✅ Community voting on flags
4. ✅ Moderation dashboard for admins
5. ✅ Appeal workflow
6. ✅ Reputation tracking
7. ✅ Statistics and monitoring
8. ✅ Database schema for production

For questions or customization needs, refer to `MODERATION_POLICY.md` and `MODERATION_ALGORITHM.md`.
