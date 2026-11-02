/**
 * 一次性维护脚本：把 scripts/ 下所有浏览器脚本的 Chromium 路径解析
 * 统一改为 _chrome.mjs 的 requireChrome()。
 *
 * 覆盖的写法：
 *   const CHROME = process.env.CHROME || '<chrome 路径>'
 *   const CHROME = process.env.CHROME ||\n  '<chrome 路径>'
 *   const CHROME = process.env.CHROME || [ '...', '...' ].find(existsSync)
 *   spawn(process.env.CHROME || '<chrome 路径>', [...])
 *   const CHROME = '<chrome 路径>'                     // 没有任何 env 覆盖
 *
 * 幂等：已经迁移过的文件会被跳过。
 * 用法：node scripts/_fix-chrome-paths.mjs [--dry] [--only name,...]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dry = process.argv.includes('--dry')
const onlyArg = process.argv.find((a) => a.startsWith('--only='))
const only = onlyArg ? new Set(onlyArg.slice('--only='.length).split(',').map((s) => s.trim())) : null

const ENV_CHROME = 'process.env.CHROME'

/** Consume a JS string literal starting at `i` (quote char included). */
function skipString(src, i) {
  const quote = src[i]
  let j = i + 1
  while (j < src.length) {
    if (src[j] === '\\') { j += 2; continue }
    if (src[j] === quote) return j + 1
    j++
  }
  return src.length
}

/** Consume a bracket-balanced [...] or (...) group starting at `i`. */
function skipGroup(src, i) {
  const open = src[i]
  const close = open === '[' ? ']' : ')'
  let depth = 0
  let j = i
  while (j < src.length) {
    const c = src[j]
    if (c === "'" || c === '"' || c === '`') { j = skipString(src, j); continue }
    if (c === '[' || c === '{' || c === '(') depth++
    else if (c === ']' || c === '}' || c === ')') {
      depth--
      if (depth === 0 && c === close) return j + 1
    }
    j++
  }
  return src.length
}

/** Consume the whole RHS of `process.env.CHROME || <expr>` (or a bare literal). */
function skipFallback(src, i) {
  // i points just after `process.env.CHROME`
  let j = i
  while (j < src.length && /\s/.test(src[j])) j++
  if (src.startsWith('||', j)) {
    j += 2
    while (j < src.length && /\s/.test(src[j])) j++
  } else {
    return i // no fallback
  }
  if (src[j] === "'" || src[j] === '"' || src[j] === '`') j = skipString(src, j)
  else if (src[j] === '[' || src[j] === '(') j = skipGroup(src, j)
  else return i
  // optional `.find(existsSync)` / `.find(Boolean)` tail
  const tail = /^\s*\.find\([^)]*\)/.exec(src.slice(j))
  if (tail) j += tail[0].length
  return j
}

function transform(source) {
  if (source.includes("from './_chrome.mjs'")) return { source, changed: false, reason: 'already-migrated' }
  const hasEnv = source.includes(ENV_CHROME)
  const hasLiteral = /Program Files[\s\S]{0,40}chrome\.exe/.test(source)
  if (!hasEnv && !hasLiteral) return { source, changed: false, reason: 'no-chrome-literal' }

  let out = ''
  let cursor = 0
  let replacements = 0
  while (true) {
    const idx = out.length === 0 && cursor === 0
      ? source.indexOf(ENV_CHROME)
      : source.indexOf(ENV_CHROME, cursor)
    if (idx < 0) { out += source.slice(cursor); break }
    const end = skipFallback(source, idx + ENV_CHROME.length)
    out += source.slice(cursor, idx)
    if (end === idx + ENV_CHROME.length) { out += ENV_CHROME; cursor = end; continue }
    out += 'requireChrome()'
    cursor = end
    replacements++
  }
  if (!replacements) {
    // No env override at all: rewrite `const CHROME = '<literal>'`
    const bare = /(const\s+CHROME\s*=\s*)(['"])([^'"]*chrome\.exe)\2/
    if (bare.test(out)) { out = out.replace(bare, '$1requireChrome()'); replacements++ }
    else return { source, changed: false, reason: hasEnv ? 'unmatched-env-chrome' : 'unmatched-literal' }
  }

  const importLine = "import { requireChrome } from './_chrome.mjs'"
  if (!out.includes(importLine)) {
    const lines = out.split('\n')
    let lastImport = -1
    for (let i = 0; i < lines.length; i++) {
      if (/^import\b/.test(lines[i])) lastImport = i
      else if (lastImport >= 0 && lines[i].trim() && !/^\s/.test(lines[i]) && !lines[i].startsWith('//') && !lines[i].startsWith('*') && !lines[i].startsWith('/*')) break
    }
    if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine)
    else lines.unshift(importLine)
    out = lines.join('\n')
  }
  return { source: out, changed: true, reason: `migrated(${replacements})` }
}

const files = readdirSync(here).filter((name) => name.endsWith('.mjs')
  && name !== '_chrome.mjs'
  && !name.startsWith('_fix-chrome-paths'))
const report = []
for (const name of files) {
  if (only && !only.has(name)) continue
  const path = join(here, name)
  const original = readFileSync(path, 'utf8')
  if (!/CHROME/.test(original)) continue
  const { source, changed, reason } = transform(original)
  report.push({ name, changed, reason })
  if (changed && !dry) writeFileSync(path, source, 'utf8')
}
for (const row of report) console.log(`${row.changed ? '+' : '.'} ${row.name} ${row.reason}`)
console.log(`\n${report.filter((r) => r.changed).length} / ${report.length} files changed${dry ? ' (dry run)' : ''}`)
