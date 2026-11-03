#!/usr/bin/env node

/**
 * Bundle Analysis Script
 *
 * 分析构建后的 bundle 大小和组成
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const distDir = join(projectRoot, 'dist')

console.log('📦 Analyzing bundle...\n')

if (!existsSync(distDir)) {
  console.error('❌ dist/ directory not found. Run `npm run build` first.')
  process.exit(1)
}

// 分析文件
function analyzeDirectory(dir, results = { files: [], totalSize: 0 }) {
  const items = readdirSync(dir)

  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      analyzeDirectory(fullPath, results)
    } else {
      const relativePath = relative(distDir, fullPath)
      const size = stat.size

      results.files.push({
        path: relativePath,
        size,
        sizeFormatted: formatBytes(size),
      })

      results.totalSize += size
    }
  }

  return results
}

// 格式化字节
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 分析
const analysis = analyzeDirectory(distDir)

// 按大小排序
analysis.files.sort((a, b) => b.size - a.size)

// 按类型分组
const byType = {}

for (const file of analysis.files) {
  const ext = file.path.split('.').pop()
  if (!byType[ext]) {
    byType[ext] = {
      count: 0,
      totalSize: 0,
      files: [],
    }
  }

  byType[ext].count++
  byType[ext].totalSize += file.size
  byType[ext].files.push(file)
}

// 输出结果
console.log('='.repeat(70))
console.log(' Bundle Analysis Report')
console.log('='.repeat(70))
console.log()

console.log(`📊 Total Files: ${analysis.files.length}`)
console.log(`📦 Total Size: ${formatBytes(analysis.totalSize)}`)
console.log()

console.log('─'.repeat(70))
console.log(' By File Type')
console.log('─'.repeat(70))
console.log()

const typeEntries = Object.entries(byType).sort((a, b) => b[1].totalSize - a[1].totalSize)

for (const [type, data] of typeEntries) {
  const percentage = ((data.totalSize / analysis.totalSize) * 100).toFixed(1)
  console.log(`  ${type.toUpperCase().padEnd(10)} ${data.count.toString().padStart(4)} files  ${formatBytes(data.totalSize).padStart(12)}  (${percentage}%)`)
}

console.log()
console.log('─'.repeat(70))
console.log(' Largest Files')
console.log('─'.repeat(70))
console.log()

const topFiles = analysis.files.slice(0, 15)

for (const file of topFiles) {
  const percentage = ((file.size / analysis.totalSize) * 100).toFixed(1)
  console.log(`  ${file.sizeFormatted.padStart(12)}  (${percentage.padStart(5)}%)  ${file.path}`)
}

// 检查是否有超大文件
console.log()
console.log('─'.repeat(70))
console.log(' Size Warnings')
console.log('─'.repeat(70))
console.log()

const warnings = []
const CHUNK_SIZE_LIMIT = 500 * 1024 // 500 KB
const TOTAL_SIZE_LIMIT = 2 * 1024 * 1024 // 2 MB

for (const file of analysis.files) {
  if (file.path.endsWith('.js') && file.size > CHUNK_SIZE_LIMIT) {
    warnings.push(`  ⚠️  Large chunk: ${file.path} (${file.sizeFormatted})`)
  }
}

if (analysis.totalSize > TOTAL_SIZE_LIMIT) {
  warnings.push(`  ⚠️  Total bundle size (${formatBytes(analysis.totalSize)}) exceeds recommended limit (${formatBytes(TOTAL_SIZE_LIMIT)})`)
}

if (warnings.length === 0) {
  console.log('  ✅ No size warnings')
} else {
  warnings.forEach((warning) => console.log(warning))
}

// 优化建议
console.log()
console.log('─'.repeat(70))
console.log(' Optimization Suggestions')
console.log('─'.repeat(70))
console.log()

const suggestions = []

// 检查是否有未分割的大块
const largeJsFiles = analysis.files.filter((f) => f.path.endsWith('.js') && f.size > CHUNK_SIZE_LIMIT)
if (largeJsFiles.length > 0) {
  suggestions.push('  💡 Consider code splitting for large JavaScript chunks')
}

// 检查是否有未压缩的资源
const uncompressedImages = analysis.files.filter((f) =>
  (f.path.endsWith('.png') || f.path.endsWith('.jpg')) && f.size > 100 * 1024
)
if (uncompressedImages.length > 0) {
  suggestions.push('  💡 Optimize images (consider WebP format)')
}

// 检查是否有多个 vendor chunks
const vendorChunks = analysis.files.filter((f) => f.path.includes('vendor') && f.path.endsWith('.js'))
if (vendorChunks.length > 3) {
  suggestions.push('  💡 Too many vendor chunks. Consider adjusting manualChunks configuration')
}

// 检查 CSS
const cssFiles = analysis.files.filter((f) => f.path.endsWith('.css'))
const totalCssSize = cssFiles.reduce((sum, f) => sum + f.size, 0)
if (totalCssSize > 100 * 1024) {
  suggestions.push('  💡 Large CSS bundle. Consider CSS modules or critical CSS extraction')
}

if (suggestions.length === 0) {
  console.log('  ✅ Bundle is well optimized!')
} else {
  suggestions.forEach((suggestion) => console.log(suggestion))
}

console.log()
console.log('='.repeat(70))

// 与优化目标对比
console.log()
console.log('📈 Optimization Progress')
console.log()

const BASELINE = {
  totalSize: 11.76 * 1024 * 1024, // 11.76 MB (baseline)
  jsSize: 11.76 * 1024 * 1024,
  cssSize: 29.5 * 1024,
}

const currentJsSize = analysis.files
  .filter((f) => f.path.endsWith('.js'))
  .reduce((sum, f) => sum + f.size, 0)

const currentCssSize = analysis.files
  .filter((f) => f.path.endsWith('.css'))
  .reduce((sum, f) => sum + f.size, 0)

const jsReduction = ((BASELINE.jsSize - currentJsSize) / BASELINE.jsSize) * 100
const totalReduction = ((BASELINE.totalSize - analysis.totalSize) / BASELINE.totalSize) * 100

console.log(`  Current JS:  ${formatBytes(currentJsSize)}`)
console.log(`  Baseline JS: ${formatBytes(BASELINE.jsSize)}`)
console.log(`  Reduction:   ${jsReduction > 0 ? '✅' : '❌'} ${jsReduction.toFixed(1)}%`)
console.log()
console.log(`  Current CSS:  ${formatBytes(currentCssSize)}`)
console.log(`  Baseline CSS: ${formatBytes(BASELINE.cssSize)}`)
console.log()
console.log(`  Total Reduction: ${totalReduction > 0 ? '✅' : '❌'} ${totalReduction.toFixed(1)}%`)

// 目标检查
console.log()
console.log('🎯 Optimization Goals')
console.log()

const GOALS = [
  { name: 'Bundle < 2 MB', target: 2 * 1024 * 1024, current: analysis.totalSize },
  { name: 'JS chunks < 500 KB', target: 500 * 1024, current: Math.max(...analysis.files.filter(f => f.path.endsWith('.js')).map(f => f.size)) },
  { name: 'Total reduction > 30%', target: 30, current: totalReduction },
]

for (const goal of GOALS) {
  let status
  let message

  if (goal.name.includes('reduction')) {
    status = goal.current >= goal.target ? '✅' : '⏳'
    message = `${goal.current.toFixed(1)}% / ${goal.target}%`
  } else {
    status = goal.current <= goal.target ? '✅' : '⏳'
    message = `${formatBytes(goal.current)} / ${formatBytes(goal.target)}`
  }

  console.log(`  ${status} ${goal.name}: ${message}`)
}

console.log()
console.log('='.repeat(70))
console.log()

// 导出 JSON
const jsonOutput = {
  timestamp: new Date().toISOString(),
  analysis,
  byType,
  baseline: BASELINE,
  comparison: {
    jsReduction,
    totalReduction,
  },
  goals: GOALS,
}

import { writeFileSync } from 'fs'
const outputPath = join(projectRoot, 'bundle-analysis.json')
writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2))
console.log(`📄 Detailed analysis saved to: bundle-analysis.json`)
console.log()
