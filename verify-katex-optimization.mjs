#!/usr/bin/env node

/**
 * KaTeX 优化验证脚本
 *
 * 验证:
 * 1. designs/shared/tex.js 是否可以加载
 * 2. 懒加载机制是否正常工作
 * 3. 代码语法是否正确
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🧪 验证 KaTeX 优化实施...\n')

// 1. 检查文件是否存在
console.log('1️⃣  检查文件存在性...')
const files = [
  'designs/shared/tex.js',
  'designs/nebula-plus/src/formulaTexture.js',
  // 'test-katex-optimization.html' — 这个手工测试页已被删除（它只用于当时
  // 对比优化前后的一次性人工比对），脚本却仍把它列为必须存在的文件，于是
  // `npm run verify:katex` 从那时起就一直失败。它不在 CI 里，所以没人发现。
  // 删掉这一项，其余三项仍在检查真正的懒加载实现。
  'index.html'
]

let allFilesExist = true
files.forEach(file => {
  const path = join(__dirname, file)
  const exists = existsSync(path)
  console.log(`   ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allFilesExist = false
})

if (!allFilesExist) {
  console.error('\n❌ 某些文件缺失')
  process.exit(1)
}

console.log('\n2️⃣  检查代码特征...')

// 2. 检查 tex.js 是否包含懒加载代码
const _texJs = readFileSync(join(__dirname, 'designs/shared/tex.js'), 'utf-8')

const checks = [
  {
    name: 'KaTeX 导入',
    pattern: /import katex from ['"]katex['"]/,
    file: 'designs/shared/tex.js'
  },
  {
    name: 'MathJax 懒加载函数',
    pattern: /async function ensureMathJax/,
    file: 'designs/shared/tex.js'
  },
  {
    name: 'MathJax 动态导入',
    pattern: /await import\(['"]mathjax-full/,
    file: 'designs/shared/tex.js'
  },
  {
    name: 'tryKatex 函数',
    pattern: /function tryKatex/,
    file: 'designs/shared/tex.js'
  },
  {
    name: 'renderWithMathJax 函数',
    pattern: /async function renderWithMathJax/,
    file: 'designs/shared/tex.js'
  },
  {
    name: '返回 renderer 字段',
    pattern: /renderer:\s*['"](?:katex|mathjax)['"]/,
    file: 'designs/shared/tex.js'
  }
]

const texJsContent = readFileSync(join(__dirname, 'designs/shared/tex.js'), 'utf-8')
const formulaTextureContent = readFileSync(join(__dirname, 'designs/nebula-plus/src/formulaTexture.js'), 'utf-8')

let allChecksPassed = true

checks.forEach(check => {
  const content = check.file.includes('tex.js') ? texJsContent : formulaTextureContent
  const passed = check.pattern.test(content)
  console.log(`   ${passed ? '✅' : '❌'} ${check.name}`)
  if (!passed) allChecksPassed = false
})

// 3. 检查 formulaTexture.js 的懒加载
console.log('\n3️⃣  检查 formulaTexture.js 优化...')

const formulaChecks = [
  {
    name: 'ensureMathJax 函数',
    pattern: /async function ensureMathJax/
  },
  {
    name: 'MathJax 动态导入',
    pattern: /await import\(['"]mathjax-full/
  },
  {
    name: 'latexToSvg 异步化',
    pattern: /async function latexToSvg/
  },
  {
    name: 'beginBake 异步化',
    pattern: /async function beginBake/
  }
]

formulaChecks.forEach(check => {
  const passed = check.pattern.test(formulaTextureContent)
  console.log(`   ${passed ? '✅' : '❌'} ${check.name}`)
  if (!passed) allChecksPassed = false
})

// 4. 检查语法错误的修复
console.log('\n4️⃣  检查已修复的错误...')

const analyticsContent = readFileSync(join(__dirname, 'designs/analytics/main.js'), 'utf-8')
const billingContent = readFileSync(join(__dirname, 'src/billing/dashboard.js'), 'utf-8')

const fixChecks = [
  {
    name: 'analytics: newRanks 改为 let',
    pattern: /let newRanks = new Array/,
    content: analyticsContent
  },
  {
    name: 'billing: 无重复导出',
    test: () => {
      // 检查是否没有重复导出 initBillingDashboard
      const exportCount = (billingContent.match(/export.*initBillingDashboard/g) || []).length
      return exportCount === 1
    }
  }
]

fixChecks.forEach(check => {
  const passed = check.test ? check.test() : check.pattern.test(check.content)
  console.log(`   ${passed ? '✅' : '❌'} ${check.name}`)
  if (!passed) allChecksPassed = false
})

// 5. 检查文档
console.log('\n5️⃣  检查文档完整性...')

// 这里原本还要求 OPTIMIZATION_PROGRESS.md 与 SESSION_SUMMARY.md 存在。
// 那两个是当时一次优化工作的过程记录（进度表与会话总结），后来已随文档
// 整理删除；把它们当作"必须存在的约束"没有意义 —— 过程记录不是产品的一
// 部分。保留下来的 OPTIMIZATION_ROADMAP.md 才是长期有效的规划文档。
const docs = [
  'OPTIMIZATION_ROADMAP.md'
]

docs.forEach(doc => {
  const exists = existsSync(join(__dirname, doc))
  console.log(`   ${exists ? '✅' : '❌'} ${doc}`)
  if (!exists) allChecksPassed = false
})

// 总结
console.log('\n' + '='.repeat(50))
if (allChecksPassed) {
  console.log('✅ 所有验证通过！')
  console.log('\n📋 优化实施总结:')
  console.log('   • KaTeX 作为首选渲染器')
  console.log('   • MathJax 懒加载（按需导入）')
  console.log('   • 自动降级机制')
  console.log('   • 代码错误已修复')
  console.log('   • 文档已更新')
  console.log('\n🚀 下一步:')
  console.log('   1. 启动开发服务器: npm run dev')
  console.log('   2. 打开浏览器测试: http://localhost:5175/test-katex-optimization.html')
  console.log('   3. 检查浏览器控制台输出')
  console.log('   4. 验证公式渲染正常')
  process.exit(0)
} else {
  console.log('❌ 部分验证失败')
  console.log('\n请检查上述失败项并修复')
  process.exit(1)
}
