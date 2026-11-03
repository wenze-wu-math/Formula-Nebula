/**
 * UserDashboard.js - User dashboard component for Formula Nebula
 * Displays user statistics, activity, and recent work
 */

class UserDashboard {
  constructor(options = {}) {
    this.container = options.container || null;
    this.userId = options.userId || null;
    this.onUpdate = options.onUpdate || (() => {});

    this.dashboardData = {
      user: {
        name: 'User',
        email: '',
        avatar: '',
        joinDate: new Date().toISOString(),
        tier: 'free'
      },
      stats: {
        totalFormulas: 0,
        savedWorkspaces: 0,
        collaborators: 0,
        completedTutorials: 0
      },
      recentActivity: [],
      favoriteFormulas: [],
      collaborations: [],
      usage: {
        apiCalls: 0,
        storageUsed: 0,
        lastUpdated: new Date().toISOString()
      },
      notifications: []
    };

    this.realtimeService = null;
    this.dataService = null;
    this.updateInterval = null;
    this.init();
  }

  async init() {
    try {
      // Initialize services
      this.realtimeService = new RealtimeService();
      this.dataService = new DashboardDataService();

      // Load initial data
      await this.loadDashboardData();

      // Setup real-time updates
      if (this.userId) {
        this.realtimeService.subscribe(`user:${this.userId}`, (data) => {
          this.handleRealtimeUpdate(data);
        });
      }

      if (this.container) {
        this.render();
        this.attachEventListeners();
      }

      // Setup periodic updates
      this.startPeriodicUpdates();
    } catch (error) {
      console.error('Failed to initialize UserDashboard:', error);
    }
  }

  async loadDashboardData() {
    try {
      const data = await this.dataService.fetchDashboardData(this.userId);
      this.dashboardData = {
        ...this.dashboardData,
        ...data
      };
      this.onUpdate(this.dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  handleRealtimeUpdate(data) {
    // Update dashboard data based on real-time events
    if (data.type === 'activity') {
      this.dashboardData.recentActivity.unshift(data.payload);
      if (this.dashboardData.recentActivity.length > 10) {
        this.dashboardData.recentActivity.pop();
      }
    } else if (data.type === 'stats') {
      this.dashboardData.stats = {
        ...this.dashboardData.stats,
        ...data.payload
      };
    } else if (data.type === 'notification') {
      this.dashboardData.notifications.unshift(data.payload);
      if (this.dashboardData.notifications.length > 5) {
        this.dashboardData.notifications.pop();
      }
    }

    this.onUpdate(this.dashboardData);
    this.updateUI();
  }

  startPeriodicUpdates() {
    // Refresh data every 60 seconds
    this.updateInterval = setInterval(() => {
      this.loadDashboardData();
    }, 60000);
  }

  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  render() {
    const dashboardHTML = `
      <div class="user-dashboard">
        <div class="dashboard-header">
          <div class="header-title">
            <h1>Dashboard</h1>
            <p class="header-subtitle">Welcome back, ${this.escapeHtml(this.dashboardData.user.name)}</p>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" id="refresh-btn" aria-label="Refresh dashboard">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <!-- User Info Section -->
        <div class="dashboard-section user-info-section">
          <div class="user-info-card">
            <div class="user-avatar">
              <img src="${this.escapeHtml(this.dashboardData.user.avatar)}" alt="User avatar">
            </div>
            <div class="user-details">
              <h2>${this.escapeHtml(this.dashboardData.user.name)}</h2>
              <p class="user-email">${this.escapeHtml(this.dashboardData.user.email)}</p>
              <div class="user-meta">
                <span class="tier-badge tier-${this.dashboardData.user.tier}">${this.dashboardData.user.tier}</span>
                <span class="join-date">Joined ${new Date(this.dashboardData.user.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="dashboard-section stats-section">
          <h2 class="section-title">Statistics</h2>
          <div class="stats-grid">
            ${this.renderStatCard('Total Formulas', this.dashboardData.stats.totalFormulas, 'formula')}
            ${this.renderStatCard('Saved Workspaces', this.dashboardData.stats.savedWorkspaces, 'workspace')}
            ${this.renderStatCard('Collaborators', this.dashboardData.stats.collaborators, 'people')}
            ${this.renderStatCard('Tutorials Completed', this.dashboardData.stats.completedTutorials, 'check')}
          </div>
        </div>

        <!-- Usage Section -->
        <div class="dashboard-section usage-section">
          <h2 class="section-title">Usage</h2>
          <div class="usage-cards">
            <div class="usage-card">
              <h3>API Calls</h3>
              <div class="usage-stat">${this.formatNumber(this.dashboardData.usage.apiCalls)}</div>
              <p class="usage-description">API calls this month</p>
              <div class="usage-bar">
                <div class="usage-fill" style="width: ${Math.min(this.dashboardData.usage.apiCalls / 1000, 100)}%"></div>
              </div>
            </div>
            <div class="usage-card">
              <h3>Storage Used</h3>
              <div class="usage-stat">${this.formatBytes(this.dashboardData.usage.storageUsed)}</div>
              <p class="usage-description">Total storage used</p>
              <div class="usage-bar">
                <div class="usage-fill" style="width: ${Math.min(this.dashboardData.usage.storageUsed / (1024 * 1024 * 1024), 100)}%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity Section -->
        <div class="dashboard-section activity-section">
          <div class="section-header">
            <h2 class="section-title">Recent Activity</h2>
            <a href="#" class="view-all-link">View all</a>
          </div>
          <div class="activity-list">
            ${this.renderActivityList()}
          </div>
        </div>

        <!-- Favorite Formulas Section -->
        <div class="dashboard-section favorites-section">
          <div class="section-header">
            <h2 class="section-title">Favorite Formulas</h2>
            <a href="#" class="view-all-link">View all</a>
          </div>
          <div class="formulas-grid">
            ${this.renderFavoriteFormulas()}
          </div>
        </div>

        <!-- Collaborations Section -->
        <div class="dashboard-section collaborations-section">
          <div class="section-header">
            <h2 class="section-title">Collaborations</h2>
            <a href="#" class="view-all-link">View all</a>
          </div>
          <div class="collaborations-list">
            ${this.renderCollaborations()}
          </div>
        </div>

        <!-- Notifications Section -->
        <div class="dashboard-section notifications-section">
          <div class="section-header">
            <h2 class="section-title">Notifications</h2>
            <button class="btn-link" id="clear-notifications" aria-label="Clear all notifications">Clear all</button>
          </div>
          <div class="notifications-list">
            ${this.renderNotifications()}
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = dashboardHTML;
  }

  renderStatCard(label, value, icon) {
    return `
      <div class="stat-card">
        <div class="stat-icon stat-${icon}">
          ${this.getIconSVG(icon)}
        </div>
        <div class="stat-content">
          <p class="stat-label">${label}</p>
          <p class="stat-value">${this.formatNumber(value)}</p>
        </div>
      </div>
    `;
  }

  renderActivityList() {
    if (this.dashboardData.recentActivity.length === 0) {
      return '<p class="empty-state">No recent activity</p>';
    }

    return this.dashboardData.recentActivity.slice(0, 5).map(activity => `
      <div class="activity-item">
        <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
        <div class="activity-content">
          <p class="activity-title">${this.escapeHtml(activity.title)}</p>
          <p class="activity-description">${this.escapeHtml(activity.description)}</p>
          <time class="activity-time" datetime="${activity.timestamp}">${this.formatTime(activity.timestamp)}</time>
        </div>
      </div>
    `).join('');
  }

  renderFavoriteFormulas() {
    if (this.dashboardData.favoriteFormulas.length === 0) {
      return '<p class="empty-state">No favorite formulas yet</p>';
    }

    return this.dashboardData.favoriteFormulas.slice(0, 6).map(formula => `
      <div class="formula-card">
        <h3>${this.escapeHtml(formula.name)}</h3>
        <code class="formula-code">${this.escapeHtml(formula.latex)}</code>
        <p class="formula-category">${this.escapeHtml(formula.category)}</p>
        <div class="formula-actions">
          <button class="btn-icon" aria-label="View formula" data-formula-id="${formula.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  renderCollaborations() {
    if (this.dashboardData.collaborations.length === 0) {
      return '<p class="empty-state">No active collaborations</p>';
    }

    return this.dashboardData.collaborations.slice(0, 5).map(collab => `
      <div class="collaboration-item">
        <div class="collaboration-header">
          <h3>${this.escapeHtml(collab.projectName)}</h3>
          <span class="status-badge status-${collab.status}">${collab.status}</span>
        </div>
        <div class="collaboration-members">
          ${collab.members.slice(0, 3).map((member, i) => `
            <div class="member-avatar" title="${this.escapeHtml(member.name)}">
              <img src="${this.escapeHtml(member.avatar)}" alt="${this.escapeHtml(member.name)}">
            </div>
          `).join('')}
          ${collab.members.length > 3 ? `<span class="member-count">+${collab.members.length - 3}</span>` : ''}
        </div>
        <p class="collaboration-description">${this.escapeHtml(collab.description)}</p>
      </div>
    `).join('');
  }

  renderNotifications() {
    if (this.dashboardData.notifications.length === 0) {
      return '<p class="empty-state">No notifications</p>';
    }

    return this.dashboardData.notifications.slice(0, 5).map(notif => `
      <div class="notification-item notification-${notif.type}">
        <div class="notification-icon">${this.getNotificationIcon(notif.type)}</div>
        <div class="notification-content">
          <p class="notification-title">${this.escapeHtml(notif.title)}</p>
          <p class="notification-message">${this.escapeHtml(notif.message)}</p>
          <time class="notification-time" datetime="${notif.timestamp}">${this.formatTime(notif.timestamp)}</time>
        </div>
        <button class="btn-dismiss" aria-label="Dismiss notification" data-notification-id="${notif.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `).join('');
  }

  attachEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadDashboardData());
    }

    // Clear notifications
    const clearNotifBtn = document.getElementById('clear-notifications');
    if (clearNotifBtn) {
      clearNotifBtn.addEventListener('click', () => this.clearNotifications());
    }

    // Dismiss individual notifications
    document.querySelectorAll('.btn-dismiss').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const notifId = e.currentTarget.dataset.notificationId;
        this.dismissNotification(notifId);
      });
    });

    // View formula buttons
    document.querySelectorAll('.formula-card .btn-icon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const formulaId = e.currentTarget.dataset.formulaId;
        this.viewFormula(formulaId);
      });
    });
  }

  updateUI() {
    // Update specific UI elements without re-rendering entire dashboard
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
      activityList.innerHTML = this.renderActivityList();
    }

    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
      notificationsList.innerHTML = this.renderNotifications();
    }

    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
      statsGrid.innerHTML = `
        ${this.renderStatCard('Total Formulas', this.dashboardData.stats.totalFormulas, 'formula')}
        ${this.renderStatCard('Saved Workspaces', this.dashboardData.stats.savedWorkspaces, 'workspace')}
        ${this.renderStatCard('Collaborators', this.dashboardData.stats.collaborators, 'people')}
        ${this.renderStatCard('Tutorials Completed', this.dashboardData.stats.completedTutorials, 'check')}
      `;
    }
  }

  async dismissNotification(notifId) {
    try {
      await this.dataService.dismissNotification(notifId);
      this.dashboardData.notifications = this.dashboardData.notifications.filter(n => n.id !== notifId);
      this.updateUI();
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  }

  async clearNotifications() {
    try {
      await this.dataService.clearNotifications(this.userId);
      this.dashboardData.notifications = [];
      this.updateUI();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  async viewFormula(formulaId) {
    // Trigger navigation or modal to view formula
    window.dispatchEvent(new CustomEvent('view-formula', { detail: { formulaId } }));
  }

  // Utility methods
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  getIconSVG(icon) {
    const icons = {
      formula: '<path d="M10 12h4M12 10v4M4 20a4 4 0 0 0 4-4V4a4 4 0 0 1 4-4 4 4 0 0 1 4 4v12a4 4 0 0 0 4 4Z"></path>',
      workspace: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line>',
      people: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
      check: '<polyline points="20 6 9 17 4 12"></polyline>'
    };
    return icons[icon] || '';
  }

  getActivityIcon(type) {
    const icons = {
      create: '✨',
      update: '📝',
      delete: '🗑️',
      share: '🤝',
      comment: '💬'
    };
    return icons[type] || '📌';
  }

  getNotificationIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type] || '📬';
  }

  destroy() {
    this.stopPeriodicUpdates();
    if (this.realtimeService) {
      this.realtimeService.unsubscribe(`user:${this.userId}`);
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserDashboard;
}
