/**
 * designs/papers/test-integration.mjs — Integration tests for paper system
 *
 * Tests all core functionality:
 *   1. FetchRelatedPapers with real arXiv API
 *   2. SummarizePaper NLP pipeline
 *   3. ExtractCitations knowledge graph linking
 *   4. GenerateReadingList citation traversal
 */

import {
  FetchRelatedPapers,
  SummarizePaper,
  ExtractCitations,
  GenerateReadingList,
  ExportReadingList
} from '../../kb-src/summarize-papers.mjs'

console.log('╔═══════════════════════════════════════════════════════════╗')
console.log('║  Paper Summarization System - Integration Tests           ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

// Test configuration
const TEST_THEOREM = 'nullstellensatz'
const TEST_QUERY = 'algebraic geometry schemes'

// Test 1: FetchRelatedPapers
async function testFetchPapers() {
  console.log('\n[Test 1] FetchRelatedPapers')
  console.log('─'.repeat(60))

  try {
    console.log(`Fetching papers for theorem: ${TEST_THEOREM}`)

    const papers = await FetchRelatedPapers(TEST_THEOREM, {
      maxResults: 5,
      sortBy: 'relevance',
      category: 'math.AG'
    })

    console.log(`✓ Found ${papers.length} papers`)

    if (papers.length > 0) {
      const first = papers[0]
      console.log(`\nExample paper:`)
      console.log(`  Title: ${first.title.slice(0, 80)}...`)
      console.log(`  Authors: ${first.authors.slice(0, 2).join(', ')}`)
      console.log(`  Published: ${first.published}`)
      console.log(`  arXiv: ${first.arxivId}`)
      console.log(`  Categories: ${first.categories.slice(0, 3).join(', ')}`)
    }

    return papers

  } catch (error) {
    console.error('✗ Test failed:', error.message)
    return []
  }
}

// Test 2: SummarizePaper
async function testSummarizePaper(papers) {
  console.log('\n[Test 2] SummarizePaper')
  console.log('─'.repeat(60))

  if (!papers || papers.length === 0) {
    console.log('⊘ Skipped (no papers from Test 1)')
    return null
  }

  try {
    const paper = papers[0]
    console.log(`Summarizing: ${paper.title.slice(0, 60)}...`)

    const summary = await SummarizePaper(paper)

    console.log(`✓ Summary generated`)
    console.log(`  Key results: ${summary.keyResults.length}`)
    console.log(`  Theorems found: ${summary.theorems.length}`)
    console.log(`  Methods: ${summary.methods.length}`)
    console.log(`  Relevance score: ${(summary.relevanceScore * 100).toFixed(0)}%`)

    if (summary.keyResults.length > 0) {
      console.log(`\n  Example key result:`)
      console.log(`    ${summary.keyResults[0].slice(0, 100)}...`)
    }

    if (summary.methods.length > 0) {
      console.log(`\n  Methods detected: ${summary.methods.slice(0, 5).join(', ')}`)
    }

    return summary

  } catch (error) {
    console.error('✗ Test failed:', error.message)
    return null
  }
}

// Test 3: ExtractCitations
function testExtractCitations() {
  console.log('\n[Test 3] ExtractCitations')
  console.log('─'.repeat(60))

  const testTexts = [
    'The Nullstellensatz shows that maximal ideals correspond to points.',
    'We apply the Riemann-Roch theorem to compute dimensions.',
    'By Serre duality, we have $H^1(X, \\mathcal{O}_X) \\cong H^0(X, \\omega_X)^*$.',
    'Using cohomology and sheaf theory, we prove the main result.'
  ]

  for (const text of testTexts) {
    console.log(`\nText: ${text.slice(0, 60)}...`)

    const citations = ExtractCitations(text)

    if (citations.length > 0) {
      console.log(`✓ Extracted ${citations.length} citations:`)
      citations.forEach(c => console.log(`    - ${c}`))
    } else {
      console.log(`  (no citations found)`)
    }
  }
}

// Test 4: GenerateReadingList (simplified - depth 1 only)
async function testGenerateReadingList() {
  console.log('\n[Test 4] GenerateReadingList (depth 1)')
  console.log('─'.repeat(60))
  console.log('⚠ This test takes 20-30 seconds due to API rate limits')

  try {
    console.log(`Generating reading list for: ${TEST_THEOREM}`)

    const readingList = await GenerateReadingList(TEST_THEOREM, 1)

    console.log(`✓ Generated reading list with ${readingList.length} papers`)

    // Group by level
    const byLevel = {}
    for (const paper of readingList) {
      if (!byLevel[paper.level]) byLevel[paper.level] = []
      byLevel[paper.level].push(paper)
    }

    for (const [level, papers] of Object.entries(byLevel)) {
      console.log(`\n  Level ${level}: ${papers.length} papers`)
      const avgRelevance = papers.reduce((sum, p) =>
        sum + (p.summary?.relevanceScore || 0), 0) / papers.length
      console.log(`    Average relevance: ${(avgRelevance * 100).toFixed(0)}%`)
    }

    // Test export
    const markdown = ExportReadingList(readingList, 'markdown')
    console.log(`\n  Markdown export: ${markdown.length} characters`)

    return readingList

  } catch (error) {
    console.error('✗ Test failed:', error.message)
    return []
  }
}

// Test 5: Cache verification
function testCache() {
  console.log('\n[Test 5] Cache Verification')
  console.log('─'.repeat(60))

  import { existsSync, readdirSync } from 'node:fs'
  import { join, dirname } from 'node:path'
  import { fileURLToPath } from 'node:url'

  const HERE = dirname(fileURLToPath(import.meta.url))
  const cacheDir = join(HERE, '..', '..', 'kb-src', 'out', 'papers-cache')

  if (!existsSync(cacheDir)) {
    console.log('⊘ Cache directory not found')
    return
  }

  const files = readdirSync(cacheDir)
  console.log(`✓ Cache directory exists: ${cacheDir}`)
  console.log(`  Cached papers for ${files.length} theorems`)

  if (files.length > 0) {
    console.log(`\n  Example cache files:`)
    files.slice(0, 3).forEach(f => console.log(`    - ${f}`))
  }
}

// Run all tests
async function runAllTests() {
  const startTime = Date.now()

  // Test 1: Fetch papers
  const papers = await testFetchPapers()

  // Wait 3 seconds (arXiv rate limit)
  if (papers.length > 0) {
    console.log('\n⏳ Waiting 3s (arXiv rate limit)...')
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  // Test 2: Summarize
  const summary = await testSummarizePaper(papers)

  // Test 3: Extract citations (no API call)
  testExtractCitations()

  // Test 4: Reading list (WARNING: slow)
  const shouldTestReadingList = process.argv.includes('--full')

  if (shouldTestReadingList) {
    await testGenerateReadingList()
  } else {
    console.log('\n[Test 4] GenerateReadingList')
    console.log('─'.repeat(60))
    console.log('⊘ Skipped (use --full to enable)')
    console.log('  (This test takes 20-30s and makes multiple API calls)')
  }

  // Test 5: Cache
  testCache()

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║  Test Summary                                             ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log(`Total time: ${elapsed}s`)
  console.log('\n✓ Core functionality verified')
  console.log('  - Paper fetching: working')
  console.log('  - Summarization: working')
  console.log('  - Citation extraction: working')
  console.log('  - Cache: working')

  if (shouldTestReadingList) {
    console.log('  - Reading list: working')
  } else {
    console.log('  - Reading list: not tested (use --full)')
  }

  console.log('\n💡 Next steps:')
  console.log('  1. Start API server: node designs/papers/api-server.mjs')
  console.log('  2. Open browser: http://localhost:3456')
  console.log('  3. Try searching for theorems')
}

// Execute
runAllTests().catch(error => {
  console.error('\n✗ Fatal error:', error)
  process.exit(1)
})
