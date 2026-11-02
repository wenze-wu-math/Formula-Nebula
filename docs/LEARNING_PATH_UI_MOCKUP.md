# Learning Path System - UI Mockup

## Main Interface Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Formula Nebula                                    [Settings] [🎯] [Help]   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┬───────────────────────────────────┐
│                                          │  🎯 学习路径               ×     │
│           3D Nebula Visualization        ├───────────────────────────────────┤
│                                          │  当前等级                         │
│                  ╱·°•○                  │  ┌─────────────────────────────┐ │
│               ·○   ╲ ╱  •··            │  │  50  ████████░░░░░░░░░░░░░  │ │
│             °•  ╲   ○                   │  └─────────────────────────────┘ │
│               ╲  ○ ╱ ╲  •°             │                                    │
│                °•○   ·                  │  ✓ 已掌握: 12    ⋯ 学习中: 5    │
│                                          │  ⏱ 总学时: 240m  ★ 理解度: 4.2  │
│                                          ├───────────────────────────────────┤
│                                          │  [💡 推荐] [📚 课程] [📊 进度] │
│                                          ├───────────────────────────────────┤
│                                          │  推荐定理:                        │
│                                          │                                    │
│                                          │  ┌─────────────────────────────┐ │
│                                          │  │ 1  希尔伯特零点定理          │ │
│                                          │  │    匹配度: 87/100            │ │
│                                          │  │    All prerequisites mastered│ │
│                                          │  └─────────────────────────────┘ │
│                                          │                                    │
│                                          │  ┌─────────────────────────────┐ │
│                                          │  │ 2  诺特正规化引理            │ │
│                                          │  │    匹配度: 75/100            │ │
│                                          │  │    Good difficulty match     │ │
│                                          │  └─────────────────────────────┘ │
│                                          │                                    │
│                                          │  ┌─────────────────────────────┐ │
│                                          │  │ 3  局部化                    │ │
│                                          │  │    匹配度: 68/100            │ │
│                                          │  │    New theorem; Perfect diff │ │
│                                          │  └─────────────────────────────┘ │
│                                          │                                    │
└─────────────────────────────────────────┴───────────────────────────────────┘

┌───────────────────────────────────┐
│  理解程度如何？                    │  ← Feedback prompt (bottom-right)
│                                    │
│  [ ★ ] [ ★ ] [ ★ ] [ ★ ] [ ★ ]   │
│   1     2     3     4     5        │
│                                    │
│  [        稍后        ]           │
└───────────────────────────────────┘
```

---

## Panel States

### State 1: Collapsed (Default)

```
                                    ┌──┐
                                    │🎯│  ← Toggle button visible
                                    └──┘
                                    
                                    Panel hidden off-screen →
```

### State 2: Expanded (Recommendations Tab)

```
┌─────────────────────────────────────┐
│  🎯 学习路径                    ×  │
├─────────────────────────────────────┤
│  当前等级                            │
│  ┌─────────────────────────────┐   │
│  │  50  ████████░░░░░░░░░░░░░  │   │
│  └─────────────────────────────┘   │
│                                      │
│  ✓ 已掌握: 12    ⋯ 学习中: 5       │
│  ⏱ 总学时: 240m  ★ 理解度: 4.2     │
├─────────────────────────────────────┤
│  [💡 推荐] [📚 课程] [📊 进度]     │  ← Active tab highlighted
│  ═══════                             │
├─────────────────────────────────────┤
│  推荐定理:                          │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 1  希尔伯特零点定理          │   │  ← Hover: border glow
│  │    匹配度: 87/100            │   │
│  │    All prerequisites mastered│   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 2  诺特正规化引理            │   │
│  │    匹配度: 75/100            │   │
│  │    Good difficulty match     │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 3  局部化                    │   │
│  │    匹配度: 68/100            │   │
│  │    New theorem               │   │
│  └─────────────────────────────┘   │
│                                      │
│  ... 5 more recommendations ...     │
│                                      │
└─────────────────────────────────────┘
```

### State 3: Curriculum Builder Tab

```
┌─────────────────────────────────────┐
│  🎯 学习路径                    ×  │
├─────────────────────────────────────┤
│  [... stats section same as above]  │
├─────────────────────────────────────┤
│  [💡 推荐] [📚 课程] [📊 进度]     │
│            ═══════                   │  ← Active tab
├─────────────────────────────────────┤
│  创建学习路径                        │
│                                      │
│  起点主题                            │
│  ┌─────────────────────────────┐   │
│  │ foundation              ▾   │   │  ← Dropdown or text input
│  └─────────────────────────────┘   │
│                                      │
│  目标主题                            │
│  ┌─────────────────────────────┐   │
│  │ cohomology              ▾   │   │
│  └─────────────────────────────┘   │
│                                      │
│  难度                                │
│  ┌─────────────────────────────┐   │
│  │ 中等 (8步)              ▾   │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │    生成学习路径    │   │  ← Gradient button
│  └─────────────────────────────┘   │
│                                      │
│  ─────────────────────────────────  │
│                                      │
│  学习路径 (6 步)                    │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ① 扎里斯基闭集               │   │
│  │   Starting theorem            │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ② 理想—簇对应                │   │
│  │   Stepping stone              │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ③ 希尔伯特零点定理           │   │
│  │   Stepping stone              │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ④ 诺特环                     │   │
│  │   Stepping stone              │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ⑤ 层理论基础                 │   │
│  │   Stepping stone              │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ⑥ 上同调基础                 │   │
│  │   Target theorem              │   │  ← Gold border
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### State 4: Progress Tab

```
┌─────────────────────────────────────┐
│  🎯 学习路径                    ×  │
├─────────────────────────────────────┤
│  [... stats section ...]             │
├─────────────────────────────────────┤
│  [💡 推荐] [📚 课程] [📊 进度]     │
│                      ═══════         │  ← Active tab
├─────────────────────────────────────┤
│  学习记录                            │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 希尔伯特零点定理      ✓ 已掌握 │   │  ← Cyan badge
│  │ ⏱ 45m  👁 7次  ★ 5/5  100%  │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 诺特环              ⋯ 学习中   │   │  ← Gold badge
│  │ ⏱ 18m  👁 3次  ★ 3/5  60%   │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 局部化              ○ 已浏览   │   │  ← Gray badge
│  │ ⏱ 5m   👁 1次  ★ 0/5  20%   │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 中山正引理          ○ 已浏览   │   │
│  │ ⏱ 3m   👁 1次  ★ 0/5  15%   │   │
│  └─────────────────────────────┘   │
│                                      │
│  ... 11 more theorems ...            │
│                                      │
│  ─────────────────────────────────  │
│                                      │
│  [导出进度] [导入进度] [清除数据]  │
└─────────────────────────────────────┘
```

---

## Interactive Elements

### 1. Recommendation Card (Hover State)

**Before Hover:**
```
┌─────────────────────────────┐
│ 1  希尔伯特零点定理          │
│    匹配度: 87/100            │
│    All prerequisites mastered│
└─────────────────────────────┘
```

**During Hover:**
```
┌─────────────────────────────┐  ← Glowing cyan border
│ 1  希尔伯特零点定理          │  ← Slightly brighter background
│    匹配度: 87/100            │
│    All prerequisites mastered│
└─────────────────────────────┘
        ↓ cursor: pointer
```

**Click Action:** Opens proof view for that theorem

---

### 2. Curriculum Step (Visual Connection)

```
┌─────────────────────────────┐
│ ① 扎里斯基闭集               │  ← Cyan left border
│   Starting theorem            │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│ ② 理想—簇对应                │  ← Gray left border
│   Stepping stone              │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│ ③ 希尔伯特零点定理           │  ← Gray left border
│   Stepping stone              │
└─────────────────────────────┘
        ↓
       ...
        ↓
┌─────────────────────────────┐
│ ⑥ 上同调基础                 │  ← Gold left border
│   Target theorem              │
└─────────────────────────────┘
```

**Visual Flow:** Subtle connecting lines or gradient between steps

---

### 3. Understanding Feedback Prompt

**Initial State (2s after opening proof):**
```
┌───────────────────────────────────┐
│  理解程度如何？                    │  ← Slide up animation
│                                    │
│  [★] [★] [★] [★] [★]             │  ← Empty stars
│                                    │
│  [        稍后        ]           │
└───────────────────────────────────┘
```

**Hover on Star:**
```
┌───────────────────────────────────┐
│  理解程度如何？                    │
│                                    │
│  [★] [★] [★] [★] [★]             │
│   ↑  Fill animation on hover      │
│                                    │
│  [        稍后        ]           │
└───────────────────────────────────┘
```

**After Rating:**
```
┌───────────────────────────────────┐
│  感谢反馈！                        │  ← Brief confirmation
│                                    │
│  [★][★][★][★][☆]                │  ← Filled stars
│                                    │
└───────────────────────────────────┘
    ↓ Fade out after 1 second
```

---

### 4. Mastery Achievement Modal

**Animation Sequence:**

**Frame 1 (0.0s):** Fade in + scale up
```
        ┌─────────────────────────┐  ← opacity: 0 → 1
        │                          │  ← scale: 0.9 → 1
        │           🎉             │
        │                          │
        │       掌握成就           │
        │   希尔伯特零点定理       │
        └─────────────────────────┘
```

**Frame 2 (0.5s):** Full reveal
```
        ┌─────────────────────────┐
        │                          │
        │           🎉             │  ← Particle effect
        │                          │
        │       掌握成就           │
        │   希尔伯特零点定理       │
        │                          │
        │  ─────────────────────  │
        │                          │
        │  推荐下一步              │
        │                          │
        │  ┌───────────────────┐  │
        │  │ 诺特正规化引理     │  │  ← Slide in from bottom
        │  │ 匹配度: 87/100     │  │
        │  └───────────────────┘  │
        │                          │
        │  ┌───────────────────┐  │
        │  │ 概形基础           │  │
        │  │ 匹配度: 75/100     │  │
        │  └───────────────────┘  │
        │                          │
        │  ┌───────────────────┐  │
        │  │ 层理论             │  │
        │  │ 匹配度: 68/100     │  │
        │  └───────────────────┘  │
        │                          │
        │  [   继续当前学习   ]   │
        │                          │
        └─────────────────────────┘
```

**Backdrop:** Semi-transparent dark overlay (rgba(0,0,0,0.7))

**Exit:** Click outside or "继续当前学习" button, or auto-close after 10s

---

## Color Scheme

### Primary Colors
- **Cyan (主色)**: `#78d7ff` - Recommendations, active states
- **Gold (目标色)**: `#ffcf7a` - Target theorems, in-progress
- **Purple (辅助色)**: `#c9aeff` - Accents, gradients
- **White (文字)**: `#f5f8ff` - Primary text
- **Gray (次要)**: `#94a8c4` - Secondary text, borders

### Status Colors
- **Mastered**: `#78d7ff` (Cyan) - ✓
- **In Progress**: `#ffcf7a` (Gold) - ⋯
- **Viewed**: `#94a8c4` (Gray) - ○

### Semantic Colors
- **Success**: `#78d7ff` (Cyan)
- **Warning**: `#ffcf7a` (Gold)
- **Info**: `#c9aeff` (Purple)
- **Neutral**: `#94a8c4` (Gray)

---

## Typography

### Hierarchy
```
H1 (Panel Title): 16px, weight 600, color #f5f8ff
H2 (Section): 14px, weight 600, color #f5f8ff
H3 (Card Title): 13px, weight 600, color #f5f8ff
Body: 12.5px, weight 400, color #c5d2e6
Small: 11.5px, weight 400, color #94a8c4
Tiny: 11px, weight 400, color #94a8c4
```

### Emphasis
- **Bold**: Important metrics, theorem names
- **Regular**: Body text, descriptions
- **Light**: Timestamps, auxiliary info

---

## Spacing System

```
XXS:  4px  - Tight gaps
XS:   8px  - Element inner padding
S:    12px - Card padding
M:    16px - Section padding
L:    20px - Panel padding
XL:   24px - Major section gaps
XXL:  32px - Modal padding
```

---

## Animation Timing

### Transitions
- **Fast**: 0.2s - Hover, active states
- **Normal**: 0.3s - Panel slide, tab switch
- **Slow**: 0.5s - Modal appear, mastery celebration

### Easing Functions
- **Ease**: Default for most transitions
- **Ease-out**: For appearing elements
- **Ease-in**: For disappearing elements
- **Ease-in-out**: For smooth back-and-forth

---

## Responsive Behavior

### Panel Width
- **Desktop (>1400px)**: 360px
- **Laptop (1200-1400px)**: 320px
- **Small screens (<1200px)**: Overlay mode, full-width

### Collapsing Strategy
```
Desktop:      Slide from right
Laptop:       Slide from right
Tablet:       Slide from right (narrower)
Mobile:       Full-screen overlay from bottom
```

---

## Accessibility Features

### Keyboard Navigation
- **Tab**: Move between interactive elements
- **Enter**: Activate button/card
- **Escape**: Close panel/modal
- **Arrow Keys**: Navigate list items

### Screen Reader Support
```html
<div role="region" aria-label="Learning Path Recommendations">
  <div role="list" aria-label="Recommended theorems">
    <div role="listitem" aria-label="Recommendation 1 of 8">
      <button aria-label="Open Hilbert's Nullstellensatz, match score 87 out of 100">
        希尔伯特零点定理
      </button>
    </div>
  </div>
</div>
```

### Focus Indicators
- Visible focus ring: 2px solid cyan
- High contrast mode compatible
- Skip navigation links

---

## Mobile Adaptations

### Touch-Friendly Targets
- Minimum tap target: 44x44px
- Increased padding on mobile
- Swipe gestures for panel

### Mobile-Specific UI

```
┌─────────────────────┐
│  Formula Nebula  🎯 │  ← Tap to open full-screen
└─────────────────────┘

[Tap 🎯]

┌─────────────────────┐
│  ← 学习路径          │  ← Full-screen overlay
├─────────────────────┤
│                      │
│  [Stats section]     │
│                      │
├─────────────────────┤
│  [Tabs]              │
├─────────────────────┤
│                      │
│  [Content]           │
│                      │
│                      │
│                      │
└─────────────────────┘
```

**Mobile Gestures:**
- Swipe down: Dismiss panel
- Swipe left/right: Switch tabs
- Tap card: Open theorem

---

## Loading States

### Curriculum Generation

**Before Generation:**
```
┌─────────────────────────────┐
│  [Input fields]              │
│                              │
│  [  生成学习路径  ]         │
└─────────────────────────────┘
```

**During Generation:**
```
┌─────────────────────────────┐
│  [Input fields]              │
│                              │
│  [  ⟳ 生成中...  ]          │  ← Spinning icon
└─────────────────────────────┘
```

**After Generation:**
```
┌─────────────────────────────┐
│  [Input fields]              │
│                              │
│  [  生成学习路径  ]         │
│                              │
│  学习路径 (6 步)            │
│  [Steps appear with          │
│   stagger animation]         │
└─────────────────────────────┘
```

---

## Empty States

### No Recommendations
```
┌─────────────────────────────────────┐
│  💡 推荐                            │
├─────────────────────────────────────┤
│                                      │
│         🌟                          │
│                                      │
│     暂无推荐                        │
│     先掌握一些基础定理吧！          │
│                                      │
│  [查看基础定理]                     │
│                                      │
└─────────────────────────────────────┘
```

### No Progress History
```
┌─────────────────────────────────────┐
│  📊 进度                            │
├─────────────────────────────────────┤
│                                      │
│         📚                          │
│                                      │
│     还没有学习记录                  │
│     开始探索星云吧！                │
│                                      │
│  [探索定理星云]                     │
│                                      │
└─────────────────────────────────────┘
```

### Failed Curriculum Generation
```
┌─────────────────────────────────────┐
│  📚 课程                            │
├─────────────────────────────────────┤
│  [Input fields]                      │
│                                      │
│  [  生成学习路径  ]                 │
│                                      │
│  ⚠ 未找到学习路径                  │
│     请检查输入的主题ID               │
│                                      │
│  提示：可以输入定理ID或family名称   │
│                                      │
└─────────────────────────────────────┘
```

---

## Notification Styles

### Success Notification (Mastery)
```
        ┌─────────────────────────┐
        │         🎉              │  ← Animated
        │     掌握成就             │
        │  [Theorem name]          │
        └─────────────────────────┘
```

### Info Notification (Session Start)
```
┌───────────────────────────────┐
│  ℹ️ 学习会话已开始             │
│     计时器正在运行             │
└───────────────────────────────┘
```

### Warning Notification (Long Idle)
```
┌───────────────────────────────┐
│  ⚠️ 您已离开10分钟             │
│     是否继续当前学习？         │
│  [继续] [结束]                │
└───────────────────────────────┘
```

---

## Interaction Flows

### Flow 1: First-Time User

```
1. User opens app
   ↓
2. Nebula renders, no learning path panel
   ↓
3. User clicks 🎯 button
   ↓
4. Panel slides in, shows:
   - Level 0
   - No mastered theorems
   - Foundation theorems as recommendations
   ↓
5. User clicks recommendation
   ↓
6. Proof view opens
   ↓
7. After 2s, feedback prompt appears
   ↓
8. User rates understanding
   ↓
9. Stats update, panel refreshes
```

### Flow 2: Creating a Curriculum

```
1. User opens learning path panel
   ↓
2. Clicks [📚 课程] tab
   ↓
3. Enters:
   - Start: "foundation"
   - Target: "cohomology"
   - Difficulty: "medium"
   ↓
4. Clicks [生成学习路径]
   ↓
5. Button shows loading state
   ↓
6. Algorithm computes path (BFS + ranking)
   ↓
7. Results appear with stagger animation
   ↓
8. User clicks step in curriculum
   ↓
9. Proof view opens for that theorem
```

### Flow 3: Achieving Mastery

```
1. User viewing theorem (4th visit)
   ↓
2. Spends 5+ minutes
   ↓
3. Completes 80%+ of proof steps
   ↓
4. Rates understanding as 4/5
   ↓
5. Tracker auto-detects mastery
   ↓
6. Modal appears: "🎉 掌握成就"
   ↓
7. Shows 3 next recommendations
   ↓
8. User clicks one → opens immediately
   OR
   User clicks "继续" → modal closes
```

---

## Technical Implementation Notes

### CSS Architecture
```css
/* Base variables */
:root {
  --lp-cyan: #78d7ff;
  --lp-gold: #ffcf7a;
  --lp-purple: #c9aeff;
  --lp-ink: #f5f8ff;
  --lp-mute: #c5d2e6;
  --lp-dim: #94a8c4;
  --lp-bg: rgba(12, 17, 29, 0.95);
  --lp-transition: 0.3s ease;
}

/* Panel */
.learning-path-panel {
  position: fixed;
  right: 20px;
  top: 80px;
  width: 360px;
  transform: translateX(400px);
  transition: transform var(--lp-transition);
}

.learning-path-panel.is-open {
  transform: translateX(0);
}

/* Cards */
.lp-rec-item {
  transition: all 0.2s;
  cursor: pointer;
}

.lp-rec-item:hover {
  border-color: var(--lp-cyan);
  background: rgba(120, 215, 255, 0.08);
}
```

### JavaScript Hooks
```javascript
// Panel toggle
const toggleBtn = document.getElementById('lp-toggle-btn')
toggleBtn.addEventListener('click', () => {
  panel.classList.toggle('is-open')
})

// Recommendation click
document.querySelectorAll('.lp-rec-item').forEach(item => {
  item.addEventListener('click', () => {
    const theoremId = item.dataset.theoremId
    proofView.open(theoremId, { pushHistory: true })
    panel.classList.remove('is-open')
  })
})

// Rating submission
document.querySelectorAll('.lp-rating-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const rating = parseInt(btn.dataset.rating)
    trackProgress(currentTheorem, rating)
    updateStats()
  })
})
```

---

## Performance Targets

### Metrics
- **Panel open**: < 300ms (slide animation)
- **Recommendation render**: < 100ms (up to 10 items)
- **Curriculum generation**: < 500ms (typical case)
- **Stats update**: < 50ms (after user action)

### Optimization Strategies
- Virtualize long lists (progress tab > 50 items)
- Debounce input fields (curriculum builder)
- Cache ranked recommendations (30s)
- Lazy-load curriculum results

---

## Browser Compatibility

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Fallbacks
- No backdrop-filter: Solid background
- No CSS Grid: Flexbox layout
- No custom scrollbar: Native scrollbar

---

## Future UI Enhancements

### Planned Features
1. **Dark/Light Theme Toggle**
2. **Curriculum Timeline View** (Gantt-style)
3. **Drag-and-Drop Curriculum Reordering**
4. **Study Streak Calendar**
5. **Achievement Badges Showcase**
6. **Social Sharing** (curriculum as image)
7. **Voice-Over Instructions** (accessibility)
8. **Multi-Language Support** (i18n)

### Experimental Ideas
- **AR Mode**: View theorems in 3D space
- **Collaborative Study Rooms**
- **AI Tutor Chat** (integrated)
- **Gamified Challenges** (daily quests)

---

This UI mockup serves as the visual specification for the learning path system implementation.
