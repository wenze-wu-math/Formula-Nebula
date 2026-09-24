/** 打印指定 id 的完整本地字段，供逐条判断 status。 */
import fs from 'node:fs'
const t = fs.readFileSync('src/data/conjectures.js', 'utf8')
const ids = process.argv.slice(2)
for (const id of ids) {
  const i = t.indexOf("id: '" + id + "'")
  if (i < 0) { console.log(`\n### ${id}  【找不到】`); continue }
  const j = t.indexOf("\n  },", i)
  console.log('\n' + '='.repeat(78))
  console.log(t.slice(i, j < 0 ? i + 2200 : j + 4))
}
