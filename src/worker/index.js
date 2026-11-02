/**
 * Formula Nebula - Cloudflare Workers Edge Handler
 *
 * Edge Functions:
 * 1. Static asset caching/compression
 * 2. API rate limiting
 * 3. Geo-location routing
 * 4. DDoS protection
 * 5. Request analytics
 */

import { CacheMiddleware } from './middleware/cache.js';
import { RateLimitMiddleware } from './middleware/rate-limit.js';
import { GeoRoutingMiddleware } from './middleware/geo.js';
import { DDoSProtectionMiddleware } from './middleware/ddos.js';
import { AnalyticsMiddleware } from './middleware/analytics.js';

export default {
  async fetch(request, env, ctx) {
    try {
      // Initialize middlewares
      const cache = new CacheMiddleware({
        cacheTTL: parseInt(env.CACHE_TTL_SECONDS || '3600'),
        enableCompression: true
      });

      const rateLimit = new RateLimitMiddleware({
        maxRequests: parseInt(env.MAX_REQUESTS_PER_MINUTE || '100'),
        windowSeconds: 60,
        enableBurst: true
      });

      const geo = new GeoRoutingMiddleware({
        enableRouting: env.ENABLE_GEO_ROUTING === 'true'
      });

      const ddos = new DDoSProtectionMiddleware({
        enabled: env.ENABLE_DDOS_PROTECTION === 'true',
        challengeThreshold: 50,
        blockThreshold: 100
      });

      const analytics = new AnalyticsMiddleware({
        enabled: env.ENABLE_ANALYTICS === 'true',
        sampleRate: 1.0
      });

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return handleCORS(request);
      }

      // Middleware pipeline
      let response = null;

      // 1. DDoS Protection (first line of defense)
      response = await ddos.handle(request, env, ctx);
      if (response) return addCORSHeaders(response, request);

      // 2. Geo-location routing
      response = await geo.handle(request, env, ctx);
      if (response) return addCORSHeaders(response, request);

      // 3. Rate limiting
      response = await rateLimit.handle(request, env, ctx);
      if (response) return addCORSHeaders(response, request);

      // 4. Analytics (start timing)
      await analytics.handle(request, env, ctx);

      // 5. Cache check
      response = await cache.handle(request, env, ctx);
      if (response) {
        // Add geo headers to cached response
        if (ctx.geoHeaders) {
          response = geo.addGeoHeaders(response, ctx.geoHeaders);
        }

        // Record analytics
        await analytics.recordMetrics(request, response, ctx, env);

        return addCORSHeaders(response, request);
      }

      // No middleware intercepted - fetch from origin
      response = await fetchFromOrigin(request, env, ctx);

      // Post-processing
      // Apply caching to response
      response = await cache.cacheResponse(request, response, ctx);

      // Add geo headers
      if (ctx.geoHeaders) {
        response = geo.addGeoHeaders(response, ctx.geoHeaders);
      }

      // Record analytics
      await analytics.recordMetrics(request, response, ctx, env);

      return addCORSHeaders(response, request);

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error.message,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
};

/**
 * Fetch from origin server
 */
async function fetchFromOrigin(request, env, ctx) {
  const url = new URL(request.url);

  // Use regional origin if specified by geo routing
  if (ctx.targetOrigin) {
    url.host = ctx.targetOrigin;
  }

  // Clone request for origin
  const originRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow'
  });

  // Add custom headers
  originRequest.headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));
  originRequest.headers.set('X-Forwarded-Host', request.headers.get('host') || url.host);

  if (ctx.geoData) {
    originRequest.headers.set('X-Client-Country', ctx.geoData.country);
    originRequest.headers.set('X-Client-Region', ctx.geoData.region);
  }

  try {
    const response = await fetch(originRequest);
    return response;
  } catch (error) {
    console.error('Origin fetch error:', error);
    return new Response('Origin server unavailable', { status: 502 });
  }
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request) {
  const origin = request.headers.get('Origin');

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}

/**
 * Add CORS headers to response
 */
function addCORSHeaders(response, request) {
  const origin = request.headers.get('Origin');
  const headers = new Headers(response.headers);

  headers.set('Access-Control-Allow-Origin', origin || '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  headers.set('Access-Control-Allow-Credentials', 'true');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Special routes for worker management
 */
export async function handleSpecialRoute(request, env, ctx) {
  const url = new URL(request.url);

  // Analytics dashboard endpoint
  if (url.pathname === '/__worker/analytics') {
    const analytics = new AnalyticsMiddleware({ enabled: true });
    const timeRange = url.searchParams.get('range') || 'hour';
    const data = await analytics.getDashboardData(env, timeRange);

    return new Response(JSON.stringify(data, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Rate limit status endpoint
  if (url.pathname === '/__worker/rate-limit-status') {
    const rateLimit = new RateLimitMiddleware({});
    const clientId = rateLimit.getClientId(request);
    const endpoint = url.searchParams.get('endpoint') || '/';
    const status = await rateLimit.getRateLimitStatus(clientId, endpoint, env);

    return new Response(JSON.stringify(status, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Health check endpoint
  if (url.pathname === '/__worker/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      worker: 'formula-nebula-edge',
      version: '1.0.0'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return null;
}
