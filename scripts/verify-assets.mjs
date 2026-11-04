/**
 * Verify that every asset the HTML and the web-app manifest reference actually
 * exists in the build output.
 *
 * This exists because several of them silently did not:
 *   - <link rel="icon" href="/favicon.svg">   -> no such file
 *   - manifest icons /icon-192.png, /icon-512.png -> never created
 *   - og:image / twitter:image /og-image.jpg  -> never created
 *   - manifest screenshots and shortcuts pointing at paths that only exist
 *     in the source tree, not in dist/
 *
 * A missing icon does not break the build — the browser just shows a blank
 * tile and the failure is invisible until someone installs the app. That is
 * exactly the kind of defect a build-time check should catch.
 *
 * Run: node scripts/verify-assets.mjs      (after `npm run build`)
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')

let failures = 0
const fail = (msg) => {
  failures++
  console.log(`  ✗ ${msg}`)
}
const ok = (msg) => console.log(`  ✓ ${msg}`)

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.')
  process.exit(1)
}

const resolveInDist = (url) => {
  // URLs in the built HTML are either absolute (/foo) or relative (foo).
  // Under a sub-path build Vite rewrites them; dist/ is always the root of the
  // deployed tree, so strip a leading slash and resolve against it.
  const clean = url.split('?')[0].split('#')[0].replace(/^\/+/, '')
  if (/^https?:\/\//.test(url) || url.startsWith('data:')) return null
  return path.join(DIST, clean)
}

// ── 1. index.html references ───────────────────────────────────────────────
console.log('\nindex.html references:')
const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')

const refs = new Set()
for (const m of html.matchAll(/(?:href|src|content)="([^"]+)"/g)) {
  const url = m[1]
  if (!url || url.startsWith('#') || /^(https?:|data:|mailto:)/.test(url)) continue
  // Only asset-looking URLs
  if (/\.(svg|png|jpe?g|ico|webp|json|js|css|woff2?|ttf)$/.test(url)) refs.add(url)
}

for (const url of refs) {
  const target = resolveInDist(url)
  if (!target) continue
  if (fs.existsSync(target)) ok(url)
  else fail(`${url} referenced by index.html but missing in dist/`)
}

// ── 2. manifest references ─────────────────────────────────────────────────
console.log('\nmanifest references:')
const manifestPath = path.join(DIST, 'manifest.json')
if (!fs.existsSync(manifestPath)) {
  fail('manifest.json missing from dist/')
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

  // start_url and scope must be resolvable ('.' or './' = the app root).
  for (const key of ['start_url', 'scope']) {
    const v = manifest[key]
    if (v === undefined) continue
    if (/^https?:/.test(v)) {
      fail(`${key} is an absolute URL (${v}) — breaks sub-path deploys`)
    } else if (/^\/[^/]/.test(v)) {
      fail(`${key} is root-absolute (${v}) — breaks sub-path deploys`)
    } else {
      ok(`${key} is relative (${v})`)
    }
  }

  const collect = (list, kind) => {
    for (const item of list || []) {
      if (!item.src) continue
      if (/^\/[^/]/.test(item.src)) {
        fail(`${kind} icon "${item.src}" is root-absolute — breaks sub-path deploys`)
        continue
      }
      const target = resolveInDist(item.src)
      if (target && fs.existsSync(target)) ok(`${kind} ${item.src}`)
      else fail(`${kind} "${item.src}" declared in manifest but missing in dist/`)
    }
  }
  collect(manifest.icons, 'icon')
  for (const sc of manifest.shortcuts || []) collect(sc.icons, `shortcut(${sc.name})`)

  // Screenshots are optional for installation, but a declared-but-missing one
  // is still a broken reference.
  for (const shot of manifest.screenshots || []) {
    const target = resolveInDist(shot.src)
    if (target && fs.existsSync(target)) ok(`screenshot ${shot.src}`)
    else fail(`screenshot "${shot.src}" declared in manifest but missing in dist/`)
  }
}

// ── 3. service worker precache list ────────────────────────────────────────
console.log('\nservice worker precache:')
const swPath = path.join(DIST, 'sw.js')
if (!fs.existsSync(swPath)) {
  fail('sw.js missing from dist/')
} else {
  const sw = fs.readFileSync(swPath, 'utf8')
  // The precache entries are built with resolveInScope('./x'), so the literal
  // strings we can check are the './...' arguments.
  const precache = [...sw.matchAll(/resolveInScope\('\.\/([^']*)'\)/g)].map((m) => m[1])
  if (!precache.length) {
    ok('no literal precache entries to check (SW builds URLs at runtime)')
  }
  for (const rel of precache) {
    const target = path.join(DIST, rel || 'index.html')
    if (fs.existsSync(target)) ok(rel || '(root)')
    else fail(`service worker precaches "${rel}" but it is missing in dist/`)
  }
}

// ── summary ────────────────────────────────────────────────────────────────
console.log('')
if (failures) {
  console.log(`FAILED: ${failures} broken asset reference(s)`)
  process.exit(1)
}
console.log('OK: every referenced asset exists in dist/')
process.exit(0)
