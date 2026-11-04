/**
 * 证明页路由的纯函数工具（零浏览器依赖）。
 *
 * 证明页不进入 three.js 场景，因此它的路由只处理地址栏字符串：
 *   · `?p=<id>` 是对人友好的短链接形式；
 *   · `#v1&k=<id>` 是与星云设置 hash 共存的规范形式。
 *
 * 这里不验证 id 是否属于当前知识库。数据可能在构建后才加载，且
 * 路由模块会被 Node 验证脚本直接 import；实际存在性检查留给调用方。
 * 所有公开函数都对畸形输入兜底，不把地址栏错误变成启动异常。
 */

import {
  PROOF_HASH_KEY,
  PROOF_QUERY_KEY,
  decodeLocationState,
  encodeState,
} from './urlState.js'

/** 取一个可用于地址栏的非空 id；其他输入视为空。 */
export function normalizeProofId(id) {
  if (typeof id !== 'string') return ''
  return id.trim()
}

/**
 * 生成 query 形式的证明页链接。
 *
 * 默认返回 `?p=<id>`。传入 `pathname` / `query` / `hash` 可把它拼进
 * 当前页面，例如 encodeProofLink('foo', { pathname: '/', hash: 'v1' })。
 * query 中已有的 p 会被替换，其他参数保持不动。
 */
export function encodeProofLink(id, options = {}) {
  const proof = normalizeProofId(id)
  if (!proof) return ''

  const o = options && typeof options === 'object' ? options : {}
  const pathname = typeof o.pathname === 'string' ? o.pathname : ''
  let query = typeof o.query === 'string' ? o.query : ''
  let hash = typeof o.hash === 'string' ? o.hash : ''

  try {
    if (query.startsWith('?')) query = query.slice(1)
    const params = new URLSearchParams(query)
    params.set(PROOF_QUERY_KEY, proof)
    const encoded = params.toString()
    const q = encoded ? `?${encoded}` : ''
    if (hash && !hash.startsWith('#')) hash = `#${hash}`
    // No pathname/query/hash supplied still intentionally returns `?p=...`.
    return `${pathname}${q}${hash}`
  } catch {
    // URLSearchParams should not throw for strings, but this module is used in
    // startup and validation paths where a safe fallback is preferable.
    return `${pathname || ''}?${PROOF_QUERY_KEY}=${encodeURIComponent(proof)}`
  }
}

/** 生成规范 hash 形式（不含开头的 #）。可带其它星云状态字段。 */
export function encodeProofHash(id, state = {}) {
  const proof = normalizeProofId(id)
  if (!proof) return encodeState(state && typeof state === 'object' ? state : {})
  const s = state && typeof state === 'object' ? state : {}
  return encodeState({ ...s, proof })
}

/**
 * 从 query/hash 中取证明 id。返回完整解码状态，便于调用方同时恢复
 * 视图、形态与显示开关；非法或空输入始终返回安全空壳。
 */
export function decodeProofRoute(search = '', hash = '') {
  return decodeLocationState(search, hash)
}

/** 仅取证明 id；找不到或输入畸形时返回 undefined。 */
export function proofIdFromLocation(search = '', hash = '') {
  const state = decodeProofRoute(search, hash)
  return state && typeof state.proof === 'string' && state.proof
    ? state.proof
    : undefined
}

/**
 * 移除 query 形式的证明路由，同时保留其它查询参数。
 * hash 原样返回，适合"回到星云"按钮构造地址。
 */
export function withoutProofQuery(search = '') {
  let query = typeof search === 'string' ? search : ''
  try {
    if (query.startsWith('?')) query = query.slice(1)
    const params = new URLSearchParams(query)
    params.delete(PROOF_QUERY_KEY)
    const encoded = params.toString()
    return encoded ? `?${encoded}` : ''
  } catch {
    return ''
  }
}

export { PROOF_HASH_KEY, PROOF_QUERY_KEY }

