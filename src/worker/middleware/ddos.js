/**
 * DDoS Protection Middleware
 * Challenge-based protection, bot detection, and anomaly detection
 */

export class DDoSProtectionMiddleware {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.challengeThreshold = options.challengeThreshold || 50; // requests/min
    this.blockThreshold = options.blockThreshold || 100; // requests/min
    this.challengeExpirySeconds = options.challengeExpirySeconds || 3600; // 1 hour
    this.botUserAgents = new Set([
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'
    ]);
  }

  async handle(request, env, ctx) {
    if (!this.enabled) {
      return null;
    }

    const clientId = this.getClientId(request);
    const userAgent = request.headers.get('User-Agent') || '';

    // Check for obvious bots
    if (this.isSuspiciousBot(userAgent)) {
      const isVerified = await this.checkBotVerification(clientId, env);
      if (!isVerified && !this.isGoodBot(userAgent)) {
        return this.challengeResponse(request);
      }
    }

    // Check request rate
    const requestRate = await this.getRequestRate(clientId, env, ctx);

    if (requestRate > this.blockThreshold) {
      // Block immediately
      return this.blockResponse('Rate limit exceeded');
    }

    if (requestRate > this.challengeThreshold) {
      // Issue challenge
      const isVerified = await this.checkBotVerification(clientId, env);
      if (!isVerified) {
        return this.challengeResponse(request);
      }
    }

    // Check for attack patterns
    const threatScore = this.calculateThreatScore(request, ctx);
    if (threatScore > 80) {
      return this.blockResponse('Suspicious activity detected');
    } else if (threatScore > 50) {
      return this.challengeResponse(request);
    }

    return null; // Allow request
  }

  async getRequestRate(clientId, env, ctx) {
    if (!env.RATE_LIMIT_KV) {
      return 0;
    }

    const now = Date.now();
    const key = `ddos:rate:${clientId}`;
    const windowMs = 60000; // 1 minute

    try {
      const data = await env.RATE_LIMIT_KV.get(key, { type: 'json' });

      if (!data) {
        // First request
        ctx.waitUntil(
          env.RATE_LIMIT_KV.put(key, JSON.stringify({
            requests: [now],
            firstSeen: now
          }), { expirationTtl: 120 })
        );
        return 1;
      }

      // Filter recent requests
      const recentRequests = (data.requests || []).filter(
        t => t > now - windowMs
      );

      recentRequests.push(now);

      // Update KV
      ctx.waitUntil(
        env.RATE_LIMIT_KV.put(key, JSON.stringify({
          requests: recentRequests.slice(-200), // Keep last 200
          firstSeen: data.firstSeen
        }), { expirationTtl: 120 })
      );

      return recentRequests.length;

    } catch (error) {
      console.error('Error getting request rate:', error);
      return 0;
    }
  }

  calculateThreatScore(request, _ctx) {
    let score = 0;
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';

    // Missing or suspicious User-Agent
    if (!userAgent || userAgent.length < 10) {
      score += 30;
    }

    // Suspicious patterns in URL
    if (this.hasSuspiciousPattern(url.pathname)) {
      score += 25;
    }

    // Missing common headers
    const hasReferer = request.headers.has('Referer');
    const hasAccept = request.headers.has('Accept');
    const hasAcceptLanguage = request.headers.has('Accept-Language');

    if (!hasReferer && !hasAccept && !hasAcceptLanguage) {
      score += 20;
    }

    // Known attack patterns
    if (this.hasAttackPattern(request)) {
      score += 40;
    }

    // HTTP method abuse
    if (['PUT', 'DELETE', 'TRACE', 'CONNECT'].includes(request.method)) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  hasSuspiciousPattern(pathname) {
    const patterns = [
      /\.\./,                     // Directory traversal
      /(admin|wp-admin|phpmyadmin)/i,  // Common admin paths
      /\.(php|asp|aspx|jsp)$/i,   // Server-side scripts
      /(eval|exec|system|cmd)/i,  // Command injection
      /<script/i,                 // XSS attempts
      /union.*select/i            // SQL injection
    ];

    return patterns.some(pattern => pattern.test(pathname));
  }

  hasAttackPattern(request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const pathname = url.pathname;

    // SQL injection patterns
    const sqlPatterns = [
      /(\bor\b|\band\b).*=.*('|")/i,
      /union.*select/i,
      /drop.*table/i
    ];

    // XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /onerror=/i,
      /onload=/i
    ];

    const combinedString = `${pathname} ${searchParams}`;

    return [...sqlPatterns, ...xssPatterns].some(
      pattern => pattern.test(combinedString)
    );
  }

  isSuspiciousBot(userAgent) {
    const lower = userAgent.toLowerCase();
    return Array.from(this.botUserAgents).some(bot => lower.includes(bot));
  }

  isGoodBot(userAgent) {
    const goodBots = [
      'googlebot', 'bingbot', 'slurp', 'duckduckbot',
      'baiduspider', 'yandexbot', 'facebookexternalhit'
    ];

    const lower = userAgent.toLowerCase();
    return goodBots.some(bot => lower.includes(bot));
  }

  async checkBotVerification(clientId, env) {
    if (!env.RATE_LIMIT_KV) {
      return false;
    }

    const key = `ddos:verified:${clientId}`;

    try {
      const verified = await env.RATE_LIMIT_KV.get(key);
      return verified === 'true';
    } catch (error) {
      return false;
    }
  }

  async setVerified(clientId, env, ctx) {
    if (!env.RATE_LIMIT_KV) {
      return;
    }

    const key = `ddos:verified:${clientId}`;
    ctx.waitUntil(
      env.RATE_LIMIT_KV.put(key, 'true', {
        expirationTtl: this.challengeExpirySeconds
      })
    );
  }

  challengeResponse(_request) {
    // Simple JavaScript challenge
    const challenge = `
<!DOCTYPE html>
<html>
<head>
  <title>验证检查 - Verification Check</title>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      color: #333;
    }
    .challenge-box {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 400px;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 1rem auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="challenge-box">
    <h2>🛡️ 安全检查</h2>
    <p>正在验证您的浏览器...</p>
    <div class="spinner"></div>
  </div>
  <script>
    setTimeout(() => {
      // Simple proof of work
      let proof = 0;
      for (let i = 0; i < 100000; i++) {
        proof += Math.random();
      }
      // Redirect with proof parameter
      window.location.href = window.location.href +
        (window.location.search ? '&' : '?') +
        'cf_challenge=' + btoa(proof.toString().substring(0, 16));
    }, 2000);
  </script>
</body>
</html>
    `.trim();

    return new Response(challenge, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Protection-Status': 'challenge'
      }
    });
  }

  blockResponse(reason) {
    return new Response(
      JSON.stringify({
        error: 'Access Denied',
        message: 'Your request has been blocked for security reasons.',
        reason: reason,
        timestamp: new Date().toISOString()
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Protection-Status': 'blocked'
        }
      }
    );
  }

  getClientId(request) {
    return request.headers.get('CF-Connecting-IP') ||
           request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
           'unknown';
  }
}
