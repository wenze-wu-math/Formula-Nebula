#!/usr/bin/env node
/**
 * designs/atlas/check-conjecture-distribution.mjs
 *
 * Diagnostic script to verify the atlas conjecture distribution fix.
 *
 * Measures:
 * 1. Angular distribution in 12 sectors (0-30°, 30-60°, ..., 330-360°)
 * 2. Count of isolated conjectures (no neighbors within threshold)
 * 3. Median nearest-neighbor distance
 * 4. Distribution uniformity (variance < threshold indicates uniform distribution)
 *
 * Usage: node designs/atlas/check-conjecture-distribution.mjs
 */

import { openPage } from '../cdp.mjs'

const TAU = Math.PI * 2
const _DEG = Math.PI / 180

/**
 * Compute angular sector (0-11) for a given angle in radians.
 */
function getSector(angle) {
  const normalized = ((angle % TAU) + TAU) % TAU
  return Math.floor(normalized / (TAU / 12))
}

/**
 * Compute distance between two points.
 */
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

/**
 * Compute median of an array.
 */
function median(arr) {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

/**
 * Compute variance of an array.
 */
function variance(arr) {
  if (arr.length === 0) return 0
  const mean = arr.reduce((sum, v) => sum + v, 0) / arr.length
  return arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length
}

async function main() {
  console.log('Starting conjecture distribution diagnostic...\n')

  const page = await openPage({
    url: 'http://localhost:5190/designs/atlas/',
    wait: 'window.__design && window.__design.ready',
    waitMs: 60000,
  })

  if (!page.ready) {
    console.error('ERROR: Page failed to load within timeout')
    await page.close()
    process.exit(1)
  }

  console.log('Page loaded, extracting conjecture positions...\n')

  // Extract DSO (conjecture) positions from the atlas
  const dsos = await page.eval(`
    const atlas = window.__design?.atlas
    if (!atlas || !atlas.dsos) throw new Error('Atlas not available')

    return atlas.dsos.map(d => ({
      id: d.id,
      x: d.x,
      y: d.y,
      r: Math.sqrt(d.x ** 2 + d.y ** 2),
      angle: Math.atan2(d.y, d.x),
    }))
  `)

  console.log(`Found ${dsos.length} conjectures\n`)

  if (dsos.length === 0) {
    console.log('No conjectures found, exiting.')
    await page.close()
    return
  }

  // 1. Angular distribution in 12 sectors
  const sectorCounts = new Array(12).fill(0)
  for (const dso of dsos) {
    const sector = getSector(dso.angle)
    sectorCounts[sector]++
  }

  console.log('Angular distribution (12 sectors of 30°):')
  for (let i = 0; i < 12; i++) {
    const start = i * 30
    const end = (i + 1) * 30
    const count = sectorCounts[i]
    const percentage = ((count / dsos.length) * 100).toFixed(1)
    const bar = '█'.repeat(Math.round(count / 2))
    console.log(`  ${start}°-${end}°: ${count.toString().padStart(3)} (${percentage.padStart(5)}%) ${bar}`)
  }

  // 2. Compute nearest-neighbor distances
  const nearestDistances = []
  for (let i = 0; i < dsos.length; i++) {
    let minDist = Infinity
    for (let j = 0; j < dsos.length; j++) {
      if (i === j) continue
      const dist = distance(dsos[i].x, dsos[i].y, dsos[j].x, dsos[j].y)
      if (dist < minDist) minDist = dist
    }
    nearestDistances.push(minDist)
  }

  const medianNearestDist = median(nearestDistances)
  console.log(`\nNearest-neighbor distance:`)
  console.log(`  Median: ${medianNearestDist.toFixed(2)}`)
  console.log(`  Min: ${Math.min(...nearestDistances).toFixed(2)}`)
  console.log(`  Max: ${Math.max(...nearestDistances).toFixed(2)}`)

  // 3. Count isolated conjectures (no neighbors within 2x median distance)
  const isolationThreshold = medianNearestDist * 2
  const isolated = nearestDistances.filter(d => d > isolationThreshold).length
  console.log(`\nIsolated conjectures (distance > ${isolationThreshold.toFixed(2)}):`)
  console.log(`  Count: ${isolated} (${((isolated / dsos.length) * 100).toFixed(1)}%)`)

  // 4. Distribution uniformity analysis
  const expectedPerSector = dsos.length / 12
  const sectorVariance = variance(sectorCounts)
  const normalizedVariance = sectorVariance / expectedPerSector

  console.log(`\nDistribution uniformity:`)
  console.log(`  Expected per sector: ${expectedPerSector.toFixed(2)}`)
  console.log(`  Sector variance: ${sectorVariance.toFixed(2)}`)
  console.log(`  Normalized variance: ${normalizedVariance.toFixed(2)}`)

  // Threshold: normalized variance < 0.3 indicates reasonable uniformity
  const uniformityThreshold = 0.3
  const isUniform = normalizedVariance < uniformityThreshold
  console.log(`  Status: ${isUniform ? '✓ UNIFORM' : '✗ NON-UNIFORM'} (threshold: ${uniformityThreshold})`)

  // 5. Radial distribution
  const radii = dsos.map(d => d.r)
  const medianRadius = median(radii)
  console.log(`\nRadial distribution:`)
  console.log(`  Median radius: ${medianRadius.toFixed(2)}`)
  console.log(`  Min radius: ${Math.min(...radii).toFixed(2)}`)
  console.log(`  Max radius: ${Math.max(...radii).toFixed(2)}`)

  // Summary verdict
  console.log('\n' + '='.repeat(60))
  console.log('VERDICT:')
  if (isUniform && isolated <= dsos.length * 0.1) {
    console.log('  ✓ Distribution is GOOD')
    console.log('    - Angular distribution is uniform')
    console.log('    - Few isolated conjectures')
  } else {
    console.log('  ✗ Distribution needs improvement')
    if (!isUniform) console.log('    - Angular distribution is non-uniform')
    if (isolated > dsos.length * 0.1) console.log('    - Too many isolated conjectures')
  }
  console.log('='.repeat(60))

  if (page.errors.length > 0) {
    console.log('\nPage errors detected:')
    for (const err of page.errors) {
      console.log(`  [${err.type}] ${err.text}`)
    }
  }

  await page.close()
}

main().catch((err) => {
  console.error('ERROR:', err)
  process.exit(1)
})
