/**
 * designs/map/src/ui/index.js — DOM 界面入口（搜索、详情面板、图例、名录、HUD、tooltip）。SPEC §9。
 *
 * 实现在 app.js（组装）与各子文件：search / cartouche / register / panel / hud / tooltip / glyphs / describe。
 * 入口只做转发，保持契约签名：initUI({graph, world}) → { obstacles(), closeTransient(), focusSearch() }。
 */
export { initUI } from './app.js'
