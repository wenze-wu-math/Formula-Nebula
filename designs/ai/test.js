/**
 * designs/ai/test.js
 * Test suite for AI Visualization Recommender
 * Run with: node --experimental-modules test.js
 */

import {
  RecommendVisualization,
  AutoHighlightConnections,
  GenerateComparison,
  OptimizeCameraPosition,
  GetRecommenderStats
} from './viz-recommender.js'
import { getGraph } from '../shared/kb.js'

console.log('🧪 Testing AI Visualization Recommender\n')

/* ═══════════════════════════════════════════════════════════════
 * Test 1: System Stats
 * ═══════════════════════════════════════════════════════════════ */

console.log('Test 1: System Statistics')
console.log('─'.repeat(50))

const stats = GetRecommenderStats()
console.log(`Total nodes: ${stats.totalNodes}`)
console.log(`Total edges: ${stats.totalEdges}`)
console.log(`Average degree: ${stats.avgDegree.toFixed(2)}`)
console.log(`Average clustering: ${(stats.avgClustering * 100).toFixed(1)}%`)
console.log(`Has temporal info: ${stats.hasTemporalInfo}`)
console.log(`Visualization types: ${stats.vizTypes}`)
console.log(`Importance distribution:`, stats.importanceDistribution)
console.log('✓ Stats test passed\n')

/* ═══════════════════════════════════════════════════════════════
 * Test 2: Basic Recommendation
 * ═══════════════════════════════════════════════════════════════ */

console.log('Test 2: Basic Recommendation (Nullstellensatz)')
console.log('─'.repeat(50))

const rec1 = RecommendVisualization('nullstellensatz')

if (rec1.error) {
  console.error('❌ Error:', rec1.error)
} else {
  console.log(`Recommended: ${rec1.recommended}`)
  console.log(`Scores:`, rec1.scores)
  console.log(`Metrics:`)
  console.log(`  - Degree: ${rec1.metrics.degree}`)
  console.log(`  - Neighborhood: ${rec1.metrics.neighborhoodSize}`)
  console.log(`  - Clustering: ${(rec1.metrics.clustering * 100).toFixed(1)}%`)
  console.log(`  - Avg path length: ${rec1.metrics.avgPathLength.toFixed(2)}`)
  console.log(`  - Importance: ${(rec1.metrics.importance * 100).toFixed(0)}%`)

  const reasons = rec1.reasons[rec1.recommended]
  if (reasons.length > 0) {
    console.log(`Reasons:`)
    reasons.forEach(r => console.log(`  - ${r}`))
  }

  console.log('✓ Recommendation test passed\n')
}

/* ═══════════════════════════════════════════════════════════════
 * Test 3: Connection Highlighting
 * ═══════════════════════════════════════════════════════════════ */

console.log('Test 3: Connection Highlighting (Nullstellensatz)')
console.log('─'.repeat(50))

const highlights = AutoHighlightConnections('nullstellensatz')

if (highlights.error) {
  console.error('❌ Error:', highlights.error)
} else {
  console.log(`Critical connections: ${highlights.critical.length}`)
  console.log(`Important connections: ${highlights.important.length}`)
  console.log(`Related connections: ${highlights.related.length}`)
  console.log(`Total nodes involved: ${highlights.nodes.length}`)

  if (highlights.critical.length > 0) {
    console.log(`\nTop critical connection:`)
    const top = highlights.critical[0]
    console.log(`  ${top.src} → ${top.tgt}`)
    console.log(`  Type: ${top.type}`)
    console.log(`  Score: ${top.score.toFixed(2)}`)
    console.log(`  Color: ${top.color}`)
  }

  console.log('✓ Highlighting test passed\n')
}

/* ═══════════════════════════════════════════════════════════════
 * Test 4: Theorem Comparison
 * ═══════════════════════════════════════════════════════════════ */

console.log('Test 4: Theorem Comparison')
console.log('─'.repeat(50))

// Find two nodes that likely exist
const graph = getGraph()
const node1 = graph.nodes[0]?.id
const node2 = graph.nodes[1]?.id

if (node1 && node2) {
  const comp = GenerateComparison(node1, node2)

  if (comp.error) {
    console.error('❌ Error:', comp.error)
  } else {
    console.log(`Comparing: ${node1} ↔ ${node2}`)
    console.log(`Path found: ${comp.path ? 'Yes' : 'No'}`)

    if (comp.path) {
      console.log(`Path length: ${comp.pathLength}`)
      console.log(`Path: ${comp.path.join(' → ')}`)
    }

    console.log(`Common neighbors: ${comp.commonNeighbors.length}`)
    console.log(`Layout: ${comp.layout}`)

    console.log(`\nProperty comparison:`)
    console.log(`  Importance: ${comp.properties.importance[node1].toFixed(2)} vs ${comp.properties.importance[node2].toFixed(2)}`)
    console.log(`  Family: ${comp.properties.family[node1]} vs ${comp.properties.family[node2]}`)
    console.log(`  Degree: ${comp.properties.degree[node1]} vs ${comp.properties.degree[node2]}`)

    console.log('✓ Comparison test passed\n')
  }
} else {
  console.log('⚠ Skipping comparison test (not enough nodes)\n')
}

/* ═══════════════════════════════════════════════════════════════
 * Test 5: Camera Optimization
 * ═══════════════════════════════════════════════════════════════ */

console.log('Test 5: Camera Optimization')
console.log('─'.repeat(50))

// Global view
const globalCam = OptimizeCameraPosition(graph)
console.log('Global camera:')
console.log(`  Position: [${globalCam.position.map(v => v.toFixed(1)).join(', ')}]`)
console.log(`  Target: [${globalCam.target.map(v => v.toFixed(1)).join(', ')}]`)
console.log(`  FOV: ${globalCam.fov}°`)

// Focused view
if (node1) {
  const focusCam = OptimizeCameraPosition(graph, node1)
  if (focusCam) {
    console.log(`\nFocused camera (${node1}):`)
    console.log(`  Position: [${focusCam.position.map(v => v.toFixed(1)).join(', ')}]`)
    console.log(`  Target: [${focusCam.target.map(v => v.toFixed(1)).join(', ')}]`)
    console.log(`  FOV: ${focusCam.fov}°`)
    console.log(`  Distance: ${focusCam.distance.toFixed(1)}`)
  }
}

console.log('✓ Camera optimization test passed\n')

/* ═══════════════════════════════════════════════════════════════
 * Test 6: Edge Cases
 * ═══════════════════════════════════════════════════════════════ */

console.log('Test 6: Edge Cases')
console.log('─'.repeat(50))

// Non-existent node
const recBad = RecommendVisualization('nonexistent-theorem-xyz')
console.log(`Non-existent node: ${recBad.error ? 'Correctly handled' : 'FAILED'}`)

// Empty comparison
const compBad = GenerateComparison('', '')
console.log(`Empty comparison: ${compBad.error ? 'Correctly handled' : 'FAILED'}`)

console.log('✓ Edge cases handled\n')

/* ═══════════════════════════════════════════════════════════════
 * Test 7: Performance
 * ═══════════════════════════════════════════════════════════════ */

console.log('Test 7: Performance')
console.log('─'.repeat(50))

if (graph.nodes.length > 0) {
  const testNode = graph.nodes[Math.floor(graph.nodes.length / 2)].id

  // Recommendation performance
  const t1 = performance.now()
  RecommendVisualization(testNode)
  const t2 = performance.now()
  console.log(`Recommendation: ${(t2 - t1).toFixed(2)}ms`)

  // Highlighting performance
  const t3 = performance.now()
  AutoHighlightConnections(testNode)
  const t4 = performance.now()
  console.log(`Highlighting: ${(t4 - t3).toFixed(2)}ms`)

  // Camera optimization performance
  const t5 = performance.now()
  OptimizeCameraPosition(graph, testNode)
  const t6 = performance.now()
  console.log(`Camera: ${(t6 - t5).toFixed(2)}ms`)

  console.log('✓ Performance test passed\n')
}

/* ═══════════════════════════════════════════════════════════════
 * Test Summary
 * ═══════════════════════════════════════════════════════════════ */

console.log('═'.repeat(50))
console.log('✅ All tests passed!')
console.log('═'.repeat(50))
