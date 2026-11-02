/**
 * designs/shared/responsive.js — Responsive utilities shared across all designs.
 *
 * Provides:
 * - Device detection & viewport info
 * - Touch gesture handling (pinch zoom, pan)
 * - Adaptive rendering quality based on device capabilities
 * - Mobile UI layout helpers
 */

/** Device & viewport detection */
export function detectDevice() {
  const w = window.innerWidth
  const h = window.innerHeight
  const isMobile = w < 768
  const isTablet = w >= 768 && w < 1024
  const isPortrait = h > w
  const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const dpr = window.devicePixelRatio || 1

  return {
    isMobile,
    isTablet,
    isDesktop: w >= 1024,
    isPortrait,
    isLandscape: !isPortrait,
    touchCapable,
    width: w,
    height: h,
    dpr,
    // Performance tier based on device characteristics
    tier: isMobile ? (dpr > 2 ? 'mobile-high' : 'mobile-low') :
          isTablet ? 'tablet' : 'desktop'
  }
}

/** Get adaptive quality settings based on device */
export function getQualitySettings(device = detectDevice()) {
  const { tier, isMobile, dpr } = device

  // Base quality multipliers
  const quality = {
    'mobile-low': { particle: 0.25, resolution: 0.7, maxParticles: 800, labelDensity: 0.5 },
    'mobile-high': { particle: 0.4, resolution: 0.85, maxParticles: 1500, labelDensity: 0.7 },
    'tablet': { particle: 0.65, resolution: 1.0, maxParticles: 3000, labelDensity: 0.85 },
    'desktop': { particle: 1.0, resolution: 1.0, maxParticles: 8000, labelDensity: 1.0 }
  }

  const settings = quality[tier] || quality.desktop

  // Adjust resolution for high-DPR mobile devices (cap at 2x on mobile)
  if (isMobile && dpr > 2) {
    settings.resolution = Math.min(settings.resolution, 0.85)
  }

  return settings
}

/** Touch gesture handler for pinch-zoom and two-finger pan */
export class TouchGestureHandler {
  constructor(element, callbacks = {}) {
    this.element = element
    this.callbacks = callbacks
    this.touches = new Map()
    this.gestureStart = null
    this.lastPinch = null

    this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false })
    this.element.addEventListener('touchcancel', this.onTouchCancel.bind(this), { passive: false })
  }

  onTouchStart(e) {
    for (const t of e.changedTouches) {
      this.touches.set(t.identifier, { x: t.clientX, y: t.clientY })
    }

    if (this.touches.size === 2 && !this.gestureStart) {
      const pts = Array.from(this.touches.values())
      const dx = pts[1].x - pts[0].x
      const dy = pts[1].y - pts[0].y
      const dist = Math.hypot(dx, dy)
      const cx = (pts[0].x + pts[1].x) / 2
      const cy = (pts[0].y + pts[1].y) / 2

      this.gestureStart = { dist, cx, cy }
      this.lastPinch = { dist, cx, cy, time: performance.now() }

      if (this.callbacks.onGestureStart) {
        this.callbacks.onGestureStart({ cx, cy })
      }
    }
  }

  onTouchMove(e) {
    e.preventDefault() // Prevent page scroll during gesture

    for (const t of e.changedTouches) {
      this.touches.set(t.identifier, { x: t.clientX, y: t.clientY })
    }

    if (this.touches.size === 2 && this.gestureStart) {
      const pts = Array.from(this.touches.values())
      const dx = pts[1].x - pts[0].x
      const dy = pts[1].y - pts[0].y
      const dist = Math.hypot(dx, dy)
      const cx = (pts[0].x + pts[1].x) / 2
      const cy = (pts[0].y + pts[1].y) / 2

      if (this.lastPinch) {
        const scale = dist / this.lastPinch.dist
        const panX = cx - this.lastPinch.cx
        const panY = cy - this.lastPinch.cy

        if (this.callbacks.onPinchZoom) {
          this.callbacks.onPinchZoom({
            scale,
            cx,
            cy,
            panX,
            panY,
            dist,
            startDist: this.gestureStart.dist
          })
        }
      }

      this.lastPinch = { dist, cx, cy, time: performance.now() }
    } else if (this.touches.size === 1 && !this.gestureStart) {
      // Single-finger pan
      const t = Array.from(this.touches.values())[0]
      if (this.callbacks.onPan) {
        this.callbacks.onPan({ x: t.x, y: t.y })
      }
    }
  }

  onTouchEnd(e) {
    for (const t of e.changedTouches) {
      this.touches.delete(t.identifier)
    }

    if (this.touches.size < 2) {
      if (this.gestureStart && this.callbacks.onGestureEnd) {
        this.callbacks.onGestureEnd()
      }
      this.gestureStart = null
      this.lastPinch = null
    }
  }

  onTouchCancel(e) {
    this.onTouchEnd(e)
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.onTouchStart)
    this.element.removeEventListener('touchmove', this.onTouchMove)
    this.element.removeEventListener('touchend', this.onTouchEnd)
    this.element.removeEventListener('touchcancel', this.onTouchCancel)
  }
}

/** Responsive layout helper for panels/overlays */
export function getLayoutMode(device = detectDevice()) {
  const { isMobile, isPortrait, width } = device

  if (isMobile && isPortrait) {
    return 'mobile-portrait' // Bottom sheet for panels
  } else if (isMobile) {
    return 'mobile-landscape' // Compact sidebar
  } else if (width < 1024) {
    return 'tablet' // Adaptive sidebar
  }
  return 'desktop' // Full sidebar
}

/** Calculate adaptive canvas resolution (DPR scaling) */
export function getCanvasResolution(device = detectDevice()) {
  const { isMobile, dpr } = device

  // Cap resolution on mobile to save memory & improve performance
  if (isMobile) {
    return Math.min(1.5, dpr)
  }

  // Desktop/tablet: use native DPR but cap at 2
  return Math.min(2, dpr)
}

/** Debounce helper for resize events */
export function debounce(fn, ms = 150) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), ms)
  }
}

/** Check if device should use lazy loading for off-screen content */
export function shouldLazyLoad(device = detectDevice()) {
  return device.isMobile || device.isTablet
}

/** Get adaptive label font size based on viewport */
export function getAdaptiveFontSize(baseSize, device = detectDevice()) {
  const { isMobile, width } = device

  if (isMobile) {
    // Scale down font on small screens
    return baseSize * Math.max(0.8, Math.min(1, width / 375))
  }

  return baseSize
}
