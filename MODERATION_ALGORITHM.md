# Content Moderation Algorithm Specification
## Formula Nebula - Technical Implementation

### Executive Summary

This document describes the technical algorithms powering Formula Nebula's content moderation system, providing a detailed breakdown of scoring formulas, decision trees, and implementation patterns.

---

## 1. Auto-Moderation Scoring Algorithm

### 1.1 Overall Toxicity Score Formula

```
toxicityScore = min((patternScore × 0.4 + heuristicScore × 0.6) / 100, 1.0)

Where:
- patternScore: Sum of weighted pattern matches (0-100)
- heuristicScore: Sum of heuristic violations (0-100)
- Final score normalized to [0, 1] range
```

### 1.2 Pattern-Based Detection

**Pattern Matching:**
```javascript
for each pattern in TOXIC_PATTERNS:
  matches = text.match(pattern)
  if matches:
    patternScore += severity(pattern) × matches.length
```

**Severity Mapping:**
```
Pattern Index | Type              | Severity Weight | Example
-------------|-------------------|-----------------|------------------
0            | Profanity         | 40              | f*ck, sh*t
1            | Personal Attacks  | 35              | idiot, stupid
2            | Spam Indicators   | 20              | click here, buy now
3            | URL Spam          | 25              | Multiple URLs
4            | Hate Speech       | 50              | hate/kill + all/every
```

### 1.3 Heuristic Analysis

**Heuristic Scoring:**
```
capsRatio = UPPERCASE_CHARS / TOTAL_CHARS

if capsRatio > 0.6 AND length > 20:
  score += 15  // Excessive caps

punctCount = count of [!?]{2,}
if punctCount > 2:
  score += 10  // Excessive punctuation

repeatedChars = count of (.)\1{4,}
if repeatedChars > 0:
  score += 8  // Character spam

if length < 30 AND capsRatio > 0.5:
  score += 12  // Short aggressive

urlCount = count of https?://
if urlCount > 3:
  score += 20  // URL spam

if length > 2000:
  score += 5  // Excessive length
  confidence = 0.5  // Lower confidence for very long text
```

### 1.4 Combined Score Calculation

**Weighted Combination:**
```
patternComponent = patternScore × 0.4
heuristicComponent = heuristicScore × 0.6
rawScore = (patternComponent + heuristicComponent) / 100
finalScore = min(rawScore, 1.0)
```

**Example Calculation:**
```
Text: "YOU ARE AN IDIOT!!!! THIS IS STUPID!!!!"

Pattern Matches:
- "idiot" (personal attack, severity 35) × 1 = 35
- "stupid" (personal attack, severity 35) × 1 = 35
patternScore = 70

Heuristics:
- capsRatio = 32/40 = 0.8 > 0.6 → +15
- punctCount = 2 instances of "!!!!" → +10
heuristicScore = 25

Combined:
toxicityScore = (70 × 0.4 + 25 × 0.6) / 100
              = (28 + 15) / 100
              = 0.43
```

### 1.5 Threshold-Based Action Determination

```
if toxicityScore >= 0.85:
  level = "high"
  recommendation = "auto_hide"
  
else if toxicityScore >= 0.6:
  level = "medium"
  recommendation = "flag_for_review"
  
else if toxicityScore >= 0.3:
  level = "low"
  recommendation = "warn"
  
else:
  level = "safe"
  recommendation = "approve"
```

### 1.6 Reputation-Based Adjustment

```
if metadata.authorReputation exists:
  if authorReputation > 0.8 AND level == "low":
    recommendation = "approve"
    flags.append("trusted_author_override")
    
  else if authorReputation < 0.3 AND level == "medium":
    recommendation = "auto_hide"
    flags.append("low_reputation_escalation")
```

---

## 2. Community Voting Algorithm

### 2.1 Vote Weight Assignment

```
weight = VOTE_WEIGHTS[userRole]

VOTE_WEIGHTS:
  regular: 1
  trusted: 2
  moderator: 5
```

### 2.2 Vote Tally Calculation

```javascript
function calculateVoteTally(votes):
  agreeCount = 0
  disagreeCount = 0
  agreeWeight = 0
  disagreeWeight = 0
  
  for each vote in votes:
    if vote.vote == true:
      agreeCount += 1
      agreeWeight += vote.weight
    else:
      disagreeCount += 1
      disagreeWeight += vote.weight
  
  totalWeight = agreeWeight + disagreeWeight
  agreeRatio = agreeWeight / totalWeight
  
  return {
    totalVotes: votes.length,
    agreeCount, disagreeCount,
    totalWeight, agreeWeight, disagreeWeight,
    agreeRatio
  }
```

### 2.3 Action Threshold Logic

```
MIN_VOTES = 5
HIDING_THRESHOLD = 0.7
DELETION_THRESHOLD = 0.9
REJECTION_THRESHOLD = 0.3
REJECTION_MIN_VOTES = 10

if tally.totalVotes >= MIN_VOTES:
  agreeRatio = tally.agreeWeight / tally.totalWeight
  
  if agreeRatio >= DELETION_THRESHOLD:
    resolution = "deleted"
    
  else if agreeRatio >= HIDING_THRESHOLD:
    resolution = "hidden"
    
  else if agreeRatio < REJECTION_THRESHOLD AND tally.totalVotes >= REJECTION_MIN_VOTES:
    resolution = "approved"  // Flag rejected
```

**Example Scenarios:**

```
Scenario 1: Hide Content
- 4 regular users vote agree (weight 4)
- 1 regular user votes disagree (weight 1)
- agreeRatio = 4/5 = 0.8 > 0.7
→ Content HIDDEN

Scenario 2: Delete Content
- 2 moderators vote agree (weight 10)
- 1 regular user votes disagree (weight 1)
- agreeRatio = 10/11 = 0.91 > 0.9
→ Content DELETED

Scenario 3: Reject Flag
- 2 regular users vote agree (weight 2)
- 10 regular users vote disagree (weight 10)
- agreeRatio = 2/12 = 0.17 < 0.3 AND totalVotes >= 10
→ Flag REJECTED (content approved)

Scenario 4: Insufficient Votes
- 3 regular users vote agree (weight 3)
- 1 regular user votes disagree (weight 1)
- totalVotes = 4 < 5
→ NO ACTION (pending)
```

### 2.4 Vote Update Handling

```
if user has existing vote on flag:
  UPDATE existing vote record
  // totalVotes count stays the same
else:
  ADD new vote record
  totalVotes += 1
```

---

## 3. Appeal Processing Algorithm

### 3.1 Appeal Eligibility Check

```
function isAppealEligible(flag):
  if flag.status != "resolved":
    return false, "Can only appeal resolved flags"
  
  if flag.resolution not in ["hidden", "deleted"]:
    return false, "Can only appeal hidden/deleted content"
  
  existingAppeals = getAppeals(flag.id)
  if existingAppeals.length >= MAX_APPEALS:
    return false, "Maximum appeals reached"
  
  return true, null
```

### 3.2 Appeal Priority Queue

```
Priority Ranking (highest to lowest):
1. High-toxicity auto-flags (score > 0.85)
2. Pending appeals (status = "pending")
3. Split community votes (40% < agreeRatio < 60%)
4. Repeat offender content (user with 3+ violations)
5. Standard flags
```

### 3.3 Appeal Decision Impact

```
function processAppealDecision(appeal, granted):
  flag = getFlag(appeal.flagId)
  
  if granted:
    flag.status = "resolved"
    flag.resolution = "approved"
    flag.moderatorNotes = "Appeal granted"
    
    // Restore content visibility
    content.status = "active"
    
    // Update statistics
    stats.appealsGranted += 1
    
  else:
    flag.status = "resolved"
    flag.moderatorNotes = "Appeal rejected"
    
    // Maintain original decision
    // Content stays hidden/deleted
    
    // Update statistics
    stats.appealsRejected += 1
```

---

## 4. Reputation System Algorithm

### 4.1 Reputation Score Calculation

```
initialReputation = 0.5  // Neutral starting point

Adjustments:
- Approved contribution: +0.02
- Flagged content (upheld): -0.15
- Accurate flag report: +0.05
- Inaccurate flag report: -0.10
- Community helpful vote: +0.02
- Appeal granted (unfair punishment): +0.10
- Appeal rejected (frivolous): -0.05

finalReputation = clamp(initialReputation + Σ(adjustments), 0.0, 1.0)
```

### 4.2 Reputation Level Mapping

```
Reputation Range | Level      | Moderation Treatment
-----------------|------------|---------------------
0.0 - 0.2        | Restricted | Auto-hide all content
0.2 - 0.4        | Low        | Stricter thresholds (-0.1)
0.4 - 0.6        | Normal     | Standard moderation
0.6 - 0.8        | Good       | Relaxed thresholds (+0.1)
0.8 - 1.0        | Trusted    | Vote weight ×2, minimal checks
```

### 4.3 Threshold Adjustment by Reputation

```
baseThresholds = {low: 0.3, medium: 0.6, high: 0.85}

if reputation < 0.4:
  adjustedThresholds = {
    low: 0.2,    // -0.1
    medium: 0.5, // -0.1
    high: 0.75   // -0.1
  }
  
else if reputation > 0.6:
  adjustedThresholds = {
    low: 0.4,    // +0.1
    medium: 0.7, // +0.1
    high: 0.95   // +0.1
  }
```

---

## 5. Performance Metrics & KPIs

### 5.1 Accuracy Metrics

**Precision:**
```
Precision = True Positives / (True Positives + False Positives)

Target: >85%
```

**Recall:**
```
Recall = True Positives / (True Positives + False Negatives)

Target: >70%
```

**F1 Score:**
```
F1 = 2 × (Precision × Recall) / (Precision + Recall)

Target: >75%
```

### 5.2 Efficiency Metrics

**Average Resolution Time:**
```
avgResolutionTime = Σ(resolutionTime) / totalResolvedFlags

Target: <2 hours
```

**Moderator Workload:**
```
workloadPerModerator = totalModeratorReviews / numberOfModerators / timeWindow

Target: <50 reviews/day per moderator
```

### 5.3 Health Metrics

**Flag Rate:**
```
flagRate = totalFlags / totalContent × 100%

Normal: 1-3%
Alert if: >5% (possible spam attack)
```

**Appeal Grant Rate:**
```
appealGrantRate = appealsGranted / totalAppeals × 100%

Target: 15-25%
<10% = Too strict
>40% = Too lenient
```

**False Positive Rate:**
```
falsePositiveRate = falsePositives / (falsePositives + trueNegatives) × 100%

Target: <10%
```

---

## 6. Edge Case Handling

### 6.1 False Positive Mitigation

**Mathematical Content Whitelisting:**
```
whitelistedPatterns = [
  /f\(x\)/gi,           // Function notation
  /f'\(x\)/gi,          // Derivatives
  /\\frac\{.*\}\{.*\}/gi, // LaTeX fractions
  // ... more LaTeX/math patterns
]

for each pattern in whitelistedPatterns:
  if text.match(pattern):
    // Remove matched portion from toxicity analysis
    textToAnalyze = text.replace(pattern, '')
```

### 6.2 Context-Aware Analysis

**Constructive Criticism vs Personal Attack:**
```
if contains("wrong", "incorrect", "error") AND 
   contains("because", "since", "should be") AND
   NOT contains("you are", "you're"):
  // Likely constructive criticism
  adjustScore(-0.15)
```

### 6.3 Coordinated Attack Detection

**Vote Clustering Analysis:**
```
function detectVoteBrigading(flagId):
  votes = getVotes(flagId)
  timestamps = [v.timestamp for v in votes]
  
  # Check for abnormal clustering
  if count(votes_within_5_minutes) > 10:
    # Check IP/user pattern similarity
    if unique_ips < total_votes / 3:
      return true, "Possible vote brigading"
  
  return false, null
```

---

## 7. Algorithm Optimization

### 7.1 Performance Optimization

**Caching Strategy:**
```
// Cache auto-moderation results for identical text
cache[textHash] = {
  result: moderationResult,
  timestamp: now(),
  ttl: 3600000  // 1 hour
}

if cache[textHash] AND (now() - cache[textHash].timestamp < ttl):
  return cache[textHash].result
```

**Batch Processing:**
```
// Process multiple items in batch for efficiency
function batchAutoModerate(texts):
  results = []
  for text in texts:
    results.append(AutoModerationScore(text))
  return results
```

### 7.2 Scalability Considerations

**Distributed Voting:**
```
// Shard flags across multiple servers by flagId hash
shardId = hash(flagId) % NUM_SHARDS
server = voteServers[shardId]
result = server.recordVote(flagId, vote)
```

**Asynchronous Processing:**
```
// Queue non-urgent moderation tasks
if toxicityScore < HIGH_THRESHOLD:
  queue.enqueue({
    type: "review",
    priority: "low",
    payload: flag
  })
```

---

## 8. Testing & Validation

### 8.1 Unit Test Coverage

**Test Categories:**
1. Pattern matching accuracy
2. Threshold boundary conditions
3. Vote tally calculations
4. Appeal eligibility logic
5. Edge case handling

**Example Test Cases:**
```javascript
testAutoModeration("clean math content") → safe
testAutoModeration("profanity + attack") → high
testAutoModeration("ALL CAPS!!!") → low/medium
testAutoModeration("") → safe
testAutoModeration(veryLongText) → safe with low confidence
```

### 8.2 Integration Testing

**Workflow Tests:**
```
1. Flag → Vote → Resolve → Appeal → Grant
2. Flag → Auto-hide → Appeal → Reject
3. Multiple flags → Community vote → Delete
4. Low reputation → Stricter moderation → Flag
```

### 8.3 Performance Benchmarks

**Response Time Targets:**
```
AutoModerationScore: <50ms
CommunityVote: <20ms
FlagContent: <30ms
AppealDecision: <40ms
GetModerationStats: <100ms
```

---

## 9. Continuous Improvement

### 9.1 Model Retraining

**Data Collection:**
```
// Collect labeled examples for retraining
function collectTrainingData(flag):
  if flag.resolution in ["approved", "hidden", "deleted"]:
    trainingSet.append({
      text: flag.content,
      label: flag.resolution,
      autoModScore: flag.autoModScore,
      communityVote: flag.communityVoteResult,
      groundTruth: flag.resolution
    })
```

**Retraining Schedule:**
- Review model accuracy monthly
- Retrain if accuracy drops below 80%
- A/B test new model before full deployment

### 9.2 Policy Iteration

**Feedback Loop:**
```
quarterlyReview:
  1. Analyze false positive/negative rates
  2. Review appeal patterns
  3. Adjust thresholds if needed
  4. Update toxic pattern list
  5. Refine heuristics based on edge cases
```

---

## 10. Implementation Checklist

- [x] Pattern-based toxicity detection
- [x] Heuristic analysis
- [x] Weighted community voting
- [x] Appeal mechanism
- [x] Reputation system
- [x] Statistics tracking
- [x] Edge case handling
- [x] Unit test suite
- [x] Documentation
- [ ] Production database integration
- [ ] Real-time monitoring dashboard
- [ ] A/B testing framework
- [ ] Machine learning model integration
- [ ] Multi-language support

---

## Conclusion

This moderation algorithm provides a robust, scalable, and fair system for managing user-generated content in Formula Nebula. The three-layer approach (auto-moderation, community voting, manual review) ensures both efficiency and accuracy while maintaining transparency and accountability through the appeal process.

Key Strengths:
- **Balanced**: Combines automation with human judgment
- **Transparent**: Clear scoring formulas and thresholds
- **Fair**: Multiple appeal opportunities
- **Scalable**: Efficient algorithms with caching and batching
- **Accurate**: Target >85% precision with continuous improvement

The system is designed to evolve with community needs through data-driven policy adjustments and regular model retraining.
