/**
 * Peer Review Workflow - Example Usage
 * Demonstrates how to use the review system in practice
 */

// Import the workflow (if using modules)
// import reviewWorkflow from './review.js';

// ============================================================================
// EXAMPLE 1: Author submits a proof for review
// ============================================================================

function exampleSubmitProof() {
  console.log('=== EXAMPLE 1: Submit Proof ===\n');

  const proofData = {
    title: "A Novel Approach to the Collatz Conjecture",
    abstract: "This paper presents a new method for analyzing the Collatz conjecture " +
              "using dynamical systems theory. We prove several new properties of the " +
              "Collatz sequence and provide computational evidence for bounded orbits.",
    tags: ["number-theory", "dynamical-systems", "unsolved-problems"],
    difficulty: "advanced",
    steps: [
      {
        step: 1,
        content: "Define the Collatz function: C(n) = n/2 if n is even, 3n+1 if n is odd",
        formula: "C(n) = \\begin{cases} n/2 & \\text{if } n \\equiv 0 \\pmod{2} \\\\ 3n+1 & \\text{if } n \\equiv 1 \\pmod{2} \\end{cases}"
      },
      {
        step: 2,
        content: "Establish that all sequences eventually reach 1 (conjecture)",
        formula: "\\forall n \\in \\mathbb{N}, \\exists k : C^k(n) = 1"
      },
      {
        step: 3,
        content: "Analyze the trajectory in phase space",
        details: "We examine the behavior of Collatz orbits in logarithmic space..."
      }
    ]
  };

  const result = reviewWorkflow.SubmitForReview(
    'proof-collatz-001',
    proofData,
    'author-alice'
  );

  console.log('Submission Result:', result);
  console.log('✓ Review ID:', result.reviewId);
  console.log('✓ Version ID:', result.versionId);
  console.log('✓ Status: Pending\n');

  return result.reviewId;
}

// ============================================================================
// EXAMPLE 2: Assign reviewers with custom deadline
// ============================================================================

function exampleAssignReviewers(reviewId) {
  console.log('=== EXAMPLE 2: Assign Reviewers ===\n');

  // Assign 3 expert reviewers with a 10-day deadline
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 10);

  const assignment = reviewWorkflow.AssignReviewers(
    reviewId,
    ['reviewer-bob', 'reviewer-carol', 'reviewer-dave'],
    { deadline: twoWeeksFromNow.toISOString() }
  );

  console.log('Assignment Result:', assignment);
  console.log('✓ Assigned', assignment.assigned, 'reviewers');
  console.log('✓ Deadline:', new Date(assignment.reviewers[0].deadline).toLocaleDateString());
  console.log('✓ Each reviewer has', assignment.reviewers[0].checklistItems, 'checklist items\n');

  return assignment;
}

// ============================================================================
// EXAMPLE 3: Reviewer submits comprehensive feedback
// ============================================================================

function exampleSubmitReview(reviewId) {
  console.log('=== EXAMPLE 3: Submit Review ===\n');

  const feedback = {
    checklist: [
      {
        id: 'correctness',
        label: 'Mathematical correctness',
        status: 'completed',
        score: 4,
        notes: 'Minor issue in step 3 - the phase space argument needs clarification'
      },
      {
        id: 'completeness',
        label: 'Proof completeness',
        status: 'completed',
        score: 3,
        notes: 'Missing formal treatment of convergence'
      },
      {
        id: 'clarity',
        label: 'Clarity and readability',
        status: 'completed',
        score: 5,
        notes: 'Excellent exposition, very clear notation'
      },
      {
        id: 'rigor',
        label: 'Mathematical rigor',
        status: 'completed',
        score: 3,
        notes: 'Some handwaving in the dynamical systems section'
      },
      {
        id: 'novelty',
        label: 'Novelty and originality',
        status: 'completed',
        score: 5,
        notes: 'Highly original approach, not seen this method before'
      },
      {
        id: 'citations',
        label: 'Proper citations',
        status: 'completed',
        score: 4,
        notes: 'Good references, but missing Terras (1976) paper on Collatz'
      },
      {
        id: 'notation',
        label: 'Notation consistency',
        status: 'completed',
        score: 5,
        notes: 'Perfect notation throughout'
      },
      {
        id: 'structure',
        label: 'Logical structure',
        status: 'completed',
        score: 4,
        notes: 'Well organized, minor reordering suggested'
      }
    ],
    comments: "This is a promising approach to the Collatz conjecture with some novel insights. " +
              "However, the proof as presented is incomplete and requires significant revision. " +
              "The phase space analysis is innovative but needs more rigorous treatment. " +
              "With revisions addressing the points below, this could be a strong contribution.",
    strengths: [
      "Novel use of dynamical systems theory",
      "Clear exposition and excellent notation",
      "Strong computational evidence provided",
      "Well-structured argument flow"
    ],
    weaknesses: [
      "Step 3 phase space argument lacks rigor",
      "Missing formal convergence analysis",
      "Incomplete treatment of exceptional cases",
      "Some computational results not reproducible (missing code)"
    ],
    suggestions: [
      "Add formal convergence proof or state as conjecture",
      "Clarify the phase space transformation in step 3",
      "Include Terras (1976) and reference the 3x+1 problem literature",
      "Provide code repository for computational verification",
      "Address edge cases: n=1 and small cycles",
      "Consider reorganizing sections 2 and 3 for better flow"
    ],
    confidentialNotes: "Author shows strong mathematical maturity. This work, while incomplete, " +
                       "demonstrates original thinking. Recommend acceptance after major revision. " +
                       "Could be suitable for Journal of Number Theory if properly revised."
  };

  const result = reviewWorkflow.SubmitReview(
    reviewId,
    'reviewer-bob',
    feedback,
    'revise' // verdict: accept, revise, or reject
  );

  console.log('Review Submission Result:', result);
  console.log('✓ Verdict:', result.verdict);
  console.log('✓ Review complete?', result.reviewComplete);
  if (result.aggregateVerdict) {
    console.log('✓ Aggregate verdict:', result.aggregateVerdict);
  }
  console.log();

  return result;
}

// ============================================================================
// EXAMPLE 4: Track version history after revision
// ============================================================================

function exampleTrackVersions(proofId) {
  console.log('=== EXAMPLE 4: Track Versions ===\n');

  // Simulate author creating a revised version
  // (In real usage, author would submit an updated proof)
  const revisedProof = {
    title: "A Novel Approach to the Collatz Conjecture (Revised)",
    abstract: "Revised version incorporating reviewer feedback...",
    tags: ["number-theory", "dynamical-systems"],
    difficulty: "advanced",
    steps: [/* updated steps */]
  };

  // This would create v2
  reviewWorkflow.SubmitForReview(proofId, revisedProof, 'author-alice');

  // Now track all versions
  const history = reviewWorkflow.TrackVersions(proofId);

  console.log('Version History:', history);
  console.log('✓ Total versions:', history.totalVersions);
  console.log('✓ Latest version:', history.latestVersion);
  console.log('\nAll versions:');
  history.versions.forEach(v => {
    console.log(`  - v${v.versionNumber}: ${v.changeNote} (${new Date(v.createdAt).toLocaleDateString()})`);
  });
  console.log();

  return history;
}

// ============================================================================
// EXAMPLE 5: Generate diff between versions
// ============================================================================

function exampleGenerateDiff(proofId) {
  console.log('=== EXAMPLE 5: Generate Diff ===\n');

  // Get version history first
  const history = reviewWorkflow.TrackVersions(proofId);

  if (history.totalVersions < 2) {
    console.log('Not enough versions to compare\n');
    return;
  }

  // Compare v1 and v2
  const v1 = history.versions[0].versionId;
  const v2 = history.versions[1].versionId;

  const diff = reviewWorkflow.GenerateDiff(proofId, v1, v2);

  console.log('Diff Result:');
  console.log('✓ Comparing:', diff.comparison.from.versionId, '→', diff.comparison.to.versionId);
  console.log('✓ Statistics:');
  console.log('  - Additions:', diff.stats.additions);
  console.log('  - Deletions:', diff.stats.deletions);
  console.log('  - Modifications:', diff.stats.modifications);
  console.log('  - Total changes:', diff.stats.totalChanges);
  console.log('\nVisual Diff:');
  console.log(diff.visualDiff);
  console.log();

  return diff;
}

// ============================================================================
// EXAMPLE 6: Query review statistics
// ============================================================================

function exampleQueryStats(reviewId) {
  console.log('=== EXAMPLE 6: Query Statistics ===\n');

  const stats = reviewWorkflow.getReviewStats(reviewId);

  console.log('Review Statistics:');
  console.log('✓ Status:', stats.status);
  console.log('✓ Total reviewers:', stats.totalReviewers);
  console.log('✓ Completed reviews:', stats.completedReviews);
  console.log('✓ In progress:', stats.inProgressReviews);
  console.log('✓ Pending:', stats.pendingReviews);
  console.log('✓ Progress:', stats.progress.toFixed(1) + '%');
  console.log('✓ Submitted:', new Date(stats.submittedAt).toLocaleDateString());
  if (stats.completedAt) {
    console.log('✓ Completed:', new Date(stats.completedAt).toLocaleDateString());
  }
  console.log();

  return stats;
}

// ============================================================================
// EXAMPLE 7: Get reviews for a specific user
// ============================================================================

function exampleUserReviews() {
  console.log('=== EXAMPLE 7: User Reviews ===\n');

  const userId = 'reviewer-bob';

  // Get all reviews assigned to this user
  const allReviews = reviewWorkflow.getReviewsByReviewer(userId);
  console.log(`Total reviews for ${userId}:`, allReviews.length);

  // Get only pending reviews
  const pendingReviews = reviewWorkflow.getPendingReviews(userId);
  console.log('Pending reviews:', pendingReviews.length);

  // Display pending reviews
  if (pendingReviews.length > 0) {
    console.log('\nPending Reviews:');
    pendingReviews.forEach((review, index) => {
      const assignment = review.reviewers.find(r => r.userId === userId);
      console.log(`${index + 1}. ${review.metadata.title}`);
      console.log(`   Review ID: ${review.reviewId}`);
      console.log(`   Deadline: ${new Date(assignment.deadline).toLocaleDateString()}`);
      console.log(`   Tags: ${review.metadata.tags.join(', ')}`);
    });
  }
  console.log();
}

// ============================================================================
// EXAMPLE 8: Complete workflow end-to-end
// ============================================================================

function exampleCompleteWorkflow() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         COMPLETE PEER REVIEW WORKFLOW EXAMPLE              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Author submits proof
  const reviewId = exampleSubmitProof();

  // Step 2: Editor assigns reviewers
  exampleAssignReviewers(reviewId);

  // Step 3: First reviewer submits feedback
  exampleSubmitReview(reviewId);

  // Simulate other reviewers
  console.log('=== Simulating Other Reviewers ===\n');
  reviewWorkflow.SubmitReview(reviewId, 'reviewer-carol', {
    checklist: [],
    comments: 'Excellent work with minor revisions needed.',
    strengths: ['Original approach', 'Clear writing'],
    weaknesses: ['Minor gaps'],
    suggestions: ['Add more examples']
  }, 'revise');

  reviewWorkflow.SubmitReview(reviewId, 'reviewer-dave', {
    checklist: [],
    comments: 'Strong contribution, ready after revisions.',
    strengths: ['Novel method'],
    weaknesses: ['Some details missing'],
    suggestions: ['Expand section 3']
  }, 'accept');

  // Step 4: Check final statistics
  exampleQueryStats(reviewId);

  // Get the review to see aggregate verdict
  const review = reviewWorkflow.getReview(reviewId);
  console.log('=== FINAL RESULT ===');
  console.log('✓ Aggregate Verdict:', review.verdict.toUpperCase());
  console.log('✓ Feedback from', review.feedback.length, 'reviewers');
  console.log('✓ Status:', review.status);
  console.log();

  // Step 5: Author revises and creates v2
  console.log('=== Author Revises Proof ===\n');
  const proofId = review.proofId;
  const revisedProof = {
    title: review.metadata.title + ' (Revised)',
    abstract: 'Revised based on reviewer feedback...',
    tags: review.metadata.tags,
    difficulty: review.metadata.difficulty,
    steps: [
      { step: 1, content: 'Updated step 1...' },
      { step: 2, content: 'Updated step 2...' },
      { step: 3, content: 'Clarified phase space argument...' },
      { step: 4, content: 'Added formal convergence proof...' }
    ]
  };

  reviewWorkflow.SubmitForReview(proofId, revisedProof, 'author-alice');
  console.log('✓ Created version 2\n');

  // Step 6: View version history
  exampleTrackVersions(proofId);

  // Step 7: Generate diff
  exampleGenerateDiff(proofId);

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              WORKFLOW COMPLETED SUCCESSFULLY               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// ============================================================================
// RUN EXAMPLES
// ============================================================================

if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Review workflow examples loaded. Run exampleCompleteWorkflow() to see demo.\n');

  // Expose functions globally for interactive testing
  window.reviewExamples = {
    exampleCompleteWorkflow,
    exampleSubmitProof,
    exampleAssignReviewers,
    exampleSubmitReview,
    exampleTrackVersions,
    exampleGenerateDiff,
    exampleQueryStats,
    exampleUserReviews
  };

  console.log('Available functions:');
  console.log('  - reviewExamples.exampleCompleteWorkflow()');
  console.log('  - reviewExamples.exampleSubmitProof()');
  console.log('  - reviewExamples.exampleAssignReviewers(reviewId)');
  console.log('  - reviewExamples.exampleSubmitReview(reviewId)');
  console.log('  - reviewExamples.exampleTrackVersions(proofId)');
  console.log('  - reviewExamples.exampleGenerateDiff(proofId)');
  console.log('  - reviewExamples.exampleQueryStats(reviewId)');
  console.log('  - reviewExamples.exampleUserReviews()');
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment - run automatically
  exampleCompleteWorkflow();
  exampleUserReviews();
}
