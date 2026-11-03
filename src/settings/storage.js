/**
 * Settings Storage Manager
 * Handles localStorage and optional backend synchronization
 */

class SettingsStorage {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'formula-nebula-settings';
    this.syncEndpoint = options.syncEndpoint || null;
    this.userId = options.userId || null;
    this.autoSync = options.autoSync !== false;
    this.syncInterval = options.syncInterval || 30000; // 30 seconds
    this.lastSyncTime = null;
    this.isSyncing = false;
    this.syncTimer = null;

    // Cache for conflict resolution
    this.cache = {
      local: null,
      remote: null,
      timestamp: 0
    };

    this.init();
  }

  init() {
    if (this.autoSync && this.syncEndpoint) {
      this.startAutoSync();
    }
  }

  /**
   * Load settings from localStorage
   */
  loadLocal() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.cache.local = JSON.parse(data);
        this.cache.timestamp = Date.now();
        return this.cache.local;
      }
    } catch (error) {
      console.error('Failed to load local settings:', error);
    }
    return null;
  }

  /**
   * Save settings to localStorage
   */
  saveLocal(settings) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
      this.cache.local = settings;
      this.cache.timestamp = Date.now();

      // Trigger sync if enabled
      if (this.autoSync && this.syncEndpoint) {
        this.syncToServer();
      }
      return true;
    } catch (error) {
      console.error('Failed to save local settings:', error);
      return false;
    }
  }

  /**
   * Load settings from server
   */
  async loadRemote() {
    if (!this.syncEndpoint || !this.userId) {
      return null;
    }

    try {
      const response = await fetch(`${this.syncEndpoint}/user/${this.userId}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        console.warn('Failed to load remote settings:', response.statusText);
        return null;
      }

      const data = await response.json();
      this.cache.remote = data;
      this.lastSyncTime = Date.now();
      return data;
    } catch (error) {
      console.error('Failed to fetch remote settings:', error);
      return null;
    }
  }

  /**
   * Save settings to server
   */
  async saveRemote(settings) {
    if (!this.syncEndpoint || !this.userId) {
      return false;
    }

    if (this.isSyncing) {
      return false; // Prevent concurrent syncs
    }

    this.isSyncing = true;

    try {
      const response = await fetch(`${this.syncEndpoint}/user/${this.userId}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          settings: settings,
          clientTimestamp: Date.now(),
          version: 1
        })
      });

      if (!response.ok) {
        console.warn('Failed to save remote settings:', response.statusText);
        return false;
      }

      this.lastSyncTime = Date.now();
      return true;
    } catch (error) {
      console.error('Failed to sync settings to server:', error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Synchronize local and remote settings
   */
  async sync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const local = this.loadLocal();
      const remote = await this.loadRemote();

      if (!local && !remote) {
        return null;
      }

      // Merge strategy: remote takes precedence, but preserve local-only settings
      const merged = this.mergeSettings(local, remote);

      // Save merged result locally
      if (merged) {
        this.saveLocal(merged);
      }

      // Sync to server if we have a remote endpoint
      if (merged && this.syncEndpoint) {
        await this.saveRemote(merged);
      }

      return merged;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Merge local and remote settings with conflict resolution
   */
  mergeSettings(local, remote) {
    if (!local && !remote) return null;
    if (!local) return remote;
    if (!remote) return local;

    // Deep merge strategy
    return this.deepMerge(local, remote);
  }

  /**
   * Deep merge two objects
   */
  deepMerge(local, remote) {
    const result = { ...local };

    for (const key in remote) {
      if (typeof remote[key] === 'object' && remote[key] !== null && !Array.isArray(remote[key])) {
        result[key] = this.deepMerge(
          result[key] || {},
          remote[key]
        );
      } else if (typeof remote[key] !== 'undefined') {
        result[key] = remote[key];
      }
    }

    return result;
  }

  /**
   * Start automatic synchronization
   */
  startAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.sync();
    }, this.syncInterval);
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Trigger immediate sync to server
   */
  async syncToServer() {
    const local = this.loadLocal();
    if (local) {
      return await this.saveRemote(local);
    }
    return false;
  }

  /**
   * Get authentication token (to be implemented by consumer)
   */
  getAuthToken() {
    // This should be overridden or set during initialization
    return localStorage.getItem('auth-token') || '';
  }

  /**
   * Clear all settings
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      this.cache = {
        local: null,
        remote: null,
        timestamp: 0
      };
      this.lastSyncTime = null;
      return true;
    } catch (error) {
      console.error('Failed to clear settings:', error);
      return false;
    }
  }

  /**
   * Export settings as JSON
   */
  export() {
    const local = this.loadLocal();
    return JSON.stringify(local, null, 2);
  }

  /**
   * Import settings from JSON
   */
  import(settingsJSON) {
    try {
      const settings = JSON.parse(settingsJSON);
      return this.saveLocal(settings);
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.stopAutoSync();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsStorage;
}
