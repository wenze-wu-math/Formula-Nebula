/**
 * Formula Nebula - Billing Dashboard
 *
 * Interactive UI for managing subscriptions, viewing usage, and upgrading tiers.
 */

import {
  GetTier,
  UpgradeTier,
  CalculateQuotas,
  CheckLimits,
  getUsageSummary,
  getAllTiers,
  TIER_TYPES,
  compareTiers
} from './tiers.js';

// ============================================================================
// Dashboard State
// ============================================================================

let currentUserId = null;
let dashboardContainer = null;
let refreshInterval = null;

// ============================================================================
// Dashboard Initialization
// ============================================================================

/**
 * Initialize the billing dashboard
 * @param {string} userId - User identifier
 * @param {HTMLElement} container - Container element for the dashboard
 * @param {Object} options - Configuration options
 */
export function initBillingDashboard(userId, container, options = {}) {
  currentUserId = userId;
  dashboardContainer = container;

  if (!container) {
    throw new Error('Container element is required');
  }

  // Clear existing content
  container.innerHTML = '';
  container.className = 'billing-dashboard';

  // Render dashboard
  renderDashboard();

  // Auto-refresh if enabled
  if (options.autoRefresh) {
    refreshInterval = setInterval(() => {
      refreshDashboard();
    }, options.refreshInterval || 60000); // Default 1 minute
  }

  return {
    refresh: refreshDashboard,
    destroy: destroyDashboard
  };
}

/**
 * Render the complete dashboard
 */
function renderDashboard() {
  if (!dashboardContainer) return;

  const tier = GetTier(currentUserId);
  const summary = getUsageSummary(currentUserId);
  const allTiers = getAllTiers();

  dashboardContainer.innerHTML = `
    <div class="billing-header">
      <h2>Billing & Subscription</h2>
      <div class="current-plan">
        <span class="plan-badge plan-${tier.id}">${tier.name}</span>
        ${tier.price ? `<span class="plan-price">$${tier.price}/${tier.billingCycle}</span>` : '<span class="plan-price">Free Forever</span>'}
      </div>
    </div>

    <div class="billing-content">
      <!-- Usage Section -->
      <div class="billing-section usage-section">
        <h3>Usage Overview</h3>
        ${renderUsageMetrics(summary)}
        ${renderWarnings(summary.warnings)}
      </div>

      <!-- Current Plan Section -->
      <div class="billing-section current-plan-section">
        <h3>Current Plan Features</h3>
        ${renderFeatureList(tier)}
      </div>

      <!-- Upgrade Options -->
      <div class="billing-section upgrade-section">
        <h3>Available Plans</h3>
        ${renderTierCards(allTiers, tier.id)}
      </div>

      <!-- Billing History (Placeholder) -->
      <div class="billing-section history-section">
        <h3>Billing History</h3>
        ${renderBillingHistory()}
      </div>
    </div>
  `;

  // Attach event listeners
  attachEventListeners();
}

/**
 * Render usage metrics with progress bars
 */
function renderUsageMetrics(summary) {
  const metrics = [
    {
      label: 'Storage',
      key: 'storage',
      data: summary.usage.storage,
      formatter: formatBytes
    },
    {
      label: 'Collections',
      key: 'collections',
      data: summary.usage.collections,
      formatter: (value) => value.toString()
    },
    {
      label: 'Private Collections',
      key: 'privateCollections',
      data: summary.usage.privateCollections,
      formatter: (value) => value.toString()
    },
    {
      label: 'Collaborators',
      key: 'collaborators',
      data: summary.usage.collaborators,
      formatter: (value) => value.toString()
    },
    {
      label: 'API Calls Today',
      key: 'apiCallsToday',
      data: summary.usage.apiCallsToday,
      formatter: (value) => value.toString()
    }
  ];

  return `
    <div class="usage-metrics">
      ${metrics.map(metric => renderUsageBar(metric)).join('')}
    </div>
  `;
}

/**
 * Render a single usage progress bar
 */
function renderUsageBar(metric) {
  const { label, data, formatter } = metric;
  const { used, limit, percentage, unlimited } = data;

  const displayLimit = unlimited ? '∞' : formatter(limit);
  const displayUsed = formatter(used);
  const barClass = percentage > 80 ? 'danger' : percentage > 60 ? 'warning' : 'normal';

  return `
    <div class="usage-metric">
      <div class="metric-header">
        <span class="metric-label">${label}</span>
        <span class="metric-value">${displayUsed} / ${displayLimit}</span>
      </div>
      <div class="metric-bar">
        <div class="metric-progress ${barClass}" style="width: ${unlimited ? 0 : percentage}%"></div>
      </div>
      ${!unlimited ? `<span class="metric-percentage">${percentage.toFixed(1)}% used</span>` : '<span class="metric-percentage">Unlimited</span>'}
    </div>
  `;
}

/**
 * Render usage warnings
 */
function renderWarnings(warnings) {
  if (!warnings || warnings.length === 0) {
    return '';
  }

  return `
    <div class="usage-warnings">
      ${warnings.map(warning => `
        <div class="warning-item ${warning.severity}">
          <span class="warning-icon">⚠</span>
          <span class="warning-message">${warning.message}</span>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render feature list for current tier
 */
function renderFeatureList(tier) {
  return `
    <ul class="feature-list">
      ${tier.features.map(feature => `
        <li class="feature-item">
          <span class="feature-check">✓</span>
          <span class="feature-text">${feature}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

/**
 * Render tier comparison cards
 */
function renderTierCards(tiers, currentTierId) {
  return `
    <div class="tier-cards">
      ${tiers.map(tier => renderTierCard(tier, currentTierId)).join('')}
    </div>
  `;
}

/**
 * Render a single tier card
 */
function renderTierCard(tier, currentTierId) {
  const isCurrent = tier.id === currentTierId;
  const canUpgrade = compareTiers(tier.id, currentTierId) > 0;
  const priceDisplay = tier.price !== null ? `$${tier.price}` : 'Contact Sales';
  const billingDisplay = tier.billingCycle ? `/${tier.billingCycle}` : '';

  return `
    <div class="tier-card ${isCurrent ? 'current' : ''} ${tier.id}">
      <div class="tier-card-header">
        <h4 class="tier-name">${tier.name}</h4>
        ${isCurrent ? '<span class="current-badge">Current Plan</span>' : ''}
      </div>

      <div class="tier-price">
        <span class="price-amount">${priceDisplay}</span>
        <span class="price-cycle">${billingDisplay}</span>
      </div>

      <ul class="tier-features">
        ${tier.features.slice(0, 5).map(feature => `
          <li class="tier-feature">
            <span class="feature-check">✓</span>
            ${feature}
          </li>
        `).join('')}
        ${tier.features.length > 5 ? `<li class="tier-feature more">+${tier.features.length - 5} more features</li>` : ''}
      </ul>

      <div class="tier-actions">
        ${isCurrent
          ? '<button class="btn-secondary" disabled>Current Plan</button>'
          : canUpgrade
            ? `<button class="btn-primary upgrade-btn" data-tier="${tier.id}">Upgrade to ${tier.name}</button>`
            : '<button class="btn-secondary" disabled>Contact Sales</button>'
        }
      </div>
    </div>
  `;
}

/**
 * Render billing history
 */
function renderBillingHistory() {
  // Placeholder - would fetch from backend in production
  return `
    <div class="billing-history">
      <p class="no-history">No billing history available.</p>
      <p class="history-note">Invoices and payment receipts will appear here after your first payment.</p>
    </div>
  `;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Attach event listeners to dashboard elements
 */
function attachEventListeners() {
  if (!dashboardContainer) return;

  // Upgrade button clicks
  const upgradeButtons = dashboardContainer.querySelectorAll('.upgrade-btn');
  upgradeButtons.forEach(button => {
    button.addEventListener('click', handleUpgradeClick);
  });
}

/**
 * Handle upgrade button click
 */
async function handleUpgradeClick(event) {
  const targetTier = event.target.dataset.tier;

  if (!targetTier) return;

  // Show confirmation modal
  const confirmed = await showUpgradeConfirmation(targetTier);

  if (confirmed) {
    try {
      const result = UpgradeTier(currentUserId, targetTier);

      if (result.success) {
        showNotification('success', `Successfully upgraded to ${result.newTier.name}!`);
        refreshDashboard();
      } else {
        showNotification('error', result.error || 'Upgrade failed');
      }
    } catch (error) {
      showNotification('error', `Error: ${error.message}`);
    }
  }
}

/**
 * Show upgrade confirmation modal
 */
async function showUpgradeConfirmation(tierType) {
  const tier = CalculateQuotas(tierType);

  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'billing-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Upgrade to ${tier.tierName}?</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>You're about to upgrade to the <strong>${tier.tierName}</strong> plan.</p>
          ${tier.pricing.price ? `
            <div class="pricing-summary">
              <span class="price-label">Monthly charge:</span>
              <span class="price-value">$${tier.pricing.price}</span>
            </div>
          ` : '<p><strong>Note:</strong> Enterprise pricing is custom. Our team will contact you.</p>'}
          <p class="upgrade-note">Your new features will be available immediately.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary cancel-btn">Cancel</button>
          <button class="btn-primary confirm-btn">Confirm Upgrade</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const closeModal = () => {
      document.body.removeChild(modal);
      resolve(false);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(true);
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  });
}

/**
 * Show notification toast
 */
function showNotification(type, message) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// ============================================================================
// Dashboard Lifecycle
// ============================================================================

/**
 * Refresh dashboard data
 */
function refreshDashboard() {
  renderDashboard();
}

/**
 * Destroy dashboard and clean up
 */
function destroyDashboard() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }

  if (dashboardContainer) {
    dashboardContainer.innerHTML = '';
    dashboardContainer = null;
  }

  currentUserId = null;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  if (bytes === -1) return '∞';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ============================================================================
// Public API
// ============================================================================

export {
  initBillingDashboard,
  refreshDashboard,
  destroyDashboard
};
