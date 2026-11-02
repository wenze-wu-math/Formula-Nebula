/**
 * Peer Review Workflow System
 * Handles proof submission, reviewer assignment, feedback, and versioning
 */

class ReviewWorkflow {
  constructor() {
    this.reviews = new Map(); // reviewId -> review object
    this.proofVersions = new Map(); // proofId -> version history
    this.assignments = new Map(); // reviewId -> reviewer assignments
    this.reviewCounter = 1000;
    this.versionCounter = new Map(); // proofId -> counter
  }

  /**
   * Submit a proof for peer review
   * @param {string} proofId - Unique identifier for the proof
   * @param {object} proofData - Proof content and metadata
   * @param {string} authorId - Author's user ID
   * @returns {object} Review submission result with reviewId
   */
  SubmitForReview(proofId, proofData, authorId) {
    const reviewId = `REV-${this.reviewCounter++}`;
    const timestamp = new Date().toISOString();

    // Create version snapshot
    const versionId = this._createVersion(proofId, proofData, authorId, 'Submitted for review');

    const review = {
      reviewId,
      proofId,
      versionId,
      authorId,
      status: 'pending', // pending, in_review, completed, rejected
      submittedAt: timestamp,
      reviewers: [],
      feedback: [],
      verdict: null, // null, 'accept', 'revise', 'reject'
      metadata: {
        title: proofData.title || 'Untitled Proof',
        abstract: proofData.abstract || '',
        tags: proofData.tags || [],
        difficulty: proofData.difficulty || 'unknown'
      }
    };

    this.reviews.set(reviewId, review);

    return {
      success: true,
      reviewId,
      versionId,
      message: 'Proof submitted for review',
      submittedAt: timestamp
    };
  }

  /**
   * Assign reviewers to a review
   * @param {string} reviewId - Review identifier
   * @param {Array<string>} userIds - Array of reviewer user IDs
   * @param {object} options - Assignment options
   * @returns {object} Assignment result
   */
  AssignReviewers(reviewId, userIds, options = {}) {
    const review = this.reviews.get(reviewId);

    if (!review) {
      return { success: false, error: 'Review not found' };
    }

    if (review.status !== 'pending' && review.status !== 'in_review') {
      return { success: false, error: 'Review is not accepting new reviewers' };
    }

    const assignments = userIds.map(userId => ({
      userId,
      assignedAt: new Date().toISOString(),
      status: 'assigned', // assigned, in_progress, completed, declined
      deadline: options.deadline || this._calculateDeadline(7), // 7 days default
      checklist: this._createReviewChecklist(),
      feedback: null
    }));

    // Add to review
    review.reviewers.push(...assignments);
    review.status = 'in_review';

    // Store assignments
    if (!this.assignments.has(reviewId)) {
      this.assignments.set(reviewId, []);
    }
    this.assignments.get(reviewId).push(...assignments);

    // Notify reviewers (placeholder for notification system)
    this._notifyReviewers(userIds, reviewId, review.metadata.title);

    return {
      success: true,
      reviewId,
      assigned: assignments.length,
      reviewers: assignments.map(a => ({
        userId: a.userId,
        deadline: a.deadline,
        checklistItems: a.checklist.length
      }))
    };
  }

  /**
   * Submit review feedback and verdict
   * @param {string} reviewId - Review identifier
   * @param {string} reviewerId - Reviewer's user ID
   * @param {object} feedback - Structured feedback
   * @param {string} verdict - 'accept', 'revise', or 'reject'
   * @returns {object} Submission result
   */
  SubmitReview(reviewId, reviewerId, feedback, verdict) {
    const review = this.reviews.get(reviewId);

    if (!review) {
      return { success: false, error: 'Review not found' };
    }

    const assignment = review.reviewers.find(r => r.userId === reviewerId);
    if (!assignment) {
      return { success: false, error: 'Reviewer not assigned to this review' };
    }

    if (assignment.status === 'completed') {
      return { success: false, error: 'Review already submitted' };
    }

    // Validate feedback
    const validatedFeedback = this._validateFeedback(feedback);

    // Store feedback
    const reviewFeedback = {
      reviewerId,
      submittedAt: new Date().toISOString(),
      verdict, // accept, revise, reject
      checklist: validatedFeedback.checklist,
      comments: validatedFeedback.comments,
      strengths: validatedFeedback.strengths || [],
      weaknesses: validatedFeedback.weaknesses || [],
      suggestions: validatedFeedback.suggestions || [],
      confidentialNotes: validatedFeedback.confidentialNotes || ''
    };

    assignment.feedback = reviewFeedback;
    assignment.status = 'completed';
    review.feedback.push(reviewFeedback);

    // Check if all reviews are complete
    const allComplete = review.reviewers.every(r => r.status === 'completed' || r.status === 'declined');

    if (allComplete) {
      review.status = 'completed';
      review.verdict = this._aggregateVerdict(review.feedback);
      review.completedAt = new Date().toISOString();

      // Notify author
      this._notifyAuthor(review.authorId, reviewId, review.verdict);
    }

    return {
      success: true,
      reviewId,
      reviewerId,
      verdict,
      reviewComplete: allComplete,
      aggregateVerdict: allComplete ? review.verdict : null
    };
  }

  /**
   * Track all versions of a proof
   * @param {string} proofId - Proof identifier
   * @returns {object} Version history with metadata
   */
  TrackVersions(proofId) {
    const versions = this.proofVersions.get(proofId);

    if (!versions || versions.length === 0) {
      return {
        success: false,
        error: 'No versions found for this proof'
      };
    }

    return {
      success: true,
      proofId,
      totalVersions: versions.length,
      versions: versions.map(v => ({
        versionId: v.versionId,
        versionNumber: v.versionNumber,
        createdAt: v.createdAt,
        authorId: v.authorId,
        changeNote: v.changeNote,
        reviewId: v.reviewId || null,
        contentHash: v.contentHash,
        size: v.content ? JSON.stringify(v.content).length : 0
      })),
      latestVersion: versions[versions.length - 1].versionId
    };
  }

  /**
   * Generate diff between two proof versions
   * @param {string} proofId - Proof identifier
   * @param {string} v1Id - First version ID
   * @param {string} v2Id - Second version ID
   * @returns {object} Detailed diff
   */
  GenerateDiff(proofId, v1Id, v2Id) {
    const versions = this.proofVersions.get(proofId);

    if (!versions) {
      return { success: false, error: 'Proof not found' };
    }

    const v1 = versions.find(v => v.versionId === v1Id);
    const v2 = versions.find(v => v.versionId === v2Id);

    if (!v1 || !v2) {
      return { success: false, error: 'Version not found' };
    }

    const diff = this._computeDiff(v1.content, v2.content);

    return {
      success: true,
      proofId,
      comparison: {
        from: { versionId: v1Id, versionNumber: v1.versionNumber, createdAt: v1.createdAt },
        to: { versionId: v2Id, versionNumber: v2.versionNumber, createdAt: v2.createdAt }
      },
      changes: diff.changes,
      stats: diff.stats,
      visualDiff: this._formatVisualDiff(diff)
    };
  }

  // ==================== Helper Methods ====================

  _createVersion(proofId, content, authorId, changeNote) {
    if (!this.proofVersions.has(proofId)) {
      this.proofVersions.set(proofId, []);
      this.versionCounter.set(proofId, 1);
    }

    const versions = this.proofVersions.get(proofId);
    const versionNumber = this.versionCounter.get(proofId);
    const versionId = `${proofId}-v${versionNumber}`;

    const version = {
      versionId,
      versionNumber,
      proofId,
      content: JSON.parse(JSON.stringify(content)), // Deep clone
      authorId,
      createdAt: new Date().toISOString(),
      changeNote,
      contentHash: this._hashContent(content)
    };

    versions.push(version);
    this.versionCounter.set(proofId, versionNumber + 1);

    return versionId;
  }

  _createReviewChecklist() {
    return [
      { id: 'correctness', label: 'Mathematical correctness', status: 'pending', score: null, notes: '' },
      { id: 'completeness', label: 'Proof completeness', status: 'pending', score: null, notes: '' },
      { id: 'clarity', label: 'Clarity and readability', status: 'pending', score: null, notes: '' },
      { id: 'rigor', label: 'Mathematical rigor', status: 'pending', score: null, notes: '' },
      { id: 'novelty', label: 'Novelty and originality', status: 'pending', score: null, notes: '' },
      { id: 'citations', label: 'Proper citations', status: 'pending', score: null, notes: '' },
      { id: 'notation', label: 'Notation consistency', status: 'pending', score: null, notes: '' },
      { id: 'structure', label: 'Logical structure', status: 'pending', score: null, notes: '' }
    ];
  }

  _validateFeedback(feedback) {
    return {
      checklist: feedback.checklist || this._createReviewChecklist(),
      comments: feedback.comments || '',
      strengths: feedback.strengths || [],
      weaknesses: feedback.weaknesses || [],
      suggestions: feedback.suggestions || [],
      confidentialNotes: feedback.confidentialNotes || ''
    };
  }

  _aggregateVerdict(feedbackList) {
    if (feedbackList.length === 0) return 'pending';

    const verdicts = feedbackList.map(f => f.verdict);
    const acceptCount = verdicts.filter(v => v === 'accept').length;
    const rejectCount = verdicts.filter(v => v === 'reject').length;
    const reviseCount = verdicts.filter(v => v === 'revise').length;

    // Simple majority rule
    if (acceptCount > feedbackList.length / 2) return 'accept';
    if (rejectCount > feedbackList.length / 2) return 'reject';
    return 'revise';
  }

  _computeDiff(content1, content2) {
    const changes = [];
    const stats = {
      additions: 0,
      deletions: 0,
      modifications: 0,
      totalChanges: 0
    };

    // Compare proof steps
    if (content1.steps && content2.steps) {
      const steps1 = content1.steps;
      const steps2 = content2.steps;

      // Detect added steps
      for (let i = 0; i < steps2.length; i++) {
        if (!steps1[i]) {
          changes.push({ type: 'addition', location: `step ${i + 1}`, content: steps2[i] });
          stats.additions++;
        } else if (JSON.stringify(steps1[i]) !== JSON.stringify(steps2[i])) {
          changes.push({
            type: 'modification',
            location: `step ${i + 1}`,
            from: steps1[i],
            to: steps2[i]
          });
          stats.modifications++;
        }
      }

      // Detect deleted steps
      if (steps1.length > steps2.length) {
        for (let i = steps2.length; i < steps1.length; i++) {
          changes.push({ type: 'deletion', location: `step ${i + 1}`, content: steps1[i] });
          stats.deletions++;
        }
      }
    }

    // Compare metadata
    if (content1.title !== content2.title) {
      changes.push({
        type: 'modification',
        location: 'title',
        from: content1.title,
        to: content2.title
      });
      stats.modifications++;
    }

    stats.totalChanges = stats.additions + stats.deletions + stats.modifications;

    return { changes, stats };
  }

  _formatVisualDiff(diff) {
    return diff.changes.map(change => {
      switch (change.type) {
        case 'addition':
          return `+ ${change.location}: ${JSON.stringify(change.content)}`;
        case 'deletion':
          return `- ${change.location}: ${JSON.stringify(change.content)}`;
        case 'modification':
          return `~ ${change.location}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`;
        default:
          return '';
      }
    }).join('\n');
  }

  _hashContent(content) {
    // Simple hash function (replace with crypto hash in production)
    const str = JSON.stringify(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  _calculateDeadline(days) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline.toISOString();
  }

  _notifyReviewers(userIds, reviewId, title) {
    // Placeholder for notification system
    console.log(`Notifying ${userIds.length} reviewers for review ${reviewId}: "${title}"`);
  }

  _notifyAuthor(authorId, reviewId, verdict) {
    // Placeholder for notification system
    console.log(`Notifying author ${authorId} - Review ${reviewId} completed with verdict: ${verdict}`);
  }

  // ==================== Query Methods ====================

  getReview(reviewId) {
    return this.reviews.get(reviewId) || null;
  }

  getReviewsByAuthor(authorId) {
    return Array.from(this.reviews.values()).filter(r => r.authorId === authorId);
  }

  getReviewsByReviewer(reviewerId) {
    return Array.from(this.reviews.values()).filter(r =>
      r.reviewers.some(rev => rev.userId === reviewerId)
    );
  }

  getPendingReviews(reviewerId) {
    return Array.from(this.reviews.values()).filter(r => {
      const assignment = r.reviewers.find(rev => rev.userId === reviewerId);
      return assignment && assignment.status === 'assigned';
    });
  }

  getReviewStats(reviewId) {
    const review = this.reviews.get(reviewId);
    if (!review) return null;

    const totalReviewers = review.reviewers.length;
    const completedReviews = review.reviewers.filter(r => r.status === 'completed').length;
    const inProgressReviews = review.reviewers.filter(r => r.status === 'in_progress').length;
    const pendingReviews = review.reviewers.filter(r => r.status === 'assigned').length;

    return {
      reviewId,
      status: review.status,
      totalReviewers,
      completedReviews,
      inProgressReviews,
      pendingReviews,
      progress: totalReviewers > 0 ? (completedReviews / totalReviewers) * 100 : 0,
      submittedAt: review.submittedAt,
      completedAt: review.completedAt
    };
  }
}

// Export singleton instance
const reviewWorkflow = new ReviewWorkflow();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = reviewWorkflow;
}
