/**
 * 全部 1620 条关联的**规范顺序**来源。
 *
 * ══ 为什么需要这个模块 ══
 *
 * 「全局 index」是整个类型工作的坐标系：分批判定按 index 写结果，
 * 灌库也按 index 找边。这个坐标系原本存在一个临时 dump 文件里
 * （scripts/_links-dump.json），但它是一次性脚手架，清理时被删掉了 ——
 * 于是 _apply-types.mjs 直接读不到东西。
 *
 * 教训：**坐标系不能由一个临时文件定义**。真正定义顺序的是数据文件
 * 本身的排列，所以这里就从数据文件里现读，不依赖任何中间产物。
 *
 * ══ 顺序为什么是固定的 ══
 *
 * 拼接顺序必须与当初 dump 时的顺序逐位一致，否则所有 index 都会错位：
 *   knowledge → conjectures → extra-a → extra-b → … → extra-h
 * 这个顺序由下面 FILES 数组的顺序唯一决定，改动它等于重排全部 index，
 * 会让 merged.txt 整体失效 —— 所以它旁边有 _assertOrder() 兜底。
 *
 * ══ 不做缓存 ══
 *
 * 每次调用都重新读文件。这些脚本都是手动跑的、秒级完成，
 * 缓存只会带来"我明明改了数据它却还是旧值"的困惑。
 */
import { readFileSync } from 'node:fs'

/** 文件与其中关联数组的名字，**顺序即全局 index 的顺序** */
export const LINK_FILES = [
  ['src/data/knowledge.js', 'LINKS'],
  ['src/data/conjectures.js', 'CONJECTURE_LINKS'],
  ['src/data/extra-a.js', 'EXTRA_A_LINKS'],
  ['src/data/extra-b.js', 'EXTRA_B_LINKS'],
  ['src/data/extra-c.js', 'EXTRA_C_LINKS'],
  ['src/data/extra-d.js', 'EXTRA_D_LINKS'],
  ['src/data/extra-e.js', 'EXTRA_E_LINKS'],
  ['src/data/extra-f.js', 'EXTRA_F_LINKS'],
  ['src/data/extra-g.js', 'EXTRA_G_LINKS'],
  ['src/data/extra-h.js', 'EXTRA_H_LINKS'],
]

/** 匹配一条边元组：`['src', 'dst', 0.9, '理由', 'type'],`
 *
 *  ⚠ 第 5 项必须写成**可选组**，否则类型还没写入时一条都匹配不到；
 *    而且匹配到了也要保留（下面把它取出来），不能悄悄丢掉 ——
 *    丢掉的话所有基于它的校验都会拿"没有类型的数据"去检验"类型判定"。
 *  ⚠ 用行首锚定 + 行尾 `],`：数据文件里有大量注释和模板字符串，
 *    不锚定会匹配到文档示例。 */
const TUPLE_RE = /^\s*\[\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*([0-9.]+)\s*,\s*'([^']*)'\s*(?:,\s*'([a-zA-Z]+)')?\s*\],\s*$/gm

/**
 * 读出全部关联，按规范顺序。
 * @returns {{index:number,file:string,array:string,src:string,dst:string,weight:number,label:string,type:string|null}[]}
 */
export function readAllLinks() {
  const out = []
  for (const [file, array] of LINK_FILES) {
    let text
    try { text = readFileSync(file, 'utf8') } catch { continue }
    let m
    TUPLE_RE.lastIndex = 0
    while ((m = TUPLE_RE.exec(text))) {
      out.push({
        index: out.length,
        file, array,
        src: m[1], dst: m[2], weight: Number(m[3]), label: m[4],
        type: m[5] || null,
      })
    }
  }
  return out
}

/** 期望的边数。1620 是这一整轮工作的基准数字，
 *  任何环节对不上都应该立刻报错而不是继续。 */
export const EXPECTED_LINKS = 1620

/**
 * 交叉核对用的**独立**来源：最初发给分类者的 12 个批次文件。
 *
 * 为什么需要"独立来源"：如果只拿数据文件跟 merged.txt 比，
 * 那验的是"我把 merged.txt 写进数据了吗"，而不是
 * "merged.txt 的第 i 行讲的是数据里第 i 条边吗"。
 * 后者才是真正会出错的地方（分批判定整体错位一行），
 * 而它必须用**分类者当时看到的那份文本**来验证 —— 就是 b00..b11。
 */
export function readBatchSources(dir = 'scripts/_batches') {
  const out = []
  for (let b = 0; b < 12; b++) {
    const name = `b${String(b).padStart(2, '0')}.txt`
    let text
    // 批次文件在清理时被收进了 _archive/，两个位置都试
    try { text = readFileSync(`${dir}/${name}`, 'utf8') }
    catch { try { text = readFileSync(`${dir}/_archive/${name}`, 'utf8') } catch { continue } }
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue
      const f = line.split('|')
      const idx = Number(f[0])
      if (!Number.isFinite(idx) || !f[1]) continue
      out[idx] = f[1]   // "src>dst"
    }
  }
  return out
}
