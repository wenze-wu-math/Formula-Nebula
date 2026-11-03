/**
 * Settings Module - Main Export
 * Complete personalization system for Formula Nebula
 */

import SettingsStorage from './storage.js';
import SettingsManager from './SettingsManager.js';

/**
 * Initialize settings system
 * @param {Object} options Configuration options
 * @returns {SettingsManager} Settings manager instance
 */
function initializeSettings(options = {}) {
  const manager = new SettingsManager(options);
  return manager;
}

/**
 * Get current settings
 * @returns {Object} Current settings
 */
function getSettings() {
  const storage = new SettingsStorage();
  return storage.loadLocal();
}

/**
 * Update settings
 * @param {Object} newSettings New settings to apply
 * @returns {boolean} Success status
 */
function updateSettings(newSettings) {
  const storage = new SettingsStorage();
  return storage.saveLocal(newSettings);
}

/**
 * Sync settings with server
 * @param {string} syncEndpoint Server endpoint
 * @param {string} userId User ID
 * @returns {Promise<Object>} Synced settings
 */
async function syncSettings(syncEndpoint, userId) {
  const storage = new SettingsStorage({
    syncEndpoint,
    userId,
    autoSync: true
  });
  return await storage.sync();
}

/**
 * Export settings as JSON
 * @returns {string} JSON string of settings
 */
function exportSettings() {
  const storage = new SettingsStorage();
  return storage.export();
}

/**
 * Import settings from JSON
 * @param {string} settingsJSON JSON string of settings
 * @returns {boolean} Success status
 */
function importSettings(settingsJSON) {
  const storage = new SettingsStorage();
  return storage.import(settingsJSON);
}

/**
 * Clear all settings
 * @returns {boolean} Success status
 */
function clearSettings() {
  const storage = new SettingsStorage();
  return storage.clear();
}

// Export for ES6 modules
export {
  SettingsStorage,
  SettingsManager,
  initializeSettings,
  getSettings,
  updateSettings,
  syncSettings,
  exportSettings,
  importSettings,
  clearSettings
};

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SettingsStorage,
    SettingsManager,
    initializeSettings,
    getSettings,
    updateSettings,
    syncSettings,
    exportSettings,
    importSettings,
    clearSettings
  };
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Settings will be initialized on demand
  });
} else {
  // Settings will be initialized on demand
}
