/**
 * Premium Integration Example
 *
 * Shows how to integrate premium features into existing codebase
 */

import { PremiumModal } from '../components/PremiumModal.js';
import { premiumGate } from './gate.js';
import '../premium/premium.css';

// Initialize premium modal (called once on app start)
export function initPremiumFeatures() {
  const modal = new PremiumModal();

  // Listen for show premium modal events
  window.addEventListener('show-premium-modal', (e) => {
    const { suggestedTier } = e.detail || {};
    if (suggestedTier) {
      modal.selectedTier = suggestedTier;
    }
    modal.show();
  });

  // Add "Upgrade" button to UI
  addUpgradeButton();

  // Add tier badge to show current plan
  addTierBadge();

  // Add usage indicator for rate-limited features
  addUsageIndicators();

  console.log('[Premium] Initialized');
}

// Add upgrade button to navigation
function addUpgradeButton() {
  const nav = document.querySelector('.nav-controls') || document.querySelector('header');
  if (!nav) return;

  const upgradeBtn = document.createElement('button');
  upgradeBtn.className = 'upgrade-btn';
  upgradeBtn.innerHTML = `
    <span class="upgrade-icon">⭐</span>
    <span class="upgrade-text">升级</span>
  `;
  upgradeBtn.addEventListener('click', () => {
    premiumGate.showPremiumModal();
  });

  nav.appendChild(upgradeBtn);
}

// Add tier badge showing current plan
function addTierBadge() {
  const tier = premiumGate.getTierInfo();
  const badge = document.createElement('div');
  badge.className = `tier-badge tier-${tier.id}`;
  badge.textContent = tier.name;
  badge.title = `当前方案: ${tier.name}`;

  document.body.appendChild(badge);
}

// Add usage indicators for rate-limited features
function addUsageIndicators() {
  const stats = premiumGate.getUsageStats();

  // Example: Show semantic search quota in search UI
  if (stats.semanticSearch?.daily) {
    const { remaining, limit } = stats.semanticSearch.daily;
    const searchUI = document.querySelector('.search-container');
    if (searchUI && limit !== -1) {
      const indicator = document.createElement('div');
      indicator.className = 'usage-indicator';
      indicator.innerHTML = `
        <span class="usage-label">语义搜索</span>
        <span class="usage-value">${remaining}/${limit}</span>
      `;
      searchUI.appendChild(indicator);
    }
  }
}

// Example: Gate semantic search feature
export async function performSemanticSearch(query) {
  // Check if user has access and hasn't hit rate limit
  if (!premiumGate.requireLimit('semanticSearch', 'daily')) {
    return null;  // User was prompted to upgrade
  }

  // Proceed with search
  try {
    const response = await fetch('/api/semantic-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    return await response.json();
  } catch (error) {
    console.error('[SemanticSearch] Error:', error);
    return null;
  }
}

// Example: Gate proof generation feature
export async function generateProof(theoremId) {
  // Check feature access first
  if (!premiumGate.requireAccess('proofGeneration')) {
    return null;  // User was prompted to upgrade
  }

  // Check monthly limit
  if (!premiumGate.requireLimit('proofGeneration', 'monthly')) {
    return null;  // User hit limit and was prompted
  }

  // Proceed with generation
  try {
    const response = await fetch('/api/proof-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theoremId })
    });

    return await response.json();
  } catch (error) {
    console.error('[ProofGeneration] Error:', error);
    return null;
  }
}

// Example: Gate paper analysis
export async function analyzePaper(paperUrl) {
  if (!premiumGate.requireLimit('paperAnalysis', 'monthly')) {
    return null;
  }

  try {
    const response = await fetch('/api/analyze-paper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperUrl })
    });

    return await response.json();
  } catch (error) {
    console.error('[PaperAnalysis] Error:', error);
    return null;
  }
}

// Example: Add premium feature to existing search UI
export function enhanceSearchUI() {
  const searchInput = document.querySelector('#search-input');
  if (!searchInput) return;

  // Add semantic search toggle
  const toggle = document.createElement('label');
  toggle.className = 'semantic-toggle';
  toggle.innerHTML = `
    <input type="checkbox" id="semantic-search-toggle" />
    <span>语义搜索</span>
    <span class="premium-badge">⭐</span>
  `;

  searchInput.parentElement.appendChild(toggle);

  // Handle toggle
  const checkbox = toggle.querySelector('input');
  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      // Check if user has access
      const check = premiumGate.checkLimit('semanticSearch', 'daily');
      if (!check.allowed) {
        e.target.checked = false;
        premiumGate.promptLimitReached('semanticSearch', 'daily');
      }
    }
  });
}

// Example: Add "Pro" badge to premium features in UI
export function markPremiumFeatures() {
  const premiumFeatures = [
    { selector: '.proof-generation-btn', feature: 'proofGeneration' },
    { selector: '.theorem-discovery-btn', feature: 'theoremDiscovery' },
    { selector: '.paper-analysis-btn', feature: 'paperAnalysis' }
  ];

  premiumFeatures.forEach(({ selector, feature }) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Check if user has access
      if (!premiumGate.hasAccess(feature)) {
        // Add premium badge
        const badge = document.createElement('span');
        badge.className = 'premium-badge';
        badge.textContent = '⭐ Pro';
        badge.title = '此功能需要升级';
        el.appendChild(badge);

        // Add click handler to show upgrade modal
        el.addEventListener('click', (e) => {
          if (!premiumGate.hasAccess(feature)) {
            e.preventDefault();
            e.stopPropagation();
            premiumGate.promptUpgrade(feature);
          }
        });
      }
    });
  });
}

// Debug helpers (development only)
if (process.env.NODE_ENV === 'development') {
  window.debugPremium = {
    setTier: (tier) => premiumGate._debugSetTier(tier),
    resetUsage: () => premiumGate._debugResetUsage(),
    showModal: () => premiumGate.showPremiumModal(),
    getStats: () => premiumGate.getUsageStats(),
    getTier: () => premiumGate.getTierInfo()
  };

  console.log('[Premium] Debug commands available: window.debugPremium');
}

// Styles for integration components
const integrationStyles = `
.upgrade-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.upgrade-btn:hover {
  transform: translateY(-2px);
}

.upgrade-icon {
  font-size: 18px;
}

.tier-badge {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  z-index: 1000;
  border: 2px solid;
}

.tier-badge.tier-free {
  border-color: #6b7280;
}

.tier-badge.tier-scholar {
  border-color: #3b82f6;
}

.tier-badge.tier-professional {
  border-color: #8b5cf6;
}

.tier-badge.tier-research {
  border-color: #f59e0b;
}

.usage-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8px;
}

.usage-value {
  font-weight: 700;
  color: #fbbf24;
}

.semantic-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  cursor: pointer;
}

.premium-badge {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  margin-left: 6px;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = integrationStyles;
document.head.appendChild(styleSheet);
