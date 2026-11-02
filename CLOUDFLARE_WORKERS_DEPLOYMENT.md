# Cloudflare Workers Deployment Guide

## Overview

This deployment provides edge functions for Formula Nebula with:
1. **Static Asset Caching/Compression** - Intelligent CDN caching with gzip compression
2. **API Rate Limiting** - Token bucket algorithm with per-IP and per-endpoint limits
3. **Geo-location Routing** - Route requests to nearest origin based on user location
4. **DDoS Protection** - Challenge-based protection with bot detection
5. **Request Analytics** - Real-time metrics collection and aggregation

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│   Cloudflare Edge Network        │
│   ┌─────────────────────────┐   │
│   │  DDoS Protection         │   │
│   │  ↓                       │   │
│   │  Geo Routing             │   │
│   │  ↓                       │   │
│   │  Rate Limiting           │   │
│   │  ↓                       │   │
│   │  Analytics Start         │   │
│   │  ↓                       │   │
│   │  Cache Check             │   │
│   │  ↓                       │   │
│   │  Origin Fetch (if miss)  │   │
│   │  ↓                       │   │
│   │  Cache Response          │   │
│   │  ↓                       │   │
│   │  Add Headers             │   │
│   │  ↓                       │   │
│   │  Record Analytics        │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Origin    │
│   Server    │
└─────────────┘
```

## Prerequisites

1. **Cloudflare Account** - Sign up at https://dash.cloudflare.com
2. **Wrangler CLI** - Install Cloudflare Workers CLI:
   ```bash
   npm install -g wrangler
   ```
3. **Domain on Cloudflare** - Add your domain to Cloudflare

## Setup Instructions

### 1. Authenticate Wrangler

```bash
wrangler login
```

### 2. Create KV Namespaces

Create two KV namespaces for rate limiting and analytics:

```bash
# Production namespaces
wrangler kv:namespace create "RATE_LIMIT_KV"
wrangler kv:namespace create "ANALYTICS_KV"

# Preview namespaces (for testing)
wrangler kv:namespace create "RATE_LIMIT_KV" --preview
wrangler kv:namespace create "ANALYTICS_KV" --preview
```

You'll get output like:
```
✨ Success! Created KV namespace RATE_LIMIT_KV
 Add the following to your wrangler.toml:
 { binding = "RATE_LIMIT_KV", id = "abc123..." }
```

### 3. Update wrangler.toml

Replace the placeholder IDs in `wrangler.toml` with your actual namespace IDs:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR_RATE_LIMIT_NAMESPACE_ID"
preview_id = "YOUR_RATE_LIMIT_PREVIEW_ID"

[[kv_namespaces]]
binding = "ANALYTICS_KV"
id = "YOUR_ANALYTICS_NAMESPACE_ID"
preview_id = "YOUR_ANALYTICS_PREVIEW_ID"
```

Also update your account ID and zone ID:

```toml
account_id = "YOUR_CLOUDFLARE_ACCOUNT_ID"
zone_id = "YOUR_CLOUDFLARE_ZONE_ID"  # Optional, for route binding
```

### 4. Configure Routes (Optional)

If you want to deploy to a specific route instead of workers.dev subdomain:

```toml
workers_dev = false
route = "formula-nebula.com/*"
zone_id = "YOUR_CLOUDFLARE_ZONE_ID"
```

### 5. Deploy Worker

Deploy to production:

```bash
wrangler deploy
```

Deploy to staging:

```bash
wrangler deploy --env staging
```

### 6. Test Deployment

Test the worker is running:

```bash
curl https://formula-nebula-edge.YOUR_SUBDOMAIN.workers.dev/__worker/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-02T12:00:00.000Z",
  "worker": "formula-nebula-edge",
  "version": "1.0.0"
}
```

## Configuration

### Environment Variables

Configure in `wrangler.toml` under `[vars]`:

- `MAX_REQUESTS_PER_MINUTE` - Rate limit per IP (default: 100)
- `CACHE_TTL_SECONDS` - Default cache TTL (default: 3600)
- `ENABLE_ANALYTICS` - Enable analytics (default: true)
- `ENABLE_GEO_ROUTING` - Enable geo routing (default: true)
- `ENABLE_DDOS_PROTECTION` - Enable DDoS protection (default: true)

### Rate Limiting Configuration

Modify in `src/worker/middleware/rate-limit.js`:

```javascript
const rateLimit = new RateLimitMiddleware({
  maxRequests: 100,        // Max requests per window
  windowSeconds: 60,       // Time window in seconds
  enableBurst: true,       // Allow burst traffic
  burstMultiplier: 1.5     // Burst capacity multiplier
});
```

### Cache Configuration

Modify in `src/worker/middleware/cache.js`:

```javascript
const cache = new CacheMiddleware({
  cacheTTL: 3600,          // Default TTL in seconds
  enableCompression: true  // Enable gzip compression
});
```

### DDoS Protection Configuration

Modify in `src/worker/middleware/ddos.js`:

```javascript
const ddos = new DDoSProtectionMiddleware({
  enabled: true,
  challengeThreshold: 50,  // Requests/min before challenge
  blockThreshold: 100,     // Requests/min before block
  challengeExpirySeconds: 3600  // Challenge valid for 1 hour
});
```

## Monitoring & Analytics

### Analytics Dashboard

Access real-time analytics:

```bash
curl "https://YOUR_WORKER_URL/__worker/analytics?range=hour"
```

Available ranges: `minute`, `hour`, `day`

Response:
```json
{
  "timeRange": "hour",
  "totalRequests": 12543,
  "totalErrors": 23,
  "errorRate": "0.18%",
  "avgDuration": "45.32ms",
  "cacheHitRate": "87.45%",
  "topPaths": [
    { "key": "/", "value": 5432 },
    { "key": "/src/main.js", "value": 3210 }
  ],
  "topCountries": [
    { "key": "US", "value": 6543 },
    { "key": "CN", "value": 3210 }
  ],
  "statusDistribution": {
    "200": 12000,
    "404": 20,
    "500": 3
  },
  "methodDistribution": {
    "GET": 12500,
    "POST": 43
  }
}
```

### Rate Limit Status

Check rate limit status for a client:

```bash
curl "https://YOUR_WORKER_URL/__worker/rate-limit-status?endpoint=/"
```

### Logs

View real-time logs:

```bash
wrangler tail
```

Filter by status:

```bash
wrangler tail --status error
```

## Advanced Features

### Regional Routing

Configure regional origins in `src/worker/middleware/geo.js`:

```javascript
const geo = new GeoRoutingMiddleware({
  enableRouting: true,
  regionalOrigins: {
    'US': 'us-origin.example.com',
    'EU': 'eu-origin.example.com',
    'AS': 'asia-origin.example.com'
  },
  defaultOrigin: 'global-origin.example.com'
});
```

### Custom Caching Rules

Add custom cache rules by extension:

```javascript
// In src/worker/middleware/cache.js
getCacheTTL(extension) {
  const rules = {
    'html': 3600,        // 1 hour
    'css': 86400,        // 1 day
    'js': 86400,         // 1 day
    'png': 31536000,     // 1 year
    'woff2': 31536000    // 1 year
  };
  return rules[extension] || 3600;
}
```

### Per-Endpoint Rate Limits

Add endpoint-specific limits:

```javascript
// In src/worker/index.js
const endpoint = url.pathname;
const limits = {
  '/api/search': { maxRequests: 20, windowSeconds: 60 },
  '/api/compute': { maxRequests: 5, windowSeconds: 60 }
};

const config = limits[endpoint] || { maxRequests: 100, windowSeconds: 60 };
const rateLimit = new RateLimitMiddleware(config);
```

## Performance Optimization

### Cache Warming

Pre-populate cache with critical assets:

```bash
# Warm up cache for common pages
curl https://formula-nebula.com/
curl https://formula-nebula.com/src/main.js
curl https://formula-nebula.com/src/styles.css
```

### Compression

The worker automatically compresses text-based assets:
- HTML, CSS, JS, JSON, SVG, XML
- Gzip compression for browsers that support it
- Brotli support coming soon

### Edge Caching Strategy

- **Static assets**: Cached for 1 year
- **HTML pages**: Cached for 1 hour
- **API responses**: Not cached
- **Dynamic content**: Not cached

## Troubleshooting

### Worker Not Responding

1. Check deployment status:
   ```bash
   wrangler deployments list
   ```

2. Check logs:
   ```bash
   wrangler tail
   ```

3. Verify route configuration:
   ```bash
   wrangler routes list
   ```

### Rate Limiting Issues

1. Check KV namespace binding:
   ```bash
   wrangler kv:namespace list
   ```

2. Clear rate limit data:
   ```bash
   wrangler kv:key delete --namespace-id=YOUR_ID "ratelimit:CLIENT_IP:ENDPOINT"
   ```

### Cache Issues

1. Purge all cache:
   ```bash
   # In Cloudflare dashboard: Caching > Configuration > Purge Everything
   ```

2. Purge specific URL:
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"files":["https://formula-nebula.com/index.html"]}'
   ```

### Analytics Not Recording

1. Verify KV namespace binding in wrangler.toml
2. Check analytics is enabled:
   ```toml
   [vars]
   ENABLE_ANALYTICS = "true"
   ```
3. Verify KV writes aren't rate limited

## Cost Estimation

Cloudflare Workers pricing (as of 2024):

### Free Plan
- 100,000 requests/day
- 10ms CPU time per request
- Suitable for testing and small projects

### Paid Plan ($5/month)
- 10 million requests/month included
- $0.50 per additional million
- 50ms CPU time per request

### KV Storage
- First 100,000 read operations/day: free
- Additional reads: $0.50 per million
- Writes: $5 per million
- Storage: $0.50 per GB/month

**Estimated costs for Formula Nebula:**
- 1M requests/month: $5/month (workers) + $0.50/month (KV) = **$5.50/month**
- 10M requests/month: $5/month (workers) + $2/month (KV) = **$7/month**

## Security Best Practices

1. **Enable DDoS Protection**: Always keep enabled in production
2. **Configure Rate Limits**: Set appropriate limits for your application
3. **Monitor Analytics**: Check for unusual patterns
4. **Use HTTPS Only**: Enforce SSL/TLS
5. **Validate Origin**: Verify origin server certificates
6. **Rotate Secrets**: Regularly update API keys and tokens

## Maintenance

### Update Worker

```bash
# Pull latest changes
git pull

# Deploy updated worker
wrangler deploy
```

### Monitor Performance

```bash
# Watch real-time logs
wrangler tail --format pretty

# Check metrics in dashboard
open https://dash.cloudflare.com
```

### Backup KV Data

```bash
# Export rate limit data
wrangler kv:key list --namespace-id=YOUR_RATE_LIMIT_ID > rate_limit_backup.json

# Export analytics data
wrangler kv:key list --namespace-id=YOUR_ANALYTICS_ID > analytics_backup.json
```

## Support

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Wrangler CLI Docs: https://developers.cloudflare.com/workers/wrangler/
- Community Discord: https://discord.gg/cloudflaredev

## License

Part of Formula Nebula project.
