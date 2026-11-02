#!/usr/bin/env node
/**
 * Benchmark novel graph layout algorithms on Formula Nebula
 * Usage: node designs/atlas/research/benchmark-novel.mjs [nodeCount]
 */

import { getGraph } from '../../shared/kb.js'
import {
  hyperbolicLayout,
  forceAtlas2Layout,
  spectralLayout,
  communityAwareLayout,
  benchmarkLayouts
} from './novel-layout.js'

const nodeCount = parseInt(process.argv[2]) || null

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  Novel Graph Layout Algorithms Benchmark')
console.log('  Formula Nebula Knowledge Graph')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('Building graph...')
const graph = getGraph()

let testGraph = graph
if (nodeCount !== null) {
  // Create subset for testing
  const theorems = graph.nodes.filter(n => !n.cluster && !n.researcher).slice(0, nodeCount)
  const conjectures = graph.nodes.filter(n => n.cluster)
  const researchers = graph.nodes.filter(n => n.researcher)

  const nodeIds = new Set([...theorems, ...conjectures, ...researchers].map(n => n.id))
  const links = graph.links.filter(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source
    const t = typeof l.target === 'object' ? l.target.id : l.target
    return nodeIds.has(s) && nodeIds.has(t)
  })

  testGraph = {
    nodes: [...theorems, ...conjectures, ...researchers],
    links
  }
  console.log(`Testing with ${theorems.length} theorems, ${conjectures.length} conjectures, ${researchers.length} researchers`)
  console.log(`Total: ${testGraph.nodes.length} nodes, ${testGraph.links.length} edges\n`)
} else {
  const theorems = graph.nodes.filter(n => !n.cluster && !n.researcher).length
  const conjectures = graph.nodes.filter(n => n.cluster).length
  const researchers = graph.nodes.filter(n => n.researcher).length
  console.log(`Testing with full graph:`)
  console.log(`  Theorems: ${theorems}`)
  console.log(`  Conjectures: ${conjectures}`)
  console.log(`  Researchers: ${researchers}`)
  console.log(`  Total: ${graph.nodes.length} nodes, ${graph.links.length} edges\n`)
}

// Run comprehensive benchmark
console.log('Running benchmark suite...\n')
const results = benchmarkLayouts(testGraph, { seed: 42 })

// Print detailed results
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  DETAILED RESULTS')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

for (const result of results) {
  if (result.error) {
    console.log(`❌ ${result.name}: FAILED`)
    console.log(`   Error: ${result.error}\n`)
    continue
  }

  console.log(`✓ ${result.name}`)
  console.log(`  Time: ${result.time.toFixed(1)}ms`)
  console.log(`  Metrics:`)
  console.log(`    Edge length mean:     ${result.metrics.edgeLengthMean.toFixed(2)}`)
  console.log(`    Edge length variance: ${result.metrics.edgeLengthVariance.toFixed(2)}`)
  console.log(`    Node spread (area):   ${result.metrics.nodeSpread.toFixed(0)}`)
  console.log(`    Edge crossings (sample): ${result.metrics.crossingsSample}`)
  console.log('')
}

// Comparison summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  COMPARATIVE ANALYSIS')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const successful = results.filter(r => !r.error)

if (successful.length > 0) {
  const fastest = successful.reduce((min, r) => r.time < min.time ? r : min)
  const lowestVariance = successful.reduce((min, r) =>
    r.metrics.edgeLengthVariance < min.metrics.edgeLengthVariance ? r : min
  )
  const leastCrossings = successful.reduce((min, r) =>
    r.metrics.crossingsSample < min.metrics.crossingsSample ? r : min
  )

  console.log(`⚡ Fastest Algorithm: ${fastest.name} (${fastest.time.toFixed(1)}ms)`)
  console.log(`📊 Most Uniform Edge Lengths: ${lowestVariance.name} (variance: ${lowestVariance.metrics.edgeLengthVariance.toFixed(2)})`)
  console.log(`🎯 Fewest Edge Crossings: ${leastCrossings.name} (${leastCrossings.metrics.crossingsSample} in sample)`)

  console.log('\n┌─────────────────────┬──────────────┬──────────────┬──────────────┐')
  console.log('│ Algorithm           │ Time (ms)    │ Variance     │ Crossings    │')
  console.log('├─────────────────────┼──────────────┼──────────────┼──────────────┤')

  for (const r of successful) {
    const name = r.name.padEnd(19)
    const time = r.time.toFixed(1).padStart(10)
    const variance = r.metrics.edgeLengthVariance.toFixed(0).padStart(10)
    const crossings = String(r.metrics.crossingsSample).padStart(10)
    console.log(`│ ${name} │ ${time}   │ ${variance}   │ ${crossings}   │`)
  }
  console.log('└─────────────────────┴──────────────┴──────────────┴──────────────┘')
}

// Quality ranking
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  QUALITY RANKING')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

if (successful.length > 0) {
  // Normalize and score (lower is better for variance and crossings)
  const scores = successful.map(r => {
    const timeScore = r.time
    const varianceScore = r.metrics.edgeLengthVariance
    const crossingScore = r.metrics.crossingsSample

    // Weighted composite score (adjust weights as needed)
    const composite = (timeScore * 0.3) + (varianceScore * 0.4) + (crossingScore * 0.3)

    return { ...r, composite }
  }).sort((a, b) => a.composite - b.composite)

  console.log('Ranking by composite score (30% time, 40% variance, 30% crossings):\n')
  scores.forEach((s, i) => {
    console.log(`${i + 1}. ${s.name}`)
    console.log(`   Composite Score: ${s.composite.toFixed(2)}`)
    console.log(`   Time: ${s.time.toFixed(1)}ms | Variance: ${s.metrics.edgeLengthVariance.toFixed(0)} | Crossings: ${s.metrics.crossingsSample}`)
    console.log('')
  })
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Benchmark complete!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
