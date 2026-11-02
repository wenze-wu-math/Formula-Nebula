/**
 * designs/manuscript/formulas-key.js — 预排版缓存的格式约定（formulas.js 与生成脚本 formulas-build.mjs 共用）。
 *
 * 缓存条目只有在 key 完全一致时才被采用：key = 版本 | 字号 | 墨色 | latex 原文。
 * 知识库里某条 latex 改了 → key 对不上 → 该条回落到 worker 现排，绝不会显示过期公式。
 * 改了 tex.js 的排版配置（字号、宏包、尺寸修正）时把 CACHE_VER 加一，整份缓存作废。
 */
export const CACHE_VER = 'mj1'
export const CACHE_FILE = 'formulas-cache.json'

export function cacheKey(texEm, color, latex) { return `${CACHE_VER}|${texEm}|${color}|${latex}` }

/** 字形路径字典编码：MathJax 每个 SVG 都内联自己用到的字形路径（fontCache:'local'），
 *  464 条公式里只有 ~300 种不同路径，换成 @序号 后体积从 5.2 MB 降到 ~2 MB。 */
export function encodePaths(svg, dict, index) {
  return svg.replace(/ d="([^"@][^"]*)"/g, (_, d) => {
    let k = index.get(d)
    if (k === undefined) { k = dict.length; dict.push(d); index.set(d, k) }
    return ` d="@${k}"`
  })
}
export function decodePaths(svg, dict) {
  return svg.replace(/ d="@(\d+)"/g, (m, k) => {
    const d = dict[+k]
    return typeof d === 'string' ? ` d="${d}"` : m
  })
}
