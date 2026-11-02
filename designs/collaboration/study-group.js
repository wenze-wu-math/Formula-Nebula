/**
 * designs/collaboration/study-group.js
 * Study Group Collaboration Features
 *
 * Features:
 * 1. Create study groups around topics
 * 2. Group chat and voice (WebRTC)
 * 3. Shared virtual whiteboard
 * 4. Group problem sets and quizzes
 * 5. Group progress tracking
 */

import { getGraph } from '../shared/kb.js'

/* ═══════════════════════════════════════════════════════════════
 * Data Structures
 * ═══════════════════════════════════════════════════════════════ */

/**
 * @typedef {Object} StudyGroup
 * @property {string} groupId - Unique group identifier
 * @property {string} name - Group name
 * @property {string} topic - Focus topic/theorem area
 * @property {Array<string>} members - Member user IDs
 * @property {string} ownerId - Creator user ID
 * @property {number} createdAt - Creation timestamp
 * @property {Object} settings - Group settings
 */

/**
 * @typedef {Object} ProblemSet
 * @property {string} problemSetId - Unique problem set ID
 * @property {string} groupId - Associated group
 * @property {Array<Object>} problems - Problem definitions
 * @property {Object} responses - Member responses
 * @property {number} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} WhiteboardState
 * @property {string} groupId - Associated group
 * @property {Array<Object>} paths - Drawing paths
 * @property {Array<Object>} objects - Shape objects
 * @property {Object} metadata - Canvas metadata
 */

/* ═══════════════════════════════════════════════════════════════
 * State Management
 * ═══════════════════════════════════════════════════════════════ */

// In-memory storage (replace with backend API in production)
const studyGroups = new Map()
const problemSets = new Map()
const whiteboardStates = new Map()
const groupProgress = new Map()
const voiceChannels = new Map()

/* ═══════════════════════════════════════════════════════════════
 * 1. Create Study Groups
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Create a new study group
 * @param {string} name - Group name
 * @param {string} topic - Topic/theorem area
 * @param {Array<string>} members - Initial member IDs
 * @returns {string} groupId
 */
export function CreateGroup(name, topic, members = []) {
  const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const group = {
    groupId,
    name,
    topic,
    members: [...new Set(members)], // Remove duplicates
    ownerId: members[0] || 'anonymous',
    createdAt: Date.now(),
    settings: {
      isPublic: false,
      allowInvites: true,
      maxMembers: 50,
      voiceEnabled: true,
      whiteboardEnabled: true
    },
    activity: {
      lastActive: Date.now(),
      totalMessages: 0,
      totalProblemsSolved: 0
    }
  }

  studyGroups.set(groupId, group)

  // Initialize group progress tracking
  groupProgress.set(groupId, {
    groupId,
    members: {},
    theoremsCovered: [],
    problemsCompleted: 0,
    studyTimeMinutes: 0,
    lastUpdated: Date.now()
  })

  // Initialize whiteboard
  whiteboardStates.set(groupId, {
    groupId,
    paths: [],
    objects: [],
    metadata: {
      width: 1920,
      height: 1080,
      zoom: 1.0,
      pan: { x: 0, y: 0 }
    },
    lastModified: Date.now()
  })

  console.log(`✓ Study group created: ${groupId}`, group)
  return groupId
}

/**
 * Get group by ID
 * @param {string} groupId
 * @returns {StudyGroup|null}
 */
export function GetGroup(groupId) {
  return studyGroups.get(groupId) || null
}

/**
 * List all groups (with optional filtering)
 * @param {Object} filters - Filter options
 * @returns {Array<StudyGroup>}
 */
export function ListGroups(filters = {}) {
  let groups = Array.from(studyGroups.values())

  if (filters.topic) {
    groups = groups.filter(g => g.topic.includes(filters.topic))
  }

  if (filters.memberId) {
    groups = groups.filter(g => g.members.includes(filters.memberId))
  }

  if (filters.isPublic !== undefined) {
    groups = groups.filter(g => g.settings.isPublic === filters.isPublic)
  }

  return groups.sort((a, b) => b.activity.lastActive - a.activity.lastActive)
}

/**
 * Add member to group
 * @param {string} groupId
 * @param {string} userId
 * @returns {boolean}
 */
export function AddMember(groupId, userId) {
  const group = studyGroups.get(groupId)
  if (!group) return false

  if (group.members.length >= group.settings.maxMembers) {
    console.warn('Group is full')
    return false
  }

  if (!group.members.includes(userId)) {
    group.members.push(userId)

    // Initialize member progress
    const progress = groupProgress.get(groupId)
    if (progress && !progress.members[userId]) {
      progress.members[userId] = {
        joinedAt: Date.now(),
        problemsSolved: 0,
        contributionScore: 0,
        studyTimeMinutes: 0
      }
    }
  }

  return true
}

/* ═══════════════════════════════════════════════════════════════
 * 2. Voice Channel (WebRTC)
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Initialize voice channel for group
 * @param {string} groupId
 * @returns {Object} RTC configuration and offer
 */
export function InitializeVoiceChannel(groupId) {
  const group = studyGroups.get(groupId)
  if (!group || !group.settings.voiceEnabled) {
    return { error: 'Voice not enabled for this group' }
  }

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }

  // Create voice channel state
  const channel = {
    groupId,
    active: true,
    participants: [],
    config: rtcConfig,
    createdAt: Date.now(),
    quality: 'high', // high, medium, low
    codec: 'opus',
    bitrate: 32000
  }

  voiceChannels.set(groupId, channel)

  // RTC Offer structure (simplified - actual WebRTC setup needs full implementation)
  const rtcOffer = {
    type: 'offer',
    groupId,
    config: rtcConfig,
    mediaConstraints: {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    },
    signaling: {
      server: 'wss://signaling.formula-nebula.io',
      room: groupId
    }
  }

  console.log(`✓ Voice channel initialized for group ${groupId}`)
  return rtcOffer
}

/**
 * Join voice channel
 * @param {string} groupId
 * @param {string} userId
 * @returns {Object} Peer connection details
 */
export function JoinVoiceChannel(groupId, userId) {
  const channel = voiceChannels.get(groupId)
  if (!channel) {
    return { error: 'Voice channel not found' }
  }

  if (!channel.participants.includes(userId)) {
    channel.participants.push(userId)
  }

  return {
    groupId,
    userId,
    peers: channel.participants.filter(id => id !== userId),
    config: channel.config,
    quality: channel.quality
  }
}

/**
 * Leave voice channel
 * @param {string} groupId
 * @param {string} userId
 */
export function LeaveVoiceChannel(groupId, userId) {
  const channel = voiceChannels.get(groupId)
  if (!channel) return

  channel.participants = channel.participants.filter(id => id !== userId)

  // Close channel if empty
  if (channel.participants.length === 0) {
    voiceChannels.delete(groupId)
    console.log(`✓ Voice channel closed for group ${groupId}`)
  }
}

/**
 * Get voice channel status
 * @param {string} groupId
 * @returns {Object|null}
 */
export function GetVoiceStatus(groupId) {
  const channel = voiceChannels.get(groupId)
  if (!channel) return null

  return {
    active: channel.active,
    participantCount: channel.participants.length,
    participants: channel.participants,
    quality: channel.quality
  }
}

/* ═══════════════════════════════════════════════════════════════
 * 3. Shared Virtual Whiteboard
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Draw on whiteboard
 * @param {string} groupId
 * @param {Object} path - Drawing path data
 * @returns {Object} Broadcast event
 */
export function DrawOnWhiteboard(groupId, path) {
  const whiteboard = whiteboardStates.get(groupId)
  if (!whiteboard) {
    return { error: 'Whiteboard not found' }
  }

  // Validate path structure
  if (!path.points || !Array.isArray(path.points)) {
    return { error: 'Invalid path data' }
  }

  // Add path with metadata
  const drawingPath = {
    id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...path,
    timestamp: Date.now(),
    userId: path.userId || 'anonymous'
  }

  whiteboard.paths.push(drawingPath)
  whiteboard.lastModified = Date.now()

  // Create broadcast event
  const broadcastEvent = {
    type: 'whiteboard:draw',
    groupId,
    data: drawingPath,
    timestamp: Date.now()
  }

  console.log(`✓ Whiteboard updated for group ${groupId}`)
  return broadcastEvent
}

/**
 * Add object to whiteboard (text, shape, image)
 * @param {string} groupId
 * @param {Object} object - Object data
 * @returns {Object} Broadcast event
 */
export function AddWhiteboardObject(groupId, object) {
  const whiteboard = whiteboardStates.get(groupId)
  if (!whiteboard) {
    return { error: 'Whiteboard not found' }
  }

  const whiteboardObject = {
    id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...object,
    timestamp: Date.now(),
    userId: object.userId || 'anonymous'
  }

  whiteboard.objects.push(whiteboardObject)
  whiteboard.lastModified = Date.now()

  return {
    type: 'whiteboard:object',
    groupId,
    data: whiteboardObject,
    timestamp: Date.now()
  }
}

/**
 * Clear whiteboard
 * @param {string} groupId
 * @param {string} userId - User requesting clear
 * @returns {boolean}
 */
export function ClearWhiteboard(groupId, userId) {
  const whiteboard = whiteboardStates.get(groupId)
  const group = studyGroups.get(groupId)

  if (!whiteboard || !group) return false

  // Only owner can clear
  if (userId !== group.ownerId) {
    console.warn('Only group owner can clear whiteboard')
    return false
  }

  whiteboard.paths = []
  whiteboard.objects = []
  whiteboard.lastModified = Date.now()

  console.log(`✓ Whiteboard cleared for group ${groupId}`)
  return true
}

/**
 * Get whiteboard state
 * @param {string} groupId
 * @returns {WhiteboardState|null}
 */
export function GetWhiteboardState(groupId) {
  return whiteboardStates.get(groupId) || null
}

/**
 * Export whiteboard as image data
 * @param {string} groupId
 * @returns {Object} Export data
 */
export function ExportWhiteboard(groupId) {
  const whiteboard = whiteboardStates.get(groupId)
  if (!whiteboard) return null

  return {
    groupId,
    paths: whiteboard.paths,
    objects: whiteboard.objects,
    metadata: whiteboard.metadata,
    exportedAt: Date.now(),
    format: 'json'
  }
}

/* ═══════════════════════════════════════════════════════════════
 * 4. Group Problem Sets and Quizzes
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Create problem set from theorems
 * @param {string} groupId
 * @param {Array<string>} theorems - Theorem IDs
 * @returns {string} problemSetId
 */
export function CreateGroupProblemSet(groupId, theorems) {
  const group = studyGroups.get(groupId)
  if (!group) {
    return null
  }

  const graph = getGraph()
  const problemSetId = `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Generate problems from theorems
  const problems = theorems.map((theoremId, index) => {
    const node = graph.nodes.find(n => n.id === theoremId)
    if (!node) return null

    return {
      problemId: `p_${index + 1}`,
      theoremId,
      type: selectProblemType(node),
      question: generateQuestion(node),
      options: generateOptions(node),
      correctAnswer: node.id,
      difficulty: calculateDifficulty(node),
      points: calculatePoints(node)
    }
  }).filter(p => p !== null)

  const problemSet = {
    problemSetId,
    groupId,
    title: `${group.topic} - Problem Set`,
    problems,
    responses: {}, // userId -> { problemId -> answer }
    scores: {}, // userId -> score
    createdAt: Date.now(),
    dueDate: null,
    settings: {
      allowRetries: true,
      showAnswers: false,
      timeLimit: null // minutes
    }
  }

  problemSets.set(problemSetId, problemSet)

  console.log(`✓ Problem set created: ${problemSetId} with ${problems.length} problems`)
  return problemSetId
}

/**
 * Submit answer to problem
 * @param {string} problemSetId
 * @param {string} userId
 * @param {string} problemId
 * @param {any} answer
 * @returns {Object} Result
 */
export function SubmitAnswer(problemSetId, userId, problemId, answer) {
  const problemSet = problemSets.get(problemSetId)
  if (!problemSet) {
    return { error: 'Problem set not found' }
  }

  const problem = problemSet.problems.find(p => p.problemId === problemId)
  if (!problem) {
    return { error: 'Problem not found' }
  }

  // Initialize user responses
  if (!problemSet.responses[userId]) {
    problemSet.responses[userId] = {}
  }

  // Store answer
  problemSet.responses[userId][problemId] = {
    answer,
    timestamp: Date.now(),
    attempts: (problemSet.responses[userId][problemId]?.attempts || 0) + 1
  }

  // Check correctness
  const isCorrect = checkAnswer(problem, answer)

  // Update score
  if (isCorrect) {
    if (!problemSet.scores[userId]) {
      problemSet.scores[userId] = 0
    }
    problemSet.scores[userId] += problem.points
  }

  return {
    problemId,
    correct: isCorrect,
    points: isCorrect ? problem.points : 0,
    totalScore: problemSet.scores[userId] || 0,
    showAnswer: problemSet.settings.showAnswers
  }
}

/**
 * Get problem set
 * @param {string} problemSetId
 * @returns {Object|null}
 */
export function GetProblemSet(problemSetId) {
  return problemSets.get(problemSetId) || null
}

/**
 * List problem sets for group
 * @param {string} groupId
 * @returns {Array<Object>}
 */
export function ListProblemSets(groupId) {
  return Array.from(problemSets.values())
    .filter(ps => ps.groupId === groupId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Get leaderboard for problem set
 * @param {string} problemSetId
 * @returns {Array<Object>}
 */
export function GetLeaderboard(problemSetId) {
  const problemSet = problemSets.get(problemSetId)
  if (!problemSet) return []

  return Object.entries(problemSet.scores)
    .map(([userId, score]) => ({
      userId,
      score,
      problemsCompleted: Object.keys(problemSet.responses[userId] || {}).length,
      totalProblems: problemSet.problems.length
    }))
    .sort((a, b) => b.score - a.score)
}

/* ═══════════════════════════════════════════════════════════════
 * 5. Group Progress Tracking
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Track group progress
 * @param {string} groupId
 * @returns {Object} Progress statistics
 */
export function TrackGroupProgress(groupId) {
  const progress = groupProgress.get(groupId)
  const group = studyGroups.get(groupId)

  if (!progress || !group) {
    return { error: 'Group not found' }
  }

  // Calculate aggregate stats
  const memberStats = Object.entries(progress.members).map(([userId, data]) => ({
    userId,
    problemsSolved: data.problemsSolved,
    contributionScore: data.contributionScore,
    studyTimeMinutes: data.studyTimeMinutes,
    joinedAt: data.joinedAt
  }))

  const totalProblems = memberStats.reduce((sum, m) => sum + m.problemsSolved, 0)
  const totalStudyTime = memberStats.reduce((sum, m) => sum + m.studyTimeMinutes, 0)
  const avgContribution = memberStats.length > 0
    ? memberStats.reduce((sum, m) => sum + m.contributionScore, 0) / memberStats.length
    : 0

  // Get theorem coverage
  const theoremsCovered = progress.theoremsCovered

  return {
    groupId,
    groupName: group.name,
    topic: group.topic,
    memberCount: group.members.length,
    stats: {
      totalProblems,
      totalStudyTime,
      avgContribution: Math.round(avgContribution),
      theoremsCount: theoremsCovered.length,
      activeDays: calculateActiveDays(group.createdAt)
    },
    members: memberStats.sort((a, b) => b.contributionScore - a.contributionScore),
    theoremsCovered,
    recentActivity: getRecentActivity(groupId),
    lastUpdated: progress.lastUpdated
  }
}

/**
 * Update member progress
 * @param {string} groupId
 * @param {string} userId
 * @param {Object} updates
 */
export function UpdateMemberProgress(groupId, userId, updates) {
  const progress = groupProgress.get(groupId)
  if (!progress) return

  if (!progress.members[userId]) {
    progress.members[userId] = {
      joinedAt: Date.now(),
      problemsSolved: 0,
      contributionScore: 0,
      studyTimeMinutes: 0
    }
  }

  const member = progress.members[userId]

  if (updates.problemsSolved !== undefined) {
    member.problemsSolved += updates.problemsSolved
    progress.problemsCompleted += updates.problemsSolved
  }

  if (updates.studyTimeMinutes !== undefined) {
    member.studyTimeMinutes += updates.studyTimeMinutes
    progress.studyTimeMinutes += updates.studyTimeMinutes
  }

  if (updates.contributionScore !== undefined) {
    member.contributionScore += updates.contributionScore
  }

  if (updates.theoremId) {
    if (!progress.theoremsCovered.includes(updates.theoremId)) {
      progress.theoremsCovered.push(updates.theoremId)
    }
  }

  progress.lastUpdated = Date.now()
}

/**
 * Get group activity feed
 * @param {string} groupId
 * @param {number} limit
 * @returns {Array<Object>}
 */
export function GetActivityFeed(groupId, limit = 20) {
  // Combine activities from multiple sources
  const activities = []

  // Problem set activities
  const sets = ListProblemSets(groupId)
  sets.forEach(ps => {
    activities.push({
      type: 'problem_set_created',
      timestamp: ps.createdAt,
      data: { problemSetId: ps.problemSetId, title: ps.title }
    })
  })

  // Whiteboard activities
  const whiteboard = whiteboardStates.get(groupId)
  if (whiteboard) {
    whiteboard.paths.slice(-10).forEach(path => {
      activities.push({
        type: 'whiteboard_draw',
        timestamp: path.timestamp,
        data: { userId: path.userId }
      })
    })
  }

  return activities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
}

/* ═══════════════════════════════════════════════════════════════
 * Helper Functions
 * ═══════════════════════════════════════════════════════════════ */

function selectProblemType(node) {
  const types = ['multiple-choice', 'true-false', 'connection', 'application']
  const weights = [0.4, 0.2, 0.2, 0.2]

  const random = Math.random()
  let cumulative = 0

  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i]
    if (random < cumulative) {
      return types[i]
    }
  }

  return types[0]
}

function generateQuestion(node) {
  const templates = [
    `What is the significance of ${node.name || node.en}?`,
    `Which theorem is directly related to ${node.name || node.en}?`,
    `${node.name || node.en} is primarily used in which context?`,
    `What is the main application of ${node.name || node.en}?`
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}

function generateOptions(node) {
  const graph = getGraph()

  // Get related nodes as distractors
  const related = graph.edges
    .filter(e => e.src === node.id || e.tgt === node.id)
    .map(e => e.src === node.id ? e.tgt : e.src)
    .slice(0, 3)

  const options = [node.id, ...related]

  // Shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]]
  }

  return options.map(id => {
    const optNode = graph.nodes.find(n => n.id === id)
    return {
      id,
      label: optNode ? (optNode.name || optNode.en || id) : id
    }
  })
}

function calculateDifficulty(node) {
  // Based on importance and connections
  const importance = node.importance || 0
  const degree = node.degree || 0

  if (importance > 0.8 && degree > 10) return 'hard'
  if (importance > 0.5 && degree > 5) return 'medium'
  return 'easy'
}

function calculatePoints(node) {
  const difficulty = calculateDifficulty(node)
  const points = {
    easy: 10,
    medium: 20,
    hard: 30
  }
  return points[difficulty] || 10
}

function checkAnswer(problem, answer) {
  if (problem.type === 'multiple-choice') {
    return answer === problem.correctAnswer
  }

  if (problem.type === 'true-false') {
    return answer === problem.correctAnswer
  }

  // For other types, implement custom logic
  return false
}

function calculateActiveDays(createdAt) {
  const now = Date.now()
  const diff = now - createdAt
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getRecentActivity(groupId) {
  const activities = GetActivityFeed(groupId, 5)
  return activities.map(a => ({
    type: a.type,
    timestamp: a.timestamp,
    timeAgo: formatTimeAgo(a.timestamp)
  }))
}

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

/* ═══════════════════════════════════════════════════════════════
 * Chat Functions (Bonus)
 * ═══════════════════════════════════════════════════════════════ */

const groupMessages = new Map()

/**
 * Send message to group chat
 * @param {string} groupId
 * @param {string} userId
 * @param {string} message
 * @returns {Object} Message object
 */
export function SendMessage(groupId, userId, message) {
  const group = studyGroups.get(groupId)
  if (!group) {
    return { error: 'Group not found' }
  }

  if (!group.members.includes(userId)) {
    return { error: 'User not a member of this group' }
  }

  if (!groupMessages.has(groupId)) {
    groupMessages.set(groupId, [])
  }

  const messageObj = {
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    groupId,
    userId,
    message,
    timestamp: Date.now(),
    reactions: []
  }

  groupMessages.get(groupId).push(messageObj)
  group.activity.totalMessages++
  group.activity.lastActive = Date.now()

  return messageObj
}

/**
 * Get chat messages for group
 * @param {string} groupId
 * @param {number} limit
 * @returns {Array<Object>}
 */
export function GetMessages(groupId, limit = 50) {
  const messages = groupMessages.get(groupId) || []
  return messages.slice(-limit)
}

/**
 * Add reaction to message
 * @param {string} messageId
 * @param {string} userId
 * @param {string} emoji
 */
export function AddReaction(messageId, userId, emoji) {
  for (const messages of groupMessages.values()) {
    const message = messages.find(m => m.messageId === messageId)
    if (message) {
      message.reactions.push({ userId, emoji, timestamp: Date.now() })
      return true
    }
  }
  return false
}

/* ═══════════════════════════════════════════════════════════════
 * Analytics & Reports
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Generate group report
 * @param {string} groupId
 * @returns {Object} Comprehensive report
 */
export function GenerateGroupReport(groupId) {
  const group = studyGroups.get(groupId)
  const progress = TrackGroupProgress(groupId)
  const problemSetsData = ListProblemSets(groupId)

  if (!group || progress.error) {
    return { error: 'Group not found' }
  }

  return {
    group: {
      id: groupId,
      name: group.name,
      topic: group.topic,
      createdAt: group.createdAt,
      memberCount: group.members.length
    },
    progress,
    problemSets: {
      total: problemSetsData.length,
      completed: problemSetsData.filter(ps => {
        const responses = Object.keys(ps.responses).length
        return responses >= group.members.length * 0.8 // 80% completion
      }).length
    },
    voice: GetVoiceStatus(groupId),
    whiteboard: {
      pathCount: whiteboardStates.get(groupId)?.paths.length || 0,
      objectCount: whiteboardStates.get(groupId)?.objects.length || 0
    },
    engagement: {
      messagesPerMember: group.activity.totalMessages / group.members.length,
      activeDays: calculateActiveDays(group.createdAt),
      avgStudyTime: progress.stats.totalStudyTime / group.members.length
    }
  }
}

/**
 * Get system-wide statistics
 * @returns {Object}
 */
export function GetSystemStats() {
  return {
    totalGroups: studyGroups.size,
    totalMembers: Array.from(studyGroups.values())
      .reduce((sum, g) => sum + g.members.length, 0),
    totalProblemSets: problemSets.size,
    totalProblems: Array.from(problemSets.values())
      .reduce((sum, ps) => sum + ps.problems.length, 0),
    activeVoiceChannels: voiceChannels.size,
    totalMessages: Array.from(groupMessages.values())
      .reduce((sum, msgs) => sum + msgs.length, 0)
  }
}

