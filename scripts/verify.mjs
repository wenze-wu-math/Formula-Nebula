// 用 Chrome 无头模式真实渲染并截图 + 抓取控制台日志
// 用法: node scripts/verify.mjs
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const OUT = resolve('shots')

mkdirSync(OUT, { recursive: true })

const args = [
  '--headless=new',
  '--disable-gpu-sandbox',
  '--no-sandbox',
  '--enable-unsafe-swiftshader',      // 无头环境用软件渲染跑 WebGL
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--hide-scrollbars',
  '--window-size=1600,1000',
  '--virtual-time-budget=25000',      // 给 MathJax 排版留足时间
  '--screenshot=' + resolve(OUT, 'nebula.png'),
  '--dump-dom',
  URL,
]

console.log('启动 Chrome 渲染…')
const cp = spawn(CHROME, args, { stdio: ['ignore', 'pipe', 'pipe'] })

let out = ''
let err = ''
cp.stdout.on('data', (d) => { out += d.toString() })
cp.stderr.on('data', (d) => { err += d.toString() })

const code = await new Promise((res) => cp.on('close', res))
console.log('Chrome 退出码:', code)

writeFileSync(OUT + '/dom.html', out, 'utf8')
writeFileSync(OUT + '/stderr.txt', err, 'utf8')

// 从 DOM 里提取关键信息
const m = out.match(/<div id="load"[^>]*class="([^"]*)"/)
console.log('load 遮罩 class:', m ? m[1] : '(未找到)')

const lbl = out.match(/<div class="lbl">([^<]*)</)
console.log('加载状态文字:', lbl ? lbl[1] : '(未找到)')

// 数一下渲染出了多少面板/图例元素
const famMatches = out.match(/class="fam"/g)
console.log('图例家族条目:', famMatches ? famMatches.length : 0)

const katexInDom = (out.match(/katex/g) || []).length
console.log('DOM 中 katex 出现次数:', katexInDom)

console.log('DOM 长度:', out.length)
console.log('\n--- stderr 中的错误/警告 (前 40 行) ---')
const lines = err.split('\n').filter((l) =>
  /error|Error|WARN|Warning|fail|Fail|Uncaught|GL_|swiftshader/i.test(l))
console.log(lines.slice(0, 40).join('\n') || '(无)')
