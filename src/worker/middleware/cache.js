/**
 * Static Asset Caching & Compression Middleware
 * Implements intelligent caching strategies with compression
 */

export class CacheMiddleware {
  constructor(options = {}) {
    this.cacheTTL = options.cacheTTL || 3600;
    this.enableCompression = options.enableCompression !== false;
    this.cacheableExtensions = new Set([
      'html', 'css', 'js', 'json', 'svg', 'png', 'jpg', 'jpeg',
      'gif', 'webp', 'woff', 'woff2', 'ttf', 'ico'
    ]);
  }

  async handle(request, env, ctx) {
    const url = new URL(request.url);

    // Skip caching for API requests or non-GET methods
    if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
      return null; // Pass through to next middleware
    }

    const cache = caches.default;
    const cacheKey = this.getCacheKey(request);

    // Try to serve from cache
    let response = await cache.match(cacheKey);

    if (response) {
      // Add cache hit header
      response = new Response(response.body, response);
      response.headers.set('X-Cache-Status', 'HIT');
      return response;
    }

    // Cache miss - fetch from origin
    return null; // Will be fetched by main handler
  }

  async cacheResponse(request, response, ctx) {
    const url = new URL(request.url);

    // Only cache successful GET responses
    if (request.method !== 'GET' || response.status !== 200) {
      return response;
    }

    // Check if file extension is cacheable
    const ext = url.pathname.split('.').pop()?.toLowerCase();
    if (!ext || !this.cacheableExtensions.has(ext)) {
      return response;
    }

    // Clone response for caching
    const cacheResponse = response.clone();
    const cacheKey = this.getCacheKey(request);

    // Determine cache TTL based on file type
    const ttl = this.getCacheTTL(ext);

    // Set cache headers
    const headers = new Headers(cacheResponse.headers);
    headers.set('Cache-Control', `public, max-age=${ttl}`);
    headers.set('X-Cache-Status', 'MISS');

    // Add compression if supported
    const acceptEncoding = request.headers.get('Accept-Encoding') || '';
    const shouldCompress = this.enableCompression &&
                           acceptEncoding.includes('gzip') &&
                           this.isCompressible(ext);

    if (shouldCompress && !headers.has('Content-Encoding')) {
      headers.set('Content-Encoding', 'gzip');
      headers.set('Vary', 'Accept-Encoding');
    }

    const responseToCache = new Response(cacheResponse.body, {
      status: cacheResponse.status,
      statusText: cacheResponse.statusText,
      headers
    });

    // Cache the response asynchronously
    ctx.waitUntil(
      caches.default.put(cacheKey, responseToCache)
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  getCacheKey(request) {
    const url = new URL(request.url);
    const acceptEncoding = request.headers.get('Accept-Encoding') || '';

    // Include encoding in cache key for proper compression handling
    const encoding = acceptEncoding.includes('gzip') ? 'gzip' : 'identity';
    return new Request(`${url.origin}${url.pathname}?encoding=${encoding}`, {
      method: 'GET'
    });
  }

  getCacheTTL(extension) {
    const longCache = ['woff', 'woff2', 'ttf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico'];
    const mediumCache = ['css', 'js'];
    const shortCache = ['html', 'json', 'svg'];

    if (longCache.includes(extension)) {
      return 31536000; // 1 year
    } else if (mediumCache.includes(extension)) {
      return 86400; // 1 day
    } else if (shortCache.includes(extension)) {
      return this.cacheTTL; // Default (1 hour)
    }
    return 3600; // 1 hour fallback
  }

  isCompressible(extension) {
    const compressible = ['html', 'css', 'js', 'json', 'svg', 'xml', 'txt'];
    return compressible.includes(extension);
  }

  async purgeCache(pattern) {
    const cache = caches.default;
    // Note: Cache purging requires manual key tracking in production
    // This is a simplified version
    console.log(`Cache purge requested for pattern: ${pattern}`);
  }
}
