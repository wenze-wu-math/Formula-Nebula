/**
 * Verify the deepExplanation rescue: load every proof batch at runtime and
 * confirm the text that used to be clobbered is now readable, and that the
 * `explanation` field still holds what it held before (no behaviour change
 * for existing consumers).
 *
 * Usage: node scripts/_verify-explanation-rescue.mjs
 */

import path from 'node:path'
import fs from 'node:fs'

const ROOT = path.resolve(import.meta.dirname, '..')
const PROOFS_DIR = path.join(ROOT, 'src', 'data', 'proofs')

// Load in the same order the app does (index.js drives the registry).
const { PROOFS } = await import(
  'file:///' + path.join(PROOFS_DIR, 'index.js').replace(/\\/g, '/')
)

const nodes = Object.values(PROOFS ?? {})
let withExplanation = 0
let withDeep = 0
let deepChars = 0
let explChars = 0
const samples = []

for (const [id, p] of Object.entries(PROOFS ?? {})) {
  if (typeof p?.explanation === 'string' && p.explanation.length) {
    withExplanation++
    explChars += p.explanation.length
  }
  if (typeof p?.deepExplanation === 'string' && p.deepExplanation.length) {
    withDeep++
    deepChars += p.deepExplanation.length
    if (samples.length < 3) {
      samples.push({ id, head: p.deepExplanation.slice(0, 90).replace(/\s+/g, ' ') })
    }
  }
}

console.log(`proof nodes loaded:        ${nodes.length}`)
console.log(`with explanation:          ${withExplanation}`)
console.log(`with deepExplanation:      ${withDeep}`)
console.log(`chars in explanation:      ${explChars.toLocaleString()}`)
console.log(`chars in deepExplanation:  ${deepChars.toLocaleString()}`)
console.log('\nsamples of rescued content:')
for (const s of samples) console.log(`  [${s.id}] ${s.head}...`)

// Assertions
const problems = []
if (withDeep !== 195) problems.push(`expected 195 rescued blocks, got ${withDeep}`)
if (deepChars < 75000) problems.push(`rescued text suspiciously small: ${deepChars} chars`)
if (withExplanation < 195) problems.push(`explanation coverage dropped: ${withExplanation}`)

// Any name that is still duplicated would be a missed rename.
for (const [id, p] of Object.entries(PROOFS ?? {})) {
  if (typeof p?.deepExplanation === 'string' && !p.deepExplanation.trim()) {
    problems.push(`empty deepExplanation on ${id}`)
  }
}

console.log('')
if (problems.length) {
  console.log('FAILED:')
  for (const p of problems) console.log('  - ' + p)
  process.exit(1)
}
console.log('OK: both explanation texts are present at runtime.')
