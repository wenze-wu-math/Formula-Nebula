#!/usr/bin/env node
/**
 * Startup profiling tool for nebula-plus
 *
 * Diagnoses the 82.8s startup time (50s baking + 17s layout)
 * by collecting detailed Chrome DevTools profiles and analyzing the breakdown.
 */

import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'
import { join } from 'path'

const URL = 'http://localhost:5190'
const PROFILE_DIR = 'tools/profiles'

async function main() {
  console.log('🔍 Profiling nebula-plus startup...\n')

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  // Enable CDP profiler
  const client = await page.target().createCDPSession()
  await client.send('Profiler.enable')
  await client.send('Profiler.setSamplingInterval', { interval: 100 })

  console.log('⏱️  Starting CPU profiler...')
  await client.send('Profiler.start')

  const startTime = Date.now()

  // Navigate and wait for completion
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 })

  console.log('⏳ Waiting for scene to be ready...')

  // Wait for __design.ready flag
  await page.waitForFunction(
    () => window.__design?.ready === true,
    { timeout: 120000 }
  )

  const totalTime = Date.now() - startTime

  console.log('✅ Scene ready! Stopping profiler...\n')

  // Stop profiler and get results
  const { profile } = await client.send('Profiler.stop')

  // Get diagnostic info from page
  const diag = await page.evaluate(() => {
    const diagEl = document.getElementById('diag')
    return diagEl ? JSON.parse(diagEl.textContent) : {}
  })

  // Save raw profile
  const profilePath = join(PROFILE_DIR, `startup-${Date.now()}.cpuprofile`)
  writeFileSync(profilePath, JSON.stringify(profile, null, 2))
  console.log(`📊 CPU profile saved: ${profilePath}`)

  // Analyze the profile
  const analysis = analyzeProfile(profile, diag, totalTime)

  // Print report
  printReport(analysis, diag)

  // Save analysis
  const analysisPath = join(PROFILE_DIR, `analysis-${Date.now()}.json`)
  writeFileSync(analysisPath, JSON.stringify(analysis, null, 2))
  console.log(`📄 Analysis saved: ${analysisPath}\n`)

  await browser.close()
}

function analyzeProfile(profile, diag, totalTime) {
  const { nodes, samples } = profile

  // Build function name lookup
  const funcNames = new Map()
  for (const node of nodes) {
    funcNames.set(node.id, node.callFrame.functionName || '(anonymous)')
  }

  // Aggregate time by function
  const timings = new Map()
  const sampleInterval = 0.1 // 100μs

  for (const nodeId of samples) {
    const name = funcNames.get(nodeId)
    if (!name) continue
    timings.set(name, (timings.get(name) || 0) + sampleInterval)
  }

  // Sort by time spent
  const sorted = Array.from(timings.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)

  // Categorize hot functions
  const categories = {
    baking: ['latexToSvg', 'svgToImage', 'bakeFormulaTexture', 'bakeAll', 'MathJax'],
    layout: ['layoutGraph', 'relaxForces', 'computeRadii'],
    buildNodes: ['buildNodes', 'createMesh', 'Mesh', 'PlaneGeometry'],
    webgl: ['WebGL', 'compileShader', 'createTexture', 'bindBuffer'],
    other: []
  }

  const breakdown = {
    baking: 0,
    layout: 0,
    buildNodes: 0,
    webgl: 0,
    other: 0
  }

  for (const [func, time] of timings) {
    let matched = false
    for (const [cat, patterns] of Object.entries(categories)) {
      if (cat === 'other') continue
      if (patterns.some(p => func.includes(p))) {
        breakdown[cat] += time
        matched = true
        break
      }
    }
    if (!matched) breakdown.other += time
  }

  return {
    totalTime,
    diag,
    breakdown,
    hotFunctions: sorted,
    recommendations: generateRecommendations(breakdown, diag)
  }
}

function generateRecommendations(breakdown, diag) {
  const recommendations = []

  const { baking, layout, buildNodes } = breakdown
  const bakeMs = diag.ms?.bake || 0
  const layoutMs = diag.ms?.layout || 0

  // Baking analysis
  if (bakeMs > 30000) {
    recommendations.push({
      priority: 'HIGH',
      issue: `Baking takes ${(bakeMs/1000).toFixed(1)}s (target: <20s)`,
      causes: [
        'Serial MathJax processing of 464+ formulas',
        'Image decode waiting in main thread',
        'No Web Worker parallelization'
      ],
      fixes: [
        '✅ Move MathJax to Web Worker (already supported)',
        '✅ Increase lookahead depth (?lookahead=16)',
        '⚠️  Consider caching pre-baked textures'
      ]
    })
  }

  // Layout analysis
  if (layoutMs > 10000) {
    recommendations.push({
      priority: 'HIGH',
      issue: `Layout takes ${(layoutMs/1000).toFixed(1)}s (4.5× slower than steady-state)`,
      causes: [
        'Cold JIT: first-run JS is not yet optimized',
        'Possible sync file reads or blocking operations',
        'Force relaxation may be doing unnecessary work'
      ],
      fixes: [
        '🔍 Profile with Chrome DevTools (this run)',
        '⚡ Move layout to Web Worker',
        '🎯 Pre-warm JIT with small warmup batch',
        '📊 Check if initial layout uses different code path'
      ]
    })
  }

  // Asset loading
  if (breakdown.webgl > 2000) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'WebGL initialization takes significant time',
      causes: [
        'Shader compilation',
        'Texture upload to GPU',
        'Sequential asset loading'
      ],
      fixes: [
        '⚡ Compile shaders during baking phase',
        '📦 Batch texture uploads',
        '🔄 Parallelize asset loading'
      ]
    })
  }

  return recommendations
}

function printReport(analysis, diag) {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('📊 NEBULA-PLUS STARTUP PERFORMANCE REPORT')
  console.log('═══════════════════════════════════════════════════════════\n')

  console.log(`⏱️  Total startup time: ${(analysis.totalTime/1000).toFixed(1)}s\n`)

  console.log('🔥 Time breakdown by phase:')
  console.log(`   Baking:     ${(diag.ms?.bake/1000 || 0).toFixed(1)}s`)
  console.log(`   Layout:     ${(diag.ms?.layout/1000 || 0).toFixed(1)}s`)
  console.log(`   BuildNodes: ${(diag.ms?.buildNodes || 0).toFixed(0)}ms\n`)

  console.log('📈 CPU time by category:')
  for (const [cat, time] of Object.entries(analysis.breakdown)) {
    const pct = (time / (analysis.totalTime/1000) * 100).toFixed(1)
    console.log(`   ${cat.padEnd(12)} ${(time/1000).toFixed(1)}s (${pct}%)`)
  }
  console.log()

  console.log('🔥 Top 10 hot functions:')
  for (let i = 0; i < Math.min(10, analysis.hotFunctions.length); i++) {
    const [func, time] = analysis.hotFunctions[i]
    const pct = (time / (analysis.totalTime/1000) * 100).toFixed(1)
    const truncFunc = func.length > 40 ? func.slice(0, 37) + '...' : func
    console.log(`   ${(i+1).toString().padStart(2)}. ${truncFunc.padEnd(40)} ${(time/1000).toFixed(2)}s (${pct}%)`)
  }
  console.log()

  if (analysis.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:\n')
    for (const rec of analysis.recommendations) {
      console.log(`[${rec.priority}] ${rec.issue}`)
      console.log('   Possible causes:')
      rec.causes.forEach(c => console.log(`     • ${c}`))
      console.log('   Suggested fixes:')
      rec.fixes.forEach(f => console.log(`     ${f}`))
      console.log()
    }
  }

  console.log('═══════════════════════════════════════════════════════════')
}

main().catch(err => {
  console.error('❌ Profile failed:', err.message)
  process.exit(1)
})
