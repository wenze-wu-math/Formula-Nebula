/**
 * designs/collaboration/demo.js
 * Study Group Hub - Interactive Demo
 */

import {
  CreateGroup,
  GetGroup,
  ListGroups,
  AddMember,
  InitializeVoiceChannel,
  JoinVoiceChannel,
  LeaveVoiceChannel,
  GetVoiceStatus,
  DrawOnWhiteboard,
  AddWhiteboardObject,
  GetWhiteboardState,
  ClearWhiteboard,
  ExportWhiteboard,
  CreateGroupProblemSet,
  SubmitAnswer,
  GetProblemSet,
  GetLeaderboard,
  TrackGroupProgress,
  UpdateMemberProgress,
  GetActivityFeed,
  SendMessage,
  GetMessages,
  AddReaction,
  GenerateGroupReport,
  GetSystemStats
} from './study-group.js'

/* ═══════════════════════════════════════════════════════════════
 * State Management
 * ═══════════════════════════════════════════════════════════════ */

let currentUser = 'user_demo'
let currentGroup = null
let whiteboardCanvas = null
let whiteboardCtx = null
let isDrawing = false

/* ═══════════════════════════════════════════════════════════════
 * DOM Helpers
 * ═══════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id)
const $$ = (sel) => document.querySelectorAll(sel)

/* ═══════════════════════════════════════════════════════════════
 * Initialization
 * ═══════════════════════════════════════════════════════════════ */

function init() {
  console.log('Study Group Hub initializing...')

  // Load system stats
  updateSystemStats()

  // Setup event listeners
  setupEventListeners()

  // Create demo groups
  createDemoData()

  // Render groups
  renderGroupsList()

  console.log('Study Group Hub ready!')
}

function setupEventListeners() {
  // Group creation
  $('create-group-btn')?.addEventListener('click', handleCreateGroup)

  // Voice controls
  $('start-voice-btn')?.addEventListener('click', handleStartVoice)
  $('leave-voice-btn')?.addEventListener('click', handleLeaveVoice)

  // Whiteboard controls
  $('clear-whiteboard-btn')?.addEventListener('click', handleClearWhiteboard)
  $('export-whiteboard-btn')?.addEventListener('click', handleExportWhiteboard)

  // Problem set
  $('create-problemset-btn')?.addEventListener('click', handleCreateProblemSet)

  // Chat
  $('send-message-btn')?.addEventListener('click', handleSendMessage)
  $('chat-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage()
  })

  // Navigation
  $$('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => handleTabSwitch(tab.dataset.tab))
  })
}

function createDemoData() {
  // Create sample groups
  const groups = [
    {
      name: 'Algebraic Geometry Basics',
      topic: 'Schemes and Varieties',
      members: ['user_demo', 'alice', 'bob', 'charlie']
    },
    {
      name: 'Cohomology Theory',
      topic: 'Sheaf Cohomology',
      members: ['user_demo', 'alice', 'david']
    },
    {
      name: 'Riemann-Roch Theorem',
      topic: 'Classical Algebraic Geometry',
      members: ['user_demo', 'bob', 'eve']
    }
  ]

  groups.forEach(g => {
    const groupId = CreateGroup(g.name, g.topic, g.members)
    if (!currentGroup) {
      currentGroup = groupId
      loadGroup(groupId)
    }

    // Add some demo messages
    SendMessage(groupId, g.members[1], 'Hey everyone! Ready to study?')
    SendMessage(groupId, g.members[0], 'Yes! Let\'s start with the basics.')

    // Create a problem set
    const theorems = ['Riemann-Roch', 'Bezout', 'Chow', 'Hirzebruch-Riemann-Roch']
    CreateGroupProblemSet(groupId, theorems)

    // Update some progress
    UpdateMemberProgress(groupId, g.members[0], {
      problemsSolved: 3,
      studyTimeMinutes: 45,
      contributionScore: 15
    })
  })
}

/* ═══════════════════════════════════════════════════════════════
 * UI Rendering
 * ═══════════════════════════════════════════════════════════════ */

function updateSystemStats() {
  const stats = GetSystemStats()
  $('stat-groups').textContent = stats.totalGroups
  $('stat-members').textContent = stats.totalMembers
  $('stat-problems').textContent = stats.totalProblems
  $('stat-active').textContent = stats.activeVoiceChannels
}

function renderGroupsList() {
  const groups = ListGroups({ memberId: currentUser })
  const container = $('groups-list')

  if (!container) return

  container.innerHTML = groups.map(group => `
    <div class="group-card ${group.groupId === currentGroup ? 'active' : ''}"
         onclick="loadGroup('${group.groupId}')">
      <div class="group-header">
        <h3>${group.name}</h3>
        <span class="member-count">${group.members.length} members</span>
      </div>
      <div class="group-topic">${group.topic}</div>
      <div class="group-activity">
        Last active: ${formatTimeAgo(group.activity.lastActive)}
      </div>
    </div>
  `).join('')
}

function loadGroup(groupId) {
  currentGroup = groupId
  const group = GetGroup(groupId)

  if (!group) {
    console.error('Group not found:', groupId)
    return
  }

  // Update UI
  $('current-group-name').textContent = group.name
  $('current-group-topic').textContent = group.topic

  // Load tabs
  renderChatTab(groupId)
  renderWhiteboardTab(groupId)
  renderProblemsTab(groupId)
  renderProgressTab(groupId)

  // Update groups list highlighting
  renderGroupsList()

  console.log('Loaded group:', group)
}

function renderChatTab(groupId) {
  const messages = GetMessages(groupId)
  const container = $('chat-messages')

  if (!container) return

  container.innerHTML = messages.map(msg => `
    <div class="message ${msg.userId === currentUser ? 'own' : ''}">
      <div class="message-header">
        <strong>${msg.userId}</strong>
        <span class="timestamp">${formatTimeAgo(msg.timestamp)}</span>
      </div>
      <div class="message-body">${escapeHtml(msg.message)}</div>
      ${msg.reactions.length > 0 ? `
        <div class="reactions">
          ${msg.reactions.map(r => r.emoji).join(' ')}
        </div>
      ` : ''}
    </div>
  `).join('')

  // Scroll to bottom
  container.scrollTop = container.scrollHeight
}

function renderWhiteboardTab(groupId) {
  const whiteboardState = GetWhiteboardState(groupId)

  if (!whiteboardState) return

  // Initialize canvas if not done
  if (!whiteboardCanvas) {
    whiteboardCanvas = $('whiteboard-canvas')
    if (whiteboardCanvas) {
      whiteboardCtx = whiteboardCanvas.getContext('2d')
      setupWhiteboardDrawing()
    }
  }

  // Render saved paths
  if (whiteboardCtx) {
    whiteboardCtx.clearRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height)

    whiteboardState.paths.forEach(path => {
      drawPath(path)
    })

    whiteboardState.objects.forEach(obj => {
      drawObject(obj)
    })
  }

  // Update stats
  const statsEl = $('whiteboard-stats')
  if (statsEl) {
    statsEl.textContent = `${whiteboardState.paths.length} paths, ${whiteboardState.objects.length} objects`
  }
}

function renderProblemsTab(groupId) {
  const problemSets = Array.from(window.problemSets?.values() || [])
    .filter(ps => ps.groupId === groupId)

  const container = $('problems-list')
  if (!container) return

  if (problemSets.length === 0) {
    container.innerHTML = '<p class="empty-state">No problem sets yet. Create one to get started!</p>'
    return
  }

  container.innerHTML = problemSets.map(ps => {
    const leaderboard = GetLeaderboard(ps.problemSetId)
    const userScore = ps.scores[currentUser] || 0
    const maxScore = ps.problems.reduce((sum, p) => sum + p.points, 0)

    return `
      <div class="problemset-card">
        <h4>${ps.title}</h4>
        <div class="problemset-meta">
          ${ps.problems.length} problems • ${maxScore} points total
        </div>
        <div class="problemset-progress">
          Your score: <strong>${userScore}/${maxScore}</strong>
        </div>
        <button onclick="viewProblemSet('${ps.problemSetId}')" class="btn-secondary">
          View Problems
        </button>
        <div class="leaderboard-mini">
          Top: ${leaderboard.slice(0, 3).map(l =>
            `${l.userId} (${l.score})`
          ).join(', ')}
        </div>
      </div>
    `
  }).join('')
}

function renderProgressTab(groupId) {
  const progress = TrackGroupProgress(groupId)

  if (progress.error) {
    $('progress-content').innerHTML = '<p class="error">Failed to load progress</p>'
    return
  }

  const container = $('progress-content')
  if (!container) return

  container.innerHTML = `
    <div class="progress-overview">
      <div class="stat-card">
        <div class="stat-value">${progress.stats.totalProblems}</div>
        <div class="stat-label">Problems Solved</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${progress.stats.theoremsCount}</div>
        <div class="stat-label">Theorems Covered</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${progress.stats.totalStudyTime}</div>
        <div class="stat-label">Study Minutes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${progress.stats.activeDays}</div>
        <div class="stat-label">Active Days</div>
      </div>
    </div>

    <div class="members-progress">
      <h4>Member Contributions</h4>
      ${progress.members.map(m => `
        <div class="member-progress-bar">
          <div class="member-info">
            <span class="member-name">${m.userId}</span>
            <span class="member-score">${m.contributionScore} pts</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill"
                 style="width: ${Math.min(100, m.contributionScore)}%"></div>
          </div>
          <div class="member-stats">
            ${m.problemsSolved} problems • ${m.studyTimeMinutes} min
          </div>
        </div>
      `).join('')}
    </div>

    <div class="recent-activity">
      <h4>Recent Activity</h4>
      ${progress.recentActivity.map(a => `
        <div class="activity-item">
          <span class="activity-type">${formatActivityType(a.type)}</span>
          <span class="activity-time">${a.timeAgo}</span>
        </div>
      `).join('')}
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════════
 * Event Handlers
 * ═══════════════════════════════════════════════════════════════ */

function handleCreateGroup() {
  const name = prompt('Group name:')
  const topic = prompt('Topic:')

  if (name && topic) {
    const groupId = CreateGroup(name, topic, [currentUser])
    currentGroup = groupId
    renderGroupsList()
    loadGroup(groupId)
    updateSystemStats()
  }
}

function handleStartVoice() {
  if (!currentGroup) return

  const rtcOffer = InitializeVoiceChannel(currentGroup)
  if (rtcOffer.error) {
    alert(rtcOffer.error)
    return
  }

  JoinVoiceChannel(currentGroup, currentUser)
  updateVoiceUI()

  console.log('Voice channel started:', rtcOffer)
}

function handleLeaveVoice() {
  if (!currentGroup) return

  LeaveVoiceChannel(currentGroup, currentUser)
  updateVoiceUI()
}

function updateVoiceUI() {
  if (!currentGroup) return

  const status = GetVoiceStatus(currentGroup)
  const indicator = $('voice-indicator')

  if (indicator) {
    if (status && status.active) {
      indicator.textContent = `🎤 ${status.participantCount} in voice`
      indicator.className = 'voice-active'
    } else {
      indicator.textContent = '🔇 Voice inactive'
      indicator.className = 'voice-inactive'
    }
  }
}

function handleClearWhiteboard() {
  if (!currentGroup) return

  if (confirm('Clear whiteboard? This cannot be undone.')) {
    const success = ClearWhiteboard(currentGroup, currentUser)
    if (success) {
      renderWhiteboardTab(currentGroup)
    } else {
      alert('Only the group owner can clear the whiteboard')
    }
  }
}

function handleExportWhiteboard() {
  if (!currentGroup) return

  const data = ExportWhiteboard(currentGroup)
  if (data) {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `whiteboard-${currentGroup}-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
  }
}

function handleCreateProblemSet() {
  if (!currentGroup) return

  // Use some common theorems as example
  const theorems = ['Riemann-Roch', 'Bezout', 'Chow', 'Hirzebruch-Riemann-Roch', 'Serre-duality']

  const problemSetId = CreateGroupProblemSet(currentGroup, theorems)

  if (problemSetId) {
    alert(`Problem set created with ${theorems.length} problems!`)
    renderProblemsTab(currentGroup)
  }
}

function handleSendMessage() {
  if (!currentGroup) return

  const input = $('chat-input')
  const message = input.value.trim()

  if (!message) return

  const result = SendMessage(currentGroup, currentUser, message)

  if (!result.error) {
    input.value = ''
    renderChatTab(currentGroup)
  }
}

function handleTabSwitch(tabName) {
  // Update tab buttons
  $$('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName)
  })

  // Update tab content
  $$('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`)
  })

  // Refresh content
  if (currentGroup) {
    switch (tabName) {
      case 'chat':
        renderChatTab(currentGroup)
        break
      case 'whiteboard':
        renderWhiteboardTab(currentGroup)
        break
      case 'problems':
        renderProblemsTab(currentGroup)
        break
      case 'progress':
        renderProgressTab(currentGroup)
        break
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
 * Whiteboard Drawing
 * ═══════════════════════════════════════════════════════════════ */

function setupWhiteboardDrawing() {
  if (!whiteboardCanvas) return

  let currentPath = []

  whiteboardCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true
    currentPath = [getCanvasPoint(e)]
  })

  whiteboardCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return

    const point = getCanvasPoint(e)
    currentPath.push(point)

    // Draw preview
    if (whiteboardCtx && currentPath.length > 1) {
      const prev = currentPath[currentPath.length - 2]
      whiteboardCtx.beginPath()
      whiteboardCtx.moveTo(prev.x, prev.y)
      whiteboardCtx.lineTo(point.x, point.y)
      whiteboardCtx.strokeStyle = '#007bff'
      whiteboardCtx.lineWidth = 2
      whiteboardCtx.stroke()
    }
  })

  whiteboardCanvas.addEventListener('mouseup', () => {
    if (isDrawing && currentPath.length > 1) {
      const pathData = {
        points: currentPath,
        color: '#007bff',
        width: 2,
        userId: currentUser
      }

      DrawOnWhiteboard(currentGroup, pathData)
    }

    isDrawing = false
    currentPath = []
  })

  whiteboardCanvas.addEventListener('mouseleave', () => {
    isDrawing = false
  })
}

function getCanvasPoint(e) {
  const rect = whiteboardCanvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

function drawPath(path) {
  if (!whiteboardCtx || !path.points || path.points.length < 2) return

  whiteboardCtx.beginPath()
  whiteboardCtx.moveTo(path.points[0].x, path.points[0].y)

  for (let i = 1; i < path.points.length; i++) {
    whiteboardCtx.lineTo(path.points[i].x, path.points[i].y)
  }

  whiteboardCtx.strokeStyle = path.color || '#000000'
  whiteboardCtx.lineWidth = path.width || 2
  whiteboardCtx.stroke()
}

function drawObject(obj) {
  if (!whiteboardCtx) return

  // Implement object rendering (text, shapes, etc.)
  // For now, just a placeholder
}

/* ═══════════════════════════════════════════════════════════════
 * Utilities
 * ═══════════════════════════════════════════════════════════════ */

function formatTimeAgo(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

function formatActivityType(type) {
  const labels = {
    problem_set_created: '📝 Problem set created',
    whiteboard_draw: '🎨 Whiteboard activity',
    member_joined: '👋 Member joined',
    problem_solved: '✅ Problem solved'
  }
  return labels[type] || type
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Global functions for onclick handlers
window.loadGroup = loadGroup
window.viewProblemSet = (id) => {
  console.log('Viewing problem set:', id)
  const ps = GetProblemSet(id)
  alert(`Problem Set: ${ps.title}\n${ps.problems.length} problems`)
}

/* ═══════════════════════════════════════════════════════════════
 * Start
 * ═══════════════════════════════════════════════════════════════ */

init()
