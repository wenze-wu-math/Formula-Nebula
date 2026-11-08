/**
 * Review Dashboard UI Controller
 */

class ReviewDashboard {
  constructor() {
    this.currentUser = 'user-001'; // Mock user ID
    this.currentReviewId = null;
    this.mockData();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDashboard();
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Modal controls
    document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal('reviewModal'));
    document.getElementById('diffModalClose')?.addEventListener('click', () => this.closeModal('diffModal'));

    // Review actions
    document.getElementById('submitReviewBtn')?.addEventListener('click', () => this.submitReview());
    document.getElementById('saveDraftBtn')?.addEventListener('click', () => this.saveDraft());
    document.getElementById('submitNewBtn')?.addEventListener('click', () => this.showSubmitForm());

    // Diff comparison
    document.getElementById('compareDiffBtn')?.addEventListener('click', () => this.compareDiff());

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });
  }

  switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    // Load tab data
    this.loadTabData(tabName);
  }

  loadDashboard() {
    this.loadTabData('pending');
    this.updateNotificationBadge();
  }

  loadTabData(tabName) {
    switch (tabName) {
      case 'pending':
        this.loadPendingReviews();
        break;
      case 'in-progress':
        this.loadInProgressReviews();
        break;
      case 'completed':
        this.loadCompletedReviews();
        break;
      case 'submitted':
        this.loadMySubmissions();
        break;
    }
  }

  loadPendingReviews() {
    const reviews = reviewWorkflow.getPendingReviews(this.currentUser);
    this.renderReviewList('pendingList', reviews, 'pending');
    this.updateCount('pendingCount', reviews.length);
  }

  loadInProgressReviews() {
    const allReviews = reviewWorkflow.getReviewsByReviewer(this.currentUser);
    const inProgress = allReviews.filter(r => {
      const assignment = r.reviewers.find(rev => rev.userId === this.currentUser);
      return assignment && assignment.status === 'in_progress';
    });
    this.renderReviewList('inProgressList', inProgress, 'in-progress');
    this.updateCount('inProgressCount', inProgress.length);
  }

  loadCompletedReviews() {
    const allReviews = reviewWorkflow.getReviewsByReviewer(this.currentUser);
    const completed = allReviews.filter(r => {
      const assignment = r.reviewers.find(rev => rev.userId === this.currentUser);
      return assignment && assignment.status === 'completed';
    });
    this.renderReviewList('completedList', completed, 'completed');
    this.updateCount('completedCount', completed.length);
  }

  loadMySubmissions() {
    const submissions = reviewWorkflow.getReviewsByAuthor(this.currentUser);
    this.renderSubmissionList('submittedList', submissions);
  }

  renderReviewList(containerId, reviews, status) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (reviews.length === 0) {
      container.innerHTML = this.renderEmptyState(status);
      return;
    }

    container.innerHTML = reviews.map(review => this.renderReviewCard(review)).join('');

    // Add click handlers
    container.querySelectorAll('.review-card').forEach((card, index) => {
      card.addEventListener('click', () => this.openReviewModal(reviews[index]));
    });
  }

  renderReviewCard(review) {
    const assignment = review.reviewers.find(r => r.userId === this.currentUser);
    const deadline = assignment ? new Date(assignment.deadline) : null;
    const daysLeft = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const isUrgent = daysLeft !== null && daysLeft <= 2;

    return `
      <div class="review-card" data-review-id="${review.reviewId}">
        <div class="review-card-header">
          <div>
            <div class="review-title">${review.metadata.title}</div>
            <div class="review-meta">
              <span>ID: ${review.reviewId}</span>
              <span>Author: ${review.authorId}</span>
              <span>Submitted: ${new Date(review.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <span class="review-status status-${review.status.replace('_', '-')}">${review.status.replace('_', ' ')}</span>
        </div>
        <div class="review-abstract">${review.metadata.abstract || 'No abstract provided.'}</div>
        <div class="review-footer">
          <div class="review-tags">
            ${review.metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            ${review.metadata.difficulty !== 'unknown' ? `<span class="tag">Difficulty: ${review.metadata.difficulty}</span>` : ''}
          </div>
          ${deadline ? `<div class="deadline ${isUrgent ? 'urgent' : ''}">Due: ${deadline.toLocaleDateString()} (${daysLeft} days)</div>` : ''}
        </div>
      </div>
    `;
  }

  renderSubmissionList(containerId, submissions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (submissions.length === 0) {
      container.innerHTML = this.renderEmptyState('submitted');
      return;
    }

    container.innerHTML = submissions.map(submission => {
      const stats = reviewWorkflow.getReviewStats(submission.reviewId);
      return `
        <div class="review-card" data-review-id="${submission.reviewId}">
          <div class="review-card-header">
            <div>
              <div class="review-title">${submission.metadata.title}</div>
              <div class="review-meta">
                <span>ID: ${submission.reviewId}</span>
                <span>Submitted: ${new Date(submission.submittedAt).toLocaleDateString()}</span>
                <span>Reviewers: ${stats.completedReviews}/${stats.totalReviewers} completed</span>
              </div>
            </div>
            <span class="review-status status-${submission.status.replace('_', '-')}">${submission.status.replace('_', ' ')}</span>
          </div>
          <div class="review-abstract">${submission.metadata.abstract || 'No abstract provided.'}</div>
          <div class="review-footer">
            <div class="review-tags">
              ${submission.metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${stats.progress}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers to view submission details
    container.querySelectorAll('.review-card').forEach((card, index) => {
      card.addEventListener('click', () => this.viewSubmissionDetails(submissions[index]));
    });
  }

  renderEmptyState(status) {
    const messages = {
      pending: { icon: '📋', text: 'No pending reviews', subtext: 'You are all caught up!' },
      'in-progress': { icon: '🔄', text: 'No reviews in progress', subtext: 'Start reviewing from pending reviews' },
      completed: { icon: '✅', text: 'No completed reviews', subtext: 'Your completed reviews will appear here' },
      submitted: { icon: '📝', text: 'No submissions', subtext: 'Submit a proof for peer review' }
    };

    const msg = messages[status] || messages.pending;

    return `
      <div class="empty-state">
        <div class="empty-state-icon">${msg.icon}</div>
        <div class="empty-state-text">${msg.text}</div>
        <div class="empty-state-subtext">${msg.subtext}</div>
      </div>
    `;
  }

  openReviewModal(review) {
    this.currentReviewId = review.reviewId;
    const modal = document.getElementById('reviewModal');
    const assignment = review.reviewers.find(r => r.userId === this.currentUser);

    // Populate proof details
    document.getElementById('proofTitle').textContent = review.metadata.title;
    document.getElementById('proofAuthor').textContent = review.authorId;
    document.getElementById('proofSubmitted').textContent = new Date(review.submittedAt).toLocaleDateString();
    document.getElementById('reviewDeadline').textContent = assignment ? new Date(assignment.deadline).toLocaleDateString() : 'N/A';
    document.getElementById('proofAbstract').textContent = review.metadata.abstract || 'No abstract provided.';

    // Populate checklist
    const checklistContainer = document.getElementById('checklistItems');
    checklistContainer.innerHTML = assignment.checklist.map(item => `
      <div class="checklist-item">
        <label>${item.label}</label>
        <select data-item-id="${item.id}">
          <option value="">Not Reviewed</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>
        <input type="text" placeholder="Notes..." data-notes-id="${item.id}">
      </div>
    `).join('');

    // Load saved draft if exists
    const draft = this.loadDraftData(review.reviewId);
    if (draft) {
      this.populateFormWithDraft(draft);
    }

    // Update assignment status to in_progress
    if (assignment.status === 'assigned') {
      assignment.status = 'in_progress';
    }

    modal.classList.add('active');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  submitReview() {
    if (!this.currentReviewId) return;

    const feedback = this.collectFeedback();
    const verdict = document.querySelector('input[name="verdict"]:checked')?.value;

    if (!verdict) {
      alert('Please select a verdict (Accept, Revise, or Reject)');
      return;
    }

    // Submit review
    const result = reviewWorkflow.SubmitReview(this.currentReviewId, this.currentUser, feedback, verdict);

    if (result.success) {
      alert('Review submitted successfully!');
      this.closeModal('reviewModal');
      this.clearDraft(this.currentReviewId);
      this.loadDashboard();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  saveDraft() {
    if (!this.currentReviewId) return;

    const feedback = this.collectFeedback();
    const verdict = document.querySelector('input[name="verdict"]:checked')?.value;

    const draft = { feedback, verdict, savedAt: new Date().toISOString() };
    localStorage.setItem(`draft-${this.currentReviewId}`, JSON.stringify(draft));

    alert('Draft saved successfully!');
  }

  collectFeedback() {
    const checklist = [];
    document.querySelectorAll('.checklist-item').forEach(item => {
      const select = item.querySelector('select');
      const notesInput = item.querySelector('input[type="text"]');
      checklist.push({
        id: select.dataset.itemId,
        score: select.value ? parseInt(select.value) : null,
        notes: notesInput.value,
        status: select.value ? 'completed' : 'pending'
      });
    });

    return {
      checklist,
      comments: document.getElementById('generalComments').value,
      strengths: document.getElementById('strengths').value.split('\n').filter(s => s.trim()),
      weaknesses: document.getElementById('weaknesses').value.split('\n').filter(s => s.trim()),
      suggestions: document.getElementById('suggestions').value.split('\n').filter(s => s.trim()),
      confidentialNotes: document.getElementById('confidentialNotes').value
    };
  }

  loadDraftData(reviewId) {
    const draftStr = localStorage.getItem(`draft-${reviewId}`);
    return draftStr ? JSON.parse(draftStr) : null;
  }

  populateFormWithDraft(draft) {
    // Populate feedback fields
    if (draft.feedback) {
      document.getElementById('generalComments').value = draft.feedback.comments || '';
      document.getElementById('strengths').value = (draft.feedback.strengths || []).join('\n');
      document.getElementById('weaknesses').value = (draft.feedback.weaknesses || []).join('\n');
      document.getElementById('suggestions').value = (draft.feedback.suggestions || []).join('\n');
      document.getElementById('confidentialNotes').value = draft.feedback.confidentialNotes || '';

      // Populate checklist
      if (draft.feedback.checklist) {
        draft.feedback.checklist.forEach(item => {
          const select = document.querySelector(`select[data-item-id="${item.id}"]`);
          const notesInput = document.querySelector(`input[data-notes-id="${item.id}"]`);
          if (select && item.score) select.value = item.score;
          if (notesInput) notesInput.value = item.notes || '';
        });
      }
    }

    // Populate verdict
    if (draft.verdict) {
      const radio = document.querySelector(`input[name="verdict"][value="${draft.verdict}"]`);
      if (radio) radio.checked = true;
    }
  }

  clearDraft(reviewId) {
    localStorage.removeItem(`draft-${reviewId}`);
  }

  viewSubmissionDetails(submission) {
    // Show detailed view with feedback from all reviewers
    const stats = reviewWorkflow.getReviewStats(submission.reviewId);
    const feedback = submission.feedback;

    let details = `
      <h3>Submission: ${submission.metadata.title}</h3>
      <p>Status: ${submission.status}</p>
      <p>Progress: ${stats.completedReviews}/${stats.totalReviewers} reviews completed</p>
      <hr>
    `;

    if (feedback.length > 0) {
      details += '<h4>Reviews:</h4>';
      feedback.forEach((fb, i) => {
        details += `
          <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-light); border-radius: 8px;">
            <strong>Reviewer ${i + 1}</strong> - Verdict: <strong>${fb.verdict}</strong><br>
            <strong>Comments:</strong> ${fb.comments || 'No comments'}<br>
            ${fb.strengths.length > 0 ? `<strong>Strengths:</strong> ${fb.strengths.join(', ')}<br>` : ''}
            ${fb.weaknesses.length > 0 ? `<strong>Weaknesses:</strong> ${fb.weaknesses.join(', ')}<br>` : ''}
          </div>
        `;
      });
    } else {
      details += '<p>No reviews submitted yet.</p>';
    }

    // Show in modal or alert (simplified)
    alert(details.replace(/<[^>]*>/g, '\n'));
  }

  showSubmitForm() {
    alert('Submit form would open here. This would allow users to submit a new proof for review.');
  }

  compareDiff() {
    const fromVersion = document.getElementById('fromVersion').value;
    const toVersion = document.getElementById('toVersion').value;

    if (!fromVersion || !toVersion) {
      alert('Please select both versions to compare');
      return;
    }

    // Mock proof ID (in real app, this would be dynamic)
    const proofId = 'proof-001';
    const diffResult = reviewWorkflow.GenerateDiff(proofId, fromVersion, toVersion);

    if (diffResult.success) {
      this.displayDiff(diffResult);
    } else {
      alert(`Error: ${diffResult.error}`);
    }
  }

  displayDiff(diffResult) {
    const diffDisplay = document.getElementById('diffDisplay');
    const { changes, stats } = diffResult;

    let html = `
      <div style="margin-bottom: 20px;">
        <strong>Changes Summary:</strong>
        <span style="color: var(--success-color); margin-left: 15px;">+${stats.additions} additions</span>
        <span style="color: var(--danger-color); margin-left: 15px;">-${stats.deletions} deletions</span>
        <span style="color: var(--warning-color); margin-left: 15px;">~${stats.modifications} modifications</span>
      </div>
      <hr style="border-color: var(--border-color); margin: 20px 0;">
    `;

    changes.forEach(change => {
      let className;
      let prefix;
      if (change.type === 'addition') {
        className = 'diff-addition';
        prefix = '+ ';
      } else if (change.type === 'deletion') {
        className = 'diff-deletion';
        prefix = '- ';
      } else {
        className = 'diff-modification';
        prefix = '~ ';
      }

      html += `<div class="diff-line ${className}">${prefix}${change.location}: ${JSON.stringify(change.content || change.to)}</div>`;
    });

    diffDisplay.innerHTML = html;
  }

  updateCount(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = count;
  }

  updateNotificationBadge() {
    const pendingReviews = reviewWorkflow.getPendingReviews(this.currentUser);
    const badge = document.getElementById('notificationBadge');
    if (badge) badge.textContent = pendingReviews.length;
  }

  // Mock data for demonstration
  mockData() {
    // Create mock proof and submit for review
    const proof1 = {
      title: 'Fermat\'s Last Theorem - Alternative Proof',
      abstract: 'This paper presents an alternative approach to proving Fermat\'s Last Theorem using elliptic curves and modular forms.',
      tags: ['number-theory', 'algebraic-geometry'],
      difficulty: 'advanced',
      steps: [
        { step: 1, content: 'Define the elliptic curve E: y² = x³ + ax + b' },
        { step: 2, content: 'Show that E is modular' }
      ]
    };

    const result1 = reviewWorkflow.SubmitForReview('proof-001', proof1, 'user-002');
    reviewWorkflow.AssignReviewers(result1.reviewId, [this.currentUser, 'user-003'], { deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() });

    // Create another mock submission
    const proof2 = {
      title: 'Riemann Hypothesis - Partial Result',
      abstract: 'We prove the Riemann Hypothesis for the first 10^12 zeros of the zeta function.',
      tags: ['analytic-number-theory', 'complex-analysis'],
      difficulty: 'expert',
      steps: []
    };

    const result2 = reviewWorkflow.SubmitForReview('proof-002', proof2, this.currentUser);
    reviewWorkflow.AssignReviewers(result2.reviewId, ['user-004', 'user-005']);
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ReviewDashboard();
});
