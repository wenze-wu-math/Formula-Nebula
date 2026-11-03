/**
 * dashboard-example.js - Usage example for UserDashboard component
 */

// Example 1: Basic Dashboard Initialization
function initializeDashboard() {
  // Create dashboard container
  const dashboardContainer = document.getElementById('dashboard-container');

  // Initialize dashboard
  const dashboard = new UserDashboard({
    container: dashboardContainer,
    userId: 'user-123', // Replace with actual user ID
    onUpdate: (data) => {
      console.log('Dashboard updated:', data);
    }
  });

  return dashboard;
}

// Example 2: Dashboard with Custom Configuration
function initializeDashboardWithConfig() {
  const dashboard = new UserDashboard({
    container: document.getElementById('dashboard'),
    userId: getCurrentUserId(),
    onUpdate: (data) => {
      // Handle dashboard updates
      updateAnalytics(data.stats);
      updateNotificationBadge(data.notifications.length);
    }
  });

  // Listen for real-time updates
  if (dashboard.realtimeService) {
    dashboard.realtimeService.addEventListener('connected', () => {
      console.log('Real-time service connected');
      showNotification('Connected to live updates', 'success');
    });

    dashboard.realtimeService.addEventListener('disconnected', () => {
      console.log('Real-time service disconnected');
      showNotification('Disconnected from live updates', 'warning');
    });

    dashboard.realtimeService.addEventListener('error', (detail) => {
      console.error('Real-time error:', detail);
    });
  }

  return dashboard;
}

// Example 3: Handling Dashboard Events
function setupDashboardEventHandlers(dashboard) {
  // Listen for view formula events
  window.addEventListener('view-formula', (e) => {
    const { formulaId } = e.detail;
    console.log('Opening formula:', formulaId);
    openFormulaModal(formulaId);
  });

  // Handle navigation from dashboard
  document.addEventListener('click', (e) => {
    if (e.target.matches('.view-all-link')) {
      e.preventDefault();
      const section = e.target.closest('.dashboard-section');
      const title = section.querySelector('.section-title')?.textContent;
      navigateToSection(title);
    }
  });
}

// Example 4: Manual Data Refresh
function setupManualRefresh(dashboard) {
  const refreshBtn = document.getElementById('refresh-btn');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      // Add loading state
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Refreshing...';

      try {
        await dashboard.loadDashboardData();
        showNotification('Dashboard refreshed', 'success');
      } catch (error) {
        showNotification('Failed to refresh dashboard', 'error');
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh';
      }
    });
  }
}

// Example 5: Recording User Activities
async function recordUserActivity(dashboard, activityType, activityData) {
  try {
    await dashboard.dataService.recordActivity(dashboard.userId, {
      type: activityType,
      title: activityData.title,
      description: activityData.description,
      timestamp: new Date().toISOString()
    });

    console.log('Activity recorded:', activityType);
  } catch (error) {
    console.error('Failed to record activity:', error);
  }
}

// Example 6: Real-time Notifications
function setupRealtimeNotifications(dashboard) {
  if (!dashboard.realtimeService) {
    console.warn('Realtime service not available');
    return;
  }

  // Subscribe to user-specific events
  dashboard.realtimeService.subscribe(`user:${dashboard.userId}`, (data) => {
    console.log('Real-time update received:', data);

    // Handle different types of updates
    switch (data.type) {
      case 'activity':
        showActivityNotification(data.payload);
        break;
      case 'notification':
        showPushNotification(data.payload);
        break;
      case 'stats':
        updateStatsDisplay(data.payload);
        break;
      case 'collaboration':
        handleCollaborationUpdate(data.payload);
        break;
    }
  });

  // Subscribe to team channel if needed
  dashboard.realtimeService.subscribe(`team:${getTeamId()}`, (data) => {
    console.log('Team update:', data);
  });
}

// Example 7: Syncing with Other Components
class DashboardSyncManager {
  constructor(dashboard) {
    this.dashboard = dashboard;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Sync when formulas are saved
    window.addEventListener('formula-saved', (e) => {
      this.dashboard.dataService.recordActivity(this.dashboard.userId, {
        type: 'create',
        title: 'Formula saved',
        description: `Saved formula: ${e.detail.formulaName}`,
        timestamp: new Date().toISOString()
      });
    });

    // Sync when workspaces are created
    window.addEventListener('workspace-created', (e) => {
      this.dashboard.loadDashboardData();
    });

    // Sync when collaborations change
    window.addEventListener('collaboration-updated', (e) => {
      this.dashboard.loadDashboardData();
    });
  }
}

// Example 8: Customizing Dashboard Appearance
function customizeDashboardTheme(dashboard, theme) {
  const root = document.documentElement;

  const themes = {
    light: {
      '--bg-primary': '#FFFFFF',
      '--bg-secondary': '#F5F5F5',
      '--text-primary': '#1F2937',
      '--text-secondary': '#6B7280',
      '--border-color': '#E5E7EB',
      '--accent-color': '#3B82F6',
      '--accent-color-light': '#60A5FA'
    },
    dark: {
      '--bg-primary': '#1F2937',
      '--bg-secondary': '#111827',
      '--text-primary': '#F3F4F6',
      '--text-secondary': '#9CA3AF',
      '--border-color': '#374151',
      '--accent-color': '#60A5FA',
      '--accent-color-light': '#93C5FD'
    },
    high_contrast: {
      '--bg-primary': '#FFFFFF',
      '--bg-secondary': '#F0F0F0',
      '--text-primary': '#000000',
      '--text-secondary': '#333333',
      '--border-color': '#000000',
      '--accent-color': '#0000FF',
      '--accent-color-light': '#0000CC'
    }
  };

  if (themes[theme]) {
    Object.entries(themes[theme]).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
}

// Example 9: Performance Optimization
function optimizeDashboardPerformance(dashboard) {
  // Implement virtual scrolling for long lists
  const activityList = document.querySelector('.activity-list');
  if (activityList && activityList.children.length > 10) {
    implementVirtualScrolling(activityList);
  }

  // Lazy load images
  document.querySelectorAll('.user-avatar img, .member-avatar img').forEach(img => {
    lazyLoadImage(img);
  });

  // Debounce window resize for responsive updates
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateDashboardLayout();
    }, 250);
  });
}

// Example 10: Complete Setup Function
function setupCompleteUserDashboard() {
  // Initialize dashboard
  const dashboard = initializeDashboard();

  // Setup event handlers
  setupDashboardEventHandlers(dashboard);

  // Setup manual refresh
  setupManualRefresh(dashboard);

  // Setup real-time notifications
  setupRealtimeNotifications(dashboard);

  // Setup sync manager
  const syncManager = new DashboardSyncManager(dashboard);

  // Customize theme
  const userTheme = localStorage.getItem('user-theme') || 'light';
  customizeDashboardTheme(dashboard, userTheme);

  // Optimize performance
  optimizeDashboardPerformance(dashboard);

  // Handle cleanup on page unload
  window.addEventListener('beforeunload', () => {
    dashboard.destroy();
  });

  return { dashboard, syncManager };
}

// Utility Functions (implement these based on your app)
function getCurrentUserId() {
  return localStorage.getItem('user-id') || 'user-123';
}

function getTeamId() {
  return localStorage.getItem('team-id') || 'team-default';
}

function showNotification(message, type = 'info') {
  console.log(`${type.toUpperCase()}: ${message}`);
  // Implement your notification system here
}

function showActivityNotification(activity) {
  console.log('Activity notification:', activity);
  // Implement your notification UI here
}

function showPushNotification(notification) {
  console.log('Push notification:', notification);
  // Implement push notification here
}

function updateStatsDisplay(stats) {
  console.log('Stats updated:', stats);
  // Update UI with new stats
}

function handleCollaborationUpdate(collaboration) {
  console.log('Collaboration update:', collaboration);
  // Handle collaboration changes
}

function openFormulaModal(formulaId) {
  console.log('Opening formula:', formulaId);
  // Implement formula modal
}

function navigateToSection(section) {
  console.log('Navigating to section:', section);
  // Implement navigation
}

function updateAnalytics(stats) {
  console.log('Analytics updated:', stats);
  // Send to analytics service
}

function updateNotificationBadge(count) {
  const badge = document.getElementById('notification-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
  }
}

function lazyLoadImage(img) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.src = entry.target.dataset.src;
          observer.unobserve(entry.target);
        }
      });
    });
    observer.observe(img);
  }
}

function implementVirtualScrolling(container) {
  console.log('Implementing virtual scrolling for', container);
  // Implement virtual scrolling library here
}

function updateDashboardLayout() {
  console.log('Updating dashboard layout');
  // Update responsive layout
}

// Export setup function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeDashboard,
    setupCompleteUserDashboard,
    recordUserActivity,
    customizeDashboardTheme,
    DashboardSyncManager
  };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCompleteUserDashboard);
} else {
  setupCompleteUserDashboard();
}
