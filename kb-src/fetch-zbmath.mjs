/**
 * kb-src/fetch-zbmath.mjs — 从 zbMATH Open API 拉取数学家档案。
 *
 * 渠道说明（实测）：
 *   · HTML 页面 https://zbmath.org/authors/ 直连/代理都返回 403
 *   · API https://api.zbmath.org/v1/ 返回 200 —— 用这个
 *
 * API 提供的字段（实测，别高估）：
 *   ✅ name / code / zbmath_url          稳定标识与链接
 *   ✅ awards                           获奖记录（Fields/Wolf/Shaw…含年份与 Wikidata）
 *   ✅ external_ids                     MGP / Wikidata / MacTutor / GND / homepage
 *   ✅ main_fields                      MSC 分类分布（field + count + percent）
 *   ✅ spellings                        姓名变体（可判断中英文写法）
 *   ❌ coauthors                        没有合作者网络
 *   ❌ publications 列表                没有逐篇文献
 *   ❌ institution                      没有当前机构
 *
 * 所以本脚本只采集**能复核的硬事实**，叙述性内容（summary/detail/focus）
 * 留给人工或后续环节，不在这里编造。
 *
 * 用法：
 *   node kb-src/fetch-zbmath.mjs                    # 采集默认名单
 *   node kb-src/fetch-zbmath.mjs --names a,b,c      # 自定义
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/* 默认名单：代数几何史上与当代的代表人物。
 * 选取标准：MSC 14 为主领域、有明确贡献、能在 zbMATH 精确命中。 */
const DEFAULT_NAMES = [
  // 奠基者
  'Zariski, Oscar', 'Grothendieck, Alexander', 'Serre, Jean-Pierre',
  'Weil, Andre', 'Mumford, David', 'Hironaka, Heisuke',
  'Hartshorne, Robin', 'Deligne, Pierre', 'Faltings, Gerd',
  'Kodaira, Kunihiko', 'Atiyah, Michael', 'Griffiths, Phillip',
  'Mori, Shigefumi', 'Kawamata, Yujiro', 'Kollar, Janos',
  // 当代
  'Scholze, Peter', 'Voevodsky, Vladimir', 'Lurie, Jacob',
  'Bhatt, Bhargav', 'Gaitsgory, Dennis', 'Fargues, Laurent',
  'Kedlaya, Kiran', 'Cesnavicius, Kestutis', 'Raskin, Sam',
  'Hacon, Christopher', 'McKernan, James', 'Birkar, Caucher',
  'Xu, Chenyang', 'Abramovich, Dan', 'Olsson, Martin',
  'Stacks, Aise Johan de Jong', 'Conrad, Brian', 'Vakil, Ravi',
  'Poonen, Bjorn', 'Kisin, Mark', 'Emerton, Matthew',
  'Beilinson, Alexander', 'Drinfeld, Vladimir', 'Kontsevich, Maxim',
  'Simpson, Carlos', 'Ngo, Bao Chau', 'Lafforgue, Laurent',
  'Illusie, Luc', 'Berthelot, Pierre', 'Ogus, Arthur',
  'Bhatt, Bhargav', 'Bhatt, Bhargav',
]

const args = process.argv.slice(2)
const ni = args.indexOf('--names')
const names = ni >= 0 ? args[ni + 1].split(';').map((s) => s.trim()).filter(Boolean) : DEFAULT_NAMES
const uniq = [...new Set(names)]

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return await r.json()
}

/** 规范化姓名用于比对："Mumford, David" vs "Mumford, David Bryant" */
function normName(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // 去变音符号
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

/** 姓名匹配：要求「姓完全一致」且「名首词出现在结果里」。
 *  ⚠ 不能只用 includes —— 实测 `Voevodsky` 会命中 `Voevodskiĭ, Vladimir`（对），
 *  但 `Voevodskiĭ` 也命中过一个 MSC 74 的无关条目。所以要求姓精确、名也匹配。 */
function nameMatches(query, got) {
  const [qLastRaw, qFirstRaw] = String(query).split(',').map((x) => (x || '').trim())
  if (!qLastRaw) return false
  const qLast = normName(qLastRaw)
  const gotLower = String(got || '').toLowerCase()
  const [gLastRaw, gFirstRaw] = String(got || '').split(',').map((x) => (x || '').trim())
  const gLast = normName(gLastRaw)

  /* 姓必须完全一致（去变音后） */
  if (qLast !== gLast) return false
  /* 名：查询里的第一个词必须出现在结果的名里 */
  if (!qFirstRaw) return true
  const qFirst = normName(qFirstRaw.split(/\s+/)[0])
  const gFirst = normName(gFirstRaw)
  return gFirst.startsWith(qFirst) || gFirst.includes(qFirst)
}

mkdirSync(OUT, { recursive: true })
const dest = join(OUT, 'zbmath-authors.json')
const existing = existsSync(dest) ? JSON.parse(readFileSync(dest, 'utf8')) : {}
const store = { ...existing }

let ok = 0, miss = 0, fail = 0
for (const name of uniq) {
  if (store[name]?.code) { ok++; continue }   // 已有则跳过（增量）
  try {
    const r = await get(`https://api.zbmath.org/v1/author/_search?search_string=${encodeURIComponent(name)}&page=0&results_per_page=5`)
    const hits = r.result || []
    const exact = hits.find((x) => nameMatches(name, x.name)) || null
    if (!exact) {
      store[name] = { _miss: true, _candidates: hits.map((x) => x.name) }
      miss++
      console.log(`  ⚠ ${name} → 无精确匹配（候选：${hits.map((x) => x.name).join(' / ') || '无'}）`)
      continue
    }
    store[name] = exact
    ok++
    const aw = (exact.awards || []).map((a) => a.title).join(',')
    const msc = (exact.main_fields || []).slice(0, 3).map((f) => `${f.field}(${f.count})`).join(' ')
    console.log(`  ✅ ${name.padEnd(30)} code=${exact.code}  MSC:${msc}${aw ? '  奖项:' + aw : ''}`)
  } catch (e) {
    fail++
    console.log(`  ✗ ${name} → ${e.message}`)
  }
  /* 温和限速，避免被 ban */
  await new Promise((r) => setTimeout(r, 220))
}

writeFileSync(dest, JSON.stringify(store, null, 1), 'utf8')
console.log(`\n完成：命中 ${ok}，未命中 ${miss}，失败 ${fail}，共 ${Object.keys(store).length} 条 → ${dest}`)
