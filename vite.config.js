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
    rollupOptions: {
      output: {
        // 手动代码分割策略
        manualChunks: {
          // 1. Three.js 单独打包（大约 1.2MB）
          'three-core': ['three'],

          // 2. MathJax 单独打包（懒加载，约 3.5MB）
          // 注意：由于我们改为动态导入，这个 chunk 只在需要时加载
          'mathjax': [
            'mathjax-full/js/mathjax.js',
            'mathjax-full/js/input/tex.js',
            'mathjax-full/js/output/svg.js',
          ],

          // 3. KaTeX 单独打包（约 600KB）
          'katex': ['katex'],

          // 4. i18n 相关库单独打包
          'i18n': [
            'i18next',
            'i18next-browser-languagedetector',
            'i18next-http-backend'
          ],

          // 5. 协作功能单独打包（可选功能）
          'collaboration': ['ws', 'express'],

          // 6. 支付功能单独打包（可选功能）
          'billing': ['stripe'],
        },

        // 为资源文件使用内容哈希命名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 生产环境移除 console
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },

    // 启用源码映射（便于调试）
    sourcemap: true,
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'katex',
      'three',
      'i18next',
      'i18next-browser-languagedetector',
      'i18next-http-backend',
    ],
    // MathJax 排除在外，因为我们使用懒加载
    exclude: [
      'mathjax-full',
    ],
  },
})
