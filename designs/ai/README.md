# AI Visualization Recommender

An intelligent system that analyzes theorem relationships in the Formula Nebula knowledge graph and recommends the optimal visualization type for exploration.

## Features

### 🎯 Smart Visualization Selection
- Analyzes graph structure (degree, clustering, paths)
- Considers theorem importance and family
- Evaluates temporal information
- Scores all four visualization types
- Provides reasoning for recommendations

### 🔗 Auto-Highlight Connections
- Identifies critical, important, and related connections
- Scores edges by link type and node importance
- Groups highlights by significance level
- Configures visual weights and colors

### 📐 Comparison Views
- Finds shortest paths between theorems
- Identifies common neighbors
- Compares properties side-by-side
- Generates optimal comparison layouts

### 🎥 Camera Optimization
- Computes optimal viewing angles
- Adjusts zoom based on neighborhood size
- Centers on relevant subgraphs
- Provides field-of-view recommendations

## API Reference

### RecommendVisualization(theoremId)

Analyzes a theorem and recommends the best visualization.

**Parameters:**
- `theoremId` (string): ID of the theorem to analyze

**Returns:**
```javascript
{
  recommended: 'atlas' | 'map' | 'manuscript' | 'timeline',
  scores: {
    atlas: number,
    map: number,
    manuscript: number,
    timeline: number
  },
  reasons: {
    atlas: string[],
    map: string[],
    manuscript: string[],
    timeline: string[]
  },
  config: {
    // Visualization-specific configuration
  },
  metrics: {
    degree: number,
    neighborhoodSize: number,
    clustering: number,
    avgPathLength: number,
    importance: number
  }
}
```

**Example:**
```javascript
import { RecommendVisualization } from './viz-recommender.js'

const rec = RecommendVisualization('nullstellensatz')
console.log(`Recommended: ${rec.recommended}`)
console.log(`Score: ${rec.scores[rec.recommended]}`)
console.log(`Reasons:`, rec.reasons[rec.recommended])
```

### AutoHighlightConnections(theoremId)

Finds and scores important connections for a theorem.

**Parameters:**
- `theoremId` (string): ID of the theorem

**Returns:**
```javascript
{
  critical: Array<{
    src: string,
    tgt: string,
    type: string,
    score: number,
    color: string,
    width: number
  }>,
  important: Array<...>,
  related: Array<...>,
  nodes: string[]  // All connected node IDs
}
```

**Example:**
```javascript
import { AutoHighlightConnections } from './viz-recommender.js'

const highlights = AutoHighlightConnections('riemann-roch')

// Apply critical highlights
for (const edge of highlights.critical) {
  highlightEdge(edge.src, edge.tgt, {
    color: edge.color,
    width: edge.width
  })
}
```

### GenerateComparison(theorem1Id, theorem2Id)

Generates a comparison configuration for two theorems.

**Parameters:**
- `theorem1Id` (string): First theorem ID
- `theorem2Id` (string): Second theorem ID

**Returns:**
```javascript
{
  nodes: [node1, node2],
  path: string[] | null,  // Shortest path if found
  pathLength: number,
  commonNeighbors: string[],
  properties: {
    importance: { [id]: number },
    family: { [id]: string },
    degree: { [id]: number }
  },
  layout: 'path' | 'sideBySide',
  highlights: {
    path: string[],
    commonNeighbors: string[],
    distinctNeighbors1: string[],
    distinctNeighbors2: string[]
  }
}
```

**Example:**
```javascript
import { GenerateComparison } from './viz-recommender.js'

const comp = GenerateComparison('nullstellensatz', 'riemann-roch')

if (comp.path) {
  console.log(`Connected by ${comp.pathLength} hops:`, comp.path)
}
console.log(`${comp.commonNeighbors.length} common neighbors`)
```

### OptimizeCameraPosition(graph, focusNodeId?)

Optimizes camera position for viewing a graph or specific node.

**Parameters:**
- `graph` (Object): The knowledge graph
- `focusNodeId` (string, optional): Node to focus on

**Returns:**
```javascript
{
  position: [x, y, z],
  target: [x, y, z],
  fov: number,
  distance: number
}
```

**Example:**
```javascript
import { OptimizeCameraPosition } from './viz-recommender.js'
import { getGraph } from '../shared/kb.js'

const graph = getGraph()
const camera = OptimizeCameraPosition(graph, 'serre-duality')

// Apply to Three.js camera
threeCamera.position.set(...camera.position)
threeCamera.lookAt(...camera.target)
threeCamera.fov = camera.fov
threeCamera.updateProjectionMatrix()
```

## Algorithm Details

### Visualization Scoring

The recommendation engine uses a multi-factor scoring system:

#### Atlas (3D Nebula)
- **+3**: High importance (>0.8) - spatial prominence
- **+2**: High clustering (>0.5) - community structure
- **+2**: Large neighborhood (>20 nodes) - overview needed
- **+1**: Modern/birational families - exploration benefit

#### Map (2D Graph)
- **+3**: High degree (>10 connections) - clear tracing
- **+2**: Complex paths (avg>2, reachable>15) - graph layout
- **+1**: Medium degree (5-10) or neighborhood (10-20)

#### Manuscript (Book)
- **+3**: Low degree (<5) + detailed content (>200 chars)
- **+2**: Foundation family - narrative presentation
- **+1**: Complex formula (latex >100 chars)

#### Timeline (Historical)
- **+3**: Temporal information available + node has year
- Requires 30%+ of graph to have dates

### Connection Scoring

Edges are scored by:
1. **Base weight** (0-1 from data)
2. **Type bonus**:
   - implies/generalizes: +0.3
   - uses/proves: +0.2
3. **Importance bonus**: +0.2 if connected to high-importance node (>0.8)

Connections are then grouped:
- **Critical**: score > 0.8
- **Important**: score 0.5-0.8
- **Related**: score < 0.5

### Path Finding

BFS with depth limit of 6 hops. Used for:
- Comparison path visualization
- Determining layout strategy (path vs side-by-side)
- Computing average path length metrics

## Interactive Demo

The included demo UI (`index.html`) provides:

1. **Search Interface**
   - Type theorem ID or name
   - Quick example buttons
   - Auto-complete suggestions

2. **Recommendation Display**
   - Visual type with icon and description
   - Score comparison chart
   - Detailed reasoning list
   - Graph metrics dashboard

3. **Connection Visualization**
   - Grouped by significance
   - Color-coded by type
   - Hover for details

4. **Comparison Tool**
   - Select two theorems
   - View path if connected
   - Compare properties
   - Show common/distinct neighbors

5. **System Statistics**
   - Total nodes and edges
   - Average degree and clustering
   - Visualization types available

## Usage Examples

### Basic Recommendation

```javascript
import { RecommendVisualization } from './viz-recommender.js'

// Analyze Nullstellensatz
const rec = RecommendVisualization('nullstellensatz')

// Output:
// {
//   recommended: 'atlas',
//   scores: { atlas: 6, map: 1, manuscript: 2, timeline: 0 },
//   reasons: {
//     atlas: [
//       'High-importance theorem benefits from spatial prominence',
//       '24-node context benefits from overview'
//     ]
//   },
//   config: {
//     initialFocus: 'nullstellensatz',
//     zoom: 'medium',
//     highlightNeighborhood: true,
//     cameraPosition: { ... },
//     showLabels: true
//   },
//   metrics: {
//     degree: 8,
//     neighborhoodSize: 24,
//     clustering: 0.42,
//     avgPathLength: 2.3,
//     importance: 0.97
//   }
// }
```

### Highlight Critical Connections

```javascript
import { AutoHighlightConnections } from './viz-recommender.js'

const highlights = AutoHighlightConnections('riemann-roch')

// Apply to visualization
scene.edges.forEach(edge => {
  const highlight = highlights.critical.find(h =>
    h.src === edge.src && h.tgt === edge.tgt
  )

  if (highlight) {
    edge.material.color.set(highlight.color)
    edge.material.linewidth = highlight.width
    edge.material.opacity = 1.0
  }
})
```

### Compare Two Theorems

```javascript
import { GenerateComparison } from './viz-recommender.js'

const comp = GenerateComparison('nullstellensatz', 'riemann-roch')

console.log(`Path length: ${comp.pathLength}`)
// Output: "Path length: 3"

console.log(`Common neighbors: ${comp.commonNeighbors.length}`)
// Output: "Common neighbors: 5"

if (comp.layout === 'path') {
  visualizeAsPath(comp.highlights.path)
} else {
  visualizeSideBySide(comp.nodes[0], comp.nodes[1])
}
```

### Camera Positioning

```javascript
import { OptimizeCameraPosition } from './viz-recommender.js'
import { getGraph } from '../shared/kb.js'

const graph = getGraph()

// Global overview
const globalCam = OptimizeCameraPosition(graph)
camera.position.set(...globalCam.position)

// Focus on specific theorem
const focusCam = OptimizeCameraPosition(graph, 'serre-duality')
animateCameraTo(focusCam.position, focusCam.target, 1000)
```

### Batch Analysis

```javascript
import { BatchRecommend } from './viz-recommender.js'

const important = [
  'nullstellensatz',
  'riemann-roch',
  'serre-duality',
  'hirzebruch-riemann-roch',
  'grothendieck-riemann-roch'
]

const recommendations = BatchRecommend(important)

recommendations.forEach(rec => {
  console.log(`${rec.metrics.importance}: ${rec.recommended}`)
})
```

## Integration Guide

### Atlas Integration

```javascript
// In designs/atlas/main.js
import { RecommendVisualization, AutoHighlightConnections } from '../ai/viz-recommender.js'

function onNodeSelect(nodeId) {
  const rec = RecommendVisualization(nodeId)

  if (rec.recommended === 'atlas') {
    // Already in correct view - enhance with highlights
    const highlights = AutoHighlightConnections(nodeId)
    applyHighlights(highlights)
  } else {
    // Suggest switching
    showSuggestion(`This theorem might be better viewed in ${rec.recommended}`)
  }
}
```

### Map Integration

```javascript
// In designs/map/src/main.js
import { GenerateComparison } from '../ai/viz-recommender.js'

function onCompareMode(node1, node2) {
  const comp = GenerateComparison(node1.id, node2.id)

  if (comp.path) {
    highlightPath(comp.path)
  }

  highlightNodes(comp.commonNeighbors, 'shared')
  highlightNodes(comp.highlights.distinctNeighbors1, 'unique1')
  highlightNodes(comp.highlights.distinctNeighbors2, 'unique2')
}
```

## Performance

- **Recommendation**: ~5-10ms per theorem
- **Highlights**: ~2-5ms per theorem
- **Comparison**: ~10-20ms per pair
- **Camera optimization**: ~1-2ms

Suitable for real-time interactive use.

## Future Enhancements

- [ ] Machine learning-based scoring refinement
- [ ] User preference learning
- [ ] Historical context analysis
- [ ] Collaborative filtering
- [ ] Multi-theorem focus optimization
- [ ] Accessibility-aware recommendations
- [ ] Performance profiling integration

## License

Part of Formula Nebula project.
