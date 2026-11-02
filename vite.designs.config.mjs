/**
 * vite.designs.config.mjs — 供「多设计稿并行开发」专用的 Vite 配置。
 *
 * 为什么需要单独一份：根目录的 vite.config.js 用的是 fs.watch。多个代理同时
 * 原子写入 designs/ 下的文件时（写临时文件再 rename），Windows 上 fs.watch 会
 * 抛 EBUSY 让 dev server **整个崩掉**（2026-11-01 实际发生过一次：
 * "EBUSY: resource busy or locked, watch 'designs/atlas/bake.js'"）。
 *
 * 本配置只做两件事：
 *   1. 关掉 designs/ 的监听（设计稿改动本来也不需要 HMR，重载页面即可）；
 *   2. 对剩下要监听的路径改用轮询，彻底绕开 fs.watch 的 Windows 锁冲突。
 *
 * 用法（在项目根目录）：
 *   node node_modules/vite/bin/vite.js --config vite.designs.config.mjs --port 5190 --strictPort
 *
 * 注意：根目录的 vite.config.js **不做任何修改**，正式开发流程不受影响。
 */
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5190,
    host: true,
    strictPort: true,
    open: false,
    watch: {
      /* 轮询代替 fs.watch：避免 Windows 上写入中的文件触发 EBUSY */
      usePolling: true,
      interval: 500,
      ignored: [
        '**/designs/**',      // 设计稿：并行开发时频繁写入，不监听
        '**/shots/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/*.tmpdir/**',
        '**/.npm-cache/**',
      ],
    },
  },
  build: { target: 'es2020', chunkSizeWarningLimit: 2000 },
})
