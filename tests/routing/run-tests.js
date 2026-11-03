/**
 * Regression tests for URL routing.
 *
 * These cover the bug where `/?p=<id>` never opened a proof page on first
 * load. The browser-level cause (applyLocationState short-circuiting on its
 * de-dupe check) lives in main.js and needs a browser to exercise, but the
 * decoding half — "does this URL even carry a proof id?" — is pure and is
 * what the app branches on. Locking that down here means a future change to
 * the URL format cannot silently break deep links again.
 *
 * Run: node tests/routing/run-tests.js
 */

import {
  decodeLocationState,
  encodeState,
  PROOF_QUERY_KEY,
  PROOF_HASH_KEY,
} from '../../src/urlState.js'
import { proofIdFromLocation, encodeProofLink, encodeProofHash } from '../../src/proofRouter.js'

let passed = 0
let failed = 0

function check(condition, message) {
  if (!condition) throw new Error(message || 'assertion failed')
}

const tests = {
  'query form ?p=<id> yields the proof id'() {
    const st = decodeLocationState('?p=flat-morphism', '')
    check(st.proof === 'flat-morphism', `got ${JSON.stringify(st.proof)}`)
  },

  'query + hash form keeps the proof id'() {
    const st = decodeLocationState('?p=flat-morphism', '#v1&n=flat-morphism')
    check(st.proof === 'flat-morphism', `got ${JSON.stringify(st.proof)}`)
  },

  'canonical hash form #v1&k=<id> yields the proof id'() {
    // The canonical hash is versioned: `#v1&k=<id>`. A bare `#k=<id>` is not
    // the documented format and the decoder intentionally ignores it.
    const st = decodeLocationState('', `#v1&${PROOF_HASH_KEY}=flat-morphism`)
    check(st.proof === 'flat-morphism', `got ${JSON.stringify(st.proof)}`)
  },

  'bare #k=<id> without the version prefix is not treated as a proof route'() {
    const st = decodeLocationState('', `#${PROOF_HASH_KEY}=flat-morphism`)
    check(st.proof === undefined, `unexpectedly parsed: ${JSON.stringify(st.proof)}`)
  },

  'no proof parameter means no proof id'() {
    check(decodeLocationState('', '') .proof === undefined, 'empty URL must not carry a proof')
    check(decodeLocationState('?n=flat-morphism', '#v1').proof === undefined, 'node-only URL must not carry a proof')
  },

  'empty proof value is ignored'() {
    const st = decodeLocationState('?p=', '')
    check(!st.proof, `empty p= must not produce an id, got ${JSON.stringify(st.proof)}`)
  },

  'proofIdFromLocation agrees with decodeLocationState'() {
    const a = proofIdFromLocation('?p=dimension-fiber', '')
    const b = decodeLocationState('?p=dimension-fiber', '').proof
    check(a === b && a === 'dimension-fiber', `mismatch: ${a} vs ${b}`)
  },

  'encodeProofLink round-trips through the decoder'() {
    const link = encodeProofLink('flat-morphism')
    const search = link.includes('?') ? link.slice(link.indexOf('?')) : ''
    const st = decodeLocationState(search, '')
    check(st.proof === 'flat-morphism', `round-trip failed: ${link} -> ${JSON.stringify(st.proof)}`)
  },

  'encodeProofHash round-trips through the decoder'() {
    const h = encodeProofHash('flat-morphism')
    const st = decodeLocationState('', h.startsWith('#') ? h : `#${h}`)
    check(st.proof === 'flat-morphism', `hash round-trip failed: ${h} -> ${JSON.stringify(st.proof)}`)
  },

  'encodeState emits the canonical k= key'() {
    const s = encodeState({ proof: 'flat-morphism' })
    check(s.includes(`${PROOF_HASH_KEY}=flat-morphism`), `encodeState gave ${JSON.stringify(s)}`)
  },

  'the query key is still the documented "p"'() {
    check(PROOF_QUERY_KEY === 'p', `PROOF_QUERY_KEY changed to ${PROOF_QUERY_KEY}`)
  },

  'decoder never throws on junk input'() {
    for (const junk of [null, undefined, '', '?', '?p', '?p=%', '#k=%', '#k=', '%%%', '#']) {
      const st = decodeLocationState(junk, junk)
      check(st && typeof st === 'object', `threw or returned non-object for ${JSON.stringify(junk)}`)
    }
  },
}

for (const [name, fn] of Object.entries(tests)) {
  try {
    fn()
    passed++
    console.log(`✓ ${name}`)
  } catch (err) {
    failed++
    console.log(`✗ ${name}: ${err.message}`)
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
