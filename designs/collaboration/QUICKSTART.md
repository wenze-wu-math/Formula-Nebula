# Peer Review Workflow - Quick Start Guide

Get up and running with the peer review system in 5 minutes.

---

## 🚀 Quick Setup

### Option 1: Try the Dashboard (Fastest)

1. Open `review-dashboard.html` in your browser
2. Dashboard loads with sample data automatically
3. Click any review card to start reviewing
4. Explore all 4 tabs: Pending, In Progress, Completed, My Submissions

**That's it!** The dashboard includes mock data for demonstration.

---

### Option 2: Use the API (Programmatic)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Review System</title>
</head>
<body>
  <script src="review.js"></script>
  <script>
    // Submit a proof
    const result = reviewWorkflow.SubmitForReview('proof-001', {
      title: 'My First Proof',
      abstract: 'This proves something interesting...',
      tags: ['algebra'],
      difficulty: 'intermediate',
      steps: [
        { step: 1, content: 'Given: x + y = z' },
        { step: 2, content: 'Therefore: z = x + y' }
      ]
    }, 'author-me');

    console.log('Review ID:', result.reviewId);

    // Assign reviewers
    reviewWorkflow.AssignReviewers(result.reviewId, ['reviewer-1', 'reviewer-2']);

    // Submit a review
    reviewWorkflow.SubmitReview(result.reviewId, 'reviewer-1', {
      checklist: [],
      comments: 'Looks good!',
      strengths: ['Clear', 'Correct'],
      weaknesses: [],
      suggestions: ['Add examples']
    }, 'accept');

    console.log('Review submitted!');
  </script>
</body>
</html>
```

---

## 📖 5-Minute Tutorial

### Step 1: Submit a Proof (30 seconds)

```javascript
const reviewId = reviewWorkflow.SubmitForReview(
  'my-proof-001',                    // Unique proof ID
  {
    title: 'Pythagorean Theorem',
    abstract: 'Classic geometric proof...',
    tags: ['geometry', 'classical'],
    difficulty: 'beginner',
    steps: [/* your proof steps */]
  },
  'author-alice'                     // Your user ID
);

console.log('Submitted! Review ID:', reviewId.reviewId);
```

**Result:** Creates review record + version 1 snapshot

---

### Step 2: Assign Reviewers (30 seconds)

```javascript
reviewWorkflow.AssignReviewers(
  'REV-1001',                        // Review ID from step 1
  ['bob', 'carol', 'dave'],          // Reviewer user IDs
  { deadline: '2026-11-15T23:59:59Z' } // Optional custom deadline
);

console.log('Reviewers assigned and notified!');
```

**Result:** 3 reviewers assigned with 8-point checklist each

---

### Step 3: Submit Review (2 minutes)

```javascript
reviewWorkflow.SubmitReview(
  'REV-1001',                        // Review ID
  'bob',                             // Your reviewer ID
  {
    checklist: [
      { id: 'correctness', score: 5, notes: 'Perfect!' },
      { id: 'clarity', score: 4, notes: 'Very clear' }
      // ... other checklist items
    ],
    comments: 'Excellent proof with minor suggestions.',
    strengths: ['Clear notation', 'Rigorous logic'],
    weaknesses: ['Could use a diagram'],
    suggestions: ['Add visual aid'],
    confidentialNotes: 'Strong candidate'
  },
  'accept'                           // accept | revise | reject
);

console.log('Review submitted!');
```

**Result:** Feedback stored, aggregate verdict calculated when all reviews complete

---

### Step 4: Track Versions (30 seconds)

```javascript
// View version history
const history = reviewWorkflow.TrackVersions('my-proof-001');

console.log('Total versions:', history.totalVersions);
history.versions.forEach(v => {
  console.log(`v${v.versionNumber}: ${v.changeNote}`);
});
```

**Result:** See all versions with metadata

---

### Step 5: Compare Versions (1 minute)

```javascript
// Generate diff between v1 and v2
const diff = reviewWorkflow.GenerateDiff(
  'my-proof-001',
  'my-proof-001-v1',
  'my-proof-001-v2'
);

console.log('Changes:', diff.stats);
console.log(diff.visualDiff);
```

**Result:** See exact changes between versions

---

## 🎯 Common Use Cases

### Use Case 1: Simple Review
```javascript
// Submit → Assign → Review → Done
const r = reviewWorkflow.SubmitForReview('p1', data, 'alice');
reviewWorkflow.AssignReviewers(r.reviewId, ['bob']);
reviewWorkflow.SubmitReview(r.reviewId, 'bob', feedback, 'accept');
```

### Use Case 2: Revision Cycle
```javascript
// Submit → Review → Revise → Re-review
const r1 = reviewWorkflow.SubmitForReview('p1', data1, 'alice');
// ... reviews come back as "revise"
const r2 = reviewWorkflow.SubmitForReview('p1', data2, 'alice'); // v2
const diff = reviewWorkflow.GenerateDiff('p1', 'p1-v1', 'p1-v2');
```

### Use Case 3: Multi-Reviewer
```javascript
// Assign 5 reviewers, aggregate verdict
const r = reviewWorkflow.SubmitForReview('p1', data, 'alice');
reviewWorkflow.AssignReviewers(r.reviewId, ['r1','r2','r3','r4','r5']);
// Each reviewer submits independently
// System aggregates: >50% determines verdict
```

---

## 🎨 Dashboard Quick Tips

### Navigate Tabs
- **Pending** - New assignments (red badge = urgent)
- **In Progress** - Active reviews (drafts saved automatically)
- **Completed** - Past reviews (view feedback)
- **My Submissions** - Track your proofs (see progress bars)

### Review a Proof
1. Click any card in "Pending"
2. Fill in checklist (1-5 scores)
3. Add strengths/weaknesses/suggestions
4. Select verdict (Accept/Revise/Reject)
5. Click "Save Draft" or "Submit Review"

### Compare Versions
1. Open a submission with 2+ versions
2. Click "View Versions"
3. Select two versions from dropdowns
4. Click "Compare"
5. View color-coded diff

---

## ⚙️ Customization (Optional)

### Change Colors
Edit `review-dashboard.css`:
```css
:root {
  --primary-color: #YOUR_COLOR;
  --success-color: #YOUR_COLOR;
}
```

### Add Checklist Item
Edit `review.js`:
```javascript
_createReviewChecklist() {
  return [
    // ... existing items
    { id: 'custom', label: 'Your criterion', status: 'pending', score: null, notes: '' }
  ];
}
```

### Change Verdict Logic
Edit `review.js`:
```javascript
_aggregateVerdict(feedbackList) {
  // Custom logic here
  // Example: require unanimous acceptance
  return feedbackList.every(f => f.verdict === 'accept') ? 'accept' : 'revise';
}
```

---

## 🐛 Troubleshooting

### Dashboard shows empty
**Problem:** No reviews showing up

**Solution:**
- Dashboard auto-loads mock data on first load
- Check browser console for errors
- Verify `review.js` loaded before `review-dashboard.js`

### Review submission fails
**Problem:** `SubmitReview` returns error

**Solution:**
```javascript
// Check these:
1. reviewId exists? reviewWorkflow.getReview('REV-1001')
2. Reviewer assigned? review.reviewers.find(r => r.userId === 'bob')
3. Already submitted? assignment.status === 'completed'
4. Valid verdict? 'accept' | 'revise' | 'reject'
```

### Diff shows no changes
**Problem:** `GenerateDiff` returns empty changes

**Solution:**
- Versions might be identical (check contentHash)
- Ensure version IDs are correct
- Try: `reviewWorkflow.TrackVersions('proof-id')` to see all versions

---

## 📚 Next Steps

Once you're comfortable with the basics:

1. **Read the full docs** - `README.md` for complete API reference
2. **Study examples** - `example-usage.js` for 8 detailed examples
3. **Understand workflow** - `WORKFLOW-DIAGRAM.md` for architecture
4. **Customize UI** - Modify CSS variables and HTML structure
5. **Integrate backend** - Add database persistence

---

## 🎓 Learning Path

**Beginner (5 min)**
- ✓ Open dashboard
- ✓ Click through tabs
- ✓ Submit one review

**Intermediate (15 min)**
- ✓ Run `example-usage.js` in console
- ✓ Understand API methods
- ✓ Customize one checklist item

**Advanced (30 min)**
- ✓ Integrate with your auth system
- ✓ Add database backend
- ✓ Customize verdict logic
- ✓ Add notification hooks

**Expert (1 hour+)**
- ✓ Add real-time collaboration
- ✓ Implement anonymous reviews
- ✓ Build reviewer reputation system
- ✓ Export to LaTeX/PDF

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Replace mock data with real database
- [ ] Implement authentication/authorization
- [ ] Add server-side validation
- [ ] Set up notification service (email/push)
- [ ] Configure HTTPS
- [ ] Add rate limiting
- [ ] Implement backup/recovery
- [ ] Write automated tests
- [ ] Set up monitoring/logging
- [ ] Document your deployment

---

## 🎉 You're Ready!

You now know:
- ✓ How to submit proofs for review
- ✓ How to assign reviewers
- ✓ How to submit feedback
- ✓ How to track versions
- ✓ How to use the dashboard

**Start reviewing proofs!** 🚀

For more details, see:
- **API Reference:** `README.md`
- **Examples:** `example-usage.js`
- **Architecture:** `WORKFLOW-DIAGRAM.md`
- **Summary:** `IMPLEMENTATION-SUMMARY.md`
