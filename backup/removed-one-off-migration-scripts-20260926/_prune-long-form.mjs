/**
 * 一次性维护脚本：把 long-form.js 中已经被新文件取代的 18 条记录删掉。
 *
 * 为什么可以删：index.js 的合并顺序里 rewrite-a1/a2/a3/b.js 与 deep-dive.js
 * 排在其后，同名键以它们为准；long-form.js 里那 18 份是**永远不会被读到的**
 * 旧副本。它们还带着机器拼接的字数填充（约 1.1 万字符），留在仓库里只会
 * 让读者以为项目里有两份互相矛盾的证明。
 *
 * 删除是精确的：先把 long-form.js 解析成 JSON 对象，删掉 SHADOWED 里的键，
 * 再写回；不重新格式化其余记录，逐字节保留存活记录的原文。
 *
 * 用法：node scripts/_prune-long-form.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LONG_FORM_PROOFS } from '../src/data/proofs/long-form.js'
import { REWRITE_A1_PROOFS } from '../src/data/proofs/rewrite-a1.js'
import { REWRITE_A2_PROOFS } from '../src/data/proofs/rewrite-a2.js'
import { REWRITE_A3_PROOFS } from '../src/data/proofs/rewrite-a3.js'
import { REWRITE_B_PROOFS } from '../src/data/proofs/rewrite-b.js'
import { DEEP_DIVE_PROOFS } from '../src/data/proofs/deep-dive.js'

const dry = process.argv.includes('--dry')
const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'proofs', 'long-form.js')

const winners = new Set([
  ...Object.keys(REWRITE_A1_PROOFS), ...Object.keys(REWRITE_A2_PROOFS),
  ...Object.keys(REWRITE_A3_PROOFS), ...Object.keys(REWRITE_B_PROOFS),
  ...Object.keys(DEEP_DIVE_PROOFS),
])

const kept = Object.fromEntries(Object.entries(LONG_FORM_PROOFS).filter(([id]) => !winners.has(id)))
const dropped = Object.keys(LONG_FORM_PROOFS).filter((id) => winners.has(id))
if (!dropped.length) {
  console.log('没有需要删除的记录（已经清理过）')
  process.exit(0)
}

const header = '/** Long-form, source-reviewed proof records. */\n'
const body = `${header}export const LONG_FORM_PROOFS = ${JSON.stringify(kept, null, 2)}\n`
if (dry) {
  console.log(`将删除 ${dropped.length} 条：${dropped.join(' ')}`)
  console.log(`保留 ${Object.keys(kept).length} 条：${Object.keys(kept).join(' ')}`)
  console.log(`文件将从 ${readFileSync(target, 'utf8').length} 字节变为 ${body.length} 字节`)
} else {
  writeFileSync(target, body, 'utf8')
  console.log(`已删除 ${dropped.length} 条被取代的记录：${dropped.join(' ')}`)
  console.log(`保留 ${Object.keys(kept).length} 条仍在本文件中的记录：${Object.keys(kept).join(' ')}`)
}
