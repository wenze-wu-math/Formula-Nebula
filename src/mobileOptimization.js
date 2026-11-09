/**
 * ═══════════════════════════════════════════════════════════════
 *  移动端优化 · Mobile Optimization
 * ═══════════════════════════════════════════════════════════════
 *
 * 针对移动设备的特殊优化：
 *  · 触摸手势支持
 *  · 性能降级策略
 *  · 移动端UI调整
 *  · 省电模式检测
 */

/**
 * Detect if device is mobile
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768)
}

/**
 * Detect if device is iOS
 */
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

/**
 * Detect if device has limited memory
 */
export function hasLimitedMemory() {
  // Chrome/Edge expose memory API
  if (navigator.deviceMemory) {
    return navigator.deviceMemory <= 4 // 4GB or less
  }

  // Fallback: assume mobile devices have limited memory
  return isMobile()
}

/**
 * Detect if device is in power save mode (iOS)
 */
export function isLowPowerMode() {
  if (!isIOS()) return false

  try {
    // Battery API not widely supported on iOS, but we can check
    if ('getBattery' in navigator) {
      return navigator.getBattery().then(battery => {
        return battery.level < 0.2 && !battery.charging
      })
    }
  } catch {
    // API not available
  }

  return false
}

/**
 * Get device performance tier
 * @returns {'high' | 'medium' | 'low'}
 */
export function getPerformanceTier() {
  // High-end desktop
  if (!isMobile() && navigator.hardwareConcurrency >= 8) {
    return 'high'
  }

  // Mobile or low-end desktop
  if (isMobile() || hasLimitedMemory() || navigator.hardwareConcurrency <= 4) {
    return 'low'
  }

  return 'medium'
}

/**
 * Get recommended settings for device
 */
export function getRecommendedSettings() {
  const tier = getPerformanceTier()
  const mobile = isMobile()

  const settings = {
    // Rendering quality
    antialias: tier !== 'low',
    pixelRatio: mobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio,

    // Effects
    bloom: tier === 'high',
    nebula: tier !== 'low',
    stars: tier !== 'low',
    disc: true,

    // Performance
    autoRotate: false, // Start paused on all devices
    maxNodes: tier === 'high' ? 500 : tier === 'medium' ? 400 : 300,

    // Links
    showLinks: true,
    linkOpacity: tier === 'low' ? 0.3 : 0.5,

    // UI
    showLegend: !mobile || window.innerWidth > 600,
    showHints: !mobile || window.innerWidth > 600,
  }

  return settings
}

/**
 * Touch gesture handler
 */
export class TouchGestureHandler {
  constructor(element) {
    this.element = element
    this.touches = new Map()
    this.lastDistance = 0
    this.lastCenter = { x: 0, y: 0 }
    this.rotating = false

    this.onPinch = null
    this.onRotate = null
    this.onDoubleTap = null

    this.lastTapTime = 0
    this.tapTimeout = null

    this.bind()
  }

  bind() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
  }

  handleTouchStart(e) {
    // Detect double tap
    const now = Date.now()
    if (now - this.lastTapTime < 300 && e.touches.length === 1) {
      if (this.onDoubleTap) {
        this.onDoubleTap(e.touches[0])
        e.preventDefault()
      }
      clearTimeout(this.tapTimeout)
      this.lastTapTime = 0
      return
    }

    this.lastTapTime = now
    this.tapTimeout = setTimeout(() => {
      this.lastTapTime = 0
    }, 300)

    // Store touches
    for (const touch of e.touches) {
      this.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
      })
    }

    // Calculate initial state for multi-touch
    if (e.touches.length === 2) {
      this.lastDistance = this.getTouchDistance(e.touches)
      this.lastCenter = this.getTouchCenter(e.touches)
      this.rotating = true
    }
  }

  handleTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault()

      const distance = this.getTouchDistance(e.touches)
      const center = this.getTouchCenter(e.touches)

      // Pinch gesture
      if (this.lastDistance > 0 && this.onPinch) {
        const scale = distance / this.lastDistance
        this.onPinch(scale, center)
      }

      // Rotation gesture (two-finger pan)
      if (this.rotating && this.onRotate) {
        const dx = center.x - this.lastCenter.x
        const dy = center.y - this.lastCenter.y
        this.onRotate(dx, dy, center)
      }

      this.lastDistance = distance
      this.lastCenter = center
    }
  }

  handleTouchEnd(e) {
    // Clear stored touches
    for (const touch of e.changedTouches) {
      this.touches.delete(touch.identifier)
    }

    if (e.touches.length < 2) {
      this.rotating = false
      this.lastDistance = 0
    }
  }

  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  getTouchCenter(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    }
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchmove', this.handleTouchMove)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
  }
}

/**
 * Initialize mobile optimizations
 */
export function initMobileOptimizations(scene, settings) {
  if (!isMobile()) {
    console.log('💻 Desktop detected - using full quality settings')
    return null
  }

  console.log('📱 Mobile detected - applying optimizations')

  const tier = getPerformanceTier()
  const recommended = getRecommendedSettings()

  console.log(`📊 Performance tier: ${tier}`)
  console.log('⚙️ Recommended settings:', recommended)

  // Apply recommended settings
  if (recommended.antialias === false && scene.renderer) {
    console.log('  - Disabling antialiasing for performance')
  }

  if (recommended.bloom === false) {
    console.log('  - Disabling bloom effect for performance')
    // 这里原本调用 settings.setState({ display: {...} })，但 settings 上
    // **没有 setState 这个方法**（它提供的是 setShape / setTweak /
    // setColorMode / toggleDisplay / setGravity ...）。于是这一行在低性能
    // 设备上必然抛 TypeError: settings.setState is not a function。
    //
    // 后果远比"bloom 没关掉"严重：initMobileOptimizations() 是在 main()
    // 里第 578 行同步调用的，异常向上冒泡直接中断 main()，导致它后面所有
    // 初始化都不再执行 —— 包括 window.__nebula / __formulaNebula 的暴露。
    // 而生产构建开了 terser 的 drop_console，把 main().catch 里的
    // console.error 也一并删掉了，所以整个失败**完全静默**：用户只看到
    // splash 消失后一片空白。
    //
    // 正确写法：切到 bloom 关闭即可（toggleDisplay 是翻转语义，所以仅在
    // 当前为开时才翻）。用可选链兜底，避免任何一次设置 API 变动再次把
    // 整个启动流程带下去。
    if (settings?.state?.display?.bloom !== false && typeof settings?.toggleDisplay === 'function') {
      settings.toggleDisplay('bloom')
    }
  }

  // Reduce pixel ratio on low-end devices
  if (recommended.pixelRatio < window.devicePixelRatio && scene.renderer) {
    console.log(`  - Reducing pixel ratio: ${recommended.pixelRatio}x`)
    scene.renderer.setPixelRatio(recommended.pixelRatio)
  }

  // Add mobile-specific CSS
  const style = document.createElement('style')
  style.id = 'mobile-optimizations'
  style.textContent = `
    @media (max-width: 768px) {
      /* Larger touch targets */
      button, a, [role="button"] {
        min-height: 44px;
        min-width: 44px;
      }

      /* Prevent text selection during touch */
      #scene, #hud {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }

      /* Prevent pull-to-refresh */
      body {
        overscroll-behavior-y: contain;
      }

      /* Optimize animations */
      * {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000;
        perspective: 1000;
      }

      /* Hide complex elements on very small screens */
      @media (max-width: 430px) {
        #title p {
          display: none;
        }
      }
    }

    /* Landscape mobile */
    @media (max-width: 900px) and (orientation: landscape) {
      #title {
        top: 12px;
        left: 16px;
        padding-left: 52px;
      }

      #title::before {
        width: 42px;
        height: 34px;
      }

      #hint {
        font-size: 9px;
        bottom: 12px;
      }

      #legend {
        bottom: 12px;
        right: 12px;
        max-height: calc(100vh - 24px);
        overflow-y: auto;
      }
    }
  `
  document.head.appendChild(style)

  // Setup touch gestures
  const canvas = scene.renderer?.domElement
  if (canvas) {
    const gestures = new TouchGestureHandler(canvas)

    // Pinch to zoom
    gestures.onPinch = (scale, center) => {
      if (scene.controls && scene.controls.dolly) {
        const delta = scale > 1 ? -0.1 : 0.1
        scene.controls.dolly(delta)
      }
    }

    // Two-finger rotate
    gestures.onRotate = (dx, dy) => {
      if (scene.controls && scene.controls.rotate) {
        scene.controls.rotate(dx * 0.01, dy * 0.01)
      }
    }

    // Double tap to select
    gestures.onDoubleTap = (touch) => {
      // Convert touch to canvas coordinates and raycast
      if (scene.handlePointerDown) {
        const event = new PointerEvent('pointerdown', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        })
        scene.handlePointerDown(event)
      }
    }

    return gestures
  }

  return null
}

/**
 * Show performance warning if needed
 */
export function showPerformanceWarning() {
  const tier = getPerformanceTier()

  if (tier === 'low' && isMobile()) {
    const warning = document.createElement('div')
    warning.id = 'perf-warning'
    warning.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 159, 122, 0.95);
      color: #1a1a1a;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      z-index: 10001;
      max-width: 90%;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideDown 0.3s ease;
    `
    warning.innerHTML = `
      <strong>性能提示</strong>：检测到设备性能有限，已自动降低画质以保证流畅度
      <button style="
        margin-left: 12px;
        background: transparent;
        border: 1px solid #1a1a1a;
        color: #1a1a1a;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      " onclick="this.parentElement.remove()">知道了</button>
    `

    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translateX(-50%) translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(style)

    document.body.appendChild(warning)

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      warning.style.opacity = '0'
      warning.style.transform = 'translateX(-50%) translateY(-100%)'
      warning.style.transition = 'all 0.3s ease'
      setTimeout(() => warning.remove(), 300)
    }, 5000)
  }
}
