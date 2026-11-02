/**
 * tools/world/check-capitals.mjs — 验证首都（tier-0 城市）的全球分布覆盖率。
 *
 * 测试：
 *   1. 提取 8 个族的 tier-0 首都
 *   2. 计算所有首都的包围盒
 *   3. 计算覆盖率：包围盒面积 / 世界面积
 *   4. 检验首都跨度是否 >= 世界宽度/高度的 70%
 *   5. 报告理论槽位 vs 实际位置
 */
import { pathToFileURL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../..')
const { getGraph } = await import(pathToFileURL(resolve(root, 'designs/shared/kb.js')).href)
const { buildWorld } = await import(pathToFileURL(resolve(root, 'designs/map/src/world/index.js')).href)
const C = await import(pathToFileURL(resolve(root, 'designs/map/src/constants.js')).href)

console.log('Building world...')
const graph = getGraph()
const W = buildWorld(graph, { raster: false })

// 提取 8 个首都（tier-0 城市，每族一个）
const capitals = W.places
  .filter(p => p.kind === 'city' && p.tier === 0)
  .sort((a, b) => a.family < b.family ? -1 : 1)

console.log(`\nFound ${capitals.length} tier-0 capitals:`)
for (const c of capitals) {
  console.log(`  ${c.id.padEnd(35)} ${c.family.padEnd(12)} (${c.x.toFixed(1)}, ${c.y.toFixed(1)})`)
}

if (capitals.length !== 8) {
  console.log(`\n❌ FAIL: Expected 8 tier-0 capitals (one per family), found ${capitals.length}`)
  process.exit(1)
}

// 计算首都包围盒
let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
for (const c of capitals) {
  x0 = Math.min(x0, c.x)
  y0 = Math.min(y0, c.y)
  x1 = Math.max(x1, c.x)
  y1 = Math.max(y1, c.y)
}

const bboxWidth = x1 - x0
const bboxHeight = y1 - y0
const bboxArea = bboxWidth * bboxHeight

// 世界尺寸
const worldWidth = C.WORLD_BOUNDS.x1 - C.WORLD_BOUNDS.x0
const worldHeight = C.WORLD_BOUNDS.y1 - C.WORLD_BOUNDS.y0
const worldArea = worldWidth * worldHeight

// 覆盖率
const widthCoverage = bboxWidth / worldWidth
const heightCoverage = bboxHeight / worldHeight
const areaCoverage = bboxArea / worldArea

console.log(`\n━━━ Capital Distribution ━━━`)
console.log(`Bounding box:`)
console.log(`  x: [${x0.toFixed(1)}, ${x1.toFixed(1)}] = ${bboxWidth.toFixed(1)} wu`)
console.log(`  y: [${y0.toFixed(1)}, ${y1.toFixed(1)}] = ${bboxHeight.toFixed(1)} wu`)
console.log(`  area: ${bboxArea.toFixed(0)} wu²`)

console.log(`\nWorld bounds:`)
console.log(`  x: [${C.WORLD_BOUNDS.x0}, ${C.WORLD_BOUNDS.x1}] = ${worldWidth} wu`)
console.log(`  y: [${C.WORLD_BOUNDS.y0}, ${C.WORLD_BOUNDS.y1}] = ${worldHeight} wu`)
console.log(`  area: ${worldArea} wu²`)

console.log(`\nCoverage:`)
console.log(`  width:  ${(widthCoverage * 100).toFixed(1)}% of world width`)
console.log(`  height: ${(heightCoverage * 100).toFixed(1)}% of world height`)
console.log(`  area:   ${(areaCoverage * 100).toFixed(1)}% of world area`)

// 检验 >= 70% 覆盖
const THRESHOLD = 0.70
const widthPass = widthCoverage >= THRESHOLD
const heightPass = heightCoverage >= THRESHOLD

console.log(`\n━━━ Coverage Check (threshold: ${(THRESHOLD * 100).toFixed(0)}%) ━━━`)
console.log(`  ${widthPass ? '✓' : '✗'} Width coverage:  ${(widthCoverage * 100).toFixed(1)}% ${widthPass ? '>=' : '<'} ${(THRESHOLD * 100).toFixed(0)}%`)
console.log(`  ${heightPass ? '✓' : '✗'} Height coverage: ${(heightCoverage * 100).toFixed(1)}% ${heightPass ? '>=' : '<'} ${(THRESHOLD * 100).toFixed(0)}%`)

// 理论槽位 vs 实际位置
console.log(`\n━━━ Theoretical vs Actual Positions ━━━`)
console.log(`Family          Theoretical Slot    Seed Position        Actual Position      Δ from Seed`)

for (const c of capitals) {
  const slot = C.FAMILY_SLOTS[c.family]
  const seed = C.COUNTRY_SEEDS[c.family]
  const dx = c.x - seed.x
  const dy = c.y - seed.y
  const dist = Math.hypot(dx, dy)

  console.log(
    `${c.family.padEnd(15)} ` +
    `[${slot[0].toString().padStart(2)}, ${slot[1].toString().padStart(2)}]            ` +
    `(${seed.x.toFixed(0).padStart(5)}, ${seed.y.toFixed(0).padStart(5)})       ` +
    `(${c.x.toFixed(0).padStart(5)}, ${c.y.toFixed(0).padStart(5)})       ` +
    `${dist.toFixed(1)} wu`
  )
}

// 报告首都间距
console.log(`\n━━━ Inter-capital Distances ━━━`)
const distances = []
for (let i = 0; i < capitals.length; i++) {
  for (let j = i + 1; j < capitals.length; j++) {
    const d = Math.hypot(capitals[i].x - capitals[j].x, capitals[i].y - capitals[j].y)
    distances.push({
      a: capitals[i].family,
      b: capitals[j].family,
      dist: d
    })
  }
}
distances.sort((a, b) => a.dist - b.dist)

console.log(`Minimum: ${distances[0].dist.toFixed(1)} wu (${distances[0].a} ↔ ${distances[0].b})`)
console.log(`Maximum: ${distances[distances.length - 1].dist.toFixed(1)} wu (${distances[distances.length - 1].a} ↔ ${distances[distances.length - 1].b})`)
console.log(`Median:  ${distances[Math.floor(distances.length / 2)].dist.toFixed(1)} wu`)

// 最终判定
const pass = widthPass && heightPass
console.log(`\n${pass ? '✓ PASS' : '✗ FAIL'}: Capitals span ${pass ? '>=' : '<'} ${(THRESHOLD * 100).toFixed(0)}% of world in both dimensions`)

process.exit(pass ? 0 : 1)
