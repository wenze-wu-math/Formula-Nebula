# Peer Review Workflow Diagram

## Overview
The peer review workflow follows a structured path from proof submission through reviewer assignment, feedback collection, versioning, and final verdict.

---

## Workflow Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                     PEER REVIEW WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   AUTHOR     │
│  Submits     │
│   Proof      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  1. SUBMISSION                               │
│  ─────────────                               │
│  • SubmitForReview(proofId, data, authorId) │
│  • Creates version snapshot (v1)             │
│  • Status: "pending"                         │
│  • Returns: reviewId                         │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  2. REVIEWER ASSIGNMENT                      │
│  ────────────────────                        │
│  • AssignReviewers(reviewId, userIds)       │
│  • Creates review checklist for each        │
│  • Sets deadline (default: 7 days)          │
│  • Status: "in_review"                      │
│  • Notifies reviewers                       │
└──────────────┬───────────────────────────────┘
               │
               ├─────────────┬─────────────┬─────────────┐
               ▼             ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
        │Reviewer 1│  │Reviewer 2│  │Reviewer 3│  │Reviewer N│
        └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘
              │             │             │             │
              └─────────────┴─────────────┴─────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│  3. REVIEW PROCESS                                           │
│  ───────────────                                             │
│  Each reviewer evaluates:                                    │
│                                                              │
│  ✓ CHECKLIST (8 criteria):                                  │
│    • Mathematical correctness                               │
│    • Proof completeness                                     │
│    • Clarity and readability                                │
│    • Mathematical rigor                                     │
│    • Novelty and originality                                │
│    • Proper citations                                       │
│    • Notation consistency                                   │
│    • Logical structure                                      │
│                                                              │
│  ✓ FEEDBACK:                                                │
│    • Strengths                                              │
│    • Weaknesses                                             │
│    • Suggestions for improvement                            │
│    • General comments                                       │
│    • Confidential notes (editors only)                      │
│                                                              │
│  ✓ VERDICT:                                                 │
│    • Accept                                                 │
│    • Revise (with feedback)                                 │
│    • Reject                                                 │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  4. FEEDBACK SUBMISSION                      │
│  ─────────────────────                       │
│  • SubmitReview(reviewId, reviewerId,       │
│                 feedback, verdict)           │
│  • Stores structured feedback               │
│  • Updates assignment status: "completed"   │
│  • Checks if all reviews complete           │
└──────────────┬───────────────────────────────┘
               │
               ▼
         ┌─────────────┐
         │ All reviews │
         │  complete?  │
         └─────┬───┬───┘
               │   │
          NO   │   │   YES
               │   │
               │   └───────────────────────────┐
               │                               ▼
               │                    ┌──────────────────────────┐
               │                    │  5. AGGREGATE VERDICT    │
               │                    │  ──────────────────      │
               │                    │  • Majority rule applied │
               │                    │  • Status: "completed"   │
               │                    │  • Notifies author       │
               │                    └──────────┬───────────────┘
               │                               │
               │                               ▼
               │               ┌───────────────────────────────┐
               │               │         VERDICT               │
               │               ├───────────┬───────────┬───────┤
               │               │  ACCEPT   │  REVISE   │REJECT │
               │               └─────┬─────┴─────┬─────┴───┬───┘
               │                     │           │         │
               │                     ▼           ▼         ▼
               │                ┌─────────┐ ┌─────────┐ ┌──────┐
               │                │Published│ │Revision │ │ End  │
               │                └─────────┘ │Required │ └──────┘
               │                            └────┬────┘
               │                                 │
               │◄────────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Wait for remaining  │
    │      reviews          │
    └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  6. VERSIONING & REVISION CYCLE                                  │
│  ─────────────────────────────                                   │
│                                                                  │
│  If verdict = "REVISE":                                         │
│                                                                  │
│  Author makes changes ──→ Creates new version (v2)              │
│                     │                                            │
│                     └──→ TrackVersions(proofId)                 │
│                           • Stores complete version history     │
│                           • Each version has metadata           │
│                           • Content hash for integrity          │
│                                                                  │
│  Reviewers/Editors compare versions:                            │
│                                                                  │
│     GenerateDiff(proofId, v1, v2)                              │
│     ───────────────────────────────                            │
│     • Detects additions, deletions, modifications              │
│     • Shows line-by-line changes                               │
│     • Statistics: +additions, -deletions, ~modifications       │
│     • Visual diff display                                      │
│                                                                  │
│  New review cycle begins with v2...                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SYSTEM COMPONENTS                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  ReviewWorkflow      │
│  ───────────────     │
│  Main controller     │
│  class managing:     │
│                      │
│  • reviews (Map)     │
│  • proofVersions     │
│  • assignments       │
│  • counters          │
└──────────┬───────────┘
           │
           ├────────────────────────────────────┐
           │                                    │
           ▼                                    ▼
┌──────────────────────┐          ┌──────────────────────┐
│   Review Object      │          │   Version Object     │
│   ──────────────     │          │   ───────────────    │
│                      │          │                      │
│  • reviewId          │          │  • versionId         │
│  • proofId           │          │  • versionNumber     │
│  • authorId          │          │  • content (deep)    │
│  • status            │          │  • authorId          │
│  • reviewers[]       │          │  • createdAt         │
│  • feedback[]        │          │  • changeNote        │
│  • verdict           │          │  • contentHash       │
│  • metadata          │          │  • reviewId          │
└──────────────────────┘          └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  Assignment Object   │
│  ─────────────────   │
│                      │
│  • userId            │
│  • assignedAt        │
│  • status            │
│  • deadline          │
│  • checklist[]       │
│  • feedback          │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  Checklist Item      │
│  ──────────────      │
│                      │
│  • id                │
│  • label             │
│  • status            │
│  • score (1-5)       │
│  • notes             │
└──────────────────────┘
```

---

## API Methods

### 1. SubmitForReview(proofId, proofData, authorId)
**Purpose:** Submit a proof for peer review

**Input:**
- `proofId`: Unique identifier
- `proofData`: { title, abstract, tags, difficulty, steps }
- `authorId`: Author's user ID

**Output:**
```javascript
{
  success: true,
  reviewId: "REV-1001",
  versionId: "proof-001-v1",
  message: "Proof submitted for review",
  submittedAt: "2026-11-02T10:00:00Z"
}
```

**Side Effects:**
- Creates review record with status "pending"
- Creates version snapshot (v1)
- Initializes empty reviewer list

---

### 2. AssignReviewers(reviewId, userIds, options)
**Purpose:** Assign reviewers to a submitted proof

**Input:**
- `reviewId`: Review identifier
- `userIds`: Array of reviewer user IDs
- `options`: { deadline?: ISO-date }

**Output:**
```javascript
{
  success: true,
  reviewId: "REV-1001",
  assigned: 3,
  reviewers: [
    { userId: "user-001", deadline: "2026-11-09T10:00:00Z", checklistItems: 8 },
    { userId: "user-002", deadline: "2026-11-09T10:00:00Z", checklistItems: 8 },
    { userId: "user-003", deadline: "2026-11-09T10:00:00Z", checklistItems: 8 }
  ]
}
```

**Side Effects:**
- Updates review status to "in_review"
- Creates assignment records with checklist
- Sends notifications to reviewers

---

### 3. SubmitReview(reviewId, reviewerId, feedback, verdict)
**Purpose:** Submit review feedback and verdict

**Input:**
- `reviewId`: Review identifier
- `reviewerId`: Reviewer's user ID
- `feedback`: { checklist, comments, strengths, weaknesses, suggestions, confidentialNotes }
- `verdict`: "accept" | "revise" | "reject"

**Output:**
```javascript
{
  success: true,
  reviewId: "REV-1001",
  reviewerId: "user-001",
  verdict: "revise",
  reviewComplete: true,
  aggregateVerdict: "revise"
}
```

**Side Effects:**
- Stores feedback in review record
- Updates assignment status to "completed"
- If all reviews complete: aggregates verdict, notifies author

---

### 4. TrackVersions(proofId)
**Purpose:** Get complete version history for a proof

**Input:**
- `proofId`: Proof identifier

**Output:**
```javascript
{
  success: true,
  proofId: "proof-001",
  totalVersions: 3,
  versions: [
    {
      versionId: "proof-001-v1",
      versionNumber: 1,
      createdAt: "2026-11-02T10:00:00Z",
      authorId: "user-002",
      changeNote: "Submitted for review",
      reviewId: "REV-1001",
      contentHash: "a3f5c2d",
      size: 2048
    },
    // ... more versions
  ],
  latestVersion: "proof-001-v3"
}
```

---

### 5. GenerateDiff(proofId, v1Id, v2Id)
**Purpose:** Generate detailed diff between two versions

**Input:**
- `proofId`: Proof identifier
- `v1Id`: First version ID
- `v2Id`: Second version ID

**Output:**
```javascript
{
  success: true,
  proofId: "proof-001",
  comparison: {
    from: { versionId: "proof-001-v1", versionNumber: 1, createdAt: "..." },
    to: { versionId: "proof-001-v2", versionNumber: 2, createdAt: "..." }
  },
  changes: [
    { type: "addition", location: "step 3", content: {...} },
    { type: "modification", location: "step 1", from: {...}, to: {...} },
    { type: "deletion", location: "step 5", content: {...} }
  ],
  stats: {
    additions: 2,
    deletions: 1,
    modifications: 3,
    totalChanges: 6
  },
  visualDiff: "+ step 3: ...\n~ step 1: ... → ...\n- step 5: ..."
}
```

---

## Review Checklist Criteria

Each reviewer evaluates the proof on **8 criteria**, each scored 1-5:

1. **Mathematical Correctness** - Are all mathematical statements accurate?
2. **Proof Completeness** - Are all steps necessary and sufficient?
3. **Clarity and Readability** - Is the proof easy to understand?
4. **Mathematical Rigor** - Are arguments logically sound?
5. **Novelty and Originality** - Does this contribute new insights?
6. **Proper Citations** - Are all sources properly referenced?
7. **Notation Consistency** - Is notation used consistently?
8. **Logical Structure** - Is the proof well-organized?

---

## Verdict Aggregation Rules

**Majority rule** applied when all reviews are complete:

- If **>50% Accept** → Overall verdict: **ACCEPT**
- If **>50% Reject** → Overall verdict: **REJECT**
- Otherwise → Overall verdict: **REVISE**

Example:
- 3 reviewers: Accept, Revise, Reject → **REVISE**
- 4 reviewers: Accept, Accept, Revise, Reject → **ACCEPT** (2/4 = 50% + 1)

---

## User Interface Components

### Dashboard Tabs

1. **Pending Reviews** - New assignments awaiting action
2. **In Progress** - Reviews currently being worked on
3. **Completed** - Finished reviews by this user
4. **My Submissions** - Proofs submitted by current user

### Review Card Information

- Proof title and ID
- Author information
- Submission date
- Review status badge
- Abstract preview
- Tags (subject areas, difficulty)
- Deadline with urgency indicator

### Review Modal Sections

1. **Proof Details** - Title, author, dates, abstract
2. **Review Checklist** - 8 criteria with 1-5 scoring
3. **Strengths** - Positive aspects
4. **Weaknesses** - Areas of concern
5. **Suggestions** - Constructive feedback
6. **General Comments** - Detailed review
7. **Confidential Notes** - Editor-only feedback
8. **Verdict Selection** - Accept/Revise/Reject

### Version Diff Viewer

- Version selector dropdowns
- Side-by-side comparison
- Color-coded changes:
  - **Green** - Additions (+)
  - **Red** - Deletions (-)
  - **Orange** - Modifications (~)
- Statistics summary

---

## Notification System

### Events triggering notifications:

1. **Reviewer assigned** → Notifies reviewer
2. **Review submitted** → If all complete, notifies author
3. **Deadline approaching** → Reminder to reviewer (2 days before)
4. **New version submitted** → Notifies original reviewers

---

## Storage Structure

```
reviews: Map<reviewId, Review>
  └─ REV-1001: {
       reviewId: "REV-1001",
       proofId: "proof-001",
       versionId: "proof-001-v1",
       authorId: "user-002",
       status: "in_review",
       reviewers: [
         {
           userId: "user-001",
           status: "completed",
           checklist: [...],
           feedback: {...}
         }
       ],
       feedback: [...],
       verdict: "revise"
     }

proofVersions: Map<proofId, Version[]>
  └─ proof-001: [
       {
         versionId: "proof-001-v1",
         versionNumber: 1,
         content: {...},
         createdAt: "...",
         contentHash: "..."
       },
       {
         versionId: "proof-001-v2",
         versionNumber: 2,
         content: {...},
         createdAt: "...",
         contentHash: "..."
       }
     ]

assignments: Map<reviewId, Assignment[]>
  └─ REV-1001: [
       {
         userId: "user-001",
         assignedAt: "...",
         status: "completed",
         deadline: "...",
         checklist: [...]
       }
     ]
```

---

## Security Considerations

1. **Access Control**
   - Reviewers can only see assigned reviews
   - Authors can view their submission status
   - Confidential notes only visible to editors

2. **Data Integrity**
   - Content hashing for version verification
   - Deep cloning prevents mutation
   - Immutable version history

3. **Validation**
   - Feedback structure validated before storage
   - Verdict must be one of: accept/revise/reject
   - Checklist scores must be 1-5 or null

---

## Future Enhancements

1. **Anonymous Reviews** - Hide reviewer identities from authors
2. **Double-Blind** - Hide author identities from reviewers
3. **Rebuttal Phase** - Allow authors to respond to feedback
4. **Appeal Process** - Contest rejection decisions
5. **Meta-Reviews** - Senior reviewers evaluate review quality
6. **Discussion Forum** - Reviewers discuss before final verdict
7. **Author Profiles** - Track submission history and acceptance rate
8. **Reviewer Reputation** - Score reviewers based on review quality
