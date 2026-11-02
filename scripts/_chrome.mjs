/**
 * Shared Chromium resolver for the headless verification scripts.
 *
 * Every browser script needs a real executable path. Chrome is not installed
 * on every machine that runs the suite, so resolve in this order:
 *   1. CHROME 环境变量（显式指定，优先级最高）
 *   2. 常见 Chrome / Edge 安装路径
 * 返回值保证是存在的文件；找不到时调用方自行报错退出。
 */
import { existsSync } from 'node:fs'

const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Users\\wwz\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
]

/** Default Chrome path kept for backwards compatibility with existing scripts. */
export const DEFAULT_CHROME = CANDIDATES[0]

/** First existing candidate: explicit CHROME env var, then the known install paths. */
export function resolveChrome() {
  const fromEnv = process.env.CHROME
  if (fromEnv && existsSync(fromEnv)) return fromEnv
  return CANDIDATES.find(existsSync) || ''
}

/** Resolve or exit with a clear message instead of a raw ENOENT crash. */
export function requireChrome() {
  const chrome = resolveChrome()
  if (!chrome) {
    console.error('找不到 Chromium 浏览器：请设置 CHROME 环境变量指向 chrome.exe 或 msedge.exe')
    process.exit(1)
  }
  return chrome
}
