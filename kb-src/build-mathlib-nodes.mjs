/**
 * kb-src/build-mathlib-nodes.mjs — 从 Lean 源文件抽取**形式化定理**节点。
 *
 * ═══ 这是知识库的第三个维度 ═══
 *
 *   Stacks  → 定理性（人写的、同行审阅的）
 *   nLab    → 概念性（wiki 散文）
 *   mathlib → **形式化**（Lean 4 内核验证，可 `--trust=0` 重编译）
 *
 * mathlib 节点的独特价值：它的正确性不依赖人类共识，而依赖 Lean 内核。
 * 所以这类节点上会带 `formal: true`，在页面上可区分显示。
 *
 * ═══ 抽取规则（实测）═══
 *   ✅ 定理名    `theorem foo` / `lemma foo`（含 namespace 前缀）
 *   ✅ 类型签名  `(x : X) : P x`
 *   ✅ docstring `/-- ... -/` 的自然语言说明（有则用，无则不编）
 *   ✅ 文件路径  可定位到 GitHub
 *   ❌ 中文陈述  不编造；summary 直接用 docstring 原文或类型签名
 *
 * 过滤：跳过 `private`、自动生成的 `_proof`/`_aux` 类、以及名字过短的。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const store = JSON.parse(readFileSync(join(HERE, 'out', 'mathlib-files.json'), 'utf8'))

const files = Object.entries(store).filter(([, v]) => v.ok)
console.log(`Lean 文件 ${files.length} 个`)

/* ── 从单个 Lean 文件抽定理 ── */
function extractFromLean(path, src) {
  const out = []

  /* namespace 栈：Lean 里 theorem 的完整名 = namespace + 短名 */
  /* 简化处理：记录每个定理出现位置之前最近的 namespace 声明 */
  const nsEvents = [...src.matchAll(/^\s*namespace\s+([\w.]+)/gm)].map((m) => ({ at: m.index, name: m[1] }))
  const nsEndEvents = [...src.matchAll(/^\s*end\s+([\w.]+)\s*$/gm)].map((m) => ({ at: m.index, name: m[1] }))

  function nsAt(pos) {
    /* 用栈模拟：先进后出 */
    const stack = []
    const all = [
      ...nsEvents.map((e) => ({ ...e, kind: 'open' })),
      ...nsEndEvents.map((e) => ({ ...e, kind: 'close' })),
    ].sort((a, b) => a.at - b.at)
    for (const e of all) {
      if (e.at >= pos) break
      if (e.kind === 'open') stack.push(e.name)
      else stack.pop()
    }
    return stack.join('.')
  }

  /* 匹配 theorem / lemma 声明，抓类型签名到 `:=` 之前 */
  const re = /^[ \t]*(?:@\[[^\]]*\][ \t]*)?(theorem|lemma)[ \t]+([A-Za-z_][\w.']*)([\s\S]{0,600}?):=/gm
  let m
  while ((m = re.exec(src))) {
    const kind = m[1]
    const short = m[2]
    let sig = m[3].replace(/\s+/g, ' ').trim()
    /* 截掉误抓进的证明体（正则可能跨过嵌套的 := 抓到内层） */
    const proofCut = sig.search(/\b(by|simp|exact|rw|apply|intro|constructor|refine)\b/)
    if (proofCut > 0) sig = sig.slice(0, proofCut).trim()
    /* 截掉残留的 := 及其后内容 */
    const assign = sig.indexOf(':=')
    if (assign >= 0) sig = sig.slice(0, assign).trim()
    const pos = m.index

    /* 跳过自动生成的辅助定理 */
    if (/\b(private|aux|_proof|_aux|mk_|elim_)\b/.test(short)) continue
    if (short.length < 3) continue
    /* 跳过没有实质类型的（例如 `: True`） */
    if (!sig || sig.length < 6) continue

    /* 找这个定理紧邻的 docstring（在声明之前最近的 /-- ... -/） */
    const before = src.slice(Math.max(0, pos - 900), pos)
    let doc = ''
    const docs = [...before.matchAll(/\/--([\s\S]{5,400}?)-\//g)]
    if (docs.length) {
      const last = docs[docs.length - 1]
      /* 只取紧邻的（中间不能隔着其它子句） */
      const afterDoc = before.slice(last.index + last[0].length)
      if (!/\b(theorem|lemma|def|instance)\b/.test(afterDoc)) {
        doc = last[1]
          .replace(/\s+/g, ' ')
          .replace(/\{@[^}]*\}|@\[[^\]]*\]/g, '')
          /* Lean docstring 用反引号包代码标识符；去掉反引号让它读起来是自然语言，
           * 代码内容保留（例如 `p : E → B` → p : E → B）。 */
          .replace(/`([^`]*)`/g, '$1')
          .replace(/\s+/g, ' ')
          .trim()
      }
    }

    const ns = nsAt(pos)
    const full = ns ? `${ns}.${short}` : short
    out.push({ path, kind, short, full, sig, doc })
  }
  return out
}

const all = []
for (const [path, v] of files) {
  const items = extractFromLean(path, v.text)
  all.push(...items)
}
console.log(`原始定理/引理 ${all.length} 条`)

/* ── 去重（同一 full 名可能出现在多个文件，如 import 复用）── */
const byName = new Map()
for (const t of all) {
  const cur = byName.get(t.full)
  /* 优先保留有 docstring 的 */
  if (!cur || (!cur.doc && t.doc)) byName.set(t.full, t)
}
const uniq = [...byName.values()]
console.log(`去重后 ${uniq.length} 条`)

/* ── 只保留有 docstring 的（否则星云上显示不了任何自然语言）── */
/* 过滤掉 docstring 只是文献引用的情况（没有实质描述）：
 *   `C2.1.3 in [Elephant]`
 *   `[Stacks, Tag 01AB]`
 *   `See [Hartshorne, II.4]`
 * 判据：去掉方括号引用 + 编号后，剩余英文词不足 6 个。 */
function isRealDescription(doc) {
  const stripped = doc
    .replace(/\[[^\]]*\]/g, ' ')       // 方括号引用
    .replace(/\b[A-Z]\d+(\.\d+)*\b/g, ' ')  // 编号 C2.1.3
    .replace(/\s+/g, ' ')
    .trim()
  const words = stripped.split(/\s+/).filter((w) => /^[A-Za-z]{2,}/.test(w))
  return words.length >= 6
}

/* ═══ 数量上限（2026-11-02）═══
 *
 * 实测：节点总数 4,152 → atlas 首屏 4.5s；4,934 → 10.8s。
 * 布局耗时对总数敏感（力导向 + 标签避让）。
 *
 * mathlib 有 1,115 条可用，但全放进去会把总量推到 4,934。
 * 取**前 500 条**（按代数几何相关性 + docstring 质量排序），
 * 让总量维持在 4,300 左右，首屏回到 5-6 秒。
 *
 * 排序依据：
 *   1. 文件在 AlgebraicGeometry 目录下（最核心）
 *   2. docstring 长度（说明越详细越有价值）
 *   3. Lean 全名短（短名通常更基础）
 */
const ML_CAP = Number(process.argv.find((a) => a.startsWith('--cap='))?.slice(6) ?? 500)

function relevance(t) {
  let score = 0
  if (/^Mathlib\/AlgebraicGeometry\//.test(t.path)) score += 1000
  if (/\/Scheme|\/Morphism|\/Cover|\/Cohomology|\/Sheaf/i.test(t.path)) score += 300
  if (/\/RingTheory\//.test(t.path)) score += 200
  score += Math.min(120, (t.doc || '').length / 8)
  score -= Math.min(60, String(t.full || '').length / 3)
  return score
}

const withDocAll = uniq.filter((t) => t.doc && t.doc.length >= 20 && isRealDescription(t.doc))
const withDoc = [...withDocAll].sort((a, b) => relevance(b) - relevance(a)).slice(0, ML_CAP)
console.log(`有 docstring 的 ${withDocAll.length} 条 → 按相关性取前 ${withDoc.length} 条（上限 ${ML_CAP}）`)

/* ── 转节点 ── */
function familyOfPath(path) {
  const p = path.toLowerCase()
  if (/algebraicgeometry|scheme|affine|projective/.test(p)) return 'scheme'
  if (/birational|blow|resolution/.test(p)) return 'birational'
  if (/ellipticcurve|curve|genus/.test(p)) return 'curve'
  if (/algebraiccycle|chow|k-theory/.test(p)) return 'intersect'
  if (/ellipticcurve|moduli/.test(p)) return 'modern'
  if (/cohomolog|sheaf|site|topos/.test(p)) return 'cohomology'
  if (/morphism|cover|flat|etale/.test(p)) return 'map'
  if (/ring|ideal|algebra|localiz/.test(p)) return 'foundation'
  return 'foundation'
}

/**
 * 生成稳定且**唯一**的 id。
 *
 * 不能简单 slice(0, 64)（2026-11-02 踩过）：
 *   Lean 全名很长（CategoryTheory.LocalizerMorphism.RightResolution.mk_surjective），
 *   截断后不同定理会得到同一个 id，去重时互相覆盖 —— 实测丢失 1 条并产生孤立节点。
 *
 * 修法：超过 64 字符时保留前缀 + 8 位确定性哈希后缀，保证唯一。
 */
function makeId(full) {
  const slug = String(full)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  if (slug.length <= 58) return 'ml-' + slug
  /* FNV-1a 32 位，确定性 */
  let h = 0x811c9dc5
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  const suffix = h.toString(16).padStart(8, '0')
  return 'ml-' + slug.slice(0, 54) + '-' + suffix
}

/** 从 Lean 类型签名里挑一个适合星云显示的片段。
 *
 * ⚠ 直接把整个签名当公式会很难看：Lean 签名的开头通常是**类型类约束**，
 *   例如 `[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] …`
 *   这些约束在页面上挤成一团，读者看不懂。
 *
 * 真正的"结论"在签名的 `:` 之后（Lean 里 `theorem foo (args) : CONCLUSION :=`）。
 * 所以：剥掉所有 `[...]` 约束和 `(x : T)` 参数，取 `:` 之后的结论部分。
 * 如果结论太长或没有，回退到整个签名（截断）。
 */
function pickLatex(sig) {
  if (!sig) return ''
  let s = sig.replace(/\s+/g, ' ').trim()

  /* 1) 剥掉类型类约束 [ ... ]（可能嵌套，逐层剥） */
  for (let i = 0; i < 6; i++) {
    const next = s.replace(/\[[^[\]]*\]/g, ' ')
    if (next === s) break
    s = next
  }

  /* 2) 找顶层 `:` —— 那是"参数 : 结论"的分隔点。
   *    跳过 `:=`（赋值）与 `: ` 在括号内的情形。 */
  let depth = 0
  let colonAt = -1
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '(' || c === '{' || c === '[') depth++
    else if (c === ')' || c === '}' || c === ']') depth--
    else if (c === ':' && depth === 0) {
      if (s[i + 1] === '=') continue
      colonAt = i
    }
  }
  let concl = colonAt >= 0 ? s.slice(colonAt + 1).trim() : s

  /* 3) 结论还要剥掉残留参数 */
  concl = concl.replace(/^[({][^)}]*[)}]\s*/, '').trim()

  /* 4) 太短（例如只剩一个变量名）就回退到原签名 */
  if (concl.length < 8) concl = s

  concl = concl.replace(/\s+/g, ' ').trim()
  return concl.length > 140 ? concl.slice(0, 140) + ' …' : concl
}

const nodes = withDoc.map((t) => {
  const p = t.path.replace(/^Mathlib\//, '').replace(/\.lean$/, '')
  const url = `https://github.com/leanprover-community/mathlib4/blob/master/${t.path}`
  /* importance：签名信息量 + docstring 质量 */
  let imp = 0.5
  imp += Math.min(0.18, t.sig.length / 600)
  imp += Math.min(0.12, t.doc.length / 1200)
  if (/^(AlgebraicGeometry|AlgebraicTopology)/.test(p)) imp += 0.06
  imp = Math.round(Math.min(0.9, imp) * 100) / 100

  return {
    id: makeId(t.full),
    latex: pickLatex(t.sig),
    name: t.short,
    en: t.full,
    importance: imp,
    family: familyOfPath(t.path),
    summary: t.doc.slice(0, 180),
    detail: [
      `Lean 4 形式化陈述（mathlib4）`,
      ``,
      `定理名：${t.full}`,
      `类型签名：${t.sig}`,
      ``,
      t.doc,
      ``,
      `文件：${p}`,
      `⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，`,
      `  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。`,
    ].join('\n'),
    source: `mathlib4 · ${p}`,
    url,
    formal: true,
    lean: { full: t.full, kind: t.kind, signature: t.sig, file: t.path },
  }
})

/* 去重 id */
const byId = new Map()
for (const n of nodes) if (!byId.has(n.id)) byId.set(n.id, n)
const uniqNodes = [...byId.values()]

console.log(`\n生成形式化节点 ${uniqNodes.length}`)
const byFam = {}
for (const n of uniqNodes) byFam[n.family] = (byFam[n.family] || 0) + 1
console.log('按族:', JSON.stringify(byFam))

/* ── 关联：同文件的定理互连 + 同 namespace 互连 ── */
const links = []
const seen = new Set()
const byFile = new Map()
for (const n of uniqNodes) {
  const f = n.lean.file
  if (!byFile.has(f)) byFile.set(f, [])
  byFile.get(f).push(n)
}
for (const [f, list] of byFile) {
  /* 同文件内按顺序邻近的连起来（相邻定理通常主题相关） */
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < Math.min(i + 3, list.length); j++) {
      const a = list[i].id, b = list[j].id
      const k = a < b ? `${a}|${b}` : `${b}|${a}`
      if (seen.has(k)) continue
      seen.add(k)
      links.push([a, b, 0.22, '同文件', 'related'])
    }
  }
}
console.log(`同文件关联 ${links.length} 条`)

/* 孤立兜底 */
const touched = new Set()
for (const l of links) { touched.add(l[0]); touched.add(l[1]) }
const orphans = uniqNodes.filter((n) => !touched.has(n.id))
const famAnchor = new Map()
for (const n of uniqNodes) {
  if (!touched.has(n.id)) continue
  const cur = famAnchor.get(n.family)
  if (!cur || n.importance > cur.importance) famAnchor.set(n.family, n)
}
/* 全局兜底锚点：某族只有一个节点时（birational 只有 1 条），
 * famAnchor 里没有「已连通的同族节点」可选，会导致它孤立。
 * 退化到「全库最重要且已连通的节点」。 */
let globalAnchor = null
for (const n of uniqNodes) {
  if (!touched.has(n.id)) continue
  if (!globalAnchor || n.importance > globalAnchor.importance) globalAnchor = n
}

let oe = 0
for (const n of orphans) {
  let a = famAnchor.get(n.family)
  let label = '本族锚点'
  if (!a) { a = globalAnchor; label = '全局锚点' }
  if (!a || a.id === n.id) continue
  const k = a.id < n.id ? `${a.id}|${n.id}` : `${n.id}|${a.id}`
  if (seen.has(k)) continue
  seen.add(k)
  links.push([a.id, n.id, 0.12, label, 'related'])
  oe++
}
console.log(`兜底：孤立 ${orphans.length} 个，连上 ${oe} 条；总关联 ${links.length}`)

const dest = join(ROOT, 'src', 'data', 'mathlib-extra.js')
mkdirSync(dirname(dest), { recursive: true })
const body = `/**
 * src/data/mathlib-extra.js — 由 Lean mathlib4 抽取的**形式化**定理。
 *
 * ⚠ 生成物，不要手改。重新生成：
 *     node kb-src/probe-mathlib-tree.mjs   # 拿真实文件清单（省 GitHub 配额）
 *     node kb-src/fetch-mathlib.mjs --limit 120
 *     node kb-src/build-mathlib-nodes.mjs
 *
 * 来源：https://github.com/leanprover-community/mathlib4
 *
 * ═══ 这是知识库的第三个维度 ═══
 *   Stacks  → 定理性（人写、同行审阅）
 *   nLab    → 概念性（wiki 散文）
 *   mathlib → **形式化**（Lean 4 内核验证）
 *
 * 带 \`formal: true\` 的节点，其正确性由 Lean 内核保证（可 --trust=0 重编译），
 * 不依赖人类共识。但注意：
 *   · \`latex\` 字段是 **Lean 类型签名**，不是 LaTeX 排版
 *   · \`summary\` 是 Lean docstring 原文，不是本知识库撰写的中文
 *
 * 生成时间：${new Date().toISOString()}
 * 节点数：${uniqNodes.length}　关联数：${links.length}
 */

export const MATHLIB_NODES = ${JSON.stringify(uniqNodes, null, 1)}

export const MATHLIB_LINKS = ${JSON.stringify(links, null, 0).replace(/\],\[/g, '],\n  [')}
`
writeFileSync(dest, body, 'utf8')
console.log(`\n写入 ${dest}（${(Buffer.byteLength(body) / 1024).toFixed(1)} KB）`)
