/**
 * tools/orch/check-hash.mjs — hash.js 的 Node 断言（编排模块）。
 * 运行：cd "/d/xiangmu/Formula Nebula" && node designs/map/tools/orch/check-hash.mjs
 */
import { getGraph } from '../../../shared/kb.js'
import { encodeHash, decodeHash } from '../../src/hash.js'

const g = getGraph()
const has = (id) => g.byId.has(id)
let fails = 0
const ok = (cond, msg) => { if (!cond) { fails++; console.error('✗', msg) } else console.log('✓', msg) }

// 1) 往返：全部 488 个 id + 随机相机
let bad = 0
for (const n of g.nodes) {
  const cam = { x: Math.round(Math.random() * 1600 - 800), y: Math.round(Math.random() * 1000 - 500), s: Math.round((0.6 + Math.random() * 15) * 100) / 100 }
  const h = encodeHash({ id: n.id, cam })
  const d = decodeHash(h, { has })
  if (!d.ok || d.id !== n.id || !d.cam || d.cam.x !== cam.x || d.cam.y !== cam.y || Math.abs(d.cam.s - cam.s) > 1e-9) { bad++; if (bad < 4) console.log(h, d) }
}
ok(bad === 0, `488 个 id + 相机往返（失败 ${bad}）`)
ok(encodeHash({}) === '#v1', "空状态编码 '#v1'")
ok(encodeHash({ id: 'cn-hodge' }) === '#v1&n=cn-hodge', '只有 n')
ok(encodeHash({ cam: { x: 12.4, y: -7.6, s: 2.345 } }) === '#v1&c=12,-8,2.35', `只有 c：${encodeHash({ cam: { x: 12.4, y: -7.6, s: 2.345 } })}`)
const odd = 'a&b=c#%/ 中文'
ok(decodeHash(encodeHash({ id: odd })).id === odd, '特殊字符 id 往返')
ok(encodeHash({ id: 'x', cam: { x: NaN, y: 0, s: 1 } }) === '#v1&n=x', '非有限相机不编码')

// 2) 畸形输入：不抛异常，且结果安全
const evil = ['#v2&n=x', '#v1&c=a,b', '%E0%A4%A', '#v1&n=%E0%A4%A', '#v1&n=', '#v1&c=1,2', '#v1&c=1,2,0', '#v1&c=1,2,-3', '#v1&c=1e9,2,3',
  '#v1&c=1,2,999', 'n=cn-hodge', '#', '', null, undefined, 42, {}, [], '#v1&&&', '#v1&n=no-such-id', '#v1&c=%ZZ', '#v1&zz=1&n=cn-hodge',
  '#v1&n=cn-hodge&c=10,20,3.5&n=nope', '#V1&n=cn-hodge', '#v1&c=1,2,3,4', '#v1&c= 1,2,3 ', '#v1&n=' + 'x'.repeat(10000)]
let threw = 0
const res = {}
for (const e of evil) {
  try { res[String(e)] = decodeHash(e, { has }) } catch (err) { threw++; console.error('threw on', e, err) }
}
ok(threw === 0, `${evil.length} 个畸形输入均不抛异常`)
ok(!res['#v2&n=x'].ok && res['#v2&n=x'].id === null, "'#v2&n=x' 整条忽略")
ok(res['#v1&c=a,b'].ok && res['#v1&c=a,b'].cam === null, "'#v1&c=a,b' 忽略 c 段")
ok(!res['%E0%A4%A'].ok, "'%E0%A4%A' 忽略")
ok(res['#v1&n=%E0%A4%A'].id === null, "'#v1&n=%E0%A4%A' 忽略 n 段")
ok(res['#v1&c=1,2,999'].cam?.s === 16, 's 夹到 ZOOM_MAX_S')
ok(res['#v1&c=1,2,0'].cam === null && res['#v1&c=1,2,-3'].cam === null, 's ≤ 0 忽略')
ok(res['#v1&c=1e9,2,3'].cam === null, '坐标越界（且非十进制格式）忽略')
/* 2026-11-01 约定变更：裸参数（无版本号）也接受 —— `#n=<id>` 是最自然的手写形式，
   designs/verify.mjs 的深链往返检查写的就是它。旧实现"无版本号即整条忽略"导致深链恢复失败。 */
ok(res['n=cn-hodge'].id === 'cn-hodge', '无版本号的裸参数照常解析（n）')
ok(decodeHash('#n=scheme', { has }).id === 'scheme', "'#n=scheme'（验收器写法）解析出 id")
ok(decodeHash('#c=10,20,3.5', { has }).cam?.s === 3.5, '裸参数 c 段照常解析')
ok(decodeHash('#n=scheme&c=10,20,3.5', { has }).id === 'scheme', '裸参数 n + c 同时生效')
ok(!decodeHash('#v2&n=x', { has }).ok && decodeHash('#v2&n=x', { has }).id === null, '未知版本号仍整条忽略')
ok(decodeHash('#scheme', { has }).id === null, '裸 id（不含 =）当版本号处理，整条忽略')
ok(res['#v1&n=no-such-id'].id === null && res['#v1&n=no-such-id'].warnings.length === 1, '不存在的 id 忽略并记 warning')
ok(res['#v1&zz=1&n=cn-hodge'].id === 'cn-hodge', '未知字段静默忽略，其余照常')
ok(res['#v1&n=cn-hodge&c=10,20,3.5&n=nope'].id === 'cn-hodge' && res['#v1&n=cn-hodge&c=10,20,3.5&n=nope'].cam.s === 3.5, '后出现的非法 n 不覆盖合法的')
ok(res['#V1&n=cn-hodge'].id === null, '版本大小写敏感')
ok(decodeHash('v1&n=cn-hodge', { has }).id === 'cn-hodge', '不带 # 也能解析')

console.log(fails ? `\n${fails} 项失败` : '\n全部通过')
process.exit(fails ? 1 : 0)
