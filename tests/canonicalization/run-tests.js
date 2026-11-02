/**
 * Test runner for canonicalization system
 */

import { runAllTests as runNormalizeTests } from './normalize.test.js'
import { runAllTests as runCompareTests } from './compare.test.js'

console.log('='.repeat(60))
console.log('Formula Canonicalization Test Suite')
console.log('='.repeat(60))

console.log('\n📝 Running normalization tests...\n')
const normalizeResult = runNormalizeTests()

console.log('\n📊 Running comparison tests...\n')
const compareResult = runCompareTests()

console.log('\n' + '='.repeat(60))
if (normalizeResult && compareResult) {
  console.log('✓ All tests passed!')
  process.exit(0)
} else {
  console.log('✗ Some tests failed')
  process.exit(1)
}
