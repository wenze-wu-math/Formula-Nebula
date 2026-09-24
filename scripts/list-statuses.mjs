/** 列全部 59 条猜想（含正则漏掉的 5 条），并按 status 分组；同时全网扫 .research 缓存里的新近信号。 */
import fs from 'node:fs'

const t = fs.readFileSync('src/data/conjectures.js', 'utf8')

/* 逐条按 id 切块，字段顺序不固定也能取到 */
const ids = [...t.matchAll(/id: '([^']+)'/g)].map((m) => m[1])
const rows = []
for (const id of ids) {
  const i = t.indexOf("id: '" + id + "'")
  const seg = t.slice(i, i + 1100)
  const g = (re) => { const m = re.exec(seg); return m ? m[1] : '?' }
  rows.push({
    id,
    st: g(/status: '(\w+)'/),
    field: g(/field: '(\w+)'/),
    year: g(/year: (\d+)/),
    imp: g(/importance: ([\d.]+)/),
    en: g(/en: '([^']+)'/),
    name: g(/name: '([^']+)'/),
  })
}

const hist = {}
for (const r of rows) hist[r.st] = (hist[r.st] || 0) + 1

console.log('='.repeat(80))
console.log(`全部 ${rows.length} 条 —— status 分布: ${JSON.stringify(hist)}`)
console.log('='.repeat(80))
const ORDER = { open: 0, partial: 1, proved: 2, disproved: 3, heuristic: 4 }
for (const r of [...rows].sort((a, b) => (ORDER[a.st] - ORDER[b.st]) || a.id.localeCompare(b.id))) {
  console.log(`${r.st.padEnd(10)}${r.field.padEnd(9)}${r.year.padEnd(6)}${r.imp.padEnd(5)}${r.id.padEnd(25)}${r.en}`)
}

/* ── 扫缓存：2024 年以后的年份 + "recently/2025/2026" 等词 ── */
console.log('\n' + '='.repeat(80))
console.log('缓存正文里的新近信号（年份 ≥ 2024 或 recent/recently 等）')
console.log('='.repeat(80))
const raw = JSON.parse(fs.readFileSync('.research/raw.json', 'utf8'))
const SIG = /(?:\b20(2[4-9])\b)|(?:recently|in 2025|in 2026|as of 202[4-9])/i
for (const [id, v] of Object.entries(raw)) {
  const text = String(v.text || '')
  if (!text) { console.log(`\n[${id}] （空）`); continue }
  const ss = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
  const hits = ss.filter((s) => SIG.test(s) && s.length > 40 && s.length < 420)
  if (!hits.length) continue
  const row = rows.find((r) => r.id === id)
  console.log(`\n[${id}] status=${row ? row.st : '?'}  resolved=${v.resolved}`)
  for (const s of hits.slice(0, 4)) console.log('   · ' + s.trim())
}
