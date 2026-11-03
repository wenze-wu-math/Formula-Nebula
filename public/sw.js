/**
 * Formula Nebula Service Worker
 *
 * 缓存策略：
 * 1. 静态资源（JS/CSS/字体）- Cache First
 * 2. 公式纹理 - Cache First with 7 day expiry
 * 3. HTML - Network First
 * 4. API 请求 - Network Only
 */

const CACHE_VERSION = 'v1.0.1'
const STATIC_CACHE = `formula-nebula-static-${CACHE_VERSION}`
const TEXTURE_CACHE = `formula-nebula-textures-${CACHE_VERSION}`
const RUNTIME_CACHE = `formula-nebula-runtime-${CACHE_VERSION}`

// 需要预缓存的静态资源
//
// NOTE: these are resolved against the service worker's own scope, NOT the
// site root. Using '/', '/index.html' broke any deployment under a sub-path
// (e.g. GitHub Pages at /Formula-Nebula/): the precache would fetch the wrong
// URLs and `cache.addAll` rejects if any single request 404s, so install()
// failed and the SW never activated.
const SCOPE = self.registration ? self.registration.scope : self.location.href
const resolveInScope = (path) => new URL(path, SCOPE).href

const PRECACHE_URLS = [
  resolveInScope('./'),
  resolveInScope('./index.html'),
  resolveInScope('./manifest.json'),
]

// 缓存策略配置
const CACHE_STRATEGIES = {
  static: {
    name: STATIC_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    maxEntries: 100,
  },
  texture: {
    name: TEXTURE_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    maxEntries: 5000, // 支持大量公式纹理
  },
  runtime: {
    name: RUNTIME_CACHE,
    maxAge: 24 * 60 * 60 * 1000, // 1 天
    maxEntries: 50,
  },
}

// ============================================================================
// 安装阶段
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION)

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => {
        console.log('[SW] Skip waiting')
        return self.skipWaiting()
      })
  )
})

// ============================================================================
// 激活阶段
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', CACHE_VERSION)

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // 删除旧版本的缓存
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('formula-nebula-') &&
                     !cacheName.includes(CACHE_VERSION)
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('[SW] Claiming clients')
        return self.clients.claim()
      })
  )
})

// ============================================================================
// 请求拦截
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理同源请求
  if (url.origin !== location.origin) {
    return
  }

  // 根据请求类型选择缓存策略
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_STRATEGIES.static))
  } else if (isTexture(url)) {
    event.respondWith(cacheFirst(request, CACHE_STRATEGIES.texture))
  } else if (isHTMLDocument(url)) {
    event.respondWith(networkFirst(request, CACHE_STRATEGIES.runtime))
  } else {
    // 其他请求（API等）直接走网络
    event.respondWith(fetch(request))
  }
})

// ============================================================================
// 缓存策略实现
// ============================================================================

/**
 * Cache First 策略
 * 优先从缓存读取，缓存未命中时从网络获取并缓存
 */
async function cacheFirst(request, strategy) {
  const cache = await caches.open(strategy.name)
  const cached = await cache.match(request)

  if (cached) {
    // 检查是否过期
    const cachedTime = await getCacheTime(strategy.name, request.url)
    if (cachedTime && Date.now() - cachedTime < strategy.maxAge) {
      console.log('[SW] Cache hit:', request.url)
      return cached
    }
  }

  console.log('[SW] Cache miss, fetching:', request.url)
  try {
    const response = await fetch(request)

    // 只缓存成功的响应
    if (response && response.status === 200) {
      const responseToCache = response.clone()
      await cache.put(request, responseToCache)
      await setCacheTime(strategy.name, request.url, Date.now())

      // 清理超出限制的缓存
      await trimCache(strategy.name, strategy.maxEntries)
    }

    return response
  } catch (error) {
    console.error('[SW] Fetch failed:', request.url, error)
    // 如果网络失败，返回缓存（即使过期）
    return cached || new Response('Network error', { status: 503 })
  }
}

/**
 * Network First 策略
 * 优先从网络获取，网络失败时从缓存读取
 */
async function networkFirst(request, strategy) {
  const cache = await caches.open(strategy.name)

  try {
    const response = await fetch(request)

    if (response && response.status === 200) {
      const responseToCache = response.clone()
      await cache.put(request, responseToCache)
      await setCacheTime(strategy.name, request.url, Date.now())
    }

    return response
  } catch (error) {
    console.warn('[SW] Network failed, trying cache:', request.url)
    const cached = await cache.match(request)
    return cached || new Response('Offline', { status: 503 })
  }
}

// ============================================================================
// 工具函数
// ============================================================================

function isStaticAsset(url) {
  const path = url.pathname
  return /\.(js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i.test(path)
}

function isTexture(url) {
  // 公式纹理通常是 Blob URL 或包含 'texture' 的路径
  return url.pathname.includes('texture') ||
         url.pathname.includes('formula') ||
         url.protocol === 'blob:'
}

function isHTMLDocument(url) {
  return url.pathname.endsWith('.html') ||
         url.pathname === '/' ||
         !url.pathname.includes('.')
}

/**
 * 获取缓存时间
 */
async function getCacheTime(cacheName, url) {
  const cache = await caches.open(cacheName + '-meta')
  const response = await cache.match(url)
  if (response) {
    const text = await response.text()
    return parseInt(text, 10)
  }
  return null
}

/**
 * 设置缓存时间
 */
async function setCacheTime(cacheName, url, time) {
  const cache = await caches.open(cacheName + '-meta')
  await cache.put(url, new Response(time.toString()))
}

/**
 * 清理超出限制的缓存条目
 */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries)
    await Promise.all(toDelete.map((key) => cache.delete(key)))
    console.log(`[SW] Trimmed ${toDelete.length} entries from ${cacheName}`)
  }
}

// ============================================================================
// 消息处理
// ============================================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        )
      })
    )
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ size })
      })
    )
  }
})

/**
 * 计算缓存大小
 */
async function getCacheSize() {
  const cacheNames = await caches.keys()
  let totalSize = 0

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const requests = await cache.keys()

    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const blob = await response.blob()
        totalSize += blob.size
      }
    }
  }

  return totalSize
}

console.log('[SW] Service Worker loaded')
