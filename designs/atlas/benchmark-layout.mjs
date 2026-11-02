#!/usr/bin/env node
/**
 * Benchmark layout.js vs layout-optimized.js
 * Usage: node designs/atlas/benchmark-layout.mjs [nodeCount]
 */

import { buildAtlas as buildAtlasOriginal } from './layout.js'
import { buildAtlas as buildAtlasOptimized, clearCache } from './layout-optimized.js'
import { getGraph } from '../shared/kb.js'

const nodeCount = parseInt(process.argv[2]) || null

console.log('Building graph...')
const graph = getGraph()

let testGraph = graph
if (nodeCount !== null) {
  // Create subset for testing
  const nodes = graph.nodes.filter(n => !n.cluster && !n.researcher).slice(0, nodeCount)
  const nodeIds = new Set(nodes.map(n => n.id))
  const links = graph.links.filter(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source
    const t = typeof l.target === 'object' ? l.target.id : l.target
    return nodeIds.has(s) && nodeIds.has(t)
  })
  testGraph = {
    nodes: [...nodes, ...graph.nodes.filter(n => n.cluster || n.researcher)],
    links
  }
  console.log(`Testing with ${nodeCount} theorems (${testGraph.nodes.length} total nodes)`)
} else {
  console.log(`Testing with full graph (${graph.nodes.length} nodes)`)
}

const opts = { seed: 20261031 }

// Warm up
console.log('\n=== Warm-up ===')
buildAtlasOriginal(testGraph, opts)
clearCache()

// Benchmark original
console.log('\n=== Original layout.js ===')
const t0 = performance.now()
const atlasOriginal = buildAtlasOriginal(testGraph, opts)
const t1 = performance.now()
const timeOriginal = t1 - t0

console.log(`Time: ${timeOriginal.toFixed(1)}ms`)
console.log(`Stars: ${atlasOriginal.stars.length}`)
console.log(`DSOs: ${atlasOriginal.dsos.length}`)
console.log(`Researchers: ${atlasOriginal.researchers.length}`)
console.log(`Atlas reports: ${atlasOriginal.ms}ms`)

// Benchmark optimized (no cache)
console.log('\n=== Optimized layout-optimized.js (no cache) ===')
clearCache()
const t2 = performance.now()
const atlasOptimized = buildAtlasOptimized(testGraph, opts)
const t3 = performance.now()
const timeOptimized = t3 - t2

console.log(`Time: ${timeOptimized.toFixed(1)}ms`)
console.log(`Stars: ${atlasOptimized.stars.length}`)
console.log(`DSOs: ${atlasOptimized.dsos.length}`)
console.log(`Researchers: ${atlasOptimized.researchers.length}`)
console.log(`Atlas reports: ${atlasOptimized.ms}ms`)
console.log(`Optimizations: ${JSON.stringify(atlasOptimized.optimized)}`)

// Benchmark optimized (with cache)
console.log('\n=== Optimized layout-optimized.js (with cache) ===')
const t4 = performance.now()
const atlasCached = buildAtlasOptimized(testGraph, opts)
const t5 = performance.now()
const timeCached = t5 - t4

console.log(`Time: ${timeCached.toFixed(1)}ms`)
console.log(`Cache hit: ${atlasCached === atlasOptimized}`)

// Summary
console.log('\n=== Performance Summary ===')
console.log(`Original:           ${timeOriginal.toFixed(1)}ms`)
console.log(`Optimized (no cache): ${timeOptimized.toFixed(1)}ms`)
console.log(`Optimized (cached):   ${timeCached.toFixed(1)}ms`)
console.log(`Speedup (no cache): ${(timeOriginal / timeOptimized).toFixed(2)}x`)
console.log(`Speedup (cached):   ${(timeOriginal / timeCached).toFixed(2)}x`)

// Verify results are similar
console.log('\n=== Verification ===')
const star0Orig = atlasOriginal.stars[0]
const star0Opt = atlasOptimized.stars[0]
console.log(`Star 0 position original:  (${star0Orig.x}, ${star0Orig.y})`)
console.log(`Star 0 position optimized: (${star0Opt.x}, ${star0Opt.y})`)
console.log(`Positions match: ${star0Orig.x === star0Opt.x && star0Orig.y === star0Opt.y}`)

clearCache()
