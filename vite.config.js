import { defineConfig } from 'vite'

// ─────────────────────────────────────────────────────────────
// 端口可随意修改：改下面的 DEFAULT_PORT / PREVIEW_PORT，
// 或临时用环境变量覆盖
//   PowerShell:  $env:NEBULA_PORT=6000; npm run dev
//   CMD:         set NEBULA_PORT=6000 && npm run dev
// ─────────────────────────────────────────────────────────────
const DEFAULT_PORT = 5175

/* ⚠ preview 用**另一个**默认端口，这一点是刻意的。
 *
 * `scripts/` 下的 40 多个验证脚本全部默认连 `http://localhost:5176/`。
 * 若 preview 也落在 5175，就会和 `npm run dev`（以及 v1 的预览服务器）
 * 抢同一个端口 —— 而 vite preview 的 strictPort 是 false，
 * 抢不到时会**静默往后找一个**，于是脚本连上的其实是另一个实例。
 * 那种错误极难查：页面能开、断言却全错，因为连的是旧构建。
 *
 * 分开之后：dev = 5175，preview = 5176，脚本默认打 5176。
 * 两边都能用 NEBULA_PORT 覆盖（脚本可用 URL 覆盖）。 */
const PREVIEW_PORT = 5176

export default defineConfig({
  server: {
    port: Number(process.env.NEBULA_PORT) || DEFAULT_PORT,
    host: true,          // 允许局域网/手机访问
    strictPort: false,   // 端口被占用时自动换下一个
    open: false,
    watch: {
      // 这些目录里放的是验证脚本的截图、临时 Chrome profile，
      // 以及 Vite 自己重载配置时的临时目录 —— 都可能被别的进程锁住，
      // 一旦被监听到就会 EBUSY 直接崩掉 dev server。
      ignored: [
        '**/shots/**',
        '**/.npm-cache/**',
        '**/dist/**',
        '**/*.tmpdir/**',
        '**/node_modules/**',
      ],
    },
  },
  preview: {
    port: Number(process.env.NEBULA_PREVIEW_PORT) || PREVIEW_PORT,
    strictPort: true,    // 预览是给验证脚本连的，端口必须确定
    host: true,
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
  },
})
