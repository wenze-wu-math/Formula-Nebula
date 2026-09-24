/* 把全部链接导出成 JSON，供逐条判定类型。
 * 输出写到文件（避免 PowerShell 控制台把中文弄乱码）。 */
import { writeFileSync } from 'node:fs'
import * as K from './knowledge.js'
import * as C from './conjectures.js'
import * as A from './extra-a.js'
import * as B from './extra-b.js'
import * as D from './extra-c.js'
import * as E from './extra-d.js'
import * as F from './extra-e.js'
import * as G from './extra-f.js'
import * as H from './extra-g.js'
import * as I from './extra-h.js'

const mods = { K, C, A, B, D, E, F, G, H, I }
const out = []
for (const [tag, m] of Object.entries(mods)) {
  for (const [name, val] of Object.entries(m)) {
    if (!Array.isArray(val) || !val.length) continue
    if (!Array.isArray(val[0])) continue    // 只要元组数组（链接），跳过节点对象数组
    for (const t of val) {
      if (!Array.isArray(t) || t.length < 4) continue
      out.push({ file: tag, name, src: t[0], dst: t[1], w: t[2], label: t[3], type: t[4] ?? null })
    }
  }
}
writeFileSync('scripts/_links-dump.json', JSON.stringify(out, null, 0), 'utf8')
console.log('导出', out.length, '条')
console.log('已有显式 type 的:', out.filter((x) => x.type).length)
const byName = {}
for (const x of out) byName[x.name] = (byName[x.name] || 0) + 1
console.log('按数组名:', JSON.stringify(byName))
