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

/* `base` 决定构建产物里资源 URL 的前缀。
 *
 * 本地 dev / 根域名部署时必须是 '/'。
 * 部署到 GitHub Pages 的项目页时，站点在 https://<user>.github.io/<repo>/，
 * 资源必须带上 '/<repo>/' 前缀，否则 index.html 引用的 /assets/*.js 全部 404。
 *
 * 用环境变量 NEBULA_BASE 覆盖，CI 里传 '/Formula-Nebula/' 即可，
 * 本地无需任何设置（默认 '/'）。 */
const BASE = process.env.NEBULA_BASE || '/'

export default defineConfig({
  base: BASE,
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
        // 只删「调试噪音」，**保留 error / warn**。
        //
        // 之前是 drop_console: true + pure_funcs 列了 log/info/debug —— 看似
        // 等价，实际把 console.error 和 console.warn 也一并干掉了。后果不是
        // 少了几行日志，而是**故障完全静默**：
        //
        //   main() 末尾的 `main().catch(err => console.error('启动失败', err))`
        //   被压成了空函数体。当 mobileOptimization 真的抛 TypeError 时，用户
        //   只看到 splash 消失后一片空白，控制台里什么都没有，无从排查。
        //   这个 bug 在线上存在了不知多久，正是因为这条配置把证据删了。
        //
        // 现在显式只 drop console.log。任何失败都会留下痕迹。
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
    },

    // 源码映射。
    //
    // 之前是 `true`：构建会生成 8 个 .map（合计 19 MB）并留在 dist/ 里。
    // GitHub Pages 只部署 dist/，而 Pages 不对 .map 做任何访问限制 —— 任何
    // 人都能直接下载它们，等于把完整源码公开（连注释、TODO、内部路径一起），
    // 同时白占流量配额。对一个以"可验证"为卖点的项目，这不该是默认行为。
    //
    // 默认关闭。确实需要调试线上构建时显式打开：
    //   NEBULA_SOURCEMAP=1 npm run build
    // 注意 .map 会再次进入 dist/，此时**不要**部署那一次构建产物。
    sourcemap: process.env.NEBULA_SOURCEMAP === '1',
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'katex',
      'three',
      'i18next',
      'i18next-browser-languagedetector',
      'i18next-http-backend',
      // mathjax-full is CommonJS. It must be pre-bundled by esbuild in dev,
      // otherwise the dev server serves the raw CJS file to the browser and
      // `import { AllPackages }` fails — the dev app never boots.
      'mathjax-full/js/mathjax.js',
      'mathjax-full/js/input/tex.js',
      'mathjax-full/js/input/tex/AllPackages.js',
      'mathjax-full/js/output/svg.js',
      'mathjax-full/js/adaptors/liteAdaptor.js',
      'mathjax-full/js/handlers/html.js',
    ],
  },
})
