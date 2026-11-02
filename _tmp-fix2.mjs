import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
// 恢复被误伤的字符串定界符：', ' 与 '，' 与 ')' 与 ']' 等
const pairs = [
  ["’The Stacks Project’", "'The Stacks Project'"],
  ["’本条由公开教材", "'本条由公开教材"],
  ["未复制原文。’", "未复制原文。'"],
]
let n = 0
for (const [a, b] of pairs) { if (s.includes(a)) { s = s.split(a).join(b); n++ } }
// 通用恢复：形如 , ’ 或 (’ 或 [’ 之前是定界符位置
s = s.replace(/([,([]\s*)’/g, "$1'")
s = s.replace(/’(\s*[),\]])/g, "'$1")
s = s.replace(/：’/g, "：'")
writeFileSync(p, s)
console.log('passes', n)
