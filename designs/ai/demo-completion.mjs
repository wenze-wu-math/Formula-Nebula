#!/usr/bin/env node
/**
 * Demo script: Run GNN graph completion and generate visualization
 */

import { buildGraph } from '../shared/kb.js'
import { PretrainGNN, PredictLinks, RankSuggestions, GenerateVisualization, ExplainPrediction, DemoWorkflow } from './graph-completion.js'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

console.log('Building knowledge graph...')
const graph = buildGraph()

console.log('\n' + '='.repeat(70))
console.log('Knowledge Graph Statistics')
console.log('='.repeat(70))
console.log(JSON.stringify(graph.stats, null, 2))

// Run complete workflow
const { model, predictions, visualization } = DemoWorkflow(graph)

// Save results
const outputPath = join(__dirname, 'completion-results.json')
const results = {
  metadata: {
    generated: new Date().toISOString(),
    graph: graph.stats,
    model: model.metadata,
  },
  predictions: predictions.slice(0, 50).map(p => ({
    rank: p.rank,
    source: p.source,
    target: p.target,
    confidence: p.confidence,
    type: p.predictedType,
    typeConfidence: p.typeConfidence,
    rankScore: p.rankScore,
    factors: p.factors,
    reasoning: p.reasoning,
  })),
  visualization,
}

writeFileSync(outputPath, JSON.stringify(results, null, 2))
console.log(`\n✓ Results saved to: ${outputPath}`)

// Generate detailed report for top 10
console.log('\n' + '='.repeat(70))
console.log('Detailed Explanations (Top 10)')
console.log('='.repeat(70))

predictions.slice(0, 10).forEach(pred => {
  const exp = ExplainPrediction(pred)
  console.log(`\n${'─'.repeat(70)}`)
  console.log(`Rank #${pred.rank}: ${pred.source} → ${pred.target}`)
  console.log(`${'─'.repeat(70)}`)
  console.log(`Relationship: ${pred.predictedType}`)
  console.log(`Confidence: ${(pred.confidence * 100).toFixed(1)}%`)
  console.log(`Composite Score: ${pred.rankScore.toFixed(4)}`)
  console.log(`\nFactors:`)
  exp.factors.forEach(f => {
    const bar = '█'.repeat(Math.round(f.score * 20))
    console.log(`  ${f.name.padEnd(20)} ${bar.padEnd(20)} ${(f.score * 100).toFixed(1)}% (weight: ${f.weight})`)
    console.log(`    ${f.description}`)
  })
  console.log(`\nReasoning:`)
  console.log(`  ${pred.reasoning.explanation}`)
  console.log(`  - Embedding similarity: ${pred.reasoning.embeddingSimilarity.toFixed(3)}`)
  console.log(`  - Common neighbors: ${pred.reasoning.commonNeighbors}`)
  console.log(`  - Source degree: ${pred.reasoning.srcDegree}, Target degree: ${pred.reasoning.tgtDegree}`)
  console.log(`\nRecommendation: ${exp.recommendation}`)
})

console.log('\n' + '='.repeat(70))
console.log('Summary')
console.log('='.repeat(70))
console.log(`Total predictions: ${predictions.length}`)
console.log(`High confidence (>85%): ${predictions.filter(p => p.confidence > 0.85).length}`)
console.log(`Medium confidence (75-85%): ${predictions.filter(p => p.confidence >= 0.75 && p.confidence <= 0.85).length}`)
console.log(`\nTop predicted link types:`)
const typeCounts = {}
predictions.forEach(p => {
  typeCounts[p.predictedType] = (typeCounts[p.predictedType] || 0) + 1
})
Object.entries(typeCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`)
  })

console.log(`\nVisualization data: ${visualization.predictedEdges.length} edges shown`)
console.log(`Output: ${outputPath}`)
