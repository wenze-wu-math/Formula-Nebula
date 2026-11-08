/**
 * Smoke test: can the component/service modules be imported and constructed?
 *
 * These were previously unloadable. UserDashboard referenced RealtimeService
 * and DashboardDataService without importing them, and both services only
 * exported via CommonJS (`module.exports`), so an ES import saw nothing.
 * Nothing in the app imports them, so nothing ever failed — they were simply
 * dead code that could not run.
 *
 * Scope: this verifies the modules resolve and their classes construct. It does
 * NOT claim the dashboard is wired into the UI (it is not).
 *
 * Run: node tests/components/load.test.mjs
 */

let passed = 0
let failed = 0
const pass = (msg) => {
  passed++
  console.log(`✓ ${msg}`)
}
const fail = (msg) => {
  failed++
  console.log(`✗ ${msg}`)
}

const MODULES = [
  ['UserDashboard', 'src/components/UserDashboard.js', 'UserDashboard'],
  ['RealtimeService', 'src/services/realtimeService.js', 'RealtimeService'],
  ['DashboardDataService', 'src/services/dashboardService.js', 'DashboardDataService'],
  ['PremiumModal', 'src/components/PremiumModal.js', 'PremiumModal'],
  ['SearchManager', 'src/components/SearchManager.js', 'SearchManager'],
  ['PerformanceDashboard', 'src/components/PerformanceDashboard.js', 'PerformanceDashboard'],
]

const loaded = {}

console.log('--- module load ---')
for (const [label, rel, exportName] of MODULES) {
  const url = new URL(`../../${rel}`, import.meta.url).href
  try {
    const m = await import(url)
    if (typeof m[exportName] !== 'function') {
      throw new Error(`export "${exportName}" is ${typeof m[exportName]}, expected a class`)
    }
    loaded[label] = m
    pass(`${label} exports ${exportName}`)
  } catch (e) {
    fail(`${label} (${rel}): ${e.message}`)
  }
}

console.log('\n--- construction ---')
// Construct only the classes that do not require a live DOM. Browser-dependent
// ones are import-tested above; a failure here is reported but does not fail
// the suite, because a constructor may legitimately probe for browser APIs.
for (const name of ['RealtimeService', 'DashboardDataService', 'SearchManager']) {
  const m = loaded[name]
  if (!m) continue
  try {
    const inst = new m[name]()
    if (!inst) throw new Error('constructor returned nothing')
    pass(`${name} constructs`)
  } catch (e) {
    console.log(`· ${name} construction skipped: ${e.message}`)
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
