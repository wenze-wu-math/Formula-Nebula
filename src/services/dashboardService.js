/**
 * dashboardService.js - Data fetching service for user dashboard
 * Handles API calls for dashboard data, notifications, and user information
 */

class DashboardDataService {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '/api';
    this.timeout = options.timeout || 30000;
    this.cache = new Map();
    this.cacheExpiry = options.cacheExpiry || 300000; // 5 minutes default
  }

  /**
   * Fetch complete dashboard data
   */
  async fetchDashboardData(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const cacheKey = `dashboard:${userId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [user, stats, activity, favorites, collaborations, usage, notifications] = await Promise.all([
        this.fetchUserInfo(userId),
        this.fetchUserStats(userId),
        this.fetchRecentActivity(userId),
        this.fetchFavoriteFormulas(userId),
        this.fetchCollaborations(userId),
        this.fetchUsageData(userId),
        this.fetchNotifications(userId)
      ]);

      const data = {
        user,
        stats,
        recentActivity: activity,
        favoriteFormulas: favorites,
        collaborations,
        usage,
        notifications
      };

      this.setInCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  /**
   * Fetch user profile information
   */
  async fetchUserInfo(userId) {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/users/${userId}`);
      const user = await response.json();

      // Provide default values if fields are missing
      return {
        name: user.name || 'User',
        email: user.email || '',
        avatar: user.avatar || this.getDefaultAvatar(user.name),
        joinDate: user.joinDate || new Date().toISOString(),
        tier: user.tier || 'free',
        ...user
      };
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // Return default user object on failure
      return {
        name: 'User',
        email: '',
        avatar: '',
        joinDate: new Date().toISOString(),
        tier: 'free'
      };
    }
  }

  /**
   * Fetch user statistics
   */
  async fetchUserStats(userId) {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/users/${userId}/stats`);
      const stats = await response.json();

      return {
        totalFormulas: stats.totalFormulas || 0,
        savedWorkspaces: stats.savedWorkspaces || 0,
        collaborators: stats.collaborators || 0,
        completedTutorials: stats.completedTutorials || 0,
        ...stats
      };
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return {
        totalFormulas: 0,
        savedWorkspaces: 0,
        collaborators: 0,
        completedTutorials: 0
      };
    }
  }

  /**
   * Fetch recent activity for user
   */
  async fetchRecentActivity(userId, limit = 10) {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/${userId}/activity?limit=${limit}`
      );
      const activities = await response.json();

      return Array.isArray(activities) ? activities : [];
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      return [];
    }
  }

  /**
   * Fetch favorite formulas
   */
  async fetchFavoriteFormulas(userId, limit = 12) {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/${userId}/favorites?limit=${limit}`
      );
      const formulas = await response.json();

      return Array.isArray(formulas) ? formulas.map(f => ({
        id: f.id,
        name: f.name || 'Unnamed',
        latex: f.latex || '',
        category: f.category || 'Uncategorized',
        ...f
      })) : [];
    } catch (error) {
      console.error('Failed to fetch favorite formulas:', error);
      return [];
    }
  }

  /**
   * Fetch active collaborations
   */
  async fetchCollaborations(userId, limit = 10) {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/${userId}/collaborations?limit=${limit}`
      );
      const collaborations = await response.json();

      return Array.isArray(collaborations) ? collaborations.map(c => ({
        id: c.id,
        projectName: c.projectName || 'Untitled Project',
        description: c.description || '',
        status: c.status || 'active',
        members: c.members || [],
        ...c
      })) : [];
    } catch (error) {
      console.error('Failed to fetch collaborations:', error);
      return [];
    }
  }

  /**
   * Fetch usage data (API calls, storage)
   */
  async fetchUsageData(userId) {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/users/${userId}/usage`);
      const usage = await response.json();

      return {
        apiCalls: usage.apiCalls || 0,
        storageUsed: usage.storageUsed || 0,
        lastUpdated: usage.lastUpdated || new Date().toISOString(),
        ...usage
      };
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
      return {
        apiCalls: 0,
        storageUsed: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Fetch user notifications
   */
  async fetchNotifications(userId, limit = 20) {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/${userId}/notifications?limit=${limit}`
      );
      const notifications = await response.json();

      return Array.isArray(notifications) ? notifications.map(n => ({
        id: n.id,
        title: n.title || '',
        message: n.message || '',
        type: n.type || 'info',
        timestamp: n.timestamp || new Date().toISOString(),
        read: n.read || false,
        ...n
      })) : [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  /**
   * Dismiss a notification
   */
  async dismissNotification(notificationId) {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/notifications/${notificationId}/dismiss`,
        {
          method: 'POST'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications for user
   */
  async clearNotifications(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/${userId}/notifications/clear`,
        {
          method: 'POST'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      throw error;
    }
  }

  /**
   * Create a new activity record
   */
  async recordActivity(userId, activityData) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/${userId}/activity`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(activityData)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Invalidate cache
      this.invalidateCache(`dashboard:${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to record activity:', error);
      throw error;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId, settings) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/${userId}/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Invalidate cache
      this.invalidateCache(`dashboard:${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  }

  /**
   * Fetch with timeout
   */
  fetchWithTimeout(url, options = {}) {
    return Promise.race([
      fetch(url, {
        headers: this.getDefaultHeaders(),
        ...options
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), this.timeout)
      )
    ]);
  }

  /**
   * Get default headers for API requests
   */
  getDefaultHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  /**
   * Get auth token (implement based on your auth system)
   */
  getAuthToken() {
    // This should be implemented based on your authentication system
    return localStorage.getItem('auth-token') || '';
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setInCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  invalidateCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Generate default avatar
   */
  getDefaultAvatar(name) {
    const initial = (name || 'U').charAt(0).toUpperCase();
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F'];
    const colorIndex = (name || 'User').charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${bgColor}&color=fff`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardDataService;
}
