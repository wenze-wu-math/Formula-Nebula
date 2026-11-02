/**
 * Graph Analytics Dashboard
 * Interactive metrics and visualizations for Formula Nebula
 */

import { getGraph, FAMILIES } from '../shared/kb.js'

// Initialize graph data
const graph = getGraph()
console.log('Graph loaded:', graph.nodes.length, 'nodes,', graph.links.length, 'links')

// ========================================
// Utility Functions
// ========================================

function drawText(ctx, text, x, y, options = {}) {
  const {
    size = 12,
    color = '#e0e0e0',
    align = 'left',
    baseline = 'middle',
    font = 'system-ui'
  } = options

  ctx.font = `${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.fillText(text, x, y)
}

function drawLine(ctx, x1, y1, x2, y2, color = '#333644', width = 1) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function drawRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function getCanvasContext(id) {
  const canvas = document.getElementById(id)
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  return { canvas, ctx, width: rect.width, height: rect.height }
}

// ========================================
// 1. Degree Distribution Histogram
// ========================================

function computeDegreeDistribution() {
  const degrees = new Map()
  graph.nodes.forEach(node => {
    const inDegree = graph.links.filter(l => l.target === node).length
    const outDegree = graph.links.filter(l => l.source === node).length
    const totalDegree = inDegree + outDegree
    node.degree = totalDegree
    node.inDegree = inDegree
    node.outDegree = outDegree
    degrees.set(totalDegree, (degrees.get(totalDegree) || 0) + 1)
  })
  return Array.from(degrees.entries()).sort((a, b) => a[0] - b[0]).map(([degree, count]) => ({ degree, count }))
}

function drawDegreeDistribution() {
  const distribution = computeDegreeDistribution()
  const { ctx, width, height } = getCanvasContext('degree-canvas')
  ctx.fillStyle = '#1a1d2e'
  ctx.fillRect(0, 0, width, height)
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const maxCount = Math.max(...distribution.map(d => d.count))
  const maxDegree = Math.max(...distribution.map(d => d.degree))
  drawLine(ctx, padding.left, padding.top, padding.left, height - padding.bottom, '#4fc3f7', 2)
  drawLine(ctx, padding.left, height - padding.bottom, width - padding.right, height - padding.bottom, '#4fc3f7', 2)
  const barWidth = chartWidth / distribution.length
  distribution.forEach((d, i) => {
    const barHeight = (d.count / maxCount) * chartHeight
    const x = padding.left + i * barWidth
    const y = height - padding.bottom - barHeight
    const hue = 190 + (d.degree / maxDegree) * 100
    drawRect(ctx, x + 1, y, barWidth - 2, barHeight, `hsl(${hue}, 70%, 55%)`)
  })
  drawText(ctx, 'Degree', width / 2, height - 10, { align: 'center', color: '#b0b0b0' })
  drawText(ctx, 'Count', 10, height / 2, { align: 'center', color: '#b0b0b0', size: 11 })
  const avgDegree = (graph.nodes.reduce((sum, n) => sum + n.degree, 0) / graph.nodes.length).toFixed(2)
  document.getElementById('degree-stats').innerHTML = `<div class="stat-row"><span class="stat-label">Total Nodes:</span><span class="stat-value">${graph.nodes.length}</span></div><div class="stat-row"><span class="stat-label">Total Links:</span><span class="stat-value">${graph.links.length}</span></div><div class="stat-row"><span class="stat-label">Average Degree:</span><span class="stat-value">${avgDegree}</span></div><div class="stat-row"><span class="stat-label">Max Degree:</span><span class="stat-value">${maxDegree}</span></div>`
}

// 2. Centrality Rankings
function computePageRank(iterations = 20, dampingFactor = 0.85) {
  const n = graph.nodes.length
  const nodeIndex = new Map(graph.nodes.map((node, i) => [node, i]))
  let ranks = new Array(n).fill(1 / n)
  const newRanks = new Array(n).fill(0)
  for (let iter = 0; iter < iterations; iter++) {
    newRanks.fill((1 - dampingFactor) / n)
    graph.links.forEach(link => {
      const sourceIdx = nodeIndex.get(link.source)
      const targetIdx = nodeIndex.get(link.target)
      const outDegree = link.source.outDegree || 1
      newRanks[targetIdx] += dampingFactor * (ranks[sourceIdx] / outDegree)
    })
    ;[ranks, newRanks] = [newRanks, ranks]
  }
  return graph.nodes.map((node, i) => ({ node, rank: ranks[i] })).sort((a, b) => b.rank - a.rank)
}

function drawCentrality() {
  const rankings = computePageRank()
  const top20 = rankings.slice(0, 20)
  const { ctx, width, height } = getCanvasContext('centrality-canvas')
  ctx.fillStyle = '#1a1d2e'
  ctx.fillRect(0, 0, width, height)
  const padding = { top: 20, right: 20, bottom: 20, left: 180 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const maxRank = top20[0].rank
  top20.forEach((item, i) => {
    const y = padding.top + (i / top20.length) * chartHeight
    const barWidth = (item.rank / maxRank) * chartWidth
    const hue = 190 + (i / top20.length) * 100
    drawRect(ctx, padding.left, y, barWidth, chartHeight / top20.length - 2, `hsl(${hue}, 65%, 50%)`)
    const label = item.node.name || item.node.id || 'Unknown'
    const truncated = label.length > 22 ? label.slice(0, 22) + '...' : label
    drawText(ctx, truncated, padding.left - 8, y + (chartHeight / top20.length) / 2, { align: 'right', size: 10, color: '#b0b0b0' })
  })
  document.getElementById('centrality-list').innerHTML = top20.slice(0, 10).map((item, i) => `<div class="ranking-item"><div class="rank">${i + 1}</div><div class="ranking-name">${item.node.name || item.node.id}</div><div class="ranking-score">${item.rank.toFixed(6)}</div></div>`).join('')
}

// 3. Community Detection
function detectCommunities() {
  const communities = new Map()
  let communityId = 0
  graph.nodes.forEach(node => {
    if (!node.family) {
      communities.set(node, communityId++)
    } else {
      const existing = Array.from(communities.entries()).find(([n, _]) => n.family === node.family)
      if (existing) {
        communities.set(node, existing[1])
      } else {
        communities.set(node, communityId++)
      }
    }
  })
  const communityStats = new Map()
  communities.forEach((commId, node) => {
    const stats = communityStats.get(commId) || { id: commId, nodes: [], size: 0 }
    stats.nodes.push(node)
    stats.size++
    communityStats.set(commId, stats)
  })
  return { communities, stats: Array.from(communityStats.values()).sort((a, b) => b.size - a.size) }
}

function drawCommunities() {
  const { stats } = detectCommunities()
  const { ctx, width, height } = getCanvasContext('community-canvas')
  ctx.fillStyle = '#1a1d2e'
  ctx.fillRect(0, 0, width, height)
  const padding = 40
  const radius = Math.min(width, height) / 2 - padding
  let startAngle = 0
  const total = stats.reduce((sum, s) => sum + s.size, 0)
  stats.forEach((community, i) => {
    const sliceAngle = (community.size / total) * 2 * Math.PI
    const endAngle = startAngle + sliceAngle
    const hue = (i / stats.length) * 360
    ctx.fillStyle = `hsl(${hue}, 65%, 55%)`
    ctx.beginPath()
    ctx.moveTo(width / 2, height / 2)
    ctx.arc(width / 2, height / 2, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fill()
    startAngle = endAngle
  })
  document.getElementById('community-info').innerHTML = `<div class="stat-row"><span class="stat-label">Total Communities:</span><span class="stat-value">${stats.length}</span></div><div class="stat-row"><span class="stat-label">Largest Community:</span><span class="stat-value">${stats[0]?.size || 0} nodes</span></div><div class="stat-row"><span class="stat-label">Smallest Community:</span><span class="stat-value">${stats[stats.length - 1]?.size || 0} nodes</span></div>`
}

// 4. Cross-Source Connection Matrix
function computeCrossSourceMatrix() {
  const sources = ['knowledge', 'stacks', 'nlab', 'mathlib', 'conjecture', 'researcher', 'wikipedia']
  const matrix = Array(sources.length).fill(0).map(() => Array(sources.length).fill(0))
  graph.links.forEach(link => {
    const srcType = link.source.source || 'knowledge'
    const tgtType = link.target.source || 'knowledge'
    const srcIdx = sources.indexOf(srcType)
    const tgtIdx = sources.indexOf(tgtType)
    if (srcIdx >= 0 && tgtIdx >= 0) matrix[srcIdx][tgtIdx]++
  })
  return { sources, matrix }
}

function drawCrossSourceMatrix() {
  const { sources, matrix } = computeCrossSourceMatrix()
  const { ctx, width, height } = getCanvasContext('cross-source-canvas')
  ctx.fillStyle = '#1a1d2e'
  ctx.fillRect(0, 0, width, height)
  const padding = 80
  const cellSize = Math.min((width - padding * 2) / sources.length, (height - padding * 2) / sources.length)
  const maxVal = Math.max(...matrix.flat())
  matrix.forEach((row, i) => {
    row.forEach((val, j) => {
      const x = padding + j * cellSize
      const y = padding + i * cellSize
      const intensity = val / maxVal
      const hue = 190 + intensity * 80
      ctx.fillStyle = `hsla(${hue}, 70%, ${30 + intensity * 40}%, ${0.3 + intensity * 0.7})`
      ctx.fillRect(x, y, cellSize - 2, cellSize - 2)
      if (val > 0) drawText(ctx, val.toString(), x + cellSize / 2, y + cellSize / 2, { align: 'center', size: 10, color: intensity > 0.5 ? '#ffffff' : '#b0b0b0' })
    })
  })
  sources.forEach((src, i) => {
    drawText(ctx, src, padding + i * cellSize + cellSize / 2, padding - 10, { align: 'center', size: 10, color: '#4fc3f7' })
    drawText(ctx, src, padding - 10, padding + i * cellSize + cellSize / 2, { align: 'right', size: 10, color: '#4fc3f7' })
  })
  document.getElementById('matrix-legend').innerHTML = `Cross-source connections show how different knowledge sources link together. Darker/brighter cells indicate more connections between sources.`
}

// 5. Family Connectivity Heatmap
function computeFamilyConnectivity() {
  const families = Object.keys(FAMILIES)
  const matrix = Array(families.length).fill(0).map(() => Array(families.length).fill(0))
  graph.links.forEach(link => {
    const srcFamily = link.source.family
    const tgtFamily = link.target.family
    if (srcFamily && tgtFamily) {
      const srcIdx = families.indexOf(srcFamily)
      const tgtIdx = families.indexOf(tgtFamily)
      if (srcIdx >= 0 && tgtIdx >= 0) {
        matrix[srcIdx][tgtIdx]++
        if (srcIdx !== tgtIdx) matrix[tgtIdx][srcIdx]++
      }
    }
  })
  return { families, matrix }
}

function drawFamilyHeatmap() {
  const { families, matrix } = computeFamilyConnectivity()
  const { ctx, width, height } = getCanvasContext('family-canvas')
  ctx.fillStyle = '#1a1d2e'
  ctx.fillRect(0, 0, width, height)
  const padding = 60
  const cellSize = Math.min((width - padding * 2) / families.length, (height - padding * 2) / families.length)
  const maxVal = Math.max(...matrix.flat())
  matrix.forEach((row, i) => {
    row.forEach((val, j) => {
      const x = padding + j * cellSize
      const y = padding + i * cellSize
      const intensity = val / maxVal
      const hue = 280 + intensity * 60
      ctx.fillStyle = `hsla(${hue}, 70%, ${25 + intensity * 45}%, ${0.2 + intensity * 0.8})`
      ctx.fillRect(x, y, cellSize - 1, cellSize - 1)
    })
  })
  families.forEach((family, i) => {
    const label = FAMILIES[family]?.name || family
    const truncated = label.length > 8 ? label.slice(0, 8) + '..' : label
    drawText(ctx, truncated, padding + i * cellSize + cellSize / 2, padding - 8, { align: 'center', size: 9, color: '#ba68c8' })
    drawText(ctx, truncated, padding - 8, padding + i * cellSize + cellSize / 2, { align: 'right', size: 9, color: '#ba68c8' })
  })
  const totalConnections = matrix.reduce((sum, row) => sum + row.reduce((s, v) => s + v, 0), 0) / 2
  document.getElementById('family-info').innerHTML = `<div class="stat-row"><span class="stat-label">Total Families:</span><span class="stat-value">${families.length}</span></div><div class="stat-row"><span class="stat-label">Inter-Family Links:</span><span class="stat-value">${totalConnections}</span></div>`
}

// 6. Isolated Nodes List
function findIsolatedNodes() {
  return graph.nodes.filter(node => {
    const hasLinks = graph.links.some(link => link.source === node || link.target === node)
    return !hasLinks
  })
}

function displayIsolatedNodes() {
  const isolated = findIsolatedNodes()
  if (isolated.length === 0) {
    document.getElementById('isolated-list').innerHTML = `<div class="node-item"><div class="name">No isolated nodes found</div><div class="meta">All nodes are connected to the graph</div></div>`
    return
  }
  document.getElementById('isolated-list').innerHTML = isolated.map(node => `<div class="node-item"><div class="name">${node.name || node.id}</div><div class="meta">${node.family ? `Family: ${FAMILIES[node.family]?.name || node.family}` : 'No family'}${node.source ? ` • Source: ${node.source}` : ''}</div></div>`).join('')
}

// 7. Most Referenced Theorems
function findMostReferenced() {
  const references = new Map()
  graph.links.forEach(link => {
    const target = link.target
    references.set(target, (references.get(target) || 0) + 1)
  })
  return Array.from(references.entries()).map(([node, count]) => ({ node, count })).sort((a, b) => b.count - a.count).slice(0, 20)
}

function drawReferencedTheorems() {
  const topReferenced = findMostReferenced()
  const { ctx, width, height } = getCanvasContext('referenced-canvas')
  ctx.fillStyle = '#1a1d2e'
  ctx.fillRect(0, 0, width, height)
  const padding = { top: 20, right: 20, bottom: 20, left: 160 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const maxCount = topReferenced[0]?.count || 1
  topReferenced.slice(0, 15).forEach((item, i) => {
    const y = padding.top + (i / 15) * chartHeight
    const barWidth = (item.count / maxCount) * chartWidth
    const hue = 160 + (i / 15) * 80
    drawRect(ctx, padding.left, y, barWidth, chartHeight / 15 - 2, `hsl(${hue}, 60%, 50%)`)
    const label = item.node.name || item.node.id || 'Unknown'
    const truncated = label.length > 20 ? label.slice(0, 20) + '...' : label
    drawText(ctx, truncated, padding.left - 8, y + (chartHeight / 15) / 2, { align: 'right', size: 10, color: '#b0b0b0' })
    drawText(ctx, item.count.toString(), padding.left + barWidth + 5, y + (chartHeight / 15) / 2, { align: 'left', size: 10, color: '#4fc3f7' })
  })
  document.getElementById('theorem-list').innerHTML = topReferenced.slice(0, 10).map((item, i) => `<div class="theorem-item"><div class="name">${i + 1}. ${item.node.name || item.node.id}</div><div class="meta">Referenced ${item.count} times${item.node.family ? ` • ${FAMILIES[item.node.family]?.name || item.node.family}` : ''}</div></div>`).join('')
}

// 8. Proof Completeness Gauge
function computeProofCompleteness() {
  let totalTheorems = 0
  let proofsComplete = 0
  let proofsPartial = 0
  let proofsNone = 0
  graph.nodes.forEach(node => {
    if (node.source !== 'conjecture' && node.source !== 'researcher') {
      totalTheorems++
      if (node.proof || node.proofUrl || node.source === 'mathlib') {
        proofsComplete++
      } else if (node.sketch || node.hint) {
        proofsPartial++
      } else {
        proofsNone++
      }
    }
  })
  return { total: totalTheorems, complete: proofsComplete, partial: proofsPartial, none: proofsNone, completeness: totalTheorems > 0 ? (proofsComplete / totalTheorems) * 100 : 0 }
}

function drawProofGauge() {
  const stats = computeProofCompleteness()
  const { ctx, width, height } = getCanvasContext('proof-canvas')
  ctx.fillStyle = '#1a1d2e'
  ctx.fillRect(0, 0, width, height)
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 40
  ctx.strokeStyle = '#333644'
  ctx.lineWidth = 20
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 2.25 * Math.PI)
  ctx.stroke()
  const completenessAngle = 0.75 * Math.PI + (stats.completeness / 100) * 1.5 * Math.PI
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#4fc3f7')
  gradient.addColorStop(1, '#ba68c8')
  ctx.strokeStyle = gradient
  ctx.lineWidth = 20
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, completenessAngle)
  ctx.stroke()
  drawText(ctx, `${stats.completeness.toFixed(1)}%`, centerX, centerY - 10, { align: 'center', size: 36, font: '700 36px system-ui', color: '#4fc3f7' })
  drawText(ctx, 'Complete', centerX, centerY + 20, { align: 'center', size: 14, color: '#b0b0b0' })
  document.getElementById('proof-stats').innerHTML = `<div class="stat-row"><span class="stat-label">Total Theorems:</span><span class="stat-value">${stats.total}</span></div><div class="stat-row"><span class="stat-label">With Complete Proofs:</span><span class="stat-value">${stats.complete}</span></div><div class="stat-row"><span class="stat-label">With Partial Proofs:</span><span class="stat-value">${stats.partial}</span></div><div class="stat-row"><span class="stat-label">Without Proofs:</span><span class="stat-value">${stats.none}</span></div>`
}

// Initialize All Visualizations
function init() {
  console.log('Initializing analytics dashboard...')
  drawDegreeDistribution()
  drawCentrality()
  drawCommunities()
  drawCrossSourceMatrix()
  drawFamilyHeatmap()
  displayIsolatedNodes()
  drawReferencedTheorems()
  drawProofGauge()
  console.log('Dashboard ready!')
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
