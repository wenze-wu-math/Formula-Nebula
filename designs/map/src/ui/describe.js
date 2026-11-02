/**
 * designs/map/src/ui/describe.js — 节点的"地图身份"文字（建议下拉、tooltip、面板顶条、读屏共用）。
 * 一处定义，免得三个地方对同一座城说出三种叫法。
 */
import { COUNTRY_NAMES, COUNTRY_COLORS, ISLAND_STATUS } from '../constants.js'
import { TIER_NAMES } from '../rules.js'
import { CONJECTURE_STATUS, RESEARCHER_AREAS } from '../../../shared/kb.js'

/** world.placeById 可能缺项（占位世界 / 未来数据变更），按节点字段兜底推断 */
export function placeOf(world, graph, id) {
  const p = world?.placeById?.get(id)
  if (p) return p
  const n = graph.byId.get(id)
  if (!n) return null
  if (n.researcher) return { id, node: n, kind: 'port', family: 'researcher', country: null, tier: 2 }
  if (n.cluster) return { id, node: n, kind: 'island', family: 'conjecture', country: null, tier: 3, status: n.status }
  return { id, node: n, kind: 'city', family: n.family, country: n.family, tier: 3 }
}

export function statusZh(status) {
  return ISLAND_STATUS[status]?.zh || '未勘探'
}

/** 短描述：「概形与层王国 · 大城市」/「岛屿 · 未勘探」/「港口 · IAS」 */
export function shortWhere(place) {
  if (!place) return ''
  const n = place.node
  if (place.kind === 'island') return `岛屿 · ${statusZh(place.status || n.status)}`
  if (place.kind === 'port') return `港口 · ${n.institution || '研究者'}`
  return `${COUNTRY_NAMES[place.country]?.zh || place.country} · ${TIER_NAMES[place.tier] ?? ''}`
}

/** 长描述（tooltip 第二行）：「猜想岛屿 · 未勘探（仍未解决）」/「研究者港口 · 机构」 */
export function longWhere(place) {
  if (!place) return ''
  const n = place.node
  if (place.kind === 'island') {
    const s = place.status || n.status
    return `猜想岛屿 · ${statusZh(s)}（${CONJECTURE_STATUS[s]?.name || s}）`
  }
  if (place.kind === 'port') return `研究者港口 · ${n.institution || RESEARCHER_AREAS[n.field]?.name || ''}`
  return `${COUNTRY_NAMES[place.country]?.zh || place.country} · ${TIER_NAMES[place.tier] ?? ''}`
}

/** 该 place 的代表色 {fill, ink}：城市 = 国家色；岛屿 = 状态色；港口 = 港口蓝 */
export function placeColors(place) {
  if (!place) return { fill: '#eee', ink: '#555' }
  if (place.kind === 'island') {
    const st = ISLAND_STATUS[place.status || place.node.status] || ISLAND_STATUS.open
    return { fill: st.fill || '#ffffff', ink: st.ink, coast: st.coast }
  }
  if (place.kind === 'port') return { fill: '#dce8f1', ink: '#24486a' }
  return { fill: COUNTRY_COLORS[place.country]?.land || '#eee', ink: COUNTRY_COLORS[place.country]?.ink || '#555' }
}
