/**
 * designs/ai/viz-recommender.js — AI-Powered Visualization Recommender
 *
 * Analyzes theorem relationships and recommends the best visualization type
 * for exploring specific mathematical concepts. Uses graph analysis algorithms
 * to suggest atlas/map/manuscript/timeline views and automatically highlights
 * important connections.
 */

import { getGraph, FAMILIES, LINK_TYPES, typeColor } from '../shared/kb.js'

/* ═══════════════════════════════════════════════════════════════
 * Visualization Types & Characteristics
 * ═══════════════════════════════════════════════════════════════ */

const VIZ_TYPES = {
  atlas: {
    name: 'Atlas (3D Nebula)',
    bestFor: ['exploration', 'overview', 'clustering', 'spatial'],
    strengths: [
      'Shows global structure and clustering',
      'Visualizes theorem importance through size/position',
      'Natural for browsing and discovery',
      'Beautiful spatial metaphor'
    ],
    weaknesses: [
      'Can be overwhelming for focused analysis',
      'Hard to trace specific paths',
      'Less effective for linear narratives'
    ],
    priority: 0
  },
  map: {
    name: 'Map (2D Graph)',
    bestFor: ['relationships', 'paths', 'dependencies', 'network'],
    strengths: [
      'Clear relationship visualization',
      'Easy to trace theorem connections',
      'Good for dependency analysis',
      'Familiar graph interface'
    ],
    weaknesses: [
      'Can become cluttered with many nodes',
      'Less spatial metaphor than atlas',
      'Harder to show importance hierarchy'
    ],
    priority: 1
  },
  manuscript: {
    name: 'Manuscript (Book)',
    bestFor: ['narrative', 'sequential', 'detailed', 'study'],
    strengths: [
      'Linear narrative structure',
      'Detailed formula presentation',
      'Best for deep study',
      'Natural reading flow'
    ],
    weaknesses: [
      'Loses global structure',
      'Hard to jump between distant concepts',
      'Less interactive exploration'
    ],
    priority: 2
  },
  timeline: {
    name: 'Timeline (Historical)',
    bestFor: ['history', 'chronology', 'development', 'progress'],
    strengths: [
      'Shows historical development',
      'Chronological ordering',
      'Good for understanding evolution',
      'Natural temporal metaphor'
    ],
    weaknesses: [
      'Only works with dated theorems',
      'Loses mathematical relationships',
      'Limited to temporal view'
    ],
    priority: 3
  }
}

/* ═══════════════════════════════════════════════════════════════
 * Graph Analysis Utilities
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Compute degree centrality for each node
 * @param {Object} graph - The knowledge graph
 * @returns {Map} nodeId -> {in: number, out: number, total: number}
 */
function computeDegrees(graph) {
  const degrees = new Map()

  // Initialize
  for (const node of graph.nodes) {
    degrees.set(node.id, { in: 0, out: 0, total: 0 })
  }

  // Count edges
  for (const edge of graph.links) {
    const src = degrees.get(edge.src)
    const tgt = degrees.get(edge.tgt)
    if (src) src.out++
    if (tgt) tgt.in++
  }

  // Compute totals
  for (const [id, deg] of degrees) {
    deg.total = deg.in + deg.out
    degrees.set(id, deg)
  }

  return degrees
}

/**
 * Find k-hop neighborhood of a node
 * @param {Object} graph - The knowledge graph
 * @param {string} nodeId - Starting node ID
 * @param {number} k - Number of hops (default 2)
 * @returns {Set} Set of node IDs in k-hop neighborhood
 */
function kHopNeighborhood(graph, nodeId, k = 2) {
  const visited = new Set([nodeId])
  let frontier = new Set([nodeId])

  for (let i = 0; i < k; i++) {
    const nextFrontier = new Set()

    for (const edge of graph.links) {
      if (frontier.has(edge.src) && !visited.has(edge.tgt)) {
        nextFrontier.add(edge.tgt)
        visited.add(edge.tgt)
      }
      if (frontier.has(edge.tgt) && !visited.has(edge.src)) {
        nextFrontier.add(edge.src)
        visited.add(edge.src)
      }
    }

    frontier = nextFrontier
    if (frontier.size === 0) break
  }

  return visited
}

/**
 * Compute clustering coefficient for graph or node
 * @param {Object} graph - The knowledge graph
 * @param {string} [nodeId] - Optional specific node
 * @returns {number} Clustering coefficient (0-1)
 */
function clusteringCoefficient(graph, nodeId = null) {
  if (nodeId) {
    // Local clustering for specific node
    const neighbors = kHopNeighborhood(graph, nodeId, 1)
    neighbors.delete(nodeId)

    if (neighbors.size < 2) return 0

    let edgeCount = 0
    for (const edge of graph.links) {
      if (neighbors.has(edge.src) && neighbors.has(edge.tgt)) {
        edgeCount++
      }
    }

    const maxEdges = neighbors.size * (neighbors.size - 1)
    return maxEdges > 0 ? (2 * edgeCount) / maxEdges : 0
  } else {
    // Global average clustering
    const coefficients = []
    for (const node of graph.nodes) {
      coefficients.push(clusteringCoefficient(graph, node.id))
    }
    return coefficients.reduce((a, b) => a + b, 0) / coefficients.length
  }
}

/**
 * Check if graph has temporal information
 * @param {Object} graph - The knowledge graph
 * @returns {boolean} True if enough nodes have year/date info
 */
function hasTemporalInfo(graph) {
  let withYears = 0
  for (const node of graph.nodes) {
    if (node.year || node.date || node.detail?.match(/\b\d{4}\b/)) {
      withYears++
    }
  }
  return withYears / graph.nodes.length > 0.3 // At least 30% have dates
}

/**
 * Compute path-related metrics for a node
 * @param {Object} graph - The knowledge graph
 * @param {string} nodeId - Node ID
 * @returns {Object} {avgPathLength: number, reachable: number}
 */
function pathMetrics(graph, nodeId) {
  // BFS to compute shortest paths
  const distances = new Map([[nodeId, 0]])
  const queue = [nodeId]
  let head = 0

  while (head < queue.length) {
    const current = queue[head++]
    const currentDist = distances.get(current)

    for (const edge of graph.links) {
      const neighbor = edge.src === current ? edge.tgt :
                       edge.tgt === current ? edge.src : null

      if (neighbor && !distances.has(neighbor)) {
        distances.set(neighbor, currentDist + 1)
        queue.push(neighbor)
      }
    }
  }

  const dists = Array.from(distances.values()).filter(d => d > 0)
  const avgPathLength = dists.length > 0 ?
    dists.reduce((a, b) => a + b, 0) / dists.length : 0

  return {
    avgPathLength,
    reachable: distances.size - 1 // Exclude the node itself
  }
}

/* ═══════════════════════════════════════════════════════════════
 * Main Recommendation Engine
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Analyze theorem and recommend best visualization
 * @param {string} theoremId - ID of the theorem to analyze
 * @returns {Object} Recommendation with design, config, and reasoning
 */
export function RecommendVisualization(theoremId) {
  const graph = getGraph()
  const node = graph.nodes.find(n => n.id === theoremId)

  if (!node) {
    return {
      error: `Node ${theoremId} not found`,
      fallback: 'atlas'
    }
  }

  // Compute graph metrics
  const degrees = computeDegrees(graph)
  const nodeDegree = degrees.get(theoremId) || { total: 0 }
  const neighborhood = kHopNeighborhood(graph, theoremId, 2)
  const clustering = clusteringCoefficient(graph, theoremId)
  const paths = pathMetrics(graph, theoremId)
  const hasTemporal = hasTemporalInfo(graph)

  // Scoring for each visualization type
  const scores = {
    atlas: 0,
    map: 0,
    manuscript: 0,
    timeline: 0
  }
  const reasons = {
    atlas: [],
    map: [],
    manuscript: [],
    timeline: []
  }

  // High importance → Atlas (spatial metaphor works best)
  if (node.importance > 0.8) {
    scores.atlas += 3
    reasons.atlas.push('High-importance theorem benefits from spatial prominence')
  }

  // High degree → Map (shows many connections clearly)
  if (nodeDegree.total > 10) {
    scores.map += 3
    reasons.map.push(`${nodeDegree.total} connections easier to trace in 2D`)
  } else if (nodeDegree.total > 5) {
    scores.map += 1
  }

  // Low degree but detailed → Manuscript
  if (nodeDegree.total < 5 && node.detail?.length > 200) {
    scores.manuscript += 3
    reasons.manuscript.push('Detailed content with few connections suits narrative format')
  }

  // High clustering → Atlas (shows community structure)
  if (clustering > 0.5) {
    scores.atlas += 2
    reasons.atlas.push('Strong local clustering visible in 3D layout')
  }

  // Large neighborhood → Atlas (overview needed)
  if (neighborhood.size > 20) {
    scores.atlas += 2
    reasons.atlas.push(`Large ${neighborhood.size}-node context benefits from overview`)
  } else if (neighborhood.size > 10) {
    scores.map += 1
  }

  // Path-based analysis → Map
  if (paths.avgPathLength > 2 && paths.reachable > 15) {
    scores.map += 2
    reasons.map.push('Complex path structure benefits from graph layout')
  }

  // Temporal information → Timeline
  if (hasTemporal && node.year) {
    scores.timeline += 3
    reasons.timeline.push('Historical context available')
  }

  // Family-based: some families work better in certain views
  if (node.family === 'modern' || node.family === 'birational') {
    scores.atlas += 1
    reasons.atlas.push('Modern/advanced topics benefit from spatial exploration')
  }

  if (node.family === 'foundation') {
    scores.manuscript += 2
    reasons.manuscript.push('Foundational material suits narrative presentation')
  }

  // Node type considerations
  if (node.latex && node.latex.length > 100) {
    scores.manuscript += 1
    reasons.manuscript.push('Complex formula benefits from detailed view')
  }

  // Find best score
  let best = 'atlas'
  let bestScore = scores.atlas

  for (const [vizType, score] of Object.entries(scores)) {
    if (score > bestScore) {
      best = vizType
      bestScore = score
    }
  }

  // Generate config for the recommended visualization
  const config = generateConfig(best, node, graph, {
    degrees,
    neighborhood,
    clustering,
    paths
  })

  return {
    recommended: best,
    scores,
    reasons,
    config,
    metrics: {
      degree: nodeDegree.total,
      neighborhoodSize: neighborhood.size,
      clustering,
      avgPathLength: paths.avgPathLength,
      importance: node.importance
    }
  }
}

/**
 * Generate specific configuration for recommended visualization
 * @param {string} vizType - Visualization type
 * @param {Object} node - The theorem node
 * @param {Object} graph - The knowledge graph
 * @param {Object} metrics - Computed metrics
 * @returns {Object} Visualization-specific configuration
 */
function generateConfig(vizType, node, graph, metrics) {
  switch (vizType) {
    case 'atlas':
      return {
        initialFocus: node.id,
        zoom: metrics.neighborhood.size > 20 ? 'far' : 'medium',
        highlightNeighborhood: true,
        cameraPosition: OptimizeCameraPosition(graph, node.id),
        showLabels: metrics.neighborhood.size < 30
      }

    case 'map':
      return {
        centerNode: node.id,
        showNeighbors: Math.min(metrics.neighborhood.size, 50),
        layout: metrics.clustering > 0.5 ? 'force-directed' : 'hierarchical',
        edgeLabels: metrics.degrees.get(node.id)?.total < 15
      }

    case 'manuscript':
      return {
        startChapter: node.family || 'foundation',
        focusTheorem: node.id,
        detailLevel: 'high',
        showProofs: true,
        relatedTheorems: Array.from(metrics.neighborhood).slice(0, 10)
      }

    case 'timeline':
      return {
        centerYear: node.year || 1950,
        highlightNode: node.id,
        timeRange: 'century',
        showConnections: true
      }

    default:
      return {}
  }
}

/* ═══════════════════════════════════════════════════════════════
 * Connection Highlighting
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Auto-highlight important connections for a theorem
 * @param {string} theoremId - ID of the theorem
 * @returns {Object} Highlighting configuration with edges and nodes
 */
export function AutoHighlightConnections(theoremId) {
  const graph = getGraph()
  const node = graph.nodes.find(n => n.id === theoremId)

  if (!node) {
    return { error: `Node ${theoremId} not found` }
  }

  // Find all edges connected to this node
  const connectedEdges = graph.links.filter(e =>
    e.src === theoremId || e.tgt === theoremId
  )

  // Score each edge by importance
  const scoredEdges = connectedEdges.map(edge => {
    let score = edge.weight || 0.5

    // Boost score based on link type
    const linkType = edge.type || 'related'
    if (linkType === 'implies' || linkType === 'generalizes') {
      score += 0.3
    } else if (linkType === 'uses' || linkType === 'proves') {
      score += 0.2
    }

    // Boost if connected to important node
    const otherId = edge.src === theoremId ? edge.tgt : edge.src
    const otherNode = graph.nodes.find(n => n.id === otherId)
    if (otherNode && otherNode.importance > 0.8) {
      score += 0.2
    }

    return { edge, score, otherId, otherNode }
  })

  // Sort by score and take top connections
  scoredEdges.sort((a, b) => b.score - a.score)
  const topEdges = scoredEdges.slice(0, 10)

  // Group by connection type
  const highlights = {
    critical: [], // score > 0.8
    important: [], // score 0.5-0.8
    related: [],   // score < 0.5
    nodes: new Set([theoremId])
  }

  for (const { edge, score, otherId } of topEdges) {
    const highlight = {
      src: edge.src,
      tgt: edge.tgt,
      type: edge.type,
      score,
      color: typeColor(edge.type || 'related'),
      width: Math.max(1, score * 5)
    }

    if (score > 0.8) {
      highlights.critical.push(highlight)
    } else if (score > 0.5) {
      highlights.important.push(highlight)
    } else {
      highlights.related.push(highlight)
    }

    highlights.nodes.add(otherId)
  }

  highlights.nodes = Array.from(highlights.nodes)

  return highlights
}

/* ═══════════════════════════════════════════════════════════════
 * Comparison Views
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Generate comparison configuration for two theorems
 * @param {string} theorem1Id - First theorem ID
 * @param {string} theorem2Id - Second theorem ID
 * @returns {Object} Comparison configuration with layout and highlights
 */
export function GenerateComparison(theorem1Id, theorem2Id) {
  const graph = getGraph()
  const node1 = graph.nodes.find(n => n.id === theorem1Id)
  const node2 = graph.nodes.find(n => n.id === theorem2Id)

  if (!node1 || !node2) {
    return {
      error: `One or both nodes not found: ${theorem1Id}, ${theorem2Id}`
    }
  }

  // Find shortest path between theorems
  const path = findShortestPath(graph, theorem1Id, theorem2Id)

  // Find common neighbors
  const neighbors1 = kHopNeighborhood(graph, theorem1Id, 1)
  const neighbors2 = kHopNeighborhood(graph, theorem2Id, 1)
  const commonNeighbors = Array.from(neighbors1).filter(n => neighbors2.has(n))

  // Compare properties
  const comparison = {
    nodes: [node1, node2],
    path: path.found ? path.path : null,
    pathLength: path.found ? path.path.length - 1 : Infinity,
    commonNeighbors,

    properties: {
      importance: {
        [theorem1Id]: node1.importance,
        [theorem2Id]: node2.importance,
        difference: Math.abs(node1.importance - node2.importance)
      },
      family: {
        [theorem1Id]: node1.family,
        [theorem2Id]: node2.family,
        same: node1.family === node2.family
      },
      degree: {
        [theorem1Id]: neighbors1.size - 1,
        [theorem2Id]: neighbors2.size - 1
      }
    },

    // Visualization layout
    layout: path.found && path.path.length <= 5 ? 'path' : 'sideBySide',

    // What to highlight
    highlights: {
      path: path.found ? path.path : [],
      commonNeighbors,
      distinctNeighbors1: Array.from(neighbors1).filter(n => !neighbors2.has(n)).slice(0, 5),
      distinctNeighbors2: Array.from(neighbors2).filter(n => !neighbors1.has(n)).slice(0, 5)
    }
  }

  return comparison
}

/**
 * Find shortest path between two nodes using BFS
 * @param {Object} graph - The knowledge graph
 * @param {string} startId - Start node ID
 * @param {string} endId - End node ID
 * @returns {Object} {found: boolean, path: string[], distance: number}
 */
function findShortestPath(graph, startId, endId) {
  if (startId === endId) {
    return { found: true, path: [startId], distance: 0 }
  }

  const queue = [[startId]]
  const visited = new Set([startId])

  while (queue.length > 0) {
    const path = queue.shift()
    const current = path[path.length - 1]

    // Find neighbors
    for (const edge of graph.links) {
      const neighbor = edge.src === current ? edge.tgt :
                       edge.tgt === current ? edge.src : null

      if (!neighbor || visited.has(neighbor)) continue

      const newPath = [...path, neighbor]

      if (neighbor === endId) {
        return {
          found: true,
          path: newPath,
          distance: newPath.length - 1
        }
      }

      visited.add(neighbor)
      queue.push(newPath)

      // Limit search depth
      if (newPath.length > 6) continue
    }
  }

  return { found: false, path: [], distance: Infinity }
}

/* ═══════════════════════════════════════════════════════════════
 * Camera Optimization
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Optimize camera position for viewing a graph/node
 * @param {Object} graph - The knowledge graph
 * @param {string} [focusNodeId] - Optional node to focus on
 * @returns {Object} {position: [x,y,z], target: [x,y,z], fov: number}
 */
export function OptimizeCameraPosition(graph, focusNodeId = null) {
  if (focusNodeId) {
    const node = graph.nodes.find(n => n.id === focusNodeId)
    if (!node) {
      return null
    }

    // Get neighborhood to determine zoom level
    const neighborhood = kHopNeighborhood(graph, focusNodeId, 2)

    // Compute bounding box of neighborhood
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    let minZ = Infinity, maxZ = -Infinity

    for (const nId of neighborhood) {
      const n = graph.nodes.find(node => node.id === nId)
      if (n && n.position) {
        minX = Math.min(minX, n.position[0])
        maxX = Math.max(maxX, n.position[0])
        minY = Math.min(minY, n.position[1])
        maxY = Math.max(maxY, n.position[1])
        minZ = Math.min(minZ, n.position[2] || 0)
        maxZ = Math.max(maxZ, n.position[2] || 0)
      }
    }

    // Center of neighborhood
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    const centerZ = (minZ + maxZ) / 2

    // Size of neighborhood
    const sizeX = maxX - minX
    const sizeY = maxY - minY
    const sizeZ = maxZ - minZ
    const size = Math.max(sizeX, sizeY, sizeZ)

    // Camera distance based on neighborhood size
    const distance = Math.max(size * 1.5, 10)

    // Position camera at an aesthetic angle
    const angle = Math.PI / 4 // 45 degrees
    const position = [
      centerX + distance * Math.cos(angle),
      centerY + distance * 0.5,
      centerZ + distance * Math.sin(angle)
    ]

    return {
      position,
      target: [centerX, centerY, centerZ],
      fov: neighborhood.size > 50 ? 75 : 60,
      distance
    }
  } else {
    // Global view: find center of all nodes
    let sumX = 0, sumY = 0, sumZ = 0
    let count = 0

    for (const node of graph.nodes) {
      if (node.position) {
        sumX += node.position[0]
        sumY += node.position[1]
        sumZ += node.position[2] || 0
        count++
      }
    }

    if (count === 0) {
      return {
        position: [0, 0, 50],
        target: [0, 0, 0],
        fov: 60
      }
    }

    const centerX = sumX / count
    const centerY = sumY / count
    const centerZ = sumZ / count

    // Find maximum distance from center for zoom
    let maxDist = 0
    for (const node of graph.nodes) {
      if (node.position) {
        const dx = node.position[0] - centerX
        const dy = node.position[1] - centerY
        const dz = (node.position[2] || 0) - centerZ
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
        maxDist = Math.max(maxDist, dist)
      }
    }

    const distance = Math.max(maxDist * 2, 50)

    return {
      position: [centerX, centerY + distance * 0.3, centerZ + distance],
      target: [centerX, centerY, centerZ],
      fov: 70,
      distance
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
 * Batch Analysis
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Analyze multiple theorems and generate recommendations
 * @param {string[]} theoremIds - Array of theorem IDs
 * @returns {Object[]} Array of recommendations
 */
export function BatchRecommend(theoremIds) {
  return theoremIds.map(id => RecommendVisualization(id))
}

/**
 * Get overview statistics for the recommendation system
 * @returns {Object} Statistics about the graph and recommendations
 */
export function GetRecommenderStats() {
  const graph = getGraph()
  const degrees = computeDegrees(graph)

  // Compute global metrics
  const avgDegree = Array.from(degrees.values())
    .reduce((sum, d) => sum + d.total, 0) / degrees.size

  const avgClustering = clusteringCoefficient(graph)
  const hasTemporal = hasTemporalInfo(graph)

  // Count nodes by importance
  const importanceDist = {
    high: 0,    // > 0.8
    medium: 0,  // 0.5-0.8
    low: 0      // < 0.5
  }

  for (const node of graph.nodes) {
    if (node.importance > 0.8) importanceDist.high++
    else if (node.importance > 0.5) importanceDist.medium++
    else importanceDist.low++
  }

  return {
    totalNodes: graph.nodes.length,
    totalEdges: graph.links.length,
    avgDegree,
    avgClustering,
    hasTemporalInfo: hasTemporal,
    importanceDistribution: importanceDist,
    vizTypes: Object.keys(VIZ_TYPES).length
  }
}

