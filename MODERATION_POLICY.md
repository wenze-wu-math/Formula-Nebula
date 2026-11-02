# Content Moderation Policy & Algorithm
## Formula Nebula User-Generated Content Moderation System

### Overview
This document describes the content moderation system for Formula Nebula, including policies, algorithms, and procedures for handling user-generated proofs, comments, and annotations.

---

## 1. Moderation Policy

### 1.1 Community Guidelines

**Acceptable Content:**
- Mathematical proofs and discussions
- Educational comments and explanations
- Constructive feedback on proofs
- Questions and clarifications
- References to mathematical literature
- Alternative proof approaches

**Prohibited Content:**
- Personal attacks, harassment, or bullying
- Hate speech or discriminatory language
- Spam, advertising, or self-promotion
- Intentional misinformation or misleading proofs
- Off-topic content unrelated to mathematics
- Copyright violations
- Malicious code or security exploits
- Excessive profanity or offensive language

### 1.2 Violation Severity Levels

**Level 1 - Minor (Warning)**
- Mild profanity
- Slightly off-topic comments
- Minor formatting issues
- Unintentional mathematical errors

**Level 2 - Moderate (Content Hidden)**
- Repeated minor violations
- Personal criticism (not constructive)
- Spam or promotional content
- Intentional misinformation
- Excessive caps or formatting abuse

**Level 3 - Severe (Content Deleted + Temp Ban)**
- Harassment or bullying
- Hate speech
- Malicious content
- Copyright infringement
- Coordinated spam campaigns

**Level 4 - Critical (Permanent Ban)**
- Repeated severe violations
- Threats of violence
- Doxxing or privacy violations
- Coordinated abuse

---

## 2. Moderation Algorithm

### 2.1 Three-Layer Detection System

#### Layer 1: Auto-Moderation (Real-time)
**Purpose:** Immediate detection of obvious violations using ML and pattern matching

**Components:**
1. **Toxicity Scoring**
   - Pattern-based detection (profanity, spam indicators)
   - Heuristic analysis (caps ratio, punctuation abuse, URL count)
   - Combined scoring algorithm

2. **Scoring Formula:**
   ```
   toxicityScore = (patternScore × 0.4 + heuristicScore × 0.6) / 100
   
   Where:
   - patternScore = Σ(severity × matches) for detected patterns
   - heuristicScore = weighted sum of heuristic violations
   ```

3. **Pattern Severity Weights:**
   - Profanity: 40/100
   - Personal attacks: 35/100
   - Hate speech indicators: 50/100
   - Spam patterns: 20/100
   - URL spam: 25/100

4. **Heuristic Weights:**
   - Excessive caps (>60% of text): +15
   - Excessive punctuation (>2 instances of !!/?): +10
   - Repeated characters (4+ repetitions): +8
   - Short aggressive (<30 chars, >50% caps): +12
   - URL spam (>3 URLs): +20
   - Excessive length (>2000 chars): +5

5. **Thresholds:**
   - Low (0.3): Warning + monitoring
   - Medium (0.6): Auto-flag for community review
   - High (0.85): Auto-hide + moderator review

6. **Reputation Adjustments:**
   - Trusted users (reputation > 0.8): Low-level violations → approve
   - Low-reputation users (< 0.3): Medium violations → escalate to auto-hide

#### Layer 2: Community Moderation (Collaborative)
**Purpose:** Leverage community wisdom for nuanced moderation decisions

**Voting Mechanism:**
1. **Vote Weights:**
   - Regular user: 1 point
   - Trusted user (high reputation): 2 points
   - Moderator: 5 points

2. **Decision Thresholds:**
   - Minimum votes required: 5
   - Hide content: 70% weighted agreement
   - Delete content: 90% weighted agreement
   - Reject flag: <30% agreement with 10+ votes

3. **Voting Formula:**
   ```
   agreeRatio = agreeWeight / (agreeWeight + disagreeWeight)
   
   Action:
   - agreeRatio >= 0.9 → DELETE
   - agreeRatio >= 0.7 → HIDE
   - agreeRatio < 0.3 (10+ votes) → REJECT FLAG
   ```

4. **Reputation Impact:**
   - Correct flags (aligned with final decision): +0.05 reputation
   - Incorrect flags (community disagrees): -0.10 reputation
   - Helpful votes (aligned with majority): +0.02 reputation

#### Layer 3: Moderator Review (Manual)
**Purpose:** Handle appeals, edge cases, and high-stakes decisions

**Review Queue Priority:**
1. High-toxicity auto-flags (score > 0.85)
2. Pending appeals
3. Community-escalated cases (split votes)
4. Repeat offender content
5. Low-priority flags

**Moderator Powers:**
- Override community decisions
- Grant or reject appeals
- Adjust user reputation
- Apply temporary or permanent bans
- Edit moderation policies

---

## 3. Appeal Mechanism

### 3.1 Appeal Eligibility
- Only hidden or deleted content can be appealed
- Maximum 2 appeals per flag
- Appeal must be submitted within 30 days
- Must provide substantive explanation (20+ characters)

### 3.2 Appeal Review Process
1. **Submission:** User submits appeal with explanation
2. **Queue:** Appeal enters moderator review queue
3. **Review:** Moderator reviews within 24 hours
4. **Decision:** Grant (restore content) or Reject (maintain decision)
5. **Notification:** User notified of decision with explanation

### 3.3 Appeal Decision Criteria
**Grant Appeal If:**
- Original flag was clearly incorrect
- Context was misunderstood
- Content meets community guidelines
- Punishment was disproportionate

**Reject Appeal If:**
- Content clearly violates guidelines
- User provides insufficient justification
- Evidence supports original decision
- Pattern of violations exists

### 3.4 Appeal Statistics Monitoring
- Grant rate target: 15-25% (indicates balanced moderation)
- <10% grant rate: Too strict, review policies
- >40% grant rate: Too lenient, improve detection

---

## 4. Implementation Details

### 4.1 Data Structures

```javascript
Flag {
  flagId: string
  itemId: string
  itemType: 'proof' | 'comment' | 'annotation'
  reason: string
  reporterId: string
  details: string
  timestamp: number
  status: 'pending' | 'reviewing' | 'resolved' | 'appealed'
  resolution: 'approved' | 'rejected' | 'hidden' | 'deleted'
  autoModScore: number | null
  communityVoteResult: VoteTally | null
  moderatorNotes: string
}

Vote {
  userId: string
  vote: boolean  // true = agree with flag, false = disagree
  weight: number  // 1, 2, or 5
  timestamp: number
}

Appeal {
  reviewId: string
  flagId: string
  appellant: string
  appealText: string
  timestamp: number
  status: 'pending' | 'under_review' | 'granted' | 'rejected'
  moderatorReviewerId: string | null
  moderatorDecision: boolean | null
  moderatorNotes: string
  decidedAt: number | null
}
```

### 4.2 API Functions

1. **FlagContent(itemId, reason) → flagId**
   - Creates new flag for content
   - Runs auto-moderation analysis
   - Returns unique flag identifier

2. **CommunityVote(flagId, vote) → tally**
   - Records user vote on flag
   - Calculates weighted tally
   - Auto-resolves if thresholds met
   - Returns current vote status

3. **AutoModerationScore(text) → toxicityScore**
   - Analyzes text for violations
   - Returns toxicity score (0-1)
   - Provides recommendations
   - Lists detected flags

4. **AppealDecision(flagId, appeal) → reviewId**
   - Submits appeal for flag
   - Validates appeal eligibility
   - Queues for moderator review
   - Returns review identifier

5. **ReviewAppeal(reviewId, moderatorId, grant, notes) → decision**
   - Moderator reviews appeal
   - Grants or rejects appeal
   - Updates content status
   - Returns decision result

6. **GetModerationStats() → stats**
   - Returns comprehensive statistics
   - Performance metrics
   - Activity summaries
   - Trend analysis

### 4.3 Storage & Persistence

**In-Memory Storage (Development):**
- Maps for flags, votes, appeals
- Statistics tracking
- Action history logging

**Production Storage (Recommended):**
- PostgreSQL for structured data
- Redis for real-time vote tallies
- Elasticsearch for moderation search
- S3 for appeal evidence/screenshots

---

## 5. Performance Metrics

### 5.1 Key Performance Indicators (KPIs)

**Accuracy Metrics:**
- Auto-moderation precision: Target >85%
- Auto-moderation recall: Target >70%
- Community moderation agreement: Target >80%
- Appeal grant rate: Target 15-25%

**Efficiency Metrics:**
- Average resolution time: Target <2 hours
- Moderator review time: Target <30 minutes
- Appeal processing time: Target <24 hours
- False positive rate: Target <10%

**Health Metrics:**
- Content flagging rate: Monitor for spikes
- Repeat offender rate: Target <5%
- Community participation in voting: Target >20% of active users
- Moderator workload: Target <50 reviews/day per moderator

### 5.2 Monitoring & Alerts

**Auto-Alert Conditions:**
- Flagging rate increases >200% (spam attack)
- Auto-moderation accuracy drops <70% (model drift)
- Appeal grant rate exceeds 40% (overly strict)
- Moderator queue exceeds 100 items (understaffed)
- Repeat offender detection (3+ violations in 7 days)

---

## 6. User Reputation System

### 6.1 Reputation Score (0.0 - 1.0)

**Starting Reputation:** 0.5 (neutral)

**Reputation Adjustments:**
- Approved contributions: +0.02 per item
- Flagged content (upheld): -0.15 per violation
- Accurate flag reports: +0.05 per report
- Inaccurate flag reports: -0.10 per report
- Community helpful votes: +0.02 per helpful vote
- Appeal granted: +0.10 (unfair punishment)
- Appeal rejected: -0.05 (frivolous appeal)

**Reputation Levels:**
- 0.0 - 0.2: Restricted (auto-hide all content)
- 0.2 - 0.4: Low (heightened moderation)
- 0.4 - 0.6: Normal (standard moderation)
- 0.6 - 0.8: Good (reduced moderation)
- 0.8 - 1.0: Trusted (minimal moderation, vote weight x2)

**Reputation Benefits:**
- Trusted users: Lower auto-mod thresholds
- Trusted users: Double vote weight
- Low reputation: Stricter auto-mod thresholds
- Reputation recovery: Possible over time with good behavior

---

## 7. Edge Cases & Special Handling

### 7.1 False Positives
- Mathematical notation may trigger profanity filters (e.g., "f(x)")
- LaTeX commands may appear as spam
- **Solution:** Whitelist mathematical terms, LaTeX syntax checking

### 7.2 Context-Dependent Content
- "This proof is wrong" (constructive criticism vs personal attack)
- Cultural/linguistic differences
- **Solution:** Require detail field for flags, moderator review for ambiguous cases

### 7.3 Coordinated Attacks
- Mass flagging of legitimate content
- Vote brigading
- **Solution:** Rate limiting, user clustering analysis, moderator intervention

### 7.4 Moderator Bias
- Inconsistent decisions
- Personal grudges
- **Solution:** Multi-moderator review for appeals, decision auditing, moderator rotation

### 7.5 Privacy & GDPR
- Right to be forgotten
- Data export requests
- **Solution:** Data retention policies, export tools, anonymization options

---

## 8. Future Enhancements

### 8.1 Machine Learning Improvements
- Fine-tune toxicity model on mathematical content
- Context-aware moderation (mathematical vs social discussion)
- User behavior clustering for proactive moderation
- Multi-language support

### 8.2 Community Features
- Community moderator election
- Moderation transparency reports
- Public moderation logs (anonymized)
- User-submitted policy suggestions

### 8.3 Integration Enhancements
- Proof verification integration (auto-flag invalid proofs)
- Cross-platform moderation (sync with other math communities)
- Automated test suite for policy compliance
- A/B testing framework for policy changes

---

## 9. Compliance & Legal

### 9.1 Legal Requirements
- DMCA takedown compliance
- GDPR data handling
- Age verification (COPPA compliance)
- Terms of Service enforcement

### 9.2 Content Liability
- Safe harbor provisions (CDA Section 230)
- Good faith moderation efforts
- Responsive to legal requests
- Transparent policies

### 9.3 User Rights
- Right to appeal
- Right to explanation
- Right to data export
- Right to account deletion

---

## 10. Testing & Validation

### 10.1 Test Scenarios
1. **Auto-Moderation Tests**
   - Profanity detection accuracy
   - False positive rate on mathematical content
   - Performance under load

2. **Community Moderation Tests**
   - Vote weighting correctness
   - Threshold trigger accuracy
   - Tie-breaking scenarios

3. **Appeal Process Tests**
   - Appeal eligibility validation
   - Review queue ordering
   - Decision propagation

### 10.2 Performance Testing
- Load testing: 1000 concurrent flags
- Stress testing: Spam attack simulation
- Latency testing: <100ms auto-mod response

### 10.3 Accuracy Validation
- Manually labeled test set (1000+ examples)
- Quarterly accuracy audits
- Community feedback integration

---

## Conclusion

This moderation system balances automation, community involvement, and expert review to maintain a healthy, respectful mathematical community. The three-layer approach ensures both efficiency and fairness, while the appeal mechanism provides accountability.

Key principles:
1. **Transparency**: Clear policies and decision reasoning
2. **Fairness**: Appeal process and reputation recovery
3. **Efficiency**: Automated detection with human oversight
4. **Community**: Empowering users in moderation
5. **Adaptability**: Metrics-driven policy improvements

The system is designed to scale with community growth while maintaining quality and safety standards appropriate for an academic mathematical platform.
