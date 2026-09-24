/**
 * 对全部 open + partial 条目逐条抽出"最能说明当前状态的那句话"。
 *
 * 目的：把"我需要判断的 43 条"压缩成一张可复核的表，而不是让我凭记忆
 * 决定。判据优先级：
 *   ① 含 2015 以后的年份 + 解决类动词  → 可能已变
 *   ② 明确的 "remains open / unsolved" → 仍是 open
 *   ③ 解决类动词但年份老               → 老结果，不影响
 * 只打印每条最相关的 1–2 句，并标出该页是否可信（条目名是否对得上）。
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const raw = JSON.parse(readFileSync(path.join(ROOT, '.research/raw.json'), 'utf8'))
const mod = await import(pathToFileURL(path.join(ROOT, 'src/data/conjectures.js')).href)

const RECENT_SOLVED = /\b20(1[5-9]|2[0-6])\b[^.]{0,120}\b(prov|disprov|solv|settl|resolv|refut|counterexample)/i
const SOLVED_RECENT = /\b(prov|disprov|solv|settl|resolv|refut|counterexample)[^.]{0,120}\b20(1[5-9]|2[0-6])\b/i
const OPEN_NOW = /\b(remains?|still)\b[^.]{0,40}\b(open|unsolved|unknown|conjectur)|no (known )?proof|is open\b|unsolved problem|as of 20(2[0-9])/i

function bestSentences(text) {
  const ss = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/).filter((s) => s.length > 35 && s.length < 700)
  const a = ss.filter((s) => RECENT_SOLVED.test(s) || SOLVED_RECENT.test(s))
  const b = ss.filter((s) => OPEN_NOW.test(s))
  return { recent: a.slice(0, 2), open: b.slice(0, 2) }
}

const rows = []
for (const n of mod.CONJECTURE_NODES) {
  if (n.status !== 'open' && n.status !== 'partial') continue
  const v = raw[n.id]
  if (!v?.text) { rows.push({ n, missing: true }); continue }
  rows.push({ n, page: v.resolved, ...bestSentences(v.text) })
}

/* 先打印"发现近期解决线索"的 —— 那些才可能改 */
console.log('#' + '='.repeat(76))
console.log('# 甲、发现 2015+ 解决线索的（需要人工判断是否改 status）')
console.log('#' + '='.repeat(76))
let cnt = 0
for (const r of rows) {
  if (!r.recent?.length) continue
  cnt++
  console.log(`\n★ ${r.n.id}  [${r.n.status}]  ${r.n.name}     维基: ${r.page}`)
  for (const s of r.recent) console.log('    → ' + s.trim().slice(0, 320))
}
console.log(`\n共 ${cnt} 条`)

console.log('\n\n' + '#'.repeat(77))
console.log('# 乙、其余（正文里没有 2015+ 的解决线索）')
console.log('#' + '#'.repeat(76))
for (const r of rows) {
  if (r.recent?.length) continue
  if (r.missing) { console.log(`\n? ${r.n.id}  [${r.n.status}] ${r.n.name}   —— 没抓到正文`); continue }
  console.log(`\n· ${r.n.id}  [${r.n.status}]  ${r.n.name}     维基: ${r.page}`)
  for (const s of (r.open || []).slice(0, 1)) console.log('    ○ ' + s.trim().slice(0, 260))
}
