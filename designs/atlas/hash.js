/**
 * designs/atlas/hash.js — 深链编解码（M6 所有，SPEC §7.3）。纯函数，Node 下可测。
 *
 * 格式：#n=<encodeURIComponent(id)>&v=<cx>,<cy>,<L>；cx/cy 取整，L 两位小数；两段都可省略。
 * 取舍：decodeHash **永不抛**——深链来自地址栏，任何人都能手改或被聊天软件截断，
 * 坏的部分逐段忽略，好的部分照常生效（例如 n 有效而 v 坏了，仍然选中）。
 */

/** 一段数字：只接受普通十进制写法（拒绝 '0x10'、'Infinity'、空串这类 Number() 会放过的东西） */
const NUM = /^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i
const num = (s) => (NUM.test(s) ? Number(s) : NaN)

/**
 * @param {string} str        location.hash（可带 '#'）
 * @param {(id:string)=>boolean} [hasId]  id 是否存在；不存在的 id 忽略
 * @returns {{ node?: string, view?: { cx:number, cy:number, L:number } }}
 */
export function decodeHash(str, hasId = () => true) {
  const out = {}
  let s
  try { s = String(str ?? '') } catch { return out }
  s = s.replace(/^#+/, '')
  if (!s || s.length > 2048) return out
  for (const part of s.split('&')) {
    const i = part.indexOf('=')
    if (i <= 0) continue
    const k = part.slice(0, i), v = part.slice(i + 1)
    if (k === 'n' && !('node' in out)) {
      let id
      try { id = decodeURIComponent(v) } catch { continue }   // 截断的 %E0%A4 之类
      let ok
      try { ok = !!id && !!hasId(id) } catch { ok = false }
      if (ok) out.node = id
    } else if (k === 'v' && !('view' in out)) {
      let raw
      try { raw = decodeURIComponent(v) } catch { continue }
      const xs = raw.split(',')
      if (xs.length !== 3) continue
      const [cx, cy, L] = xs.map((t) => num(t.trim()))
      if ([cx, cy, L].every(Number.isFinite) && Math.abs(cx) < 1e7 && Math.abs(cy) < 1e7 && Math.abs(L) < 100) out.view = { cx, cy, L }
    }
    // 其它字段：忽略
  }
  return out
}

/** @returns {string} 不含 '#' */
export function encodeHash({ node, view } = {}) {
  const parts = []
  if (node) parts.push('n=' + encodeURIComponent(node))
  if (view && [view.cx, view.cy, view.L].every(Number.isFinite)) {
    const r = (x) => { const n = Math.round(x); return Object.is(n, -0) ? 0 : n }
    const L = Number(view.L.toFixed(2)), Ls = Object.is(L, -0) ? '0.00' : L.toFixed(2)
    parts.push(`v=${r(view.cx)},${r(view.cy)},${Ls}`)
  }
  return parts.join('&')
}
