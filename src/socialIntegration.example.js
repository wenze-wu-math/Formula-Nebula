/**
 * ═══════════════════════════════════════════════════════════════
 *  Social Features Integration Example
 * ═══════════════════════════════════════════════════════════════
 *
 * This file demonstrates how to integrate social features into
 * the main Formula Nebula application.
 */

import {
  initializeSocialFeatures,
  getCurrentUserId,
  GetUserProfile,
  trackProofView,
  trackProofUnderstood,
  trackTheoremProved,
  trackContribution,
  updateLearningStreak,
  getUserBadges,
} from './social.js'

import { showSocialHub } from './socialHub.js'
import './socialHub.css'

/**
 * Initialize social features on app startup
 * Call this in your main.js initialization
 */
export function initSocial() {
  // Initialize the social system
  initializeSocialFeatures()

  // Add social hub button to UI
  addSocialHubButton()

  // Set up automatic tracking
  setupAutoTracking()

  // Display welcome message for new users
  checkNewUserWelcome()

  console.log('[Social] Integration complete')
}

/**
 * Add social hub button to main UI
 */
function addSocialHubButton() {
  // Find the toolbar or create one
  let toolbar = document.querySelector('.toolbar')
  if (!toolbar) {
    toolbar = document.createElement('div')
    toolbar.className = 'toolbar'
    document.body.appendChild(toolbar)
  }

  // Create social button
  const socialBtn = document.createElement('button')
  socialBtn.className = 'toolbar-btn social-btn'
  socialBtn.innerHTML = '🌟 Social'
  socialBtn.title = 'Open Social Hub (Ctrl+S)'
  socialBtn.onclick = showSocialHub

  // Add badge indicator if new badges earned
  const profile = GetUserProfile(getCurrentUserId())
  const badges = getUserBadges(getCurrentUserId())
  if (badges.length > 0) {
    const lastChecked = localStorage.getItem('social:lastBadgeCheck')
    const newBadges = badges.filter(_b => {
      const earnedTime = new Date(profile.joinedAt).getTime() // Simplified
      const checkTime = lastChecked ? new Date(lastChecked).getTime() : 0
      return earnedTime > checkTime
    })

    if (newBadges.length > 0) {
      const indicator = document.createElement('span')
      indicator.className = 'badge-indicator'
      indicator.textContent = newBadges.length
      socialBtn.appendChild(indicator)
    }
  }

  toolbar.appendChild(socialBtn)

  // Add keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      showSocialHub()
    }
  })
}

/**
 * Set up automatic tracking for common events
 */
function setupAutoTracking() {
  // Track daily streak on page load
  updateLearningStreak()

  // Set up interval to check streak daily
  setInterval(() => {
    updateLearningStreak()
  }, 60 * 60 * 1000) // Check every hour
}

/**
 * Check if user is new and show welcome
 */
function checkNewUserWelcome() {
  const profile = GetUserProfile(getCurrentUserId())
  const hasSeenWelcome = localStorage.getItem('social:hasSeenWelcome')

  if (profile && !hasSeenWelcome && profile.stats.proofsViewed === 0) {
    setTimeout(() => {
      showWelcomeToast()
      localStorage.setItem('social:hasSeenWelcome', 'true')
    }, 2000)
  }
}

/**
 * Show welcome toast for new users
 */
function showWelcomeToast() {
  const toast = document.createElement('div')
  toast.className = 'toast welcome-toast'
  toast.innerHTML = `
    <div class="toast-icon">🌟</div>
    <div class="toast-content">
      <div class="toast-title">Welcome to Formula Nebula!</div>
      <div class="toast-message">
        Track your learning, earn badges, and connect with mathematicians.
      </div>
      <button class="toast-action" onclick="this.closest('.toast').remove(); window.showSocialHub()">
        Open Social Hub
      </button>
    </div>
  `
  document.body.appendChild(toast)

  setTimeout(() => toast.classList.add('show'), 100)
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 10000)
}

/**
 * Show XP gain toast notification
 */
export function showXPToast(xp, reason) {
  const toast = document.createElement('div')
  toast.className = 'toast xp-toast'
  toast.innerHTML = `
    <div class="toast-icon">✨</div>
    <div class="toast-content">
      <div class="toast-title">+${xp} XP</div>
      <div class="toast-message">${reason}</div>
    </div>
  `
  document.body.appendChild(toast)

  setTimeout(() => toast.classList.add('show'), 100)
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

/**
 * Show badge earned notification
 */
export function showBadgeToast(badge) {
  const toast = document.createElement('div')
  toast.className = 'toast badge-toast'
  toast.innerHTML = `
    <div class="toast-icon">${badge.icon}</div>
    <div class="toast-content">
      <div class="toast-title">Badge Earned!</div>
      <div class="toast-message">${badge.name}</div>
      <div class="toast-tier ${badge.tier}">${badge.tier.toUpperCase()}</div>
    </div>
  `
  document.body.appendChild(toast)

  setTimeout(() => toast.classList.add('show'), 100)

  // Play achievement sound if available
  playAchievementSound()

  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 5000)
}

/**
 * Show level up notification
 */
export function showLevelUpToast(level) {
  const toast = document.createElement('div')
  toast.className = 'toast levelup-toast'
  toast.innerHTML = `
    <div class="toast-icon">⬆️</div>
    <div class="toast-content">
      <div class="toast-title">Level Up!</div>
      <div class="toast-message">You reached Level ${level}</div>
    </div>
  `
  document.body.appendChild(toast)

  setTimeout(() => toast.classList.add('show'), 100)

  // Play level up sound if available
  playLevelUpSound()

  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 5000)
}

/**
 * Play achievement sound
 */
function playAchievementSound() {
  try {
    const audio = new Audio('/sounds/achievement.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {}) // Ignore errors
  } catch (e) {
    // No sound available
  }
}

/**
 * Play level up sound
 */
function playLevelUpSound() {
  try {
    const audio = new Audio('/sounds/levelup.mp3')
    audio.volume = 0.4
    audio.play().catch(() => {}) // Ignore errors
  } catch (e) {
    // No sound available
  }
}

/**
 * Integration with proof viewer
 * Call this when a proof is opened
 */
export function onProofOpened(proofId, proofTitle) {
  // Track the view
  trackProofView(proofId, proofTitle)

  // Show XP notification
  showXPToast(10, 'Proof viewed')

  // Add "Mark as Understood" button to proof viewer
  addMarkAsUnderstoodButton(proofId, proofTitle)
}

/**
 * Add "Mark as Understood" button to proof viewer
 */
function addMarkAsUnderstoodButton(proofId, proofTitle) {
  const proofViewer = document.querySelector('.proof-viewer')
  if (!proofViewer) return

  let actionBar = proofViewer.querySelector('.proof-actions')
  if (!actionBar) {
    actionBar = document.createElement('div')
    actionBar.className = 'proof-actions'
    proofViewer.appendChild(actionBar)
  }

  // Check if already understood
  const understood = getUnderstoodProofs()
  const isUnderstood = understood.includes(proofId)

  if (!isUnderstood) {
    const btn = document.createElement('button')
    btn.className = 'btn-understand'
    btn.innerHTML = '✅ Mark as Understood'
    btn.onclick = () => {
      markProofAsUnderstood(proofId, proofTitle)
      btn.disabled = true
      btn.innerHTML = '✅ Understood!'
    }
    actionBar.appendChild(btn)
  }
}

/**
 * Mark proof as understood
 */
function markProofAsUnderstood(proofId, proofTitle) {
  // Track understanding
  trackProofUnderstood(proofId, proofTitle)

  // Save to localStorage
  const understood = getUnderstoodProofs()
  if (!understood.includes(proofId)) {
    understood.push(proofId)
    localStorage.setItem('social:understoodProofs', JSON.stringify(understood))
  }

  // Show XP notification
  showXPToast(50, 'Proof understood')
}

/**
 * Get understood proofs list
 */
function getUnderstoodProofs() {
  const data = localStorage.getItem('social:understoodProofs')
  return data ? JSON.parse(data) : []
}

/**
 * Integration with formal proof verification
 * Call this when a formal proof is verified
 */
export function onFormalProofVerified(theoremId, theoremTitle) {
  // Track the proof
  trackTheoremProved(theoremId, theoremTitle)

  // Show XP notification
  showXPToast(200, 'Theorem proved!')

  // Show celebration
  showProofVerifiedCelebration()
}

/**
 * Show celebration animation when proof is verified
 */
function showProofVerifiedCelebration() {
  const celebration = document.createElement('div')
  celebration.className = 'celebration-overlay'
  celebration.innerHTML = `
    <div class="celebration-content">
      <div class="celebration-icon">🎉</div>
      <div class="celebration-title">Proof Verified!</div>
      <div class="celebration-message">Outstanding work!</div>
    </div>
  `
  document.body.appendChild(celebration)

  setTimeout(() => celebration.classList.add('show'), 100)
  setTimeout(() => {
    celebration.classList.remove('show')
    setTimeout(() => celebration.remove(), 500)
  }, 2000)
}

/**
 * Integration with contribution system
 * Call this when user makes a contribution
 */
export function onUserContribution(type, nodeId, content) {
  // Track the contribution
  trackContribution(type, {
    nodeId,
    content: content.substring(0, 100), // Truncate for storage
    timestamp: new Date().toISOString(),
  })

  // Show XP notification
  showXPToast(100, 'Contribution added')
}

/**
 * Display user info in corner of screen
 */
export function addUserInfoWidget() {
  const profile = GetUserProfile(getCurrentUserId())
  const badges = getUserBadges(getCurrentUserId())

  const widget = document.createElement('div')
  widget.className = 'user-info-widget'
  widget.innerHTML = `
    <div class="widget-avatar" style="background:${profile.avatar.color}">
      ${profile.avatar.initials}
    </div>
    <div class="widget-info">
      <div class="widget-level">Lv.${profile.level}</div>
      <div class="widget-xp">${profile.xp} XP</div>
    </div>
    ${profile.stats.learningStreak > 0 ? `
      <div class="widget-streak" title="${profile.stats.learningStreak} day streak">
        🔥 ${profile.stats.learningStreak}
      </div>
    ` : ''}
  `

  widget.onclick = showSocialHub

  document.body.appendChild(widget)
}

/**
 * Monitor for badge unlocks and show notifications
 */
export function monitorBadgeUnlocks() {
  let lastBadgeCount = getUserBadges(getCurrentUserId()).length

  // Check every 5 seconds
  setInterval(() => {
    const badges = getUserBadges(getCurrentUserId())
    if (badges.length > lastBadgeCount) {
      // New badge earned
      const newBadge = badges[badges.length - 1]
      showBadgeToast(newBadge)

      // Update badge indicator
      const indicator = document.querySelector('.badge-indicator')
      if (indicator) {
        indicator.textContent = parseInt(indicator.textContent) + 1
      }
    }
    lastBadgeCount = badges.length
  }, 5000)
}

/**
 * Monitor for level ups
 */
export function monitorLevelUps() {
  let lastLevel = GetUserProfile(getCurrentUserId()).level

  setInterval(() => {
    const profile = GetUserProfile(getCurrentUserId())
    if (profile.level > lastLevel) {
      showLevelUpToast(profile.level)
    }
    lastLevel = profile.level
  }, 5000)
}

/**
 * Add social stats to info panel
 */
export function addSocialStatsToInfoPanel(infoPanel) {
  const profile = GetUserProfile(getCurrentUserId())

  const statsSection = document.createElement('div')
  statsSection.className = 'social-stats-section'
  statsSection.innerHTML = `
    <h4>Learning Progress</h4>
    <div class="stat-row">
      <span>Level:</span>
      <span class="stat-value">${profile.level}</span>
    </div>
    <div class="stat-row">
      <span>Proofs Understood:</span>
      <span class="stat-value">${profile.stats.proofsUnderstood}</span>
    </div>
    <div class="stat-row">
      <span>Theorems Proved:</span>
      <span class="stat-value">${profile.stats.theoremsProved}</span>
    </div>
    <div class="stat-row">
      <span>Current Streak:</span>
      <span class="stat-value">${profile.stats.learningStreak} 🔥</span>
    </div>
    <button class="btn-view-profile" onclick="window.showSocialHub()">
      View Full Profile
    </button>
  `

  infoPanel.appendChild(statsSection)
}

/**
 * Example: Full integration in main.js
 */
export function exampleFullIntegration() {
  // This is an example of how to integrate in main.js

  /*
  import { initSocial, onProofOpened, onFormalProofVerified } from './socialIntegration.example.js'

  async function main() {
    // ... existing initialization code

    // Initialize social features
    initSocial()

    // ... rest of initialization

    // Hook into proof viewer
    window.addEventListener('proofOpened', (e) => {
      onProofOpened(e.detail.proofId, e.detail.proofTitle)
    })

    // Hook into formal verification
    window.addEventListener('proofVerified', (e) => {
      onFormalProofVerified(e.detail.theoremId, e.detail.theoremTitle)
    })
  }
  */
}

// Make showSocialHub available globally for onclick handlers
if (typeof window !== 'undefined') {
  window.showSocialHub = showSocialHub
}
