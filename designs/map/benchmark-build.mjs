#!/usr/bin/env node
/**
 * Benchmark script for world building pipeline optimization
 */
import { getGraph } from '../shared/kb.js'
import { buildWorld } from './src/world/index.js'

const RUNS = 3

async function benchmark() {
  console.log('Loading knowledge graph...')
  const graph = getGraph()
  console.log(`Graph: ${graph.nodes.length} nodes, ${graph.links.length} links\n`)

  const times = []
  const details = []

  for (let i = 0; i < RUNS; i++) {
    console.log(`Run ${i + 1}/${RUNS}...`)
    const t0 = performance.now()
    const world = await buildWorld(graph, { raster: true })
    const elapsed = performance.now() - t0

    times.push(elapsed)
    details.push(world.meta.ms)

    console.log(`  Total: ${elapsed.toFixed(1)}ms`)
    console.log(`  Breakdown: layout=${world.meta.ms.layout}ms, fields=${world.meta.ms.fields}ms, contours=${world.meta.ms.contours}ms`)
    console.log(`  Islands: ${world.meta.ms.islands}ms, rasters=${world.meta.ms.rasters}ms`)
    if (world.meta.ms.parallel) console.log(`  Parallel section: ${world.meta.ms.parallel}ms`)
    console.log(`  Rounds: ${world.meta.ms.rounds}, bad cities: ${world.meta.ms.badCities}, fixed: ${world.meta.ms.marginFixed}`)
    console.log()
  }

  console.log('═══ Summary ═══')
  const avg = times.reduce((a, b) => a + b, 0) / times.length
  const min = Math.min(...times)
  const max = Math.max(...times)
  console.log(`Average: ${avg.toFixed(1)}ms`)
  console.log(`Min: ${min.toFixed(1)}ms`)
  console.log(`Max: ${max.toFixed(1)}ms`)
  console.log()

  // Average breakdown
  const avgDetails = {}
  for (const key of Object.keys(details[0])) {
    avgDetails[key] = details.reduce((sum, d) => sum + d[key], 0) / details.length
  }
  console.log('Average breakdown:')
  for (const [key, val] of Object.entries(avgDetails)) {
    console.log(`  ${key}: ${val.toFixed(1)}ms`)
  }
}

benchmark().catch(console.error)
