/**
 * designs/map/src/hash.js — 深链编解码（编排模块，SPEC §10.4）。纯函数，Node 可测，顶层不碰 DOM。
 *
 * 格式：`#v1&n=<id>&c=<x>,<y>,<s>`，各段可选。
 *   n = 选中 id（encodeURIComponent）；c = canvas 中心的世界坐标（取整）+ 语义尺度 s（2 位小数）。
 *
 * 取舍（沿用原应用 src/urlState.js 的思路）：
 *   · decode **永不抛异常**：hash 是不可信输入（手改、截断、聊天软件折行），任何一次抛出都发生在
 *     启动路径上 → 白屏。所以每一段独立解析，坏一段只丢一段，并把原因记进 warnings。
 *   · 相机存的是 s（= z / zFit）而不是 z：s 与屏幕尺寸无关，对方窗口大小不同也能看到同一级别的细节。
 *     x/y 是 canvas 中心，面板打开与否会让构图略偏 —— 可接受，因为带 n 的链接打开时面板也会打开。
 *
 * 版本号规则（2026-11-01 修正）：**裸参数也接受**。
 *   原先第一段不是 v1 就整条忽略，于是 `#n=scheme`（无版本号）被丢掉 —— 而这是最自然的手写形式，
 *   外部工具（designs/verify.mjs、别人贴的链接）也普遍这么写。现在按"第一段有没有 '='" 区分：
 *     · 第一段 === 'v1'        → 有版本号，跳过它继续解析（encodeHash 的输出形式）
 *     · 第一段含 '='           → 没有版本号，就是参数本身，从头解析
 *     · 第一段不含 '=' 且不是 v1 → 它是个（不认识的）版本号，整条忽略 —— 不去猜别的版本的字段含义
 */
import { ZOOM_MIN_S, ZOOM_MAX_S } from './constants.js'

export const HASH_VERSION = 'v1'

/** 世界坐标允许的范围（比 WORLD_BOUNDS 宽一些；真正的夹取交给 clampView） */
const COORD_LIMIT = 100000

/**
 * @param {{id?: string|null, cam?: {x:number, y:number, s:number}|null}} st
 * @returns {string} 以 '#' 开头；什么都没有时返回 '#v1'
 */
export function encodeHash(st = {}) {
  const parts = [HASH_VERSION]
  try {
    if (st && typeof st.id === 'string' && st.id) parts.push('n=' + encodeURIComponent(st.id))
    const c = st && st.cam
    if (c && [c.x, c.y, c.s].every((v) => typeof v === 'number' && isFinite(v))) {
      const s = Math.round(c.s * 100) / 100
      parts.push(`c=${Math.round(c.x)},${Math.round(c.y)},${s.toFixed(2)}`)
    }
  } catch { /* 编码只处理自己产出的状态，不会走到这里；兜底仍返回合法串 */ }
  return '#' + parts.join('&')
}

/** 安全的 decodeURIComponent：非法转义（如 '%E0%A4%A'）返回 null */
function safeDecode(s) {
  try { return decodeURIComponent(s) } catch { return null }
}

/**
 * @param {string} hash location.hash（可带或不带 '#'），任何类型都可传
 * @param {{has?: (id: string) => boolean}} [opt] has：id 是否存在（不传则不校验）
 * @returns {{ok: boolean, id: string|null, cam: {x,y,s}|null, warnings: string[]}}
 *   ok=false 表示整条被忽略（空、版本不对）；id/cam 为 null 表示该段缺失或非法
 */
export function decodeHash(hash, opt = {}) {
  const out = { ok: false, id: null, cam: null, warnings: [] }
  try {
    let h = typeof hash === 'string' ? hash : ''
    if (h.startsWith('#')) h = h.slice(1)
    if (!h) return out
    const segs = h.split('&')
    let start = 0
    if (segs[0] === HASH_VERSION) {
      start = 1
    } else if (segs[0].indexOf('=') < 0) {
      // 第一段不含 '=' → 它被当作版本号，但不是我们认识的那个
      out.warnings.push(`版本「${segs[0].slice(0, 16)}」不是 ${HASH_VERSION}，整条忽略`)
      return out
    } else {
      // 裸参数（无版本号）：`#n=scheme`、`#c=10,20,3` 这类，照常解析
      out.warnings.push('深链没有版本号，按 v1 解析')
    }
    out.ok = true
    for (const seg of segs.slice(start)) {
      if (!seg) continue
      const eq = seg.indexOf('=')
      const key = eq < 0 ? seg : seg.slice(0, eq)
      const val = eq < 0 ? '' : seg.slice(eq + 1)
      if (key === 'n') {
        const id = safeDecode(val)
        if (!id) { out.warnings.push('n 段无法解码，忽略'); continue }
        if (opt.has && !safeHas(opt.has, id)) { out.warnings.push(`id「${id.slice(0, 40)}」不存在，忽略`); continue }
        out.id = id
      } else if (key === 'c') {
        const raw = safeDecode(val)
        const m = raw && /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+(?:\.\d+)?)$/.exec(raw.trim())
        if (!m) { out.warnings.push('c 段格式应为 x,y,s，忽略'); continue }
        const x = Number(m[1]), y = Number(m[2]), s = Number(m[3])
        if (![x, y, s].every(isFinite) || Math.abs(x) > COORD_LIMIT || Math.abs(y) > COORD_LIMIT || s <= 0) {
          out.warnings.push('c 段数值越界，忽略'); continue
        }
        out.cam = { x, y, s: Math.min(ZOOM_MAX_S, Math.max(ZOOM_MIN_S, s)) }
      } else {
        // 未知字段：可能是将来同版本新增的可选段，静默忽略
      }
    }
  } catch (e) {
    out.warnings.push('解析失败：' + ((e && e.message) || e))
  }
  return out
}

function safeHas(has, id) {
  try { return !!has(id) } catch { return false }
}
