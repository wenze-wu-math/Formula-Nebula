/**
 * designs/_browser-lock.mjs — 全局 headless 浏览器并发锁。
 *
 * 为什么需要：每个 headless Chrome/Edge 实例会拉起多个渲染进程，
 * 四五个实例同时跑截图/验收时，整机会明显卡顿（实测曾同时存在 42 个
 * 浏览器进程）。这里用**目录创建的原语**做跨进程互斥，把并发的
 * headless 实例数硬性压到 MAX_CONCURRENT（默认 1）。
 *
 * 设计要点：
 *  - mkdir 在 Windows 与 POSIX 上都是原子的：谁先建成谁持有。
 *  - 持有者写完 `owner.json`（pid + 时间 + 用途），便于排查。
 *  - 等待方轮询；锁文件超过 STALE_MS 且持有进程已不存在 → 判定为残留锁并回收。
 *  - 超时抛错，绝不无限等待（否则一次崩溃会卡死整条流水线）。
 *
 * 用法：
 *   import { withBrowserLock } from './_browser-lock.mjs'
 *   await withBrowserLock('atlas shot', async () => { ...启动浏览器、截图、关闭... })
 */
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const LOCK_DIR = join(tmpdir(), 'formula-nebula-browser-lock')
const STALE_MS = 60_000           // 60s 无心跳即可疑；配合进程存活判断回收
const MAX_CONCURRENT = 1           // 用户明确要求：别同时开那么多

/**
 * 总开关：构建期间禁止启动浏览器。
 *
 * 2026-11-01 用户反馈：多个代理一边写代码一边实时截图，导致整机死机。
 * 策略改为「先写完代码，最后统一验收一次」。因此除非显式设置
 *   $env:FN_ALLOW_BROWSER = '1'
 * 否则任何 openPage / shot 调用都会立刻失败并给出清晰提示，
 * 从机制上防止代理再去实时截图。
 */
export function browserAllowed() {
  return process.env.FN_ALLOW_BROWSER === '1'
}

export function assertBrowserAllowed(tag) {
  if (!browserAllowed()) {
    throw new Error(
      `[browser-lock] 浏览器已被总开关禁用（tag=${tag}）。\n` +
      `当前处于「构建模式」：先把代码写完，最后由 Lead 统一验收一次。\n` +
      `如果你确实需要截图，请让 Lead 用 FN_ALLOW_BROWSER=1 运行，不要自行开启。`,
    )
  }
}

function alive(pid) {
  try { process.kill(pid, 0); return true } catch { return false }
}

function tryAcquire(slot) {
  const dir = join(LOCK_DIR, `slot-${slot}`)
  try {
    /* 父目录必须先存在：mkdir 非递归不会自动创建 LOCK_DIR */
    mkdirSync(LOCK_DIR, { recursive: true })
    mkdirSync(dir, { recursive: false })   // 原子：已存在则抛 EEXIST
    writeFileSync(join(dir, 'owner.json'), JSON.stringify({
      pid: process.pid, at: Date.now(), tag: 'pending',
    }))
    return { ok: true, dir }
  } catch (e) {
    if (e.code !== 'EEXIST') throw e
    /* 残留锁回收：持有进程已死（机器死机/进程被杀）就立刻回收，不等超时 */
    try {
      const info = JSON.parse(readFileSync(join(dir, 'owner.json'), 'utf8'))
      const ownerGone = !alive(info.pid)
      const stale = Date.now() - info.at > STALE_MS
      if (ownerGone || stale) {
        rmSync(dir, { recursive: true, force: true })
        return tryAcquire(slot)
      }
    } catch {
      /* owner.json 还没写出来（另一个进程刚建目录）或已损坏 —— 当作占用 */
    }
    return { ok: false, dir }
  }
}

/**
 * 取得一个并发槽位，执行 fn，结束后释放。
 * @param {string} tag 用途标签（写进锁文件，便于排查谁占着）
 * @param {() => Promise<any>} fn
 */
export async function withBrowserLock(tag, fn) {
  const held = await acquireBrowserLock(tag)
  try {
    return await fn()
  } finally {
    releaseBrowserLock(held)
  }
}

/**
 * 显式取得锁（用于"会话持有到 close()"的场景，例如 cdp.openPage）。
 * 调用方**必须**在 finally 里调 releaseBrowserLock(handle)，否则后续截图会一直排队。
 * @param {string} tag
 * @returns {Promise<{dir:string}>} 句柄
 */
export async function acquireBrowserLock(tag) {
  assertBrowserAllowed(tag)
  const t0 = Date.now()
  const TIMEOUT_MS = 240_000
  for (;;) {
    for (let slot = 0; slot < MAX_CONCURRENT; slot++) {
      const r = tryAcquire(slot)
      if (r.ok) {
        writeFileSync(join(r.dir, 'owner.json'), JSON.stringify({ pid: process.pid, at: Date.now(), tag }))
        return { dir: r.dir }
      }
    }
    if (Date.now() - t0 > TIMEOUT_MS) {
      throw new Error(`[browser-lock] 等待 ${TIMEOUT_MS}ms 仍拿不到槽位（tag=${tag}）。检查残留锁：${LOCK_DIR}`)
    }
    await sleep(400 + Math.random() * 400)
  }
}

/** 释放显式锁。重复释放安全。 */
export function releaseBrowserLock(handle) {
  if (!handle || !handle.dir) return
  try { rmSync(handle.dir, { recursive: true, force: true }) } catch { /* ignore */ }
}

/** 诊断：当前谁占着锁（供排查卡顿用） */
export function lockStatus() {
  const out = []
  for (let slot = 0; slot < MAX_CONCURRENT; slot++) {
    const dir = join(LOCK_DIR, `slot-${slot}`)
    if (!existsSync(dir)) { out.push({ slot, free: true }); continue }
    let info = null
    try { info = JSON.parse(readFileSync(join(dir, 'owner.json'), 'utf8')) } catch { /* ignore */ }
    out.push({ slot, free: false, ...info, pidAlive: info ? alive(info.pid) : null })
  }
  return out
}
