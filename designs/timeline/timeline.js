/**
 * designs/timeline/timeline.js
 *
 * Historical timeline visualization for Formula Nebula.
 * Shows theorems and conjectures chronologically from 1800 to 2025.
 */

import {
  getGraph,
  nodeHex,
  FAMILIES,
  CONJECTURE_STATUS,
  CONJECTURE_FIELDS
} from '../shared/kb.js'

// Timeline configuration
const TIMELINE_START = 1800
const TIMELINE_END = 2025
const CANVAS_PADDING = 80
const BUBBLE_BASE_RADIUS = 8
const BUBBLE_MAX_RADIUS = 24
const HOVER_SCALE = 1.4
const ZOOM_MIN = 0.5
const ZOOM_MAX = 5
const ZOOM_STEP = 0.2

// State
let canvas, ctx
let graph
let timelineNodes = []
let hoveredNode = null
let selectedNode = null
let transform = { x: 0, y: 0, scale: 1 }
let isDragging = false
let dragStart = { x: 0, y: 0 }
const filters = { theorems: true, conjectures: true }

// Initialize
document.addEventListener('DOMContentLoaded', init)

function init() {
  canvas = document.getElementById('timeline-canvas')
  ctx = canvas.getContext('2d')

  graph = getGraph()

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  setupInteraction()
  setupControls()
  extractTimelineData()
  generateDecadeLabels()
  render()
}

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  render()
}

function extractTimelineData() {
  timelineNodes = []

  // Extract from main graph nodes
  graph.nodes.forEach(node => {
    // Most theorem nodes don't have year data, but some might have it in detail
    const yearMatch = node.detail?.match(/\b(1[89]\d{2}|20[0-2]\d)\b/)
    const proposerMatch = node.detail?.match(/([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)\s*\(\s*(\d{4})\s*\)/)

    if (yearMatch || proposerMatch) {
      const year = proposerMatch ? parseInt(proposerMatch[2]) : parseInt(yearMatch[1])
      if (year >= TIMELINE_START && year <= TIMELINE_END) {
        timelineNodes.push({
          ...node,
          year,
          proposer: proposerMatch?.[1] || 'Unknown',
          type: 'theorem',
          color: nodeHex(node)
        })
      }
    }
  })

  // Extract conjecture nodes (these have explicit year/proposer fields)
  if (graph.conjectureNodes) {
    graph.conjectureNodes.forEach(node => {
      if (node.year && node.year >= TIMELINE_START && node.year <= TIMELINE_END) {
        const status = CONJECTURE_STATUS[node.status]
        timelineNodes.push({
          ...node,
          type: 'conjecture',
          color: status?.color || '#ffffff',
          statusName: status?.name || node.status
        })
      }
    })
  }

  // Sort by year
  timelineNodes.sort((a, b) => a.year - b.year)

  // Calculate positions
  const timelineWidth = canvas.width / window.devicePixelRatio - 2 * CANVAS_PADDING
  const timelineHeight = canvas.height / window.devicePixelRatio - 2 * CANVAS_PADDING

  timelineNodes.forEach(node => {
    // X position based on year
    const yearProgress = (node.year - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)
    node.x = CANVAS_PADDING + yearProgress * timelineWidth

    // Y position: random scatter with clustering by family
    const familyOffset = node.family ? (FAMILIES[node.family]?.arm || 0) * 0.15 : 0.5
    const jitter = (Math.random() - 0.5) * 0.3
    node.y = CANVAS_PADDING + (familyOffset + jitter) * timelineHeight

    // Radius based on importance
    const importanceScale = node.importance || 0.5
    node.radius = BUBBLE_BASE_RADIUS + (BUBBLE_MAX_RADIUS - BUBBLE_BASE_RADIUS) * importanceScale
  })

  console.log(`Timeline: extracted ${timelineNodes.length} nodes (${timelineNodes.filter(n => n.type === 'theorem').length} theorems, ${timelineNodes.filter(n => n.type === 'conjecture').length} conjectures)`)
}

function generateDecadeLabels() {
  const container = document.getElementById('decade-labels')
  container.innerHTML = ''

  for (let year = 1800; year <= 2020; year += 20) {
    const label = document.createElement('div')
    label.className = 'decade-label'
    label.textContent = year
    container.appendChild(label)
  }
}

function setupControls() {
  // Zoom controls
  document.getElementById('zoom-in').addEventListener('click', () => {
    zoom(ZOOM_STEP, canvas.width / 2, canvas.height / 2)
  })

  document.getElementById('zoom-out').addEventListener('click', () => {
    zoom(-ZOOM_STEP, canvas.width / 2, canvas.height / 2)
  })

  document.getElementById('zoom-reset').addEventListener('click', () => {
    transform = { x: 0, y: 0, scale: 1 }
    render()
  })

  // Filter controls
  document.getElementById('filter-theorems').addEventListener('change', (e) => {
    filters.theorems = e.target.checked
    render()
  })

  document.getElementById('filter-conjectures').addEventListener('change', (e) => {
    filters.conjectures = e.target.checked
    render()
  })

  // Info panel close
  document.getElementById('close-panel').addEventListener('click', () => {
    closeInfoPanel()
  })
}

function setupInteraction() {
  // Mouse move for hover
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDragging) {
      const dx = x - dragStart.x
      const dy = y - dragStart.y
      transform.x += dx
      transform.y += dy
      dragStart = { x, y }
      render()
      return
    }

    // Check hover
    const worldPos = screenToWorld(x, y)
    const prev = hoveredNode
    hoveredNode = findNodeAt(worldPos.x, worldPos.y)

    if (prev !== hoveredNode) {
      canvas.style.cursor = hoveredNode ? 'pointer' : 'grab'
      render()
    }
  })

  // Mouse down for drag
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (hoveredNode) {
      selectedNode = hoveredNode
      openInfoPanel(selectedNode)
    } else {
      isDragging = true
      dragStart = { x, y }
      canvas.style.cursor = 'grabbing'
    }
  })

  canvas.addEventListener('mouseup', () => {
    isDragging = false
    canvas.style.cursor = hoveredNode ? 'pointer' : 'grab'
  })

  canvas.addEventListener('mouseleave', () => {
    isDragging = false
    hoveredNode = null
    render()
  })

  // Wheel for zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const delta = -e.deltaY * 0.001
    zoom(delta, x, y)
  })
}

function zoom(delta, centerX, centerY) {
  const oldScale = transform.scale
  transform.scale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, transform.scale + delta))

  // Adjust pan to zoom toward center
  const scaleDiff = transform.scale - oldScale
  transform.x -= (centerX - transform.x) * scaleDiff / oldScale
  transform.y -= (centerY - transform.y) * scaleDiff / oldScale

  render()
}

function screenToWorld(screenX, screenY) {
  return {
    x: (screenX - transform.x) / transform.scale,
    y: (screenY - transform.y) / transform.scale
  }
}

function worldToScreen(worldX, worldY) {
  return {
    x: worldX * transform.scale + transform.x,
    y: worldY * transform.scale + transform.y
  }
}

function findNodeAt(x, y) {
  for (let i = timelineNodes.length - 1; i >= 0; i--) {
    const node = timelineNodes[i]
    if (!shouldShowNode(node)) continue

    const dx = x - node.x
    const dy = y - node.y
    const radius = node.radius * (node === hoveredNode ? HOVER_SCALE : 1)

    if (dx * dx + dy * dy <= radius * radius) {
      return node
    }
  }
  return null
}

function shouldShowNode(node) {
  if (node.type === 'theorem' && !filters.theorems) return false
  if (node.type === 'conjecture' && !filters.conjectures) return false
  return true
}

function render() {
  const w = canvas.width / window.devicePixelRatio
  const h = canvas.height / window.devicePixelRatio

  ctx.clearRect(0, 0, w, h)

  // Save transform
  ctx.save()
  ctx.translate(transform.x, transform.y)
  ctx.scale(transform.scale, transform.scale)

  // Draw timeline axis
  drawAxis()

  // Draw connections for selected node
  if (selectedNode) {
    drawConnections(selectedNode)
  }

  // Draw nodes
  timelineNodes.forEach(node => {
    if (shouldShowNode(node)) {
      drawNode(node)
    }
  })

  ctx.restore()
}

function drawAxis() {
  const w = canvas.width / window.devicePixelRatio
  const y = canvas.height / window.devicePixelRatio / 2

  ctx.strokeStyle = 'rgba(127, 212, 255, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(CANVAS_PADDING, y)
  ctx.lineTo(w - CANVAS_PADDING, y)
  ctx.stroke()
}

function drawNode(node) {
  const isHovered = node === hoveredNode
  const isSelected = node === selectedNode
  const radius = node.radius * (isHovered ? HOVER_SCALE : 1)

  // Glow effect for selected/hovered
  if (isSelected || isHovered) {
    ctx.shadowBlur = 20
    ctx.shadowColor = node.color
  } else {
    ctx.shadowBlur = 5
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  }

  // Draw bubble
  ctx.fillStyle = node.color
  ctx.globalAlpha = isSelected ? 1 : isHovered ? 0.9 : 0.7
  ctx.beginPath()
  ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
  ctx.fill()

  // Border for selected
  if (isSelected) {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.globalAlpha = 1
    ctx.stroke()
  }

  ctx.shadowBlur = 0
  ctx.globalAlpha = 1

  // Label for important nodes or hovered
  if (isHovered || node.importance > 0.85) {
    ctx.fillStyle = '#ffffff'
    ctx.font = `${Math.max(10, 12 / transform.scale)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const label = node.name || node.en || node.id
    ctx.fillText(label, node.x, node.y + radius + 5)
  }
}

function drawConnections(node) {
  // Find connections from graph links
  const connections = []

  if (graph.links) {
    graph.links.forEach(link => {
      if (link.source === node.id || link.target === node.id) {
        const otherId = link.source === node.id ? link.target : link.source
        const otherNode = timelineNodes.find(n => n.id === otherId)
        if (otherNode && shouldShowNode(otherNode)) {
          connections.push(otherNode)
        }
      }
    })
  }

  // Draw connection lines
  ctx.strokeStyle = 'rgba(157, 255, 176, 0.3)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 5])

  connections.forEach(other => {
    ctx.beginPath()
    ctx.moveTo(node.x, node.y)
    ctx.lineTo(other.x, other.y)
    ctx.stroke()
  })

  ctx.setLineDash([])
}

function openInfoPanel(node) {
  const panel = document.getElementById('info-panel')
  panel.classList.add('visible')

  document.getElementById('info-title').textContent = node.name || node.en || node.id
  document.getElementById('info-year').textContent = `年份: ${node.year}`
  document.getElementById('info-proposer').textContent = node.proposer ? `提出者: ${node.proposer}` : ''

  if (node.family && FAMILIES[node.family]) {
    document.getElementById('info-family').textContent = `领域: ${FAMILIES[node.family].name}`
  } else if (node.field && CONJECTURE_FIELDS[node.field]) {
    document.getElementById('info-family').textContent = `领域: ${CONJECTURE_FIELDS[node.field].name}`
  } else {
    document.getElementById('info-family').textContent = ''
  }

  document.getElementById('info-summary').textContent = node.summary || ''
  document.getElementById('info-formula').textContent = node.latex || ''

  // Show connections
  const connectionsDiv = document.getElementById('info-connections')
  const connections = findConnections(node)

  if (connections.length > 0) {
    connectionsDiv.innerHTML = '<h3>相关定理与猜想</h3>'
    connections.forEach(conn => {
      const item = document.createElement('div')
      item.className = 'connection-item'
      item.innerHTML = `
        <div class="name">${conn.name || conn.en || conn.id}</div>
        <div class="year">${conn.year}</div>
      `
      item.addEventListener('click', () => {
        selectedNode = conn
        openInfoPanel(conn)
        render()
      })
      connectionsDiv.appendChild(item)
    })
  } else {
    connectionsDiv.innerHTML = ''
  }

  render()
}

function closeInfoPanel() {
  const panel = document.getElementById('info-panel')
  panel.classList.remove('visible')
  selectedNode = null
  render()
}

function findConnections(node) {
  const connections = []

  if (graph.links) {
    graph.links.forEach(link => {
      if (link.source === node.id || link.target === node.id) {
        const otherId = link.source === node.id ? link.target : link.source
        const otherNode = timelineNodes.find(n => n.id === otherId)
        if (otherNode && shouldShowNode(otherNode)) {
          connections.push(otherNode)
        }
      }
    })
  }

  // Sort by year
  connections.sort((a, b) => a.year - b.year)

  return connections
}

