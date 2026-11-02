/**
 * kb-src/build-nlab-nodes.mjs — 把 nLab 概念页转成知识库节点。
 *
 * ═══ 与 Stacks 节点的区别（重要）═══
 *
 * Stacks 节点 = **定理/引理/定义**，有稳定 tag，能被精确引用。
 * nLab 节点   = **概念**（"scheme is a space that…"），没有定理编号。
 *
 * 所以这些节点进的是"概念层"，与定理层互补：
 *   · 定理层回答"这个结论成立吗"（Stacks）
 *   · 概念层回答"这个术语是什么意思"（nLab）
 *
 * 筛选规则：
 *   · 丢掉 `> history`、`- contents`、`- exposition` 这类非概念页
 *   · 丢掉没有 lead 的（抽不到定义 = 不是概念条目）
 *   · 保留有公式或有出链的
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const store = JSON.parse(readFileSync(join(HERE, 'out', 'nlab-pages.json'), 'utf8'))

/* 非概念页的特征 */
const NON_CONCEPT = />\s*history$|- contents$|- exposition$|^\s*HomePage$/i

/* 相关性闸门：nLab 有 20,780 页，覆盖面远超代数几何
 * （例如 "category of being"、"affine logic"、"category (philosophy)" 都是哲学/逻辑条目）。
 * 只保留与代数几何、同调代数、范畴论基础真正相关的。 */
const RELEVANT = /scheme|sheaf|topos|cohomolog|derived|spectral|stack|descent|site|morphism|etale|étale|fppf|fpqc|zariski|affine\s+scheme|projective|variet|moduli|chow|cycle|divisor|blow|resolution|birational|minimal\s+model|coherent|quasi-coherent|invertible|picard|jacobian|abelian\s+variet|elliptic\s+curve|genus|monad|adjunction|adjoint|functor|category|limit|colimit|yoneda|kan\s+extension|operad|enriched|monoidal|infinity|∞|homotop|simplicial|model\s+category|fibration|kan\s+complex|chain\s+complex|homolog|ext|tor|derived\s+functor|spectral\s+sequence|algebraic\s+k-theory|motiv/i

/* 明确排除的（哲学/逻辑/物理等非代数几何条目） */
const EXCLUDE = /philosoph|\bbeing\b|modality|affine\s+logic|\bdagger\b|hyperdoctrine|category\s+of\s+couplings|diffeological|\bphysics\b|\bquantum\b|\bstring\b|\bM-theory\b|cohesion|\bmodal\b|\bsemantics\b|\btype\s+theory\b|\bproof\b|\blambda\b/i

function isConcept(x) {
  if (x._fail) return false
  if (!x.lead || x.lead.length < 25) return false
  if (NON_CONCEPT.test(x.title)) return false
  if (NON_CONCEPT.test(x.name)) return false
  /* 正文太短（<300 字符）的也不是正经条目 */
  if ((x.plainLen || 0) < 300) return false
  /* 相关性闸门 */
  const nm = String(x.name || '') + ' ' + String(x.title || '')
  if (EXCLUDE.test(nm)) return false
  if (!RELEVANT.test(nm)) return false
  return true
}

const all = Object.values(store)
const concepts = all.filter(isConcept)
const dropped = all.filter((x) => !isConcept(x))
console.log(`nLab 页面 ${all.length} → 概念条目 ${concepts.length}（丢弃 ${dropped.length}）`)
console.log('丢弃原因分布:')
const reason = (x) => {
  if (x._fail) return '抓取失败'
  if (NON_CONCEPT.test(x.title) || NON_CONCEPT.test(x.name)) return '非概念页（history/contents）'
  if (!x.lead || x.lead.length < 25) return '无定义段'
  if ((x.plainLen || 0) < 300) return '正文过短'
  return '其他'
}
const byReason = {}
for (const x of dropped) byReason[reason(x)] = (byReason[reason(x)] || 0) + 1
for (const [k, v] of Object.entries(byReason)) console.log(`  ${k}: ${v}`)

/* ── 概念 → 知识族的映射 ──
 * nLab 的概念偏范畴论/上同调，所以主要落在 cohomology / foundation / scheme。
 * 按标题关键词判断。 */
function familyOfConcept(name) {
  const n = name.toLowerCase()
  if (/topos|site|sheaf|stack|descent|cohomolog|derived|spectral|infinity|∞|homotop/.test(n)) return 'cohomology'
  if (/scheme|variet|morphism|proper|separated|flat|etale|smooth|affine|projective/.test(n)) return 'scheme'
  if (/category|functor|monad|adjunction|limit|colimit|yoneda|kan|operad|enriched/.test(n)) return 'foundation'
  if (/module|ring|algebra|ideal|field|domain|localiz/.test(n)) return 'foundation'
  if (/curve|surface|genus|divisor|jacobian|elliptic/.test(n)) return 'curve'
  if (/moduli|deformation|formal|obstruction/.test(n)) return 'modern'
  if (/blow|resolution|singular|birational|minimal|mmp/.test(n)) return 'birational'
  if (/intersect|chow|cycle|characteristic\+class|chern|k-theory/.test(n)) return 'intersect'
  return 'cohomology'   // nLab 主体是范畴论/上同调视角
}

/** 从公式里挑一个最适合星云显示的 */
function pickLatex(x) {
  const disp = x.displayFormulas || []
  const inl = x.inlineFormulas || []
  const cands = [...disp, ...inl].filter((t) => t && t.length >= 6 && t.length <= 200)
  /* 排除纯符号碎片（例如 "\to"、"(\infty,1)"） */
  const good = cands.filter((t) => /[A-Za-z]{2,}|\\[a-zA-Z]{2,}/.test(t) && t.length >= 8)
  if (!good.length) return ''
  /* 优先含关系符的（= → ≃） */
  const isAssert = (t) => /[=]|\\to\b|\\simeq\b|\\cong\b|\\hookrightarrow/.test(t)
  good.sort((a, b) => (isAssert(b) - isAssert(a)) || (b.length - a.length))
  return good[0].replace(/\s+/g, ' ').slice(0, 200)
}

function makeId(name) {
  return 'nlb-' + String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

const nodes = concepts.map((x) => {
  const latex = pickLatex(x)
  const nFormulas = (x.inlineFormulas || []).length + (x.displayFormulas || []).length
  const nLinks = (x.outLinks || []).length
  /* importance：公式多、出链多（被广泛引用）的概念更重要 */
  let imp = 0.45
  imp += Math.min(0.22, 0.03 * nFormulas)
  imp += Math.min(0.15, 0.012 * nLinks)
  if (latex) imp += 0.06
  imp = Math.round(Math.min(0.92, imp) * 100) / 100

  return {
    id: makeId(x.name),
    latex,
    name: x.title,
    en: x.name.replace(/\+/g, ' '),
    importance: imp,
    family: familyOfConcept(x.name),
    summary: x.lead.slice(0, 180),
    detail: [
      x.lead,
      '',
      `nLab 页面共 ${x.plainLen} 字符，含 ${nFormulas} 个公式、${nLinks} 个出链。`,
      x.displayFormulas?.length ? `\n显示公式示例：\n  ${x.displayFormulas.slice(0, 3).join('\n  ')}` : '',
    ].filter(Boolean).join('\n'),
    source: `nLab（${x.title}）`,
    url: x.url,
    nlab: {
      name: x.name,
      outLinks: (x.outLinks || []).slice(0, 30),
      formulaCount: nFormulas,
    },
  }
})

/* 去重（不同页面名可能规范化成同一 id） */
const byId = new Map()
for (const n of nodes) if (!byId.has(n.id)) byId.set(n.id, n)
const uniq = [...byId.values()]

console.log(`\n生成概念节点 ${uniq.length}`)
const byFam = {}
for (const n of uniq) byFam[n.family] = (byFam[n.family] || 0) + 1
console.log('按族:', JSON.stringify(byFam))
console.log('有 latex:', uniq.filter((n) => n.latex).length, `(${(100 * uniq.filter((n) => n.latex).length / uniq.length).toFixed(0)}%)`)
console.log('importance:', Math.min(...uniq.map((n) => n.importance)), '~', Math.max(...uniq.map((n) => n.importance)))

/* ── 关联：nLab 的出链就是概念间关系 ── */
const idByName = new Map(uniq.map((n) => [n.nlab.name, n.id]))
const links = []
const seen = new Set()
for (const n of uniq) {
  for (const target of (n.nlab.outLinks || [])) {
    const to = idByName.get(target)
    if (!to || to === n.id) continue
    const k = n.id < to ? `${n.id}|${to}` : `${to}|${n.id}`
    if (seen.has(k)) continue
    seen.add(k)
    links.push([n.id, to, 0.2, 'nLab 出链', 'related'])
  }
}
/* ── 兜底：仍孤立的概念挂到本族最重要的节点上 ──
 * nLab 的出链大多指向**未采集**的页面（我们只抓了 124 页），
 * 所以有些概念在自己的小圈子里没有同伴。挂到本族锚点，避免漂浮孤点。 */
const touched = new Set()
for (const l of links) { touched.add(l[0]); touched.add(l[1]) }
const orphans = uniq.filter((n) => !touched.has(n.id))

/* 每族选 importance 最高且已连通的作为锚点 */
const famAnchor = new Map()
for (const n of uniq) {
  if (!touched.has(n.id)) continue
  const cur = famAnchor.get(n.family)
  if (!cur || n.importance > cur.importance) famAnchor.set(n.family, n)
}
let orphanEdges = 0
for (const n of orphans) {
  const a = famAnchor.get(n.family)
  if (!a) continue
  const k = a.id < n.id ? `${a.id}|${n.id}` : `${n.id}|${a.id}`
  if (seen.has(k)) continue
  seen.add(k)
  links.push([a.id, n.id, 0.12, '本族锚点', 'related'])
  orphanEdges++
}
console.log(`兜底：孤立概念 ${orphans.length} 个，连上 ${orphanEdges} 条`)

console.log(`概念间关联 ${links.length} 条`)

const dest = join(ROOT, 'src', 'data', 'nlab-extra.js')
mkdirSync(dirname(dest), { recursive: true })
const body = `/**
 * src/data/nlab-extra.js — 由 nLab 抓取的**概念**条目。
 *
 * ⚠ 生成物，不要手改。重新生成：
 *     node kb-src/fetch-nlab.mjs --limit 120 && node kb-src/build-nlab-nodes.mjs
 *
 * 来源：https://ncatlab.org/nlab/show/<page>（wiki 散文，非结构化定理库）
 *
 * ═══ 与 Stacks 节点的区别 ═══
 * Stacks 给的是**定理**（有稳定 tag、可精确引用）；
 * nLab 给的是**概念**（"scheme is a space that…"，无定理编号）。
 * 两者互补：定理层回答"这个结论成立吗"，概念层回答"这个术语什么意思"。
 *
 * 每条有 \`url\` 指向 nLab 页面，可逐条复核。
 * summary 是页面首段定义（原文摘录），detail 含公式与出链统计。
 *
 * 生成时间：${new Date().toISOString()}
 * 节点数：${uniq.length}　关联数：${links.length}
 */

export const NLAB_NODES = ${JSON.stringify(uniq, null, 1)}

export const NLAB_LINKS = ${JSON.stringify(links, null, 0).replace(/\],\[/g, '],\n  [')}
`
writeFileSync(dest, body, 'utf8')
console.log(`\n写入 ${dest}（${(Buffer.byteLength(body) / 1024).toFixed(1)} KB）`)
