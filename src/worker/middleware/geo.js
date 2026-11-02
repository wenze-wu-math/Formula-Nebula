/**
 * Geo-location Routing Middleware
 * Route requests to nearest origin/CDN based on user location
 */

export class GeoRoutingMiddleware {
  constructor(options = {}) {
    this.enableRouting = options.enableRouting !== false;
    this.regionalOrigins = options.regionalOrigins || {};
    this.defaultOrigin = options.defaultOrigin || null;
  }

  async handle(request, env, ctx) {
    if (!this.enableRouting) {
      return null; // Pass through
    }

    // Get Cloudflare geo data from request
    const geo = this.getGeoData(request);

    // Add geo headers to response
    const geoHeaders = {
      'X-Client-Country': geo.country,
      'X-Client-Region': geo.region,
      'X-Client-City': geo.city,
      'X-Client-Continent': geo.continent,
      'X-Client-Timezone': geo.timezone,
      'X-Client-Latitude': geo.latitude,
      'X-Client-Longitude': geo.longitude
    };

    // Store geo data in context for other middlewares
    ctx.geoData = geo;
    ctx.geoHeaders = geoHeaders;

    // Check if regional routing is needed
    if (Object.keys(this.regionalOrigins).length > 0) {
      const targetOrigin = this.selectOrigin(geo);
      if (targetOrigin) {
        ctx.targetOrigin = targetOrigin;
      }
    }

    return null; // Continue to next middleware
  }

  getGeoData(request) {
    // Cloudflare provides geo data in special headers
    const cf = request.cf || {};

    return {
      country: cf.country || request.headers.get('CF-IPCountry') || 'XX',
      region: cf.region || request.headers.get('CF-Region') || '',
      city: cf.city || request.headers.get('CF-City') || '',
      continent: cf.continent || request.headers.get('CF-Continent') || '',
      timezone: cf.timezone || request.headers.get('CF-Timezone') || 'UTC',
      latitude: cf.latitude || request.headers.get('CF-Latitude') || '0',
      longitude: cf.longitude || request.headers.get('CF-Longitude') || '0',
      colo: cf.colo || request.headers.get('CF-Ray')?.split('-')[1] || 'XXX',
      asn: cf.asn || 0,
      postalCode: cf.postalCode || '',
      metroCode: cf.metroCode || ''
    };
  }

  selectOrigin(geo) {
    // Priority: Country > Region > Continent > Default
    if (this.regionalOrigins[geo.country]) {
      return this.regionalOrigins[geo.country];
    }

    if (this.regionalOrigins[geo.region]) {
      return this.regionalOrigins[geo.region];
    }

    if (this.regionalOrigins[geo.continent]) {
      return this.regionalOrigins[geo.continent];
    }

    return this.defaultOrigin;
  }

  async routeRequest(request, targetOrigin) {
    if (!targetOrigin) {
      return null;
    }

    const url = new URL(request.url);
    url.host = targetOrigin;

    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: request.redirect
    });

    return fetch(modifiedRequest);
  }

  addGeoHeaders(response, geoHeaders) {
    const headers = new Headers(response.headers);

    Object.entries(geoHeaders).forEach(([key, value]) => {
      if (value) {
        headers.set(key, value.toString());
      }
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  /**
   * Get localized content based on user location
   */
  getLocalizedContent(geo) {
    const languageMap = {
      'CN': 'zh-CN',
      'TW': 'zh-TW',
      'HK': 'zh-HK',
      'JP': 'ja',
      'KR': 'ko',
      'US': 'en-US',
      'GB': 'en-GB',
      'FR': 'fr',
      'DE': 'de',
      'ES': 'es',
      'IT': 'it',
      'RU': 'ru'
    };

    return {
      language: languageMap[geo.country] || 'en',
      currency: this.getCurrency(geo.country),
      timezone: geo.timezone
    };
  }

  getCurrency(country) {
    const currencyMap = {
      'CN': 'CNY',
      'US': 'USD',
      'GB': 'GBP',
      'EU': 'EUR',
      'JP': 'JPY',
      'KR': 'KRW',
      'RU': 'RUB'
    };

    return currencyMap[country] || 'USD';
  }

  /**
   * Check if request is from a restricted region
   */
  isRestrictedRegion(geo, restrictedCountries = []) {
    return restrictedCountries.includes(geo.country);
  }

  /**
   * Get optimal CDN region
   */
  getOptimalRegion(geo) {
    const regionMap = {
      'AS': 'asia',
      'EU': 'europe',
      'NA': 'north-america',
      'SA': 'south-america',
      'AF': 'africa',
      'OC': 'oceania'
    };

    return regionMap[geo.continent] || 'global';
  }
}
