# Learning Path Recommendation System

## Overview

A personalized learning path recommendation system for Formula Nebula that tracks user progress, suggests theorems based on prerequisites, adapts to engagement patterns, and creates custom curricula between mathematical topics.

---

## Core Algorithms

### 1. **Prerequisite Resolution Algorithm**

**Purpose**: Build dependency graph of theorem prerequisites

**Method**: `GetPrerequisites(theoremId) → [TheoremId]`

**Algorithm**:
```
GetPrerequisites(theoremId):
  prerequisites = Set()
  
  # From proof dependencies
  IF theorem.proof.dependencies EXISTS:
    FOR EACH dep IN theorem.proof.dependencies:
      ADD dep TO prerequisites
  
  # From proof steps
  IF theorem.proof.steps EXISTS:
    FOR EACH step IN theorem.proof.steps:
      IF step.uses EXISTS:
        FOR EACH use IN step.uses:
          ADD use.id TO prerequisites
  
  # From graph links (edges with "requires" type)
  FOR EACH edge IN graph.links:
    IF edge.target == theoremId AND edge.type CONTAINS "requires":
      ADD edge.source TO prerequisites
  
  RETURN Array(prerequisites)
```

**Complexity**: O(D + S + E) where:
- D = number of dependencies
- S = number of proof steps
- E = number of graph edges

**Caching**: Results cached per theorem to avoid recomputation

---

### 2. **Suitability Ranking Algorithm**

**Purpose**: Rank candidate theorems by how well they match user's current level

**Method**: `RankBySuitability(user, candidates) → sorted[(theoremId, score, reason)]`

**Scoring Components** (0-100 scale):

#### a) Prerequisite Readiness (40 points max)
```
PrerequisiteScore(user, theorem):
  prerequisites = GetPrerequisites(theorem)
  
  IF prerequisites.isEmpty():
    RETURN 40  # Foundation theorem, always ready
  
  masteredCount = COUNT(p IN prerequisites WHERE user.masteredTheorems.has(p))
  ratio = masteredCount / prerequisites.length
  
  IF ratio == 1.0:
    RETURN 40  # All prerequisites mastered
  ELSE IF ratio >= 0.7:
    RETURN 30  # Most prerequisites ready
  ELSE IF ratio >= 0.4:
    RETURN 15  # Some prerequisites missing
  ELSE:
    RETURN 5   # Many prerequisites not ready
```

#### b) Difficulty Match (25 points max)
```
DifficultyScore(user, theorem):
  # Estimate theorem difficulty (0-1 scale)
  difficulty = 0.5  # baseline
  difficulty += MIN(theorem.proof.steps.length / 20, 0.2)
  difficulty += MIN(theorem.proof.dependencies.length / 10, 0.15)
  difficulty += theorem.importance * 0.15
  difficulty = MIN(difficulty, 1.0)
  
  # Compare with user level
  userLevel = user.overallLevel / 100
  gap = ABS(difficulty - userLevel)
  
  IF gap < 0.1:
    RETURN 25  # Perfect match
  ELSE IF gap < 0.2:
    RETURN 20  # Good match
  ELSE IF gap < 0.3:
    RETURN 12  # Acceptable
  ELSE:
    RETURN 5   # Mismatch
```

#### c) Family Preference (15 points max)
```
FamilyScore(user, theorem):
  IF user.preferences.preferredFamilies.isEmpty():
    RETURN 7  # Neutral
  
  IF user.preferences.preferredFamilies.includes(theorem.family):
    RETURN 15  # Matches preference
  ELSE:
    RETURN 3
```

#### d) Importance/Centrality (10 points max)
```
ImportanceScore(theorem):
  RETURN theorem.importance * 10
```

#### e) Novelty (10 points max)
```
NoveltyScore(user, theorem):
  progress = user.theorems.get(theorem)
  
  IF progress IS NULL:
    RETURN 10  # New theorem
  ELSE IF progress.visits < 2:
    RETURN 7   # Barely explored
  ELSE IF progress.visits < 5:
    RETURN 4
  ELSE:
    RETURN 1   # Already well-explored
```

**Total Score**: Sum of all components (0-100)

**Output**: Candidates sorted by score (descending)

---

### 3. **Curriculum Builder Algorithm**

**Purpose**: Create learning path from start topic to target topic

**Method**: `CreateCurriculum(startTopic, targetTopic, difficulty) → [Theorem]`

**Algorithm**:
```
CreateCurriculum(startTopic, targetTopic, difficulty, user):
  # 1. Resolve topics to theorem IDs
  startTheorems = ResolveToTheorems(startTopic)
  targetTheorems = ResolveToTheorems(targetTopic)
  
  # 2. Find learning paths using BFS
  paths = []
  FOR EACH start IN startTheorems:
    FOR EACH target IN targetTheorems:
      path = FindLearningPath(start, target, difficulty, user)
      IF path NOT EMPTY:
        ADD path TO paths
  
  # 3. Score paths
  bestPath = MAX(paths, key=PathScore)
  
  # 4. Return with order annotations
  RETURN EnrichPath(bestPath)


FindLearningPath(start, target, difficulty, user):
  # BFS with prerequisite awareness
  queue = [[start]]
  visited = {start}
  maxDepth = 15
  
  WHILE queue NOT EMPTY:
    path = queue.dequeue()
    current = path.last()
    
    IF path.length > maxDepth:
      CONTINUE
    
    # Get theorems that depend on current
    dependents = GetDependents(current)
    
    FOR EACH next IN dependents:
      IF next IN visited:
        CONTINUE
      
      ADD next TO visited
      newPath = path + [next]
      
      IF next == target:
        RETURN EnrichPath(newPath)
      
      queue.enqueue(newPath)
  
  # No direct path found - create general curriculum
  RETURN CreateGeneralCurriculum(start, target, difficulty, user)


CreateGeneralCurriculum(start, target, difficulty, user):
  curriculum = []
  
  # Get all prerequisites of target
  targetPrereqs = GetAllPrerequisites(target)
  
  # Filter already mastered
  candidates = FILTER(targetPrereqs, WHERE NOT user.masteredTheorems.has)
  
  # Rank by suitability
  ranked = RankBySuitability(user, candidates)
  
  # Limit by difficulty
  maxSteps = difficulty == 'easy' ? 5 : difficulty == 'medium' ? 8 : 12
  
  FOR i = 0 TO MIN(maxSteps, ranked.length):
    ADD {theoremId: ranked[i], reason: "Prerequisite", order: i+1} TO curriculum
  
  # Add target as final step
  ADD {theoremId: target, reason: "Learning goal", order: curriculum.length+1}
  
  RETURN curriculum


PathScore(path, user):
  # Average suitability minus length penalty
  scores = [ComputeSuitabilityScore(user, item) FOR item IN path]
  avgScore = SUM(scores) / scores.length
  lengthPenalty = path.length * 2
  
  RETURN avgScore - lengthPenalty
```

**Complexity**: O(N * M * D) where:
- N = number of start theorems
- M = number of target theorems  
- D = average dependency depth

**Optimization**: Path finding limited to depth 15 to prevent infinite loops

---

### 4. **Progress Tracking Algorithm**

**Purpose**: Track user interactions and compute mastery status

**Method**: `TrackProgress(userId, theoremId, timeSpent, understanding)`

**Algorithm**:
```
TrackProgress(userId, theoremId, timeSpent, understanding):
  progress = LoadUserProgress(userId)
  
  # Get or create theorem progress
  theoremProgress = progress.theorems.get(theoremId)
  IF theoremProgress IS NULL:
    theoremProgress = CreateEmptyProgress(theoremId)
    progress.theorems.set(theoremId, theoremProgress)
  
  # Update metrics
  theoremProgress.timeSpent += timeSpent
  theoremProgress.visits += 1
  theoremProgress.lastVisited = NOW()
  
  IF understanding IS NOT NULL:
    theoremProgress.understandingScore = understanding
  
  # Auto-classify mastery status
  ClassifyTheoremStatus(progress, theoremId)
  
  # Recompute overall level
  ComputeOverallLevel(progress)
  
  # Persist
  SaveProgress(progress)
  
  RETURN theoremProgress


ClassifyTheoremStatus(progress, theoremId):
  tp = progress.theorems.get(theoremId)
  
  # Mastery criteria
  isMastered = (
    tp.understandingScore >= 4 AND
    tp.completionRate >= 0.8 AND
    tp.visits >= 3 AND
    tp.timeSpent >= 180  # 3 minutes
  ) OR (
    tp.understandingScore == 5 AND
    tp.completionRate == 1.0
  )
  
  IF isMastered:
    progress.masteredTheorems.add(theoremId)
    progress.inProgressTheorems.remove(theoremId)
  ELSE IF tp.visits > 0:
    progress.inProgressTheorems.add(theoremId)


ComputeOverallLevel(progress):
  level = 0
  
  # Base score from mastered theorems
  level += progress.masteredTheorems.size * 5
  
  # Partial credit from in-progress
  level += progress.inProgressTheorems.size * 1.5
  
  # Bonus for high-importance theorems
  FOR EACH theoremId IN progress.masteredTheorems:
    theorem = GetTheorem(theoremId)
    IF theorem.importance >= 0.85:
      level += 5
  
  progress.overallLevel = MIN(ROUND(level), 100)
```

**Persistence**: All progress stored in localStorage as JSON

**Privacy**: Data stays local, never transmitted

---

## Data Structures

### UserProgress
```typescript
{
  userId: string
  theorems: Map<string, TheoremProgress>
  overallLevel: number              // 0-100
  masteredTheorems: Set<string>
  inProgressTheorems: Set<string>
  preferences: {
    preferredFamilies: string[]
    difficultyLevel: 'easy' | 'medium' | 'hard'
    learningStyle: 'visual' | 'proof-heavy' | 'balanced'
    sessionDuration: number         // minutes
  }
}
```

### TheoremProgress
```typescript
{
  theoremId: string
  timeSpent: number                 // seconds
  visits: number
  understandingScore: number        // 0-5
  completionRate: number            // 0-1
  firstVisited: Date
  lastVisited: Date
  proofStepsCompleted: string[]
  exported: boolean
  explored: boolean                 // used advanced features
}
```

---

## UI Components

### 1. Learning Path Panel (Right Sidebar)

```
┌─────────────────────────────────────┐
│  🎯 学习路径                    ×  │
├─────────────────────────────────────┤
│  当前等级                            │
│  ┌─────────────────────────────┐   │
│  │  50  ████████░░░░░░░░░░░░░  │   │
│  └─────────────────────────────┘   │
│                                      │
│  ✓ 已掌握: 12    ⋯ 学习中: 5       │
│  ⏱ 总学时: 240m  ★ 理解度: 4.2     │
├─────────────────────────────────────┤
│  [💡 推荐] [📚 课程] [📊 进度]     │
├─────────────────────────────────────┤
│  推荐定理:                          │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 1 希尔伯特零点定理           │   │
│  │   匹配度: 87/100              │   │
│  │   All prerequisites mastered  │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 2 诺特正规化引理             │   │
│  │   匹配度: 75/100              │   │
│  │   Good difficulty match       │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 3 局部化                     │   │
│  │   匹配度: 68/100              │   │
│  │   New theorem                 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Features**:
- Collapsible panel (slides from right)
- Toggle button in top-right corner
- Real-time stats update
- Click theorem to open proof view
- Hover shows full recommendation details

---

### 2. Curriculum Builder Tab

```
┌─────────────────────────────────────┐
│  创建学习路径                        │
│                                      │
│  起点主题: [foundation          ▾]  │
│  目标主题: [cohomology          ▾]  │
│  难度:     [中等 (8步)          ▾]  │
│                                      │
│  [    生成学习路径    ]             │
│                                      │
│  ─────────────────────────────────  │
│                                      │
│  学习路径 (6 步)                    │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ① 扎里斯基闭集               │   │
│  │   Starting theorem            │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ② 理想—簇对应                │   │
│  │   Stepping stone              │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ③ 希尔伯特零点定理           │   │
│  │   Stepping stone              │   │
│  └─────────────────────────────┘   │
│                                      │
│         ... 3 more steps ...        │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ⑥ 上同调基础                 │   │
│  │   Target theorem              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Features**:
- Smart topic resolution (accepts IDs or family names)
- Visual path with numbered steps
- Click any step to jump to that theorem
- Export path as study checklist
- Difficulty adjusts step count

---

### 3. Progress Tracking Tab

```
┌─────────────────────────────────────┐
│  学习记录                            │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 希尔伯特零点定理      ✓ 已掌握 │   │
│  │ ⏱ 45m  👁 7次  ★ 5/5  100%  │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 诺特环              ⋯ 学习中   │   │
│  │ ⏱ 18m  👁 3次  ★ 3/5  60%   │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 局部化              ○ 已浏览   │   │
│  │ ⏱ 5m   👁 1次  ★ 0/5  20%   │   │
│  └─────────────────────────────┘   │
│                                      │
│         ... more theorems ...       │
│                                      │
│  [导出进度] [导入进度] [清除数据]  │
└─────────────────────────────────────┘
```

**Features**:
- Sorted by last visited (most recent first)
- Color-coded status badges
- Engagement metrics at a glance
- Export/import for backup
- Click to revisit theorem

---

### 4. Understanding Feedback Prompt

```
┌───────────────────────────────────┐
│  理解程度如何？                    │
│                                    │
│  [ ★ ] [ ★ ] [ ★ ] [ ★ ] [ ★ ]   │
│   1     2     3     4     5        │
│                                    │
│  [        稍后        ]           │
└───────────────────────────────────┘
```

**Behavior**:
- Appears 2 seconds after opening proof
- Auto-hides after 15 seconds if no action
- Rating instantly updates progress
- Non-intrusive bottom-right position

---

### 5. Mastery Achievement Notification

```
        ┌─────────────────────────┐
        │                          │
        │           🎉             │
        │                          │
        │       掌握成就           │
        │   希尔伯特零点定理       │
        │                          │
        │  ─────────────────────  │
        │                          │
        │  推荐下一步              │
        │                          │
        │  ┌───────────────────┐  │
        │  │ 诺特正规化引理     │  │
        │  │ 匹配度: 87/100     │  │
        │  └───────────────────┘  │
        │                          │
        │  ┌───────────────────┐  │
        │  │ 概形基础           │  │
        │  │ 匹配度: 75/100     │  │
        │  └───────────────────┘  │
        │                          │
        │  [   继续当前学习   ]   │
        │                          │
        └─────────────────────────┘
```

**Trigger**: Automatic when mastery criteria met
- Understanding ≥ 4 AND completion ≥ 80% AND visits ≥ 3 AND time ≥ 3min
- OR understanding = 5 AND completion = 100%

**Features**:
- Center-screen modal with animation
- Top 3 next recommendations
- Click to immediately jump
- Auto-closes after 10 seconds

---

## Integration with Proof Explorer

### Auto-tracking Features

1. **Step Completion Tracking**
   - Hooks into `ProofStepHighlighter.focusStep()`
   - Records each step focus as completion
   - Updates `completionRate` automatically

2. **Explorer Usage Detection**
   - Tracks when user:
     - Uses dependency graph visualization
     - Searches for theorem usages
     - Exports to LaTeX
     - Compares alternate proofs
   - Sets `explored: true` flag
   - Contributes to mastery assessment

3. **Session Timing**
   - Automatic timer starts on proof open
   - Pauses when window loses focus
   - Saves on proof close or page navigation
   - Accumulated into `timeSpent` metric

4. **Prerequisite Hints in Popups**
   - Theorem hover popups show:
     - "✓ 已掌握" if user mastered it
     - "⚡ 前置定理" if prerequisite of current
   - Helps user understand learning path context

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+L` | Toggle learning path panel |
| `Ctrl+Shift+M` | Mark current theorem as mastered |
| `Ctrl+Shift+N` | Show next recommendations |

---

## Performance Considerations

### Caching Strategy
- Prerequisite resolution cached per theorem
- User progress cached in memory, persisted on change
- Recommendation rankings recomputed only when user stats change

### Storage Optimization
- localStorage limit: ~5MB
- Typical user progress: ~50KB for 100 theorems
- Automatic pruning of old data after 1 year

### Computation Complexity
| Operation | Complexity | Notes |
|-----------|-----------|--------|
| Get Prerequisites | O(D + S + E) | Cached |
| Rank Candidates | O(N * P) | N candidates, P=prerequisites |
| Create Curriculum | O(M * D^2) | BFS with depth limit |
| Track Progress | O(1) | Direct map access |

---

## Future Enhancements

### Planned Features
1. **Spaced Repetition**: Schedule review of mastered theorems
2. **Peer Comparison**: Anonymous leaderboards
3. **Learning Streaks**: Gamification with daily goals
4. **Smart Difficulty Adjustment**: Machine learning-based
5. **Collaborative Paths**: Share custom curricula
6. **Study Groups**: Multi-user progress sync

### ML Integration
- Predict mastery time based on user patterns
- Personalized difficulty estimation per theorem
- Anomaly detection for stuck users
- Recommendation diversity optimization

---

## API Reference

### Core Classes

#### `LearningPathManager`
Main orchestration class.

```javascript
const manager = new LearningPathManager(graph)

// Get recommendations
const recommendations = manager.getRecommendations(userId, count=5)
// Returns: [{theoremId, score, reason}, ...]

// Create curriculum
const curriculum = manager.createCurriculum(userId, start, target, difficulty)
// Returns: [{theoremId, reason, order}, ...]

// Track progress
manager.trackProgress(userId, theoremId, timeSpent, understanding)

// Get statistics
const stats = manager.getUserStats(userId)
// Returns: {totalTheoremsStudied, masteredCount, ...}

// Export/Import
const json = manager.exportProgress()
manager.importProgress(jsonString)
```

#### `PrerequisiteResolver`
Dependency graph analysis.

```javascript
const resolver = new PrerequisiteResolver(graph)

// Get direct prerequisites
const prereqs = resolver.GetPrerequisites(theoremId)

// Get all transitive prerequisites
const all = resolver.GetAllPrerequisites(theoremId)

// Get theorems that depend on this one
const dependents = resolver.GetDependents(theoremId)

// Check if ready to study
const ready = resolver.ArePrerequisitesMastered(theoremId, masteredSet)

// Get foundation theorems (no prerequisites)
const foundations = resolver.GetFoundationTheorems()
```

#### `SuitabilityRanker`
Score and rank candidate theorems.

```javascript
const ranker = new SuitabilityRanker(graph, prerequisiteResolver)

// Rank candidates
const ranked = ranker.RankBySuitability(userProgress, candidateIds)
// Returns: [{theoremId, score, reason}, ...] sorted by score

// Score single theorem
const result = ranker.computeSuitabilityScore(userProgress, theoremId)
// Returns: {score, reason}
```

#### `CurriculumBuilder`
Create learning paths.

```javascript
const builder = new CurriculumBuilder(graph, prerequisiteResolver, suitabilityRanker)

// Create curriculum
const curriculum = builder.CreateCurriculum(
  startTopic,      // theorem ID or family name
  targetTopic,     // theorem ID or family name
  difficulty,      // 'easy' | 'medium' | 'hard'
  userProgress     // optional
)
// Returns: [{theoremId, reason, order}, ...]
```

#### `ProgressTracker`
Track and persist user interactions.

```javascript
const tracker = new ProgressTracker(graph, storage)

// Track interaction
tracker.TrackProgress(userId, theoremId, timeSpent, understanding)

// Session management
tracker.startSession(userId, theoremId)
tracker.endSession()

// Record specific events
tracker.recordStepCompletion(userId, theoremId, stepId)
tracker.recordExport(userId, theoremId)
tracker.recordExplorerUsage(userId, theoremId)

// Mark mastery
tracker.markAsMastered(userId, theoremId)

// Get statistics
const stats = tracker.getStats(userId)
```

---

## Example Usage

### Initialize System
```javascript
import { initLearningPath } from './learningPathIntegration.js'

// After graph and proof view are ready
const integration = initLearningPath(graph, proofView, proofExplorer)
```

### Get Personalized Recommendations
```javascript
const recommendations = integration.manager.getRecommendations('user123', 5)
recommendations.forEach(rec => {
  console.log(`${rec.theoremId}: ${rec.score}/100 - ${rec.reason}`)
})
```

### Create Custom Curriculum
```javascript
const curriculum = integration.manager.createCurriculum(
  'user123',
  'foundation',        // start from foundation family
  'riemann-roch',      // goal: Riemann-Roch theorem
  'medium'             // medium difficulty
)

curriculum.forEach(step => {
  console.log(`Step ${step.order}: ${step.theoremId} (${step.reason})`)
})
```

### Track User Interaction
```javascript
// User spent 5 minutes on a theorem and rated understanding as 4/5
integration.manager.trackProgress('user123', 'nullstellensatz', 300, 4)

// Mark theorem as mastered
integration.manager.progressTracker.markAsMastered('user123', 'nullstellensatz')
```

### Export Progress
```javascript
// Export to JSON file
integration.exportProgress()

// Import from file input
const fileInput = document.getElementById('import-file')
fileInput.addEventListener('change', (e) => {
  integration.importProgress(e.target.files[0])
})
```

---

## Testing

### Unit Tests
```javascript
// Test prerequisite resolution
const resolver = new PrerequisiteResolver(graph)
const prereqs = resolver.GetPrerequisites('nullstellensatz')
assert(prereqs.includes('ideal-variety'))
assert(prereqs.includes('noetherian'))

// Test suitability scoring
const ranker = new SuitabilityRanker(graph, resolver)
const score = ranker.computeSuitabilityScore(userProgress, 'localization')
assert(score.score >= 0 && score.score <= 100)

// Test curriculum creation
const builder = new CurriculumBuilder(graph, resolver, ranker)
const curriculum = builder.CreateCurriculum('foundation', 'cohomology', 'medium')
assert(curriculum.length > 0)
assert(curriculum[0].order === 1)
assert(curriculum[curriculum.length - 1].reason.includes('goal'))
```

### Integration Tests
```javascript
// Test full workflow
const integration = initLearningPath(graph, proofView, proofExplorer)

// Simulate user interaction
integration.setCurrentTheorem('nullstellensatz')
integration.manager.trackProgress('test-user', 'nullstellensatz', 300, 4)

// Check recommendations update
const recs = integration.manager.getRecommendations('test-user', 5)
assert(recs.length === 5)
assert(recs[0].score >= recs[4].score)  // sorted by score

// Check mastery notification
integration.manager.progressTracker.markAsMastered('test-user', 'nullstellensatz')
// Should trigger showMasteryNotification()
```

---

## License

Part of Formula Nebula project. See main LICENSE file.

---

## Contact

For questions or contributions, open an issue in the Formula Nebula repository.
