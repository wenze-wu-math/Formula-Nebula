/**
 * Service Worker 注册管理
 *
 * 提供：
 * - 自动注册 Service Worker
 * - 更新检测和提示
 * - 缓存管理接口
 */

let registration = null

/**
 * 注册 Service Worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Worker not supported')
    return null
  }

  try {
    registration = await navigator.serviceWorker.register('/sw.js')
    console.log('[SW] Registered successfully:', registration.scope)

    // 监听更新
    registration.addEventListener('updatefound', handleUpdateFound)

    // 检查是否有等待的 SW
    if (registration.waiting) {
      notifyUpdate(registration.waiting)
    }

    // 监听控制器变化
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed, reloading page')
      window.location.reload()
    })

    // 定期检查更新（每小时）
    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)

    return registration
  } catch (error) {
    console.error('[SW] Registration failed:', error)
    return null
  }
}

/**
 * 处理 Service Worker 更新
 */
function handleUpdateFound() {
  const newWorker = registration.installing

  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      notifyUpdate(newWorker)
    }
  })
}

/**
 * 通知用户有新版本
 */
function notifyUpdate(worker) {
  console.log('[SW] New version available')

  // 触发自定义事件
  window.dispatchEvent(new CustomEvent('swUpdateAvailable', {
    detail: { worker }
  }))

  // 可选：自动更新（对于小更新）
  // skipWaiting(worker)
}

/**
 * 跳过等待，立即激活新 Service Worker
 */
export function skipWaiting(worker) {
  if (!worker) {
    worker = registration?.waiting
  }

  if (worker) {
    worker.postMessage({ type: 'SKIP_WAITING' })
  }
}

/**
 * 注销 Service Worker
 */
export async function unregisterServiceWorker() {
  if (registration) {
    const success = await registration.unregister()
    console.log('[SW] Unregistered:', success)
    return success
  }
  return false
}

/**
 * 清除所有缓存
 */
export async function clearAllCaches() {
  if (!('caches' in window)) {
    return false
  }

  try {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map((cacheName) => caches.delete(cacheName))
    )
    console.log('[SW] All caches cleared')
    return true
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error)
    return false
  }
}

/**
 * 获取缓存统计信息
 */
export async function getCacheStats() {
  if (!('caches' in window)) {
    return null
  }

  try {
    const cacheNames = await caches.keys()
    const stats = {
      totalCaches: cacheNames.length,
      caches: {},
      totalSize: 0,
      totalEntries: 0,
    }

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      let size = 0

      for (const request of keys) {
        const response = await cache.match(request)
        if (response) {
          const blob = await response.blob()
          size += blob.size
        }
      }

      stats.caches[cacheName] = {
        entries: keys.length,
        size,
        sizeFormatted: formatBytes(size),
      }

      stats.totalSize += size
      stats.totalEntries += keys.length
    }

    stats.totalSizeFormatted = formatBytes(stats.totalSize)

    return stats
  } catch (error) {
    console.error('[SW] Failed to get cache stats:', error)
    return null
  }
}

/**
 * 预缓存公式纹理
 */
export async function precacheTextures(textures) {
  if (!('caches' in window)) {
    return false
  }

  try {
    const cache = await caches.open('formula-nebula-textures-v1.0.1')

    for (const texture of textures) {
      if (texture.url) {
        await cache.add(texture.url)
      }
    }

    console.log(`[SW] Precached ${textures.length} textures`)
    return true
  } catch (error) {
    console.error('[SW] Failed to precache textures:', error)
    return false
  }
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 创建更新提示 UI
 */
export function createUpdateNotification() {
  const notification = document.createElement('div')
  notification.id = 'sw-update-notification'
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1e293b;
    color: #f8fafc;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    max-width: 320px;
  `

  notification.innerHTML = `
    <div style="margin-bottom: 12px;">
      <strong>🎉 新版本可用</strong>
    </div>
    <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.9;">
      Formula Nebula 有更新了！点击刷新查看最新功能。
    </div>
    <button id="sw-update-button" style="
      background: #6366f1;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 8px;
    ">
      立即更新
    </button>
    <button id="sw-dismiss-button" style="
      background: transparent;
      color: #94a3b8;
      border: 1px solid #475569;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    ">
      稍后
    </button>
  `

  return notification
}

/**
 * 显示更新提示
 */
export function showUpdateNotification(worker) {
  const notification = createUpdateNotification()
  document.body.appendChild(notification)

  const updateButton = notification.querySelector('#sw-update-button')
  const dismissButton = notification.querySelector('#sw-dismiss-button')

  updateButton.addEventListener('click', () => {
    skipWaiting(worker)
    notification.remove()
  })

  dismissButton.addEventListener('click', () => {
    notification.remove()
  })

  // 10秒后自动隐藏
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0'
      notification.style.transition = 'opacity 0.3s'
      setTimeout(() => notification.remove(), 300)
    }
  }, 10000)
}

// 自动注册（如果在生产环境）
if (import.meta.env.PROD) {
  registerServiceWorker().then((reg) => {
    if (reg) {
      window.addEventListener('swUpdateAvailable', (event) => {
        showUpdateNotification(event.detail.worker)
      })
    }
  })
}

export default {
  register: registerServiceWorker,
  unregister: unregisterServiceWorker,
  clearCaches: clearAllCaches,
  getCacheStats,
  precacheTextures,
  skipWaiting,
  showUpdateNotification,
}
