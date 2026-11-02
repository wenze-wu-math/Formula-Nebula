/**
 * kb-src/parse-stacks.mjs — 从 Stacks Project 的 .tex 抽取结构化结果。
 *
 * 输入：kb-src/raw/*.tex（fetch-stacks.mjs 拉下来的官方源码）
 * 输出：kb-src/out/stacks-results.json —— 每条结果含
 *   { tag, file, env, label, title, statement, chapter, section, url }
 *
 * 为什么可靠：Stacks 的源码是高度规整的 LaTeX，
 *   每个结果都是 `\begin{<env>}` … `\end{<env>}`，
 *   紧跟 `\label{...}`，而 `\label` 与 tags/tags 索引里的 4 字符稳定标签一一对应。
 *   所以能确定性抽取，不需要 LLM 判断、不会幻觉。
 *
 * 用法：
 *   node kb-src/parse-stacks.mjs            # 解析 raw/ 下全部
 *   node kb-src/parse-stacks.mjs --stat     # 只统计不写文件
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const RAW = join(HERE, 'raw')
const OUT = join(HERE, 'out')
const TAGS = join(HERE, 'stacks-tags.txt')

const statOnly = process.argv.includes('--stat')

/* 结果类环境（含陈述）；proof 不算独立结果 */
const RESULT_ENVS = new Set([
  'theorem', 'proposition', 'lemma', 'corollary', 'definition',
  'example', 'exercise', 'remark', 'situation', 'construction', 'conjecture',
])

/* ── 读 tags 索引：4 字符标签 → 完整 label ── */
const tagByLabel = new Map()
for (const line of readFileSync(TAGS, 'utf8').split('\n')) {
  const m = /^([0-9A-Z]{4}),(.+)$/.exec(line.trim())
  if (m) tagByLabel.set(m[2].trim(), m[1])
}

/** 去掉 LaTeX 里不适合做"一句话陈述"的装饰 */
function cleanStatement(s) {
  return s
    .replace(/\\begin\{slogan\}[\s\S]*?\\end\{slogan\}/g, '')  // slogan 是通俗复述，单列
    /* 结果块里的结构性标记：\label（已单独抽走）、\begin{reference}…\end{reference}
     * 这类包裹环境只做排版，保留会让 statement 带着原始 TeX 泄漏到前端。 */
    .replace(/\\label\{[^}]*\}/g, ' ')
    .replace(/\\begin\{reference\}([\s\S]*?)\\end\{reference\}/g, ' ')
    .replace(/\\begin\{(slogan|reference|enumerate|itemize)\}/g, ' ')
    .replace(/\\end\{(slogan|reference|enumerate|itemize)\}/g, ' ')
    .replace(/\\(medskip|smallskip|bigskip|noindent|phantomsection)\b/g, ' ')
    .replace(/\\item\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 抽 slogan（Stacks 特有的"一句话人话解释"，极适合做 summary） */
function extractSlogan(body) {
  const m = /\\begin\{slogan\}([\s\S]*?)\\end\{slogan\}/.exec(body)
  return m ? m[1].replace(/\s+/g, ' ').trim() : ''
}

/** 抽结果正文里出现的交叉引用 label（用于建关联图） */
function extractRefs(body) {
  const out = new Set()
  const re = /\\ref\{([^}]+)\}/g
  let m
  while ((m = re.exec(body))) out.add(m[1])
  return [...out]
}

const files = readdirSync(RAW).filter((f) => f.endsWith('.tex'))
const results = []
let skipped = 0

for (const file of files) {
  const src = readFileSync(join(RAW, file), 'utf8')
  const stem = basename(file, '.tex')

  /* 跟踪当前 chapter / section，给结果归位 */
  let chapter = ''
  let section = ''

  /* 逐行扫描：同时维护 chapter/section 与结果块 */
  const lines = src.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const mCh = /\\chapter\{([^}]*)\}/.exec(line)
    if (mCh) { chapter = mCh[1]; section = ''; continue }
    const mSec = /\\section\{([^}]*)\}/.exec(line)
    if (mSec) { section = mSec[1]; continue }

    const mEnv = /\\begin\{(\w+)\}/.exec(line)
    if (!mEnv || !RESULT_ENVS.has(mEnv[1])) continue

    const env = mEnv[1]
    /* 找配对的 \end{env}（Stacks 不嵌套同名环境） */
    let depth = 1, j = i + 1
    const bodyLines = []
    while (j < lines.length && depth > 0) {
      const l = lines[j]
      if (new RegExp(`\\\\begin\\{${env}\\}`).test(l)) depth++
      if (new RegExp(`\\\\end\\{${env}\\}`).test(l)) { depth--; if (depth === 0) break }
      bodyLines.push(l)
      j++
    }
    const body = bodyLines.join('\n')

    /* label：通常是 body 第一行 */
    const mLab = /\\label\{([^}]+)\}/.exec(body)
    if (!mLab) { skipped++; i = j; continue }
    const label = mLab[1]
    /* tags/tags 索引里的 full_label 是 **`文件stem-局部label`**（例：
     *   schemes.tex 里 \label{lemma-xxx} → `schemes-lemma-xxx`）。
     * 直接拿局部 label 去查会 100% 落空 —— 这是踩过的坑。 */
    const tag = tagByLabel.get(`${stem}-${label}`) || tagByLabel.get(label) || ''

    /* 可选标题：\begin{lemma}[标题] —— 本行 env 后面可能带 [] */
    const mTitle = /\\begin\{\w+\}\s*\[([^\]]*)\]/.exec(line)
    const title = mTitle ? mTitle[1].trim() : ''

    results.push({
      tag,
      file: stem,
      env,
      label,
      title,
      chapter,
      section,
      slogan: extractSlogan(body),
      statement: cleanStatement(body),
      refs: extractRefs(body),
      url: tag ? `https://stacks.math.columbia.edu/tag/${tag}` : '',
    })
    i = j
  }
}

/* ── 统计 ── */
const byEnv = {}
for (const r of results) byEnv[r.env] = (byEnv[r.env] || 0) + 1
const withTag = results.filter((r) => r.tag).length
const withSlogan = results.filter((r) => r.slogan).length

console.log(`文件 ${files.length} 个`)
console.log(`结果总数 ${results.length}（跳过无 label 的 ${skipped} 个）`)
console.log(`有稳定 tag ${withTag}（${(100 * withTag / results.length).toFixed(1)}%）`)
console.log(`有 slogan  ${withSlogan}（${(100 * withSlogan / results.length).toFixed(1)}%）`)
console.log('按环境：')
for (const [k, v] of Object.entries(byEnv).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(14)} ${v}`)
console.log('按文件（前 15）：')
const byFile = {}
for (const r of results) byFile[r.file] = (byFile[r.file] || 0) + 1
for (const [k, v] of Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`  ${k.padEnd(22)} ${v}`)

if (!statOnly) {
  mkdirSync(OUT, { recursive: true })
  const dest = join(OUT, 'stacks-results.json')
  writeFileSync(dest, JSON.stringify(results, null, 1), 'utf8')
  console.log(`\n写入 ${dest}（${(Buffer.byteLength(JSON.stringify(results)) / 1048576).toFixed(1)} MB）`)
}
