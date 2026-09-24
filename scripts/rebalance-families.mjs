/**
 * 把部分 modern 节点归入更贴切的族，使四条旋臂的节点数大致均衡。
 *
 * 族 → 旋臂的映射（FAMILIES[].arm）不变：
 *   臂0 = foundation + curve
 *   臂1 = scheme + intersect
 *   臂2 = cohomology + birational
 *   臂3 = map + modern
 * 所以只要把 modern 里"其实属于别的族"的节点挪走，臂就自然平了。
 *
 * 用法: node scripts/rebalance-families.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs'

const MOVES = {
  // 导出 / 算术 / 技术性基础 → 归入 foundation
  foundation: [
    'c-derived-scheme', 'c-perfect-complex', 'c-virtual-fundamental',
    'c-padic-hodge', 'c-perfectoid', 'c-condensed', 'c-condensed-analytic',
    'c-berkovich', 'c-tropical', 'c-chow-lemma', 'c-alterations',
    'c-tt-geometry', 'c-hodge-structure-vhs', 'c-gauss-manin', 'c-periods',
  ],
  // 层论 / 导出范畴 / Hodge 格 → 归入 cohomology
  cohomology: [
    'c-riemann-hilbert', 'c-d-module', 'c-perverse',
    'c-fourier-mukai', 'c-orlov', 'c-bondal-orlov', 'c-mukai-pair',
    'c-hyperkaehler', 'c-beauville-bogomolov', 'c-lattice-torelli',
  ],
  // 示性类 / 局部化 → 归入 intersect
  intersect: [
    'c-atiyah-singer', 'c-index-to-rr', 'c-hirzebruch-signature',
    'c-cobordism', 'c-atiyah-bott-fixed', 'c-equivariant-k',
    'b-localization', 'b-grassmannian',
  ],
}

const target = new Map()
for (const [fam, ids] of Object.entries(MOVES)) {
  for (const id of ids) target.set(id, fam)
}

const dry = process.argv.includes('--dry')
const files = ['src/data/extra-a.js', 'src/data/extra-b.js', 'src/data/extra-c.js']

let changed = 0
for (const p of files) {
  const lines = readFileSync(p, 'utf8').split('\n')
  let curId = null
  let touched = false
  for (let i = 0; i < lines.length; i++) {
    const idm = lines[i].match(/^\s*id:\s*'([^']+)'/)
    if (idm) { curId = idm[1]; continue }
    const fm = lines[i].match(/^(\s*importance:\s*[\d.]+,\s*family:\s*')([^']+)('.*)$/)
    if (!fm || !curId || !target.has(curId)) continue
    const want = target.get(curId)
    if (fm[2] === want) continue
    if (dry) console.log(`  ${curId}: ${fm[2]} → ${want}`)
    lines[i] = fm[1] + want + fm[3]
    changed++
    touched = true
  }
  if (touched && !dry) writeFileSync(p, lines.join('\n'))
}

console.log(dry ? `\n(预演) 将改动 ${changed} 处` : `\n已改动 ${changed} 处`)
