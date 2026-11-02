/** 只针对单文件的诊断（不经过 index.js，避免受其他文件并发改动影响）。 */
import { LONG_FORM_PROOFS } from '../src/data/proofs/long-form.js'

const FILLERS = [
  '本步还要检查前提是否真的满足',
  '本步还需核对环、模、理想与态射',
  '本证明还逐项核对定义域、映射方向与边界情形',
]
const BARE = [
  'operatorname', 'mathcal', 'mathfrak', 'mathbb', 'mathrm', 'boxed', 'text', 'frac', 'sqrt',
  'otimes', 'oplus', 'mapsto', 'subseteq', 'subset', 'cup', 'cap', 'deg', 'ell', 'dim',
  'eta', 'alpha', 'beta', 'gamma', 'varphi', 'neq', 'cong', 'simeq', 'Longrightarrow',
  'Rightarrow', 'cdot', 'ldots', 'sum', 'prod', 'bigcap', 'bigcup', 'bar', 'hat', 'tilde',
  'ker', 'coker', 'Gamma', 'Delta', 'Omega', 'Spec', 'Proj', 'colon', 'pmod', 'equiv',
]
const segs = (v) => {
  const out = []
  const re = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g
  let m
  while ((m = re.exec(v))) out.push(m[1] ?? m[2] ?? m[3] ?? m[4] ?? '')
  return out
}

const P = LONG_FORM_PROOFS
let fill = 0
const bare = []
const minLens = []
for (const [id, p] of Object.entries(P)) {
  const fields = [['statement', p.statement], ['conclusion', p.conclusion], ['explanation', p.explanation], ['history', p.history]]
  for (const s of p.steps ?? []) fields.push([`step:${s.id}`, s.body], [`title:${s.id}`, s.title])
  for (const e of p.examples ?? []) fields.push([`example:${e.title}`, e.body])
  for (const [k, v] of fields) {
    if (typeof v !== 'string') continue
    for (const f of FILLERS) if (v.includes(f)) { fill++; console.log('FILLER', id, k) }
    for (const s of segs(v)) {
      const hit = BARE.find((c) => new RegExp(`(^|[^\\\\a-zA-Z{])${c}\\b`).test(s))
      if (hit) bare.push(`${id} ${k} \\${hit}`)
    }
  }
  for (const s of p.steps ?? []) minLens.push([id, s.id, s.body.length])
}
console.log(`keys ${Object.keys(P).length}`)
console.log(`filler fields ${fill}`)
console.log(`bare commands (checker guard) ${bare.length}`)
for (const b of bare.slice(0, 20)) console.log('  ', b)
minLens.sort((a, b) => a[2] - b[2])
console.log('shortest steps:')
for (const m of minLens.slice(0, 12)) console.log('  ', m.join(' '))
console.log('minStep', minLens[0][2])
