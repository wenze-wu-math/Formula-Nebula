/**
 * designs/manuscript/hash.js — 深链：#n=<id>&q=<query>&v=<x>,<y>,<z>（SPEC §8.5）。
 *
 * 取舍：
 *   · 不用 URLSearchParams 编码：它把 `:` `,` 空格都转义（status%3Aopen、+），链接不好读也不好手改。
 *     这里只转义真正有歧义的字符（& = # % 与控制字符、空白），其余原样保留，例如 #q=status:open&v=5360,3490,0.120。
 *   · 解析面对的是**不可信输入**（别人贴来的链接），所以永不抛异常：坏的 %-序列按原文处理，
 *     数值不是有限数就整项忽略，id 必须真实存在才采用，zoom 钳到合法范围。
 *   · 与原星云的 `#v1&…` 不冲突：那种 hash 里没有 n= / q= / v=<三个数> 时，这里什么也解析不到。
 */
import { state } from './state.js'
import { ZOOM } from './constants.js'

const MAX_ID = 200
const MAX_Q = 500
const MAX_COORD = 1e6

/** 宽容的 decodeURIComponent：坏序列（如 %%%）不抛，保留原文 */
function decode(s) {
  try { return decodeURIComponent(s.replace(/\+/g, ' ')) } catch { return s }
}

/** 只转义会破坏 hash 结构或不可见的字符 */
function encode(s) {
  return Array.from(String(s), (c) => (c.charCodeAt(0) < 33 || c.charCodeAt(0) === 127 || '%&=#+'.includes(c) ? encodeURIComponent(c) : c)).join('')
}

/**
 * @param {string} hash  location.hash（可带 #）
 * @param {{has?:(id:string)=>boolean, zMin?:number, zMax?:number}} [opts]
 *        has：id 是否存在（默认查 state.graph.byId）；zMin/zMax：zoom 钳制范围（默认按 state.fitZoom 与 ZOOM.MAX）
 * @returns {{id:string|null, query:string, view:{x:number,y:number,z:number}|null}}
 */
export function parseHash(hash, opts = {}) {
  const out = { id: null, query: '', view: null }
  try {
    let s = typeof hash === 'string' ? hash : String(hash ?? '')
    s = s.replace(/^[#?]+/, '')
    if (!s) return out
    const seen = new Set()
    for (const part of s.split('&')) {
      const eq = part.indexOf('=')
      if (eq <= 0) continue
      const key = part.slice(0, eq)
      if (seen.has(key)) continue   // 重复参数：第一个为准
      seen.add(key)
      const val = decode(part.slice(eq + 1))
      if (key === 'n') {
        const id = val.trim()
        if (id && id.length <= MAX_ID && hasId(id, opts)) out.id = id
      } else if (key === 'q') {
        if (val.length <= MAX_Q) out.query = val.trim() ? val : ''
      } else if (key === 'v') {
        const nums = val.split(',')
        if (nums.length !== 3) continue
        const [x, y, z] = nums.map((t) => (t.trim() === '' ? NaN : Number(t)))
        if (![x, y, z].every(Number.isFinite) || z <= 0) continue
        if (Math.abs(x) > MAX_COORD || Math.abs(y) > MAX_COORD) continue
        out.view = { x, y, z: clampZ(z, opts) }
      }
    }
  } catch { /* 任何意外：返回已解析出的部分 */ }
  return out
}

function hasId(id, opts) {
  try {
    if (typeof opts.has === 'function') return !!opts.has(id)
    const g = state.graph
    return g ? g.byId.has(id) : true
  } catch { return false }
}

function clampZ(z, opts) {
  const lo = Number.isFinite(opts.zMin) ? opts.zMin : (state.fitZoom > 0 ? state.fitZoom * ZOOM.MIN_FACTOR : 0.01)
  const hi = Number.isFinite(opts.zMax) ? opts.zMax : ZOOM.MAX
  return Math.max(lo, Math.min(hi, z))
}

/**
 * @param {{id?:string|null, query?:string, view?:{x,y,z}|null}} s
 * @returns {string} 不含 # 的 hash；没有可存的状态时返回 ''。有选中时只写 n（与 q），不写 v。
 */
export function encodeHash({ id, query, view } = {}) {
  const parts = []
  if (id) parts.push(`n=${encode(id)}`)
  if (query && String(query).trim()) parts.push(`q=${encode(query)}`)
  if (!id && view && [view.x, view.y, view.z].every(Number.isFinite)) {
    // zoom 保留 3 位有效数字以上：全卷约 0.12，写成 0.120；放大到 2.5 写成 2.500
    parts.push(`v=${Math.round(view.x)},${Math.round(view.y)},${view.z < 1 ? view.z.toFixed(4) : view.z.toFixed(3)}`)
  }
  return parts.join('&')
}
