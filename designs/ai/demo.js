/**
 * designs/ai/demo.js
 * Interactive demo for AI Visualization Recommender
 */

import {
  RecommendVisualization,
  AutoHighlightConnections,
  GenerateComparison,
  OptimizeCameraPosition,
  GetRecommenderStats
} from './viz-recommender.js'
import { getGraph } from '../shared/kb.js'

/* ═══════════════════════════════════════════════════════════════
 * State Management
 * ═══════════════════════════════════════════════════════════════ */

let currentTheoremId = null
let currentRecommendation = null

/* ═══════════════════════════════════════════════════════════════
 * DOM Elements
 * ═══════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id)
const $$ = (sel) => document.querySelectorAll(sel)

/* ═══════════════════════════════════════════════════════════════
 * Initialization
 * ═══════════════════════════════════════════════════════════════ */

function init() {
  // Load system stats
  loadSystemStats()

  // Bind event listeners
  $('search-btn').addEventListener('click', handleSearch)
  $('theorem-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch()
  })

  // Example buttons
  $$('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theoremId = btn.dataset.id
      $('theorem-search').value = theoremId
      analyzeTheorem(theoremId)
    })
  })

  // Comparison buttons
  $('compare-btn').addEventListener('click', showComparison)
  $('back-to-result-btn').addEventListener('click', () => {
    $('comparison-section').style.display = 'none'
    $('result-section').style.display = 'block'
  })
  $('run-comparison-btn').addEventListener('click', handleComparison)

  // Open visualization button
  $('open-viz-btn').addEventListener('click', () => {
    if (currentRecommendation) {
      openVisualization(currentRecommendation.recommended, currentTheoremId)
    }
  })

  console.log('AI Visualization Recommender initialized')
}

/* ═══════════════════════════════════════════════════════════════
 * Search & Analysis
 * ═══════════════════════════════════════════════════════════════ */

function handleSearch() {
  const query = $('theorem-search').value.trim()
  if (!query) return

  // Try to find matching theorem
  const graph = getGraph()
  const node = graph.nodes.find(n =>
    n.id === query ||
    n.name?.includes(query) ||
    n.en?.toLowerCase().includes(query.toLowerCase())
  )

  if (node) {
    analyzeTheorem(node.id)
  } else {
    alert(`Theorem "${query}" not found. Try one of the examples.`)
  }
}

function analyzeTheorem(theoremId) {
  const graph = getGraph()
  const node = graph.nodes.find(n => n.id === theoremId)

  if (!node) {
    alert(`Theorem ${theoremId} not found`)
    return
  }

  currentTheoremId = theoremId

  // Get recommendation
  currentRecommendation = RecommendVisualization(theoremId)
  console.log('Recommendation:', currentRecommendation)

  // Get connection highlights
  const highlights = AutoHighlightConnections(theoremId)
  console.log('Highlights:', highlights)

  // Display results
  displayRecommendation(node, currentRecommendation, highlights)

  // Show result section
  $('result-section').style.display = 'block'
  $('comparison-section').style.display = 'none'

  // Scroll to results
  $('result-section').scrollIntoView({ behavior: 'smooth' })
}

/* ═══════════════════════════════════════════════════════════════
 * Display Functions
 * ═══════════════════════════════════════════════════════════════ */

function displayRecommendation(node, recommendation, highlights) {
  // Theorem header
  $('theorem-name').textContent = node.name || node.en || node.id
  $('theorem-meta').innerHTML = `
    <strong>ID:</strong> ${node.id} &nbsp;|&nbsp;
    <strong>Family:</strong> ${node.family} &nbsp;|&nbsp;
    <strong>Importance:</strong> ${(node.importance * 100).toFixed(0)}%
  `

  // Recommended visualization
  displayRecommendedViz(recommendation)

  // Scores chart
  displayScoresChart(recommendation.scores, recommendation.recommended)

  // Metrics
  displayMetrics(recommendation.metrics)

  // Connections
  displayConnections(highlights)
}

function displayRecommendedViz(rec) {
  const vizIcons = {
    atlas: '🌌',
    map: '🗺️',
    manuscript: '📖',
    timeline: '📅'
  }

  const vizNames = {
    atlas: 'Atlas (3D Nebula)',
    map: 'Map (2D Graph)',
    manuscript: 'Manuscript (Book)',
    timeline: 'Timeline (Historical)'
  }

  const vizDescriptions = {
    atlas: 'Explore theorems in a beautiful 3D space with spatial clustering and importance hierarchy',
    map: 'Navigate clear 2D relationships with easy path tracing and dependency analysis',
    manuscript: 'Study theorems in depth with linear narrative structure and detailed proofs',
    timeline: 'Discover historical development with chronological ordering and evolution'
  }

  $('recommended-viz').innerHTML = `
    <div class="viz-type">${vizIcons[rec.recommended]}</div>
    <div class="viz-name">${vizNames[rec.recommended]}</div>
    <p class="viz-description">${vizDescriptions[rec.recommended]}</p>
  `

  // Display reasons
  const reasons = rec.reasons[rec.recommended]
  if (reasons && reasons.length > 0) {
    $('recommendation-reasons').innerHTML = `
      <h4>Why this visualization?</h4>
      <ul>
        ${reasons.map(r => `<li>${r}</li>`).join('')}
      </ul>
    `
  } else {
    $('recommendation-reasons').innerHTML = ''
  }
}

function displayScoresChart(scores, recommended) {
  const maxScore = Math.max(...Object.values(scores))
  const container = $('scores-chart')

  container.innerHTML = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([viz, score]) => {
      const percentage = maxScore > 0 ? (score / maxScore * 100) : 0
      const isRecommended = viz === recommended

      return `
        <div class="score-bar ${isRecommended ? 'recommended' : ''}">
          <div class="score-label">${capitalizeFirst(viz)}</div>
          <div class="score-bar-bg">
            <div class="score-bar-fill" style="width: ${percentage}%">
              ${score.toFixed(1)}
            </div>
          </div>
          ${isRecommended ? '<span style="color: var(--accent-green); font-size: 1.5rem;">✓</span>' : ''}
        </div>
      `
    })
    .join('')
}

function displayMetrics(metrics) {
  $('metrics-display').innerHTML = `
    <div class="metric-item">
      <div class="metric-value">${metrics.degree}</div>
      <div class="metric-label">Degree</div>
    </div>
    <div class="metric-item">
      <div class="metric-value">${metrics.neighborhoodSize}</div>
      <div class="metric-label">Neighborhood</div>
    </div>
    <div class="metric-item">
      <div class="metric-value">${(metrics.clustering * 100).toFixed(0)}%</div>
      <div class="metric-label">Clustering</div>
    </div>
    <div class="metric-item">
      <div class="metric-value">${metrics.avgPathLength.toFixed(1)}</div>
      <div class="metric-label">Avg Path</div>
    </div>
    <div class="metric-item">
      <div class="metric-value">${(metrics.importance * 100).toFixed(0)}%</div>
      <div class="metric-label">Importance</div>
    </div>
  `
}

function displayConnections(highlights) {
  const container = $('connections-display')
  const graph = getGraph()

  const groups = [
    { key: 'critical', title: 'Critical Connections', icon: '🔴' },
    { key: 'important', title: 'Important Connections', icon: '🟡' },
    { key: 'related', title: 'Related Connections', icon: '🔵' }
  ]

  let html = ''

  for (const { key, title, icon } of groups) {
    const connections = highlights[key]
    if (!connections || connections.length === 0) continue

    html += `
      <div class="connection-group">
        <h5>${icon} ${title} (${connections.length})</h5>
        <div class="connection-list">
          ${connections.map(conn => {
            const targetNode = graph.nodes.find(n =>
              n.id === (conn.tgt === currentTheoremId ? conn.src : conn.tgt)
            )
            const targetName = targetNode ?
              (targetNode.name || targetNode.en || targetNode.id) :
              (conn.tgt === currentTheoremId ? conn.src : conn.tgt)

            return `
              <div class="connection-item ${key}">
                <span class="connection-arrow">→</span>
                <span class="connection-target">${targetName}</span>
                <span class="connection-type">${conn.type}</span>
              </div>
            `
          }).join('')}
        </div>
      </div>
    `
  }

  if (html === '') {
    container.innerHTML = '<p style="color: var(--text-secondary);">No significant connections found.</p>'
  } else {
    container.innerHTML = html
  }
}

/* ═══════════════════════════════════════════════════════════════
 * Comparison
 * ═══════════════════════════════════════════════════════════════ */

function showComparison() {
  $('result-section').style.display = 'none'
  $('comparison-section').style.display = 'block'
  $('compare-theorem1').value = currentTheoremId
  $('compare-theorem2').value = ''
  $('comparison-result').innerHTML = ''
}

function handleComparison() {
  const theorem1 = $('compare-theorem1').value.trim()
  const theorem2 = $('compare-theorem2').value.trim()

  if (!theorem1 || !theorem2) {
    alert('Please enter both theorem IDs')
    return
  }

  const comparison = GenerateComparison(theorem1, theorem2)
  console.log('Comparison:', comparison)

  if (comparison.error) {
    alert(comparison.error)
    return
  }

  displayComparison(comparison)
}

function displayComparison(comp) {
  const node1 = comp.nodes[0]
  const node2 = comp.nodes[1]

  let html = `
    <div class="card">
      <h3>📊 Property Comparison</h3>
      <div class="comparison-grid">
        <div>
          <h4>${node1.name || node1.en || node1.id}</h4>
          <ul>
            <li><strong>Importance:</strong> ${(comp.properties.importance[node1.id] * 100).toFixed(0)}%</li>
            <li><strong>Family:</strong> ${comp.properties.family[node1.id]}</li>
            <li><strong>Degree:</strong> ${comp.properties.degree[node1.id]}</li>
          </ul>
        </div>
        <div>
          <h4>${node2.name || node2.en || node2.id}</h4>
          <ul>
            <li><strong>Importance:</strong> ${(comp.properties.importance[node2.id] * 100).toFixed(0)}%</li>
            <li><strong>Family:</strong> ${comp.properties.family[node2.id]}</li>
            <li><strong>Degree:</strong> ${comp.properties.degree[node2.id]}</li>
          </ul>
        </div>
      </div>
    </div>
  `

  if (comp.path) {
    html += `
      <div class="card">
        <h3>🛤️ Connection Path (${comp.pathLength} ${comp.pathLength === 1 ? 'hop' : 'hops'})</h3>
        <div class="path-nodes">
          ${comp.path.map((nodeId, i) => {
            const node = comp.nodes.find(n => n.id === nodeId) ||
                         getGraph().nodes.find(n => n.id === nodeId)
            const name = node ? (node.name || node.en || nodeId) : nodeId
            return `
              ${i > 0 ? '<span class="path-arrow">→</span>' : ''}
              <div class="path-node">${name}</div>
            `
          }).join('')}
        </div>
      </div>
    `
  } else {
    html += `
      <div class="card">
        <h3>🛤️ Connection Path</h3>
        <p style="color: var(--text-secondary);">No direct path found within 6 hops.</p>
      </div>
    `
  }

  if (comp.commonNeighbors.length > 0) {
    html += `
      <div class="card">
        <h3>🔗 Common Neighbors (${comp.commonNeighbors.length})</h3>
        <div class="connection-list">
          ${comp.commonNeighbors.slice(0, 10).map(nodeId => {
            const node = getGraph().nodes.find(n => n.id === nodeId)
            const name = node ? (node.name || node.en || nodeId) : nodeId
            return `
              <div class="connection-item">
                <span class="connection-target">${name}</span>
              </div>
            `
          }).join('')}
          ${comp.commonNeighbors.length > 10 ?
            `<p style="color: var(--text-secondary); margin-top: 10px;">...and ${comp.commonNeighbors.length - 10} more</p>` :
            ''
          }
        </div>
      </div>
    `
  }

  $('comparison-result').innerHTML = html
}

/* ═══════════════════════════════════════════════════════════════
 * System Stats
 * ═══════════════════════════════════════════════════════════════ */

function loadSystemStats() {
  const stats = GetRecommenderStats()
  console.log('System stats:', stats)

  $('system-stats').innerHTML = `
    <div class="stat-box">
      <div class="stat-value">${stats.totalNodes}</div>
      <div class="stat-label">Total Theorems</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${stats.totalEdges}</div>
      <div class="stat-label">Total Connections</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${stats.avgDegree.toFixed(1)}</div>
      <div class="stat-label">Avg Degree</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${(stats.avgClustering * 100).toFixed(0)}%</div>
      <div class="stat-label">Avg Clustering</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${stats.vizTypes}</div>
      <div class="stat-label">Viz Types</div>
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════════
 * Navigation
 * ═══════════════════════════════════════════════════════════════ */

function openVisualization(vizType, theoremId) {
  const paths = {
    atlas: `../atlas/index.html#focus=${theoremId}`,
    map: `../map/index.html#node=${theoremId}`,
    manuscript: `../manuscript/index.html#theorem=${theoremId}`,
    timeline: `../timeline/index.html#focus=${theoremId}`
  }

  const url = paths[vizType]
  if (url) {
    window.open(url, '_blank')
  } else {
    alert(`Visualization type ${vizType} not yet implemented`)
  }
}

/* ═══════════════════════════════════════════════════════════════
 * Utilities
 * ═══════════════════════════════════════════════════════════════ */

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/* ═══════════════════════════════════════════════════════════════
 * Start
 * ═══════════════════════════════════════════════════════════════ */

init()
