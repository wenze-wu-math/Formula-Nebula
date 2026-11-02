// Moderation UI Interface for Formula Nebula
// Provides dashboard, reporting, and appeal interfaces

import {
  FlagContent,
  CommunityVote,
  AutoModerationScore,
  AppealDecision,
  ReviewAppeal,
  GetModerationStats,
  GetContentStatus,
  MODERATION_CONFIG
} from './moderation.js';

/**
 * Create moderation dashboard UI
 * @param {HTMLElement} container - Container element for dashboard
 * @returns {Object} Dashboard controller
 */
export function createModerationDashboard(container) {
  const dashboardState = {
    currentView: 'overview',
    selectedFlag: null,
    filterStatus: 'all',
    sortBy: 'timestamp'
  };

  const render = () => {
    container.innerHTML = '';

    const dashboard = document.createElement('div');
    dashboard.className = 'moderation-dashboard';
    dashboard.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    `;

    // Header
    const header = _createHeader(dashboardState);
    dashboard.appendChild(header);

    // Navigation
    const nav = _createNavigation(dashboardState, render);
    dashboard.appendChild(nav);

    // Content area
    const content = document.createElement('div');
    content.className = 'dashboard-content';

    switch (dashboardState.currentView) {
      case 'overview':
        content.appendChild(_createOverviewView());
        break;
      case 'flags':
        content.appendChild(_createFlagsView(dashboardState));
        break;
      case 'appeals':
        content.appendChild(_createAppealsView());
        break;
      case 'stats':
        content.appendChild(_createStatsView());
        break;
    }

    dashboard.appendChild(content);
    container.appendChild(dashboard);
  };

  render();

  return {
    refresh: render,
    switchView: (view) => {
      dashboardState.currentView = view;
      render();
    },
    getState: () => ({ ...dashboardState })
  };
}

/**
 * Create content flagging UI
 * @param {string} itemId - Content ID
 * @param {string} itemType - Content type
 * @param {Object} options - UI options
 * @returns {HTMLElement} Flag UI element
 */
export function createFlagUI(itemId, itemType, options = {}) {
  const container = document.createElement('div');
  container.className = 'flag-content-ui';
  container.style.cssText = `
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    margin: 8px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  const title = document.createElement('h3');
  title.textContent = 'Report Content';
  title.style.cssText = 'margin: 0 0 12px 0; font-size: 16px; color: #d32f2f;';

  const reasonSelect = document.createElement('select');
  reasonSelect.style.cssText = `
    width: 100%;
    padding: 8px;
    margin: 8px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  `;

  const reasons = [
    { value: '', label: 'Select a reason...' },
    { value: 'spam', label: 'Spam or advertising' },
    { value: 'offensive', label: 'Offensive language' },
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'misinformation', label: 'Mathematical misinformation' },
    { value: 'off_topic', label: 'Off-topic content' },
    { value: 'copyright', label: 'Copyright violation' },
    { value: 'other', label: 'Other (specify below)' }
  ];

  reasons.forEach(r => {
    const option = document.createElement('option');
    option.value = r.value;
    option.textContent = r.label;
    reasonSelect.appendChild(option);
  });

  const detailsArea = document.createElement('textarea');
  detailsArea.placeholder = 'Provide additional details (optional)...';
  detailsArea.style.cssText = `
    width: 100%;
    min-height: 80px;
    padding: 8px;
    margin: 8px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
  `;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'display: flex; gap: 8px; margin-top: 12px;';

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit Report';
  submitButton.style.cssText = `
    padding: 8px 16px;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.cssText = `
    padding: 8px 16px;
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;

  submitButton.addEventListener('click', () => {
    const reason = reasonSelect.value;
    const details = detailsArea.value.trim();

    if (!reason) {
      alert('Please select a reason for reporting');
      return;
    }

    const userId = options.userId || 'anonymous';
    const flagId = FlagContent(itemId, itemType, reason, userId, details);

    if (options.onSubmit) {
      options.onSubmit(flagId);
    }

    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #2e7d32;">
        <h3 style="margin: 0 0 8px 0;">Report Submitted</h3>
        <p style="margin: 0; font-size: 14px;">
          Thank you for helping keep our community safe. Your report has been submitted for review.
        </p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
          Flag ID: ${flagId}
        </p>
      </div>
    `;
  });

  cancelButton.addEventListener('click', () => {
    if (options.onCancel) {
      options.onCancel();
    } else {
      container.remove();
    }
  });

  buttonContainer.appendChild(submitButton);
  buttonContainer.appendChild(cancelButton);

  container.appendChild(title);
  container.appendChild(reasonSelect);
  container.appendChild(detailsArea);
  container.appendChild(buttonContainer);

  return container;
}

/**
 * Create voting UI for flagged content
 * @param {string} flagId - Flag to vote on
 * @param {Object} options - UI options
 * @returns {HTMLElement} Voting UI element
 */
export function createVotingUI(flagId, options = {}) {
  const container = document.createElement('div');
  container.className = 'voting-ui';
  container.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
  `;

  const label = document.createElement('span');
  label.textContent = 'Is this content inappropriate?';
  label.style.color = '#666';

  const agreeButton = document.createElement('button');
  agreeButton.textContent = '👍 Agree';
  agreeButton.style.cssText = `
    padding: 6px 12px;
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #1976d2;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
  `;

  const disagreeButton = document.createElement('button');
  disagreeButton.textContent = '👎 Disagree';
  disagreeButton.style.cssText = `
    padding: 6px 12px;
    background: #fff3e0;
    color: #f57c00;
    border: 1px solid #f57c00;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
  `;

  const resultSpan = document.createElement('span');
  resultSpan.style.cssText = 'margin-left: 8px; font-weight: 500; color: #2e7d32;';

  const handleVote = (vote) => {
    const userId = options.userId || `user_${Date.now()}`;
    const userRole = options.userRole || 'regular';

    try {
      const result = CommunityVote(flagId, userId, vote, userRole);

      resultSpan.textContent = result.actionTaken
        ? `Action taken: ${result.resolution}`
        : `Vote recorded (${result.tally.agreeCount}:${result.tally.disagreeCount})`;

      agreeButton.disabled = true;
      disagreeButton.disabled = true;
      agreeButton.style.opacity = '0.5';
      disagreeButton.style.opacity = '0.5';

      if (options.onVote) {
        options.onVote(result);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  agreeButton.addEventListener('click', () => handleVote(true));
  disagreeButton.addEventListener('click', () => handleVote(false));

  container.appendChild(label);
  container.appendChild(agreeButton);
  container.appendChild(disagreeButton);
  container.appendChild(resultSpan);

  return container;
}

/**
 * Create appeal submission UI
 * @param {string} flagId - Flag to appeal
 * @param {Object} options - UI options
 * @returns {HTMLElement} Appeal UI element
 */
export function createAppealUI(flagId, options = {}) {
  const container = document.createElement('div');
  container.className = 'appeal-ui';
  container.style.cssText = `
    background: white;
    border: 1px solid #ff9800;
    border-radius: 8px;
    padding: 16px;
    margin: 12px 0;
  `;

  const title = document.createElement('h3');
  title.textContent = 'Appeal This Decision';
  title.style.cssText = 'margin: 0 0 12px 0; font-size: 16px; color: #f57c00;';

  const instruction = document.createElement('p');
  instruction.textContent = 'Explain why you believe this moderation decision was incorrect:';
  instruction.style.cssText = 'margin: 0 0 12px 0; font-size: 14px; color: #666;';

  const appealText = document.createElement('textarea');
  appealText.placeholder = 'Provide a detailed explanation for your appeal...';
  appealText.style.cssText = `
    width: 100%;
    min-height: 100px;
    padding: 8px;
    margin: 8px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
  `;

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit Appeal';
  submitButton.style.cssText = `
    padding: 8px 16px;
    background: #ff9800;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;

  submitButton.addEventListener('click', () => {
    const text = appealText.value.trim();

    if (!text || text.length < 20) {
      alert('Please provide a detailed explanation (at least 20 characters)');
      return;
    }

    const userId = options.userId || 'anonymous';

    try {
      const reviewId = AppealDecision(flagId, text, userId);

      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #2e7d32;">
          <h3 style="margin: 0 0 8px 0;">Appeal Submitted</h3>
          <p style="margin: 0; font-size: 14px;">
            Your appeal has been submitted and will be reviewed by a moderator within 24 hours.
          </p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
            Review ID: ${reviewId}
          </p>
        </div>
      `;

      if (options.onSubmit) {
        options.onSubmit(reviewId);
      }
    } catch (error) {
      alert(error.message);
    }
  });

  container.appendChild(title);
  container.appendChild(instruction);
  container.appendChild(appealText);
  container.appendChild(submitButton);

  return container;
}

/**
 * Create auto-moderation indicator badge
 * @param {string} text - Content to analyze
 * @returns {HTMLElement} Badge element
 */
export function createAutoModBadge(text) {
  const analysis = AutoModerationScore(text);

  const badge = document.createElement('div');
  badge.className = 'auto-mod-badge';
  badge.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  `;

  const colors = {
    safe: { bg: '#e8f5e9', text: '#2e7d32', border: '#81c784' },
    low: { bg: '#fff3e0', text: '#f57c00', border: '#ffb74d' },
    medium: { bg: '#ffe0b2', text: '#e64a19', border: '#ff9800' },
    high: { bg: '#ffebee', text: '#c62828', border: '#ef5350' }
  };

  const color = colors[analysis.level];
  badge.style.background = color.bg;
  badge.style.color = color.text;
  badge.style.border = `1px solid ${color.border}`;

  const icon = document.createElement('span');
  icon.textContent = analysis.level === 'safe' ? '✓' : '⚠';

  const label = document.createElement('span');
  label.textContent = analysis.level === 'safe'
    ? 'Clean'
    : `${analysis.level.charAt(0).toUpperCase() + analysis.level.slice(1)} Risk`;

  badge.appendChild(icon);
  badge.appendChild(label);

  if (analysis.flags.length > 0) {
    badge.title = `Flags: ${analysis.flags.join(', ')}`;
  }

  return badge;
}

// ===== Private Helper Functions =====

function _createHeader(state) {
  const header = document.createElement('div');
  header.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  const title = document.createElement('h1');
  title.textContent = 'Content Moderation Dashboard';
  title.style.cssText = 'margin: 0 0 8px 0; font-size: 24px; color: #333;';

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Monitor, review, and manage community-flagged content';
  subtitle.style.cssText = 'margin: 0; font-size: 14px; color: #666;';

  header.appendChild(title);
  header.appendChild(subtitle);

  return header;
}

function _createNavigation(state, onNavigate) {
  const nav = document.createElement('div');
  nav.style.cssText = `
    background: white;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    gap: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  const views = [
    { id: 'overview', label: 'Overview' },
    { id: 'flags', label: 'Flagged Content' },
    { id: 'appeals', label: 'Appeals' },
    { id: 'stats', label: 'Statistics' }
  ];

  views.forEach(view => {
    const button = document.createElement('button');
    button.textContent = view.label;
    button.style.cssText = `
      padding: 10px 20px;
      background: ${state.currentView === view.id ? '#1976d2' : '#f5f5f5'};
      color: ${state.currentView === view.id ? 'white' : '#333'};
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    `;

    button.addEventListener('click', () => {
      state.currentView = view.id;
      onNavigate();
    });

    nav.appendChild(button);
  });

  return nav;
}

function _createOverviewView() {
  const view = document.createElement('div');

  const stats = GetModerationStats();

  const cards = [
    { title: 'Total Flags', value: stats.flags.total, color: '#ff9800' },
    { title: 'Pending Review', value: stats.flags.byStatus.pending || 0, color: '#f44336' },
    { title: 'Resolved', value: stats.flags.byStatus.resolved || 0, color: '#4caf50' },
    { title: 'Appeals', value: stats.appeals.total, color: '#2196f3' }
  ];

  const cardContainer = document.createElement('div');
  cardContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  `;

  cards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid ${card.color};
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    cardEl.innerHTML = `
      <div style="font-size: 14px; color: #666; margin-bottom: 8px;">${card.title}</div>
      <div style="font-size: 32px; font-weight: bold; color: #333;">${card.value}</div>
    `;

    cardContainer.appendChild(cardEl);
  });

  view.appendChild(cardContainer);

  // Recent activity
  const activitySection = document.createElement('div');
  activitySection.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  const activityTitle = document.createElement('h2');
  activityTitle.textContent = 'Recent Activity';
  activityTitle.style.cssText = 'margin: 0 0 16px 0; font-size: 18px; color: #333;';

  activitySection.appendChild(activityTitle);

  stats.recentActivity.slice(0, 10).forEach(activity => {
    const item = document.createElement('div');
    item.style.cssText = `
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    `;

    const date = new Date(activity.timestamp).toLocaleString();
    item.innerHTML = `
      <strong>${activity.action}</strong> - ${activity.itemId}
      <div style="font-size: 12px; color: #999; margin-top: 4px;">${date}</div>
    `;

    activitySection.appendChild(item);
  });

  view.appendChild(activitySection);

  return view;
}

function _createFlagsView(state) {
  const view = document.createElement('div');
  view.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  const title = document.createElement('h2');
  title.textContent = 'Flagged Content';
  title.style.margin = '0 0 16px 0';

  view.appendChild(title);

  // Filter options would go here

  const placeholder = document.createElement('p');
  placeholder.textContent = 'No flagged content to display';
  placeholder.style.cssText = 'color: #999; text-align: center; padding: 40px;';

  view.appendChild(placeholder);

  return view;
}

function _createAppealsView() {
  const view = document.createElement('div');
  view.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  const title = document.createElement('h2');
  title.textContent = 'Appeals';
  title.style.margin = '0 0 16px 0';

  view.appendChild(title);

  const placeholder = document.createElement('p');
  placeholder.textContent = 'No appeals to display';
  placeholder.style.cssText = 'color: #999; text-align: center; padding: 40px;';

  view.appendChild(placeholder);

  return view;
}

function _createStatsView() {
  const view = document.createElement('div');

  const stats = GetModerationStats();

  view.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  const title = document.createElement('h2');
  title.textContent = 'Statistics';
  title.style.margin = '0 0 16px 0';

  view.appendChild(title);

  const statsHTML = `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
      <div>
        <h3 style="font-size: 16px; margin: 0 0 12px 0;">Performance Metrics</h3>
        <div style="font-size: 14px; line-height: 1.8;">
          <div>Auto-Moderation Accuracy: <strong>${(stats.performance.autoModerationAccuracy * 100).toFixed(1)}%</strong></div>
          <div>Community Mod Efficiency: <strong>${(stats.performance.communityModerationEfficiency * 100).toFixed(1)}%</strong></div>
          <div>Avg Resolution Time: <strong>${(stats.performance.averageResolutionTime / 3600000).toFixed(1)}h</strong></div>
        </div>
      </div>
      <div>
        <h3 style="font-size: 16px; margin: 0 0 12px 0;">Content Status</h3>
        <div style="font-size: 14px; line-height: 1.8;">
          <div>Active: <strong>${stats.contentStatus.active}</strong></div>
          <div>Hidden: <strong>${stats.contentStatus.hidden}</strong></div>
          <div>Deleted: <strong>${stats.contentStatus.deleted}</strong></div>
        </div>
      </div>
    </div>
  `;

  const statsContainer = document.createElement('div');
  statsContainer.innerHTML = statsHTML;

  view.appendChild(statsContainer);

  return view;
}

export default {
  createModerationDashboard,
  createFlagUI,
  createVotingUI,
  createAppealUI,
  createAutoModBadge
};
