# AI Visualization Recommender — Examples

Real-world examples and use cases for the AI visualization recommender system.

## Example 1: Nullstellensatz (High-Importance Theorem)

### Input
```javascript
import { RecommendVisualization } from './viz-recommender.js'

const rec = RecommendVisualization('nullstellensatz')
```

### Output
```javascript
{
  recommended: 'atlas',
  scores: {
    atlas: 6,
    map: 1,
    manuscript: 2,
    timeline: 0
  },
  reasons: {
    atlas: [
      'High-importance theorem benefits from spatial prominence',
      '24-node context benefits from overview'
    ],
    map: [],
    manuscript: [
      'Foundational material suits narrative presentation'
    ],
    timeline: []
  },
  config: {
    initialFocus: 'nullstellensatz',
    zoom: 'medium',
    highlightNeighborhood: true,
    cameraPosition: {
      position: [15.2, 8.3, 12.7],
      target: [2.1, 1.4, 0.3],
      fov: 60,
      distance: 18.5
    },
    showLabels: true
  },
  metrics: {
    degree: 8,
    neighborhoodSize: 24,
    clustering: 0.42,
    avgPathLength: 2.3,
    importance: 0.97
  }
}
```

### Interpretation
- **Recommended: Atlas** — As a fundamental, high-importance theorem (0.97), Nullstellensatz benefits from the spatial prominence of the 3D atlas view
- **Moderate degree (8)** — Not too many connections to clutter a graph view
- **Medium-sized neighborhood (24)** — Large enough to show context, not overwhelming
- **Good clustering (0.42)** — Shows natural grouping with related concepts
- Atlas configuration optimized for medium zoom with labels visible

---

## Example 2: Highly Connected Theorem

### Input
```javascript
const rec = RecommendVisualization('sheaf-cohomology')
```

### Output (Simulated)
```javascript
{
  recommended: 'map',
  scores: {
    atlas: 2,
    map: 4,
    manuscript: 0,
    timeline: 0
  },
  reasons: {
    atlas: [],
    map: [
      '15 connections easier to trace in 2D',
      'Complex path structure benefits from graph layout'
    ],
    manuscript: [],
    timeline: []
  },
  config: {
    centerNode: 'sheaf-cohomology',
    showNeighbors: 35,
    layout: 'force-directed',
    edgeLabels: false
  },
  metrics: {
    degree: 15,
    neighborhoodSize: 35,
    clustering: 0.38,
    avgPathLength: 2.8,
    importance: 0.85
  }
}
```

### Interpretation
- **Recommended: Map** — High degree (15) means many connections to trace
- Force-directed layout shows relationship structure clearly
- Edge labels disabled (too many would clutter)
- Good for dependency analysis and path exploration

---

## Example 3: Foundational Concept with Detail

### Input
```javascript
const rec = RecommendVisualization('localization')
```

### Output (Simulated)
```javascript
{
  recommended: 'manuscript',
  scores: {
    atlas: 1,
    map: 0,
    manuscript: 6,
    timeline: 0
  },
  reasons: {
    atlas: [],
    map: [],
    manuscript: [
      'Detailed content with few connections suits narrative format',
      'Foundational material suits narrative presentation',
      'Complex formula benefits from detailed view'
    ],
    timeline: []
  },
  config: {
    startChapter: 'foundation',
    focusTheorem: 'localization',
    detailLevel: 'high',
    showProofs: true,
    relatedTheorems: [
      'noetherian',
      'nakayama',
      'krull-dim',
      'local-ring'
    ]
  },
  metrics: {
    degree: 4,
    neighborhoodSize: 12,
    clustering: 0.55,
    avgPathLength: 2.1,
    importance: 0.89
  }
}
```

### Interpretation
- **Recommended: Manuscript** — Low degree (4) with rich detail (>200 chars)
- Foundation family aligns with narrative presentation
- Complex formula needs space to display
- Related theorems provide reading path

---

## Example 4: Connection Highlighting

### Input
```javascript
import { AutoHighlightConnections } from './viz-recommender.js'

const highlights = AutoHighlightConnections('riemann-roch')
```

### Output
```javascript
{
  critical: [
    {
      src: 'riemann-roch',
      tgt: 'serre-duality',
      type: 'implies',
      score: 0.95,
      color: '#4fc3f7',
      width: 4.75
    },
    {
      src: 'divisor',
      tgt: 'riemann-roch',
      type: 'uses',
      score: 0.85,
      color: '#81c784',
      width: 4.25
    }
  ],
  important: [
    {
      src: 'riemann-roch',
      tgt: 'degree-map',
      type: 'related',
      score: 0.7,
      color: '#ba68c8',
      width: 3.5
    },
    {
      src: 'riemann-roch',
      tgt: 'canonical-bundle',
      type: 'uses',
      score: 0.65,
      color: '#81c784',
      width: 3.25
    }
  ],
  related: [
    {
      src: 'riemann-roch',
      tgt: 'genus',
      type: 'related',
      score: 0.45,
      color: '#ba68c8',
      width: 2.25
    }
  ],
  nodes: [
    'riemann-roch',
    'serre-duality',
    'divisor',
    'degree-map',
    'canonical-bundle',
    'genus'
  ]
}
```

### Visual Application
```javascript
// Apply highlights to Three.js scene
scene.traverse(obj => {
  if (obj.userData.edgeData) {
    const edge = obj.userData.edgeData

    // Find matching highlight
    const critical = highlights.critical.find(h =>
      (h.src === edge.src && h.tgt === edge.tgt) ||
      (h.src === edge.tgt && h.tgt === edge.src)
    )

    if (critical) {
      obj.material.color.set(critical.color)
      obj.material.linewidth = critical.width
      obj.material.opacity = 1.0
      obj.renderOrder = 100 // Bring to front
    } else {
      obj.material.opacity = 0.2 // Fade others
    }
  }
})
```

---

## Example 5: Theorem Comparison

### Input
```javascript
import { GenerateComparison } from './viz-recommender.js'

const comp = GenerateComparison('nullstellensatz', 'riemann-roch')
```

### Output
```javascript
{
  nodes: [
    {
      id: 'nullstellensatz',
      name: '希尔伯特零点定理',
      importance: 0.97,
      family: 'foundation'
    },
    {
      id: 'riemann-roch',
      name: '黎曼-罗赫定理',
      importance: 0.94,
      family: 'curve'
    }
  ],
  path: [
    'nullstellensatz',
    'ideal-variety',
    'divisor',
    'riemann-roch'
  ],
  pathLength: 3,
  commonNeighbors: [
    'zariski-topology',
    'algebraic-curve',
    'sheaf-cohomology'
  ],
  properties: {
    importance: {
      'nullstellensatz': 0.97,
      'riemann-roch': 0.94,
      difference: 0.03
    },
    family: {
      'nullstellensatz': 'foundation',
      'riemann-roch': 'curve',
      same: false
    },
    degree: {
      'nullstellensatz': 8,
      'riemann-roch': 12
    }
  },
  layout: 'path',
  highlights: {
    path: [
      'nullstellensatz',
      'ideal-variety',
      'divisor',
      'riemann-roch'
    ],
    commonNeighbors: [
      'zariski-topology',
      'algebraic-curve',
      'sheaf-cohomology'
    ],
    distinctNeighbors1: [
      'noetherian',
      'localization'
    ],
    distinctNeighbors2: [
      'canonical-bundle',
      'genus'
    ]
  }
}
```

### Interpretation
- **Path found**: Connected in 3 hops through ideal-variety and divisor
- **Layout: path** — Short enough to visualize as connected chain
- **Common neighbors**: 3 shared concepts showing thematic overlap
- **Importance**: Both very high (0.97, 0.94) but different families
- **Degree difference**: Riemann-Roch more connected (12 vs 8)

### Visualization Strategy
```javascript
if (comp.layout === 'path') {
  // Arrange nodes along curved path
  const pathLayout = {
    'nullstellensatz': { x: -30, y: 0 },
    'ideal-variety': { x: -10, y: 10 },
    'divisor': { x: 10, y: 10 },
    'riemann-roch': { x: 30, y: 0 }
  }

  // Highlight path edges strongly
  comp.highlights.path.forEach((nodeId, i) => {
    if (i < comp.highlights.path.length - 1) {
      highlightEdge(nodeId, comp.highlights.path[i + 1], {
        color: '#4fc3f7',
        width: 5,
        animated: true
      })
    }
  })

  // Show common neighbors with dotted lines
  comp.commonNeighbors.forEach(neighbor => {
    connectToPath(neighbor, {
      style: 'dotted',
      color: '#81c784'
    })
  })
}
```

---

## Example 6: Camera Optimization

### Input
```javascript
import { OptimizeCameraPosition } from './viz-recommender.js'
import { getGraph } from '../shared/kb.js'

const graph = getGraph()

// Focus on Serre Duality and its context
const camera = OptimizeCameraPosition(graph, 'serre-duality')
```

### Output
```javascript
{
  position: [18.5, 12.3, 22.1],
  target: [5.2, 3.8, 1.5],
  fov: 60,
  distance: 24.7
}
```

### Application
```javascript
// Animate camera transition
function animateCameraTo(newPos, newTarget, duration = 1000) {
  const startPos = camera.position.clone()
  const startTarget = controls.target.clone()
  const startTime = Date.now()

  function animate() {
    const elapsed = Date.now() - startTime
    const t = Math.min(elapsed / duration, 1)

    // Ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3)

    camera.position.lerpVectors(startPos, new THREE.Vector3(...newPos), eased)
    controls.target.lerpVectors(startTarget, new THREE.Vector3(...newTarget), eased)

    if (t < 1) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

animateCameraTo(camera.position, camera.target, 1000)
```

---

## Example 7: Batch Analysis for Important Theorems

### Input
```javascript
import { BatchRecommend } from './viz-recommender.js'

const fundamental = [
  'nullstellensatz',
  'noether-normalization',
  'going-up',
  'going-down',
  'primary-decomposition'
]

const recommendations = BatchRecommend(fundamental)
```

### Output Summary
```javascript
[
  { id: 'nullstellensatz', recommended: 'atlas', importance: 0.97 },
  { id: 'noether-normalization', recommended: 'manuscript', importance: 0.82 },
  { id: 'going-up', recommended: 'map', importance: 0.75 },
  { id: 'going-down', recommended: 'map', importance: 0.73 },
  { id: 'primary-decomposition', recommended: 'manuscript', importance: 0.79 }
]
```

### Visualization Strategy
```javascript
// Create guided tour based on recommendations
const tour = recommendations.map((rec, i) => ({
  step: i + 1,
  theoremId: rec.id,
  viewType: rec.recommended,
  duration: rec.metrics.neighborhoodSize > 20 ? 10000 : 5000,
  transition: rec.recommended === recommendations[i-1]?.recommended ?
    'smooth' : 'cross-fade'
}))

async function runTour() {
  for (const step of tour) {
    await switchToView(step.viewType, step.theoremId)
    await delay(step.duration)
  }
}
```

---

## Example 8: Adaptive UI Based on Recommendations

### Input
```javascript
function showTheoremDetails(theoremId) {
  const rec = RecommendVisualization(theoremId)
  const highlights = AutoHighlightConnections(theoremId)

  // Check if current view is optimal
  const currentView = getCurrentViewType() // 'atlas', 'map', etc.

  if (currentView !== rec.recommended) {
    // Show recommendation banner
    showBanner({
      message: `This theorem might be better viewed in ${rec.recommended}`,
      actions: [
        {
          label: `Switch to ${rec.recommended}`,
          onClick: () => switchView(rec.recommended, theoremId)
        },
        {
          label: 'Stay here',
          onClick: () => dismissBanner()
        }
      ],
      reasons: rec.reasons[rec.recommended]
    })
  } else {
    // Already in optimal view - enhance with highlights
    applyHighlights(highlights)

    // Show why this view is good
    showTooltip({
      message: `Perfect view for this theorem!`,
      reasons: rec.reasons[currentView],
      duration: 3000
    })
  }
}
```

---

## Example 9: Multi-Theorem Focus

### Input
```javascript
// User selects multiple theorems to compare
const selected = [
  'nullstellensatz',
  'going-up',
  'dimension-theory'
]

// Find optimal view for the group
function recommendForGroup(theoremIds) {
  const recommendations = BatchRecommend(theoremIds)

  // Count votes for each view type
  const votes = {}
  recommendations.forEach(rec => {
    votes[rec.recommended] = (votes[rec.recommended] || 0) + 1
  })

  const winner = Object.keys(votes).reduce((a, b) =>
    votes[a] > votes[b] ? a : b
  )

  return {
    recommended: winner,
    breakdown: votes,
    individual: recommendations
  }
}

const groupRec = recommendForGroup(selected)
```

### Output
```javascript
{
  recommended: 'map',
  breakdown: {
    atlas: 1,
    map: 2,
    manuscript: 0,
    timeline: 0
  },
  individual: [
    { id: 'nullstellensatz', recommended: 'atlas', ... },
    { id: 'going-up', recommended: 'map', ... },
    { id: 'dimension-theory', recommended: 'map', ... }
  ]
}
```

---

## Example 10: Real-Time Recommendation Updates

### Input
```javascript
// As user navigates, continuously update recommendations
let currentFocus = null

function onNavigationChange(newFocusId) {
  if (currentFocus === newFocusId) return

  currentFocus = newFocusId

  // Get recommendation
  const rec = RecommendVisualization(newFocusId)

  // Update UI indicators
  updateViewIndicators({
    atlas: rec.scores.atlas,
    map: rec.scores.map,
    manuscript: rec.scores.manuscript,
    timeline: rec.scores.timeline
  })

  // Highlight recommended view
  document.querySelectorAll('.view-button').forEach(btn => {
    if (btn.dataset.view === rec.recommended) {
      btn.classList.add('recommended')
      btn.title = rec.reasons[rec.recommended].join('\n')
    } else {
      btn.classList.remove('recommended')
    }
  })

  // Auto-optimize camera if staying in same view
  if (getCurrentViewType() === 'atlas') {
    const camera = OptimizeCameraPosition(getGraph(), newFocusId)
    animateCameraTo(camera.position, camera.target)
  }
}
```

---

## Integration Patterns

### Pattern 1: Recommendation Badge
```javascript
// Show recommendation as badge on theorem cards
function renderTheoremCard(theorem) {
  const rec = RecommendVisualization(theorem.id)

  return `
    <div class="theorem-card">
      <h3>${theorem.name}</h3>
      <span class="rec-badge ${rec.recommended}">
        Best in ${rec.recommended}
      </span>
      <p>${theorem.summary}</p>
    </div>
  `
}
```

### Pattern 2: Smart Transitions
```javascript
// Smooth transition between recommended views
async function smartNavigate(fromId, toId) {
  const fromRec = RecommendVisualization(fromId)
  const toRec = RecommendVisualization(toId)

  if (fromRec.recommended === toRec.recommended) {
    // Same view - just move focus
    await focusOnTheorem(toId)
  } else {
    // Different views - cross-fade
    await transitionToView(toRec.recommended, toId)
  }
}
```

### Pattern 3: Context-Aware Highlighting
```javascript
// Apply highlights based on user's current task
function highlightForTask(theoremId, task) {
  const highlights = AutoHighlightConnections(theoremId)

  switch (task) {
    case 'proof':
      // Show implications and dependencies
      applyHighlights(highlights.critical)
      break

    case 'exploration':
      // Show all connections
      applyHighlights({
        ...highlights.critical,
        ...highlights.important
      })
      break

    case 'comparison':
      // Prepare for comparison mode
      showComparisonPrompt(theoremId)
      break
  }
}
```

These examples demonstrate the full capabilities of the AI Visualization Recommender system and provide practical patterns for integration into the Formula Nebula project.
