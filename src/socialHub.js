/**
 * ═══════════════════════════════════════════════════════════════
 *  Social Hub UI
 * ═══════════════════════════════════════════════════════════════
 *
 * Main social features interface with tabs for:
 * - Profile
 * - Activity Feed
 * - Leaderboards
 * - Following/Followers
 * - Badges & Achievements
 */

import {
  getCurrentUserId,
  GetUserProfile,
  GetActivityFeed,
  ComputeLeaderboard,
  getUserBadges,
  getFollowing,
  getFollowers,
  FollowUser,
  UnfollowUser,
  isFollowing,
  searchUsers,
  ACTIVITY_TYPES,
  BADGE_DEFINITIONS,
} from './social.js'

/**
 * Create social hub UI
 */
export function createSocialHub() {
  const container = document.createElement('div')
  container.className = 'social-hub'
  container.innerHTML = `
    <div class="social-hub-header">
      <h2>🌟 Social Hub</h2>
      <button class="social-hub-close" title="Close">×</button>
    </div>

    <div class="social-hub-tabs">
      <button class="social-tab active" data-tab="profile">👤 Profile</button>
      <button class="social-tab" data-tab="feed">📰 Feed</button>
      <button class="social-tab" data-tab="leaderboard">🏆 Leaderboard</button>
      <button class="social-tab" data-tab="network">👥 Network</button>
      <button class="social-tab" data-tab="badges">🎖️ Badges</button>
    </div>

    <div class="social-hub-content">
      <div class="social-tab-content" data-content="profile"></div>
      <div class="social-tab-content" data-content="feed" style="display:none"></div>
      <div class="social-tab-content" data-content="leaderboard" style="display:none"></div>
      <div class="social-tab-content" data-content="network" style="display:none"></div>
      <div class="social-tab-content" data-content="badges" style="display:none"></div>
    </div>
  `

  // Tab switching
  const tabs = container.querySelectorAll('.social-tab')
  const contents = container.querySelectorAll('.social-tab-content')

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')

      // Show target content
      contents.forEach(c => {
        if (c.dataset.content === targetTab) {
          c.style.display = 'block'
          loadTabContent(targetTab, c)
        } else {
          c.style.display = 'none'
        }
      })
    })
  })

  // Close button
  container.querySelector('.social-hub-close').addEventListener('click', () => {
    container.remove()
  })

  // Load initial content
  loadTabContent('profile', container.querySelector('[data-content="profile"]'))

  return container
}

/**
 * Load content for a specific tab
 */
function loadTabContent(tab, container) {
  switch (tab) {
    case 'profile':
      renderProfileTab(container)
      break
    case 'feed':
      renderFeedTab(container)
      break
    case 'leaderboard':
      renderLeaderboardTab(container)
      break
    case 'network':
      renderNetworkTab(container)
      break
    case 'badges':
      renderBadgesTab(container)
      break
  }
}

// ══════════════════════════════════════════════════════════════
// Profile Tab
// ══════════════════════════════════════════════════════════════

function renderProfileTab(container) {
  const userId = getCurrentUserId()
  const profile = GetUserProfile(userId)
  const badges = getUserBadges(userId)

  const xpToNextLevel = ((profile.level) ** 2) * 100 - profile.xp
  const levelProgress = (profile.xp % ((profile.level) ** 2 * 100)) / ((profile.level) ** 2 * 100) * 100

  container.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar" style="background:${profile.avatar.color}">
          ${profile.avatar.initials}
        </div>
        <div class="profile-info">
          <h3>${profile.username}</h3>
          <div class="profile-level">
            Level ${profile.level}
            <span class="profile-xp">(${profile.xp} XP)</span>
          </div>
          <div class="profile-level-bar">
            <div class="profile-level-progress" style="width:${levelProgress}%"></div>
          </div>
          <p class="profile-xp-info">${xpToNextLevel} XP to next level</p>
        </div>
      </div>

      <div class="profile-bio">
        <textarea class="profile-bio-edit" placeholder="Tell others about your mathematical journey...">${profile.bio}</textarea>
        <button class="profile-bio-save">Save Bio</button>
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <div class="stat-value">${profile.stats.proofsViewed}</div>
          <div class="stat-label">Proofs Viewed</div>
        </div>
        <div class="profile-stat">
          <div class="stat-value">${profile.stats.proofsUnderstood}</div>
          <div class="stat-label">Proofs Understood</div>
        </div>
        <div class="profile-stat">
          <div class="stat-value">${profile.stats.theoremsProved}</div>
          <div class="stat-label">Theorems Proved</div>
        </div>
        <div class="profile-stat">
          <div class="stat-value">${profile.stats.contributionsCount}</div>
          <div class="stat-label">Contributions</div>
        </div>
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <div class="stat-value">${profile.stats.learningStreak} 🔥</div>
          <div class="stat-label">Day Streak</div>
        </div>
        <div class="profile-stat">
          <div class="stat-value">${profile.stats.following || 0}</div>
          <div class="stat-label">Following</div>
        </div>
        <div class="profile-stat">
          <div class="stat-value">${profile.stats.followers || 0}</div>
          <div class="stat-label">Followers</div>
        </div>
        <div class="profile-stat">
          <div class="stat-value">${badges.length}</div>
          <div class="stat-label">Badges</div>
        </div>
      </div>

      <div class="profile-badges-preview">
        <h4>Recent Badges</h4>
        <div class="badges-grid">
          ${badges.slice(0, 6).map(badge => `
            <div class="badge-item ${badge.tier}" title="${badge.description}">
              <div class="badge-icon">${badge.icon}</div>
              <div class="badge-name">${badge.name}</div>
            </div>
          `).join('') || '<p class="empty-state">No badges earned yet. Start learning!</p>'}
        </div>
      </div>

      <div class="profile-settings">
        <h4>Privacy Settings</h4>
        <label>
          <input type="checkbox" class="profile-show-activity" ${profile.preferences.showActivity ? 'checked' : ''}>
          Show my activity in feeds
        </label>
        <label>
          Profile visibility:
          <select class="profile-visibility">
            <option value="public" ${profile.preferences.visibility === 'public' ? 'selected' : ''}>Public</option>
            <option value="followers" ${profile.preferences.visibility === 'followers' ? 'selected' : ''}>Followers Only</option>
            <option value="private" ${profile.preferences.visibility === 'private' ? 'selected' : ''}>Private</option>
          </select>
        </label>
      </div>
    </div>
  `

  // Save bio
  container.querySelector('.profile-bio-save').addEventListener('click', () => {
    const bio = container.querySelector('.profile-bio-edit').value
    profile.bio = bio
    // TODO: Update profile with bio
    showToast('Bio updated!')
  })

  // Save settings
  container.querySelector('.profile-show-activity').addEventListener('change', (e) => {
    profile.preferences.showActivity = e.target.checked
    // TODO: Update preferences
  })

  container.querySelector('.profile-visibility').addEventListener('change', (e) => {
    profile.preferences.visibility = e.target.value
    // TODO: Update preferences
  })
}

// ══════════════════════════════════════════════════════════════
// Activity Feed Tab
// ══════════════════════════════════════════════════════════════

function renderFeedTab(container) {
  const userId = getCurrentUserId()
  const activities = GetActivityFeed(userId, 50)

  container.innerHTML = `
    <div class="activity-feed">
      <h3>Activity Feed</h3>
      <p class="feed-description">Recent activities from mathematicians you follow</p>

      ${activities.length === 0 ? `
        <div class="empty-state">
          <p>No activities yet. Follow other mathematicians to see their progress!</p>
          <button class="btn-discover-users">Discover Mathematicians</button>
        </div>
      ` : `
        <div class="activity-list">
          ${activities.map(activity => renderActivity(activity)).join('')}
        </div>
      `}
    </div>
  `

  container.querySelector('.btn-discover-users')?.addEventListener('click', () => {
    // Switch to network tab
    document.querySelector('[data-tab="network"]').click()
  })
}

function renderActivity(activity) {
  const time = formatTimeAgo(activity.timestamp)
  const user = activity.user

  let activityText = ''
  let activityIcon = ''

  switch (activity.type) {
    case ACTIVITY_TYPES.PROOF_VIEWED:
      activityIcon = '👀'
      activityText = `viewed <strong>${activity.metadata.proofTitle}</strong>`
      break
    case ACTIVITY_TYPES.PROOF_UNDERSTOOD:
      activityIcon = '✅'
      activityText = `understood <strong>${activity.metadata.proofTitle}</strong>`
      break
    case ACTIVITY_TYPES.THEOREM_PROVED:
      activityIcon = '🎯'
      activityText = `proved <strong>${activity.metadata.theoremTitle}</strong>`
      break
    case ACTIVITY_TYPES.BADGE_EARNED:
      activityIcon = '🎖️'
      activityText = `earned the <strong>${activity.metadata.badgeName}</strong> badge ${activity.metadata.badgeTier === 'gold' ? '⭐' : ''}`
      break
    case ACTIVITY_TYPES.LEVEL_UP:
      activityIcon = '⬆️'
      activityText = `reached <strong>Level ${activity.metadata.newLevel}</strong>`
      break
    case ACTIVITY_TYPES.FOLLOWED_USER:
      activityIcon = '👥'
      activityText = `followed <strong>${activity.metadata.targetUsername}</strong>`
      break
    case ACTIVITY_TYPES.STARTED_LEARNING_PATH:
      activityIcon = '🛤️'
      activityText = `started learning path: <strong>${activity.metadata.pathName}</strong>`
      break
    case ACTIVITY_TYPES.COMPLETED_LEARNING_PATH:
      activityIcon = '🏁'
      activityText = `completed learning path: <strong>${activity.metadata.pathName}</strong>`
      break
    default:
      activityIcon = '📌'
      activityText = activity.type
  }

  return `
    <div class="activity-item">
      <div class="activity-icon">${activityIcon}</div>
      <div class="activity-content">
        <div class="activity-user">
          <div class="activity-avatar" style="background:${user.avatar.color}">
            ${user.avatar.initials}
          </div>
          <strong>${user.username}</strong>
          <span class="activity-level">Lv.${user.level}</span>
        </div>
        <div class="activity-text">${activityText}</div>
        <div class="activity-time">${time}</div>
      </div>
    </div>
  `
}

// ══════════════════════════════════════════════════════════════
// Leaderboard Tab
// ══════════════════════════════════════════════════════════════

function renderLeaderboardTab(container) {
  const metrics = [
    { id: 'proofsUnderstood', label: 'Proofs Understood', icon: '✅' },
    { id: 'proofsViewed', label: 'Proofs Viewed', icon: '👀' },
    { id: 'theoremsProved', label: 'Theorems Proved', icon: '🎯' },
    { id: 'contributions', label: 'Contributions', icon: '✨' },
    { id: 'level', label: 'Level', icon: '⭐' },
    { id: 'streak', label: 'Current Streak', icon: '🔥' },
  ]

  const currentMetric = 'proofsUnderstood'
  const leaderboard = ComputeLeaderboard(currentMetric, 100)
  const currentUserId = getCurrentUserId()

  container.innerHTML = `
    <div class="leaderboard">
      <h3>🏆 Leaderboard</h3>

      <div class="leaderboard-metrics">
        ${metrics.map(m => `
          <button class="metric-btn ${m.id === currentMetric ? 'active' : ''}" data-metric="${m.id}">
            ${m.icon} ${m.label}
          </button>
        `).join('')}
      </div>

      <div class="leaderboard-list">
        ${leaderboard.length === 0 ? `
          <div class="empty-state">
            <p>No rankings yet. Start learning to join the leaderboard!</p>
          </div>
        ` : leaderboard.map(entry => `
          <div class="leaderboard-entry ${entry.userId === currentUserId ? 'current-user' : ''}">
            <div class="entry-rank rank-${entry.rank <= 3 ? entry.rank : 'other'}">
              ${entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
            </div>
            <div class="entry-avatar" style="background:${entry.avatar.color}">
              ${entry.avatar.initials}
            </div>
            <div class="entry-info">
              <div class="entry-username">${entry.username}</div>
              <div class="entry-level">Level ${entry.level}</div>
            </div>
            <div class="entry-badges">
              ${(entry.badges || []).slice(0, 3).map(badgeId => {
                const badge = BADGE_DEFINITIONS[badgeId]
                return badge ? `<span class="mini-badge" title="${badge.name}">${badge.icon}</span>` : ''
              }).join('')}
            </div>
            <div class="entry-score">${entry.score}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `

  // Metric switching
  container.querySelectorAll('.metric-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const metric = btn.dataset.metric
      container.querySelectorAll('.metric-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      const newLeaderboard = ComputeLeaderboard(metric, 100)
      const listContainer = container.querySelector('.leaderboard-list')

      // Re-render leaderboard entries
      listContainer.innerHTML = newLeaderboard.map(entry => `
        <div class="leaderboard-entry ${entry.userId === currentUserId ? 'current-user' : ''}">
          <div class="entry-rank rank-${entry.rank <= 3 ? entry.rank : 'other'}">
            ${entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
          </div>
          <div class="entry-avatar" style="background:${entry.avatar.color}">
            ${entry.avatar.initials}
          </div>
          <div class="entry-info">
            <div class="entry-username">${entry.username}</div>
            <div class="entry-level">Level ${entry.level}</div>
          </div>
          <div class="entry-badges">
            ${(entry.badges || []).slice(0, 3).map(badgeId => {
              const badge = BADGE_DEFINITIONS[badgeId]
              return badge ? `<span class="mini-badge" title="${badge.name}">${badge.icon}</span>` : ''
            }).join('')}
          </div>
          <div class="entry-score">${entry.score}</div>
        </div>
      `).join('')
    })
  })
}

// ══════════════════════════════════════════════════════════════
// Network Tab
// ══════════════════════════════════════════════════════════════

function renderNetworkTab(container) {
  const userId = getCurrentUserId()
  const following = getFollowing(userId)
  const followers = getFollowers(userId)

  container.innerHTML = `
    <div class="network">
      <h3>👥 Network</h3>

      <div class="network-search">
        <input type="text" class="user-search-input" placeholder="Search mathematicians...">
        <div class="search-results" style="display:none"></div>
      </div>

      <div class="network-tabs">
        <button class="network-tab active" data-tab="following">
          Following (${following.length})
        </button>
        <button class="network-tab" data-tab="followers">
          Followers (${followers.length})
        </button>
      </div>

      <div class="network-content">
        <div class="network-tab-content active" data-content="following">
          ${renderUserList(following, userId, 'following')}
        </div>
        <div class="network-tab-content" data-content="followers" style="display:none">
          ${renderUserList(followers, userId, 'followers')}
        </div>
      </div>
    </div>
  `

  // Network tab switching
  container.querySelectorAll('.network-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab
      container.querySelectorAll('.network-tab').forEach(t => t.classList.remove('active'))
      tab.classList.add('active')

      container.querySelectorAll('.network-tab-content').forEach(c => {
        if (c.dataset.content === targetTab) {
          c.style.display = 'block'
        } else {
          c.style.display = 'none'
        }
      })
    })
  })

  // User search
  const searchInput = container.querySelector('.user-search-input')
  const searchResults = container.querySelector('.search-results')

  let searchTimeout
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout)
    const query = e.target.value.trim()

    if (query.length < 2) {
      searchResults.style.display = 'none'
      return
    }

    searchTimeout = setTimeout(() => {
      const results = searchUsers(query, 10)
      if (results.length > 0) {
        searchResults.innerHTML = results.map(user => {
          const following = isFollowing(userId, user.userId)
          return `
            <div class="search-result-item">
              <div class="search-user-avatar" style="background:${user.avatar?.color || '#999'}">
                ${user.avatar?.initials || '?'}
              </div>
              <div class="search-user-info">
                <div class="search-user-name">${user.username}</div>
                <div class="search-user-level">Level ${user.level}</div>
              </div>
              <button class="btn-follow ${following ? 'following' : ''}" data-user="${user.userId}">
                ${following ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          `
        }).join('')
        searchResults.style.display = 'block'

        // Follow/unfollow handlers
        searchResults.querySelectorAll('.btn-follow').forEach(btn => {
          btn.addEventListener('click', () => {
            const targetUserId = btn.dataset.user
            const isCurrentlyFollowing = btn.classList.contains('following')

            if (isCurrentlyFollowing) {
              UnfollowUser(userId, targetUserId)
              btn.classList.remove('following')
              btn.textContent = 'Follow'
              showToast('Unfollowed')
            } else {
              FollowUser(userId, targetUserId)
              btn.classList.add('following')
              btn.textContent = 'Unfollow'
              showToast('Following!')
            }
          })
        })
      } else {
        searchResults.innerHTML = '<div class="empty-state">No users found</div>'
        searchResults.style.display = 'block'
      }
    }, 300)
  })
}

function renderUserList(users, currentUserId, listType) {
  if (users.length === 0) {
    return `
      <div class="empty-state">
        <p>${listType === 'following' ? 'Not following anyone yet.' : 'No followers yet.'}</p>
        ${listType === 'following' ? '<p>Search above to find mathematicians to follow!</p>' : ''}
      </div>
    `
  }

  return `
    <div class="user-list">
      ${users.map(user => {
        const following = isFollowing(currentUserId, user.userId)
        return `
          <div class="user-list-item">
            <div class="user-avatar" style="background:${user.avatar.color}">
              ${user.avatar.initials}
            </div>
            <div class="user-info">
              <div class="user-name">${user.username}</div>
              <div class="user-stats">
                <span>Level ${user.level}</span>
                <span>${user.stats.proofsUnderstood} proofs understood</span>
              </div>
            </div>
            ${user.userId !== currentUserId ? `
              <button class="btn-follow ${following ? 'following' : ''}" data-user="${user.userId}">
                ${following ? 'Unfollow' : 'Follow'}
              </button>
            ` : ''}
          </div>
        `
      }).join('')}
    </div>
  `
}

// ══════════════════════════════════════════════════════════════
// Badges Tab
// ══════════════════════════════════════════════════════════════

function renderBadgesTab(container) {
  const userId = getCurrentUserId()
  const earnedBadges = getUserBadges(userId)
  const earnedIds = new Set(earnedBadges.map(b => b.badgeId))
  const allBadges = Object.values(BADGE_DEFINITIONS)
  const lockedBadges = allBadges.filter(b => !earnedIds.has(b.badgeId))

  container.innerHTML = `
    <div class="badges">
      <h3>🎖️ Badges & Achievements</h3>
      <p class="badges-stats">Earned ${earnedBadges.length} of ${allBadges.length} badges</p>

      <h4>Earned Badges</h4>
      <div class="badges-grid">
        ${earnedBadges.length === 0 ? `
          <div class="empty-state">No badges earned yet. Keep learning!</div>
        ` : earnedBadges.map(badge => renderBadge(badge, true)).join('')}
      </div>

      <h4>Locked Badges</h4>
      <div class="badges-grid locked">
        ${lockedBadges.map(badge => renderBadge(badge, false)).join('')}
      </div>
    </div>
  `
}

function renderBadge(badge, earned) {
  const profile = GetUserProfile(getCurrentUserId())
  const { stats } = profile

  let progressText = ''
  if (!earned && badge.criteria) {
    const criteriaKey = Object.keys(badge.criteria)[0]
    const required = badge.criteria[criteriaKey]
    const current = stats[criteriaKey] || 0
    const progress = Math.min((current / required) * 100, 100)
    progressText = `
      <div class="badge-progress">
        <div class="badge-progress-bar">
          <div class="badge-progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="badge-progress-text">${current} / ${required}</div>
      </div>
    `
  }

  return `
    <div class="badge-card ${badge.tier} ${earned ? 'earned' : 'locked'}">
      <div class="badge-icon-large">${earned ? badge.icon : '🔒'}</div>
      <div class="badge-name">${badge.name}</div>
      <div class="badge-tier-label">${badge.tier}</div>
      <div class="badge-description">${badge.description}</div>
      ${earned ? `<div class="badge-rarity">${(badge.rarity * 100).toFixed(0)}% of users</div>` : progressText}
    </div>
  `
}

// ══════════════════════════════════════════════════════════════
// Utility Functions
// ══════════════════════════════════════════════════════════════

function formatTimeAgo(timestamp) {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

function showToast(message) {
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => toast.classList.add('show'), 100)
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

// ══════════════════════════════════════════════════════════════
// Integration Function
// ══════════════════════════════════════════════════════════════

/**
 * Show social hub (call this from main UI)
 */
export function showSocialHub() {
  // Remove existing hub
  const existing = document.querySelector('.social-hub')
  if (existing) {
    existing.remove()
    return
  }

  const hub = createSocialHub()
  document.body.appendChild(hub)
}
