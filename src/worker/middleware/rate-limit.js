/**
 * API Rate Limiting Middleware
 * Token bucket algorithm with per-IP and per-endpoint limits
 */

export class RateLimitMiddleware {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 100;
    this.windowSeconds = options.windowSeconds || 60;
    this.enableBurst = options.enableBurst !== false;
    this.burstMultiplier = options.burstMultiplier || 1.5;
  }

  async handle(request, env, ctx) {
    // Get client identifier (IP address)
    const clientId = this.getClientId(request);
    const url = new URL(request.url);

    // Create rate limit key (per IP + endpoint)
    const endpoint = this.getEndpoint(url.pathname);
    const rateLimitKey = `ratelimit:${clientId}:${endpoint}`;

    // Check rate limit
    const isAllowed = await this.checkRateLimit(rateLimitKey, env, ctx);

    if (!isAllowed) {
      return this.rateLimitResponse(request, env);
    }

    return null; // Allow request to proceed
  }

  async checkRateLimit(key, env, ctx) {
    if (!env.RATE_LIMIT_KV) {
      console.warn('RATE_LIMIT_KV not configured, rate limiting disabled');
      return true;
    }

    const now = Date.now();
    const windowStart = now - (this.windowSeconds * 1000);

    try {
      // Get current rate limit data
      const data = await env.RATE_LIMIT_KV.get(key, { type: 'json' });

      if (!data) {
        // First request - create new bucket
        const newData = {
          tokens: this.maxRequests - 1,
          lastRefill: now,
          requests: [now]
        };

        ctx.waitUntil(
          env.RATE_LIMIT_KV.put(key, JSON.stringify(newData), {
            expirationTtl: this.windowSeconds * 2
          })
        );

        return true;
      }

      // Filter requests within the current window
      const recentRequests = (data.requests || []).filter(
        timestamp => timestamp > windowStart
      );

      // Token bucket algorithm with refill
      const timeSinceRefill = now - data.lastRefill;
      const tokensToAdd = Math.floor(
        (timeSinceRefill / 1000) * (this.maxRequests / this.windowSeconds)
      );

      let currentTokens = Math.min(
        data.tokens + tokensToAdd,
        this.maxRequests
      );

      // Check if request is allowed
      const maxBurst = this.enableBurst
        ? Math.floor(this.maxRequests * this.burstMultiplier)
        : this.maxRequests;

      if (recentRequests.length >= maxBurst || currentTokens < 1) {
        // Rate limit exceeded
        return false;
      }

      // Allow request and update state
      currentTokens -= 1;
      recentRequests.push(now);

      const updatedData = {
        tokens: currentTokens,
        lastRefill: now,
        requests: recentRequests.slice(-maxBurst) // Keep only recent requests
      };

      ctx.waitUntil(
        env.RATE_LIMIT_KV.put(key, JSON.stringify(updatedData), {
          expirationTtl: this.windowSeconds * 2
        })
      );

      return true;

    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow request on error
      return true;
    }
  }

  rateLimitResponse(_request, _env) {
    const retryAfter = this.windowSeconds;

    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter: retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': this.maxRequests.toString(),
          'X-RateLimit-Window': this.windowSeconds.toString(),
          'X-RateLimit-Remaining': '0'
        }
      }
    );
  }

  getClientId(request) {
    // Try multiple headers for client IP
    const cfConnectingIP = request.headers.get('CF-Connecting-IP');
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    const xRealIP = request.headers.get('X-Real-IP');

    return cfConnectingIP ||
           xForwardedFor?.split(',')[0].trim() ||
           xRealIP ||
           'unknown';
  }

  getEndpoint(pathname) {
    // Normalize endpoint for rate limiting
    // Group similar endpoints together
    if (pathname.startsWith('/api/')) {
      const parts = pathname.split('/').slice(0, 3);
      return parts.join('/');
    }
    return pathname;
  }

  async getRateLimitStatus(clientId, endpoint, env) {
    const key = `ratelimit:${clientId}:${endpoint}`;

    try {
      const data = await env.RATE_LIMIT_KV.get(key, { type: 'json' });

      if (!data) {
        return {
          limit: this.maxRequests,
          remaining: this.maxRequests,
          reset: Date.now() + (this.windowSeconds * 1000)
        };
      }

      const now = Date.now();
      const windowStart = now - (this.windowSeconds * 1000);
      const recentRequests = (data.requests || []).filter(
        timestamp => timestamp > windowStart
      );

      return {
        limit: this.maxRequests,
        remaining: Math.max(0, this.maxRequests - recentRequests.length),
        reset: Math.min(...recentRequests) + (this.windowSeconds * 1000)
      };

    } catch (error) {
      console.error('Error getting rate limit status:', error);
      return null;
    }
  }
}
