/**
 * designs/map/src/rules.js — 语义缩放与制图规则（架构师冻结，纯函数，可在 Node 下测试）。
 *
 * 为什么单独一个文件：「某级别画不画这条路 / 这个城市标公式还是只标名字 / 谁的标签优先」
 * 同时决定 render（画什么）、labels（标什么、避让什么）、ui（图例写什么）。
 * 三处各写一份就会出现"图上画了城市却永远标不上名字"之类的错位。规则详见 SPEC §4。
 */
import { ZOOM_LEVELS, SYMBOL_SCALE, CITY_SYMBOL, PORT, LABEL_SIZE } from './constants.js'

/** 语义级别 0..3。s = zoom / zFit */
export function levelOf(s) {
  if (s < ZOOM_LEVELS[0]) return 0
  if (s < ZOOM_LEVELS[1]) return 1
  if (s < ZOOM_LEVELS[2]) return 2
  return 3
}

/**
 * 符号整体缩放。
 *
 * ═══ 为什么改成按 s 连续缩放（2026-11-02 修）═══
 *
 * 用户反馈："B方案整个世界太小了，所有城市全挤一起了。"
 *
 * 之前只按 level（0..3）取 SYMBOL_SCALE = [0.9, 1.0, 1.15, 1.3] ——
 * 缩小态（level 0）只降到 0.9，而全图时 4,152 个点的屏幕最近邻只有
 * **p10 = 3.5px**，村落符号直径 4.4px（2.2×0.9×2），必然重叠成一片。
 *
 * 加大世界尺寸**没用**：全图适配时 zoom 会自动缩小，屏幕间距保持不变
 * （实测 1×/2×/3× 世界的屏幕 p10 都是 3.5px 量级）。
 * 真正要调的是"符号在屏幕上占多大"。
 *
 * 改法：在 level 的基础上再乘一个按 s = zoom/zFit 的连续因子。
 *   · s ≥ 1（拉近）：符号按 SYMBOL_SCALE 放大，不受影响
 *   · s < 1（拉远）：额外乘 s^0.45，让符号跟着缩小
 * 下限 0.42：再小就看不清符号类型了。
 *
 * 实测（4,152 点，全图 s≈1）：level 0 时 0.9 → 仍偏大，
 * 配合 s^0.45 后在更远的档位能降到 0.42，屏幕间距（3.5px）与
 * 符号直径（4.4×0.42 ≈ 1.85px）拉开。
 */
export function symbolScale(level, s = 1) {
  const base = SYMBOL_SCALE[Math.max(0, Math.min(3, level))]
  if (!(s > 0) || s >= 1) return base
  return Math.max(0.42, base * Math.pow(s, 0.45))
}

/**
 * 给定理 / 猜想 / 研究者分 tier（world 构建时调用一次）。
 *   定理：族内按 importance 降序（并列按 degree 降序、再按 id）排名 r：
 *         r = 0 → 0（首都，每族恰 1 个）；r < 12% → 1（大城市）；r < 42% → 2（城镇）；其余 3（村落）
 *   猜想：importance ≥ .88 → 1；≥ .76 → 2；其余 3
 *   研究者：一律 2（港口不分级）
 * @param {object[]} nodes graph.nodes
 * @returns {Map<string, number>} id → tier
 */
export function assignTiers(nodes) {
  const out = new Map()
  const byFam = new Map()
  for (const n of nodes) {
    if (n.researcher) { out.set(n.id, 2); continue }
    if (n.cluster) { out.set(n.id, n.importance >= 0.88 ? 1 : n.importance >= 0.76 ? 2 : 3); continue }
    if (!byFam.has(n.family)) byFam.set(n.family, [])
    byFam.get(n.family).push(n)
  }
  for (const list of byFam.values()) {
    list.sort((a, b) => (b.importance - a.importance) || (b.degree - a.degree) || (a.id < b.id ? -1 : 1))
    const N = list.length
    list.forEach((n, r) => out.set(n.id, r === 0 ? 0 : r < 0.12 * N ? 1 : r < 0.42 * N ? 2 : 3))
  }
  return out
}

/** place.kind：'city' | 'island' | 'port' */

/**
 * 符号在屏幕上的半径（px）。render 画符号、labels 做符号避让、interact 做点选都用它。
 * island 的半径随缩放变化（它是世界尺寸的陆地），city/port 是固定屏幕尺寸的符号。
 */
export function symbolRadius(place, level, zoom, zFit = zoom) {
  /* zFit 用来算语义缩放比 s = zoom/zFit：拉远时符号要跟着变小，
   * 否则 4,152 个点的全图视图会糊成一片（详见 symbolScale 注释）。 */
  const k = symbolScale(level, zFit > 0 ? zoom / zFit : 1)
  if (place.kind === 'city') return CITY_SYMBOL[place.tier].r * k
  if (place.kind === 'port') return PORT.r * k
  return Math.max(4, place.r * zoom)   // island
}

/**
 * 某级别下标签的"基础模式"（未选中、未命中搜索时）：
 *   'formula' = 公式 + 中文名；'name' = 只有中文名；'none' = 不标
 * labels 模块按 [基础模式, 降级…] 依次尝试放置，放不下就降级（formula → name → none）。
 */
export function baseLabelMode(place, level) {
  const t = place.tier
  if (place.kind === 'port') return level >= 2 ? 'name' : 'none'
  if (place.kind === 'island') {
    if (level === 0) return t <= 1 ? 'name' : 'none'
    if (level === 1) return t <= 1 ? 'formula' : t === 2 ? 'name' : 'none'
    if (level === 2) return t <= 2 ? 'formula' : 'name'
    return 'formula'
  }
  // city
  if (level === 0) return t === 0 ? 'formula' : t === 1 ? 'name' : 'none'
  if (level === 1) return t <= 1 ? 'formula' : t === 2 ? 'name' : 'none'
  if (level === 2) return t <= 2 ? 'formula' : 'name'
  return 'formula'
}

/**
 * 实际要尝试的模式序列（第一项是首选，后续是降级）。
 * 选中节点、其一跳邻居、搜索命中：在 L0/L1 也至少尝试 'formula'（选中本身面板里也有公式，
 * 但地图上看到邻居的公式是"路线高亮"的意义所在）。
 */
export function labelModes(place, level, flags) {
  const base = baseLabelMode(place, level)
  const boosted = flags && (flags.selected || flags.neighbour || flags.hit)
  if (place.kind === 'port') return boosted || base === 'name' ? ['name'] : []
  const first = boosted ? 'formula' : base
  if (first === 'formula') return ['formula', 'name']
  if (first === 'name') return ['name']
  return []
}

/**
 * 碰撞优先级（大者先放）。
 * 选中 > 悬停 > 一跳邻居 > 搜索命中 > tier > importance。上一帧已放置的同一标签再 +0.5（防闪烁的滞回）。
 */
export function labelPriority(place, flags) {
  let p = (3 - place.tier) * 10 + place.importance * 5
  if (place.kind === 'island') p += 3          // 海上标签少竞争，但别被陆地小镇挤掉
  if (place.kind === 'port') p -= 4
  if (flags) {
    if (flags.selected) p += 1000
    if (flags.hover) p += 500
    if (flags.neighbour) p += 200
    if (flags.hit) p += 100
    if (flags.wasPlaced) p += 0.5
  }
  return p
}

/**
 * 道路在某级别是否画出（未选中状态）。选中后，选中节点的所有 link 一律以高亮路线画出（另一层）。
 * road.kind：'road' | 'highway' | 'crossroad' | 'crossway' | 'ferry' | 'lane' | 'expedition'
 *
 * 2026-11-01 修正（道路密度）：原先 crossway 无条件可见，于是 L0 总览一次画出 80 条跨境公路，
 * 加上跨族强关联本身就密，画面被橙色网线糊住（交接文档记的"跨族道路太多太乱"）。
 * 现在默认**不画跨族道路**，只保留同族高速（highway，L1 起）——同族路网构成国与国之间干净的留白。
 * 跨族关系由 UI 的「跨族道路」开关按权重取 top N 显式打开（见 showCross），默认关闭。
 * 跨族关系并没有丢：选中任一节点时，它的全部关联都以高亮路线画出（drawHighlight 不看 roadVisible）。
 */
export function roadVisible(road, level, opt) {
  switch (road.kind) {
    case 'crossway': return !!(opt && opt.showCross) && level >= (opt && opt.crossMinLevel != null ? opt.crossMinLevel : 0)
    case 'highway': return level >= 1
    case 'crossroad': return !!(opt && opt.showCross) && level >= 2
    case 'road': return level >= 2
    case 'ferry': return road.hero ? level >= 1 : level >= 2
    case 'lane': return level >= 3
    case 'expedition': return false              // 只在选中时出现
    default: return false
  }
}
/** 道路透明度（总览时跨境公路要淡，免得盖住国名） */
export function roadAlpha(road, level) {
  if (road.kind === 'crossway') return level === 0 ? 0.45 : level === 1 ? 0.7 : 0.85
  return 0.9
}

/** 跨族道路默认显示条数上限（按 link 权重取 top N；0 = 默认完全不画）。 */
export const CROSS_ROAD_TOP_N = 0
/** UI 开关打开时显示的跨族道路条数上限（按权重降序取前 N） */
export const CROSS_ROAD_SHOW_N = 40

/**
 * 从 world.roads 里按权重取前 N 条跨族道路的 key 集合。
 * @param {Array} roads world.roads
 * @param {number} n 上限
 * @returns {Set<string>}
 */
export function topCrossRoadKeys(roads, n) {
  if (!(n > 0)) return new Set()
  const cross = []
  for (const r of roads) {
    if (r.kind !== 'crossway' && r.kind !== 'crossroad') continue
    cross.push(r)
  }
  cross.sort((a, b) => (b.weight - a.weight) || (b.hero - a.hero) || String(a.key).localeCompare(String(b.key)))
  return new Set(cross.slice(0, n).map((r) => r.key))
}

/** 名字截断（按"字符"计，CJK 与拉丁一视同仁；完整名留给面板/tooltip） */
export function truncName(name) {
  const chars = [...String(name || '')]
  return chars.length > LABEL_SIZE.maxNameChars ? chars.slice(0, LABEL_SIZE.maxNameChars - 1).join('') + '…' : chars.join('')
}

/**
 * 符号是否作为标签的避让障碍。总览时 400 个村落点若都算障碍，任何标签都放不下，
 * 所以低级别只让"画得显眼"的符号参与避让（村落点允许被标签盖住，标签有光晕）。
 */
export function symbolIsObstacle(place, level) {
  if (place.kind === 'island') return true
  if (place.kind === 'port') return level >= 1
  if (level === 0) return place.tier <= 1
  if (level === 1) return place.tier <= 2
  return true
}

/** 符号透明度（未选中状态）：总览时村落点淡一些，形成"人口密度"的纹理而不是噪点 */
export function symbolAlpha(place, level) {
  if (place.kind === 'city' && place.tier === 3) return level === 0 ? 0.5 : level === 1 ? 0.75 : 1
  return 1
}

/** tier → 中文等级名（图例、tooltip、面板共用） */
export const TIER_NAMES = ['首都', '大城市', '城镇', '村落']
