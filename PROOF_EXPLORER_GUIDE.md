# Proof Explorer Integration Guide

## Overview

Proof Explorer enhances Formula Nebula's proof view with 8 interactive features:

1. **Proof Step Highlighting** - Click to focus, keyboard navigation
2. **Referenced Theorem Popup** - Hover tooltips for cited theorems
3. **Dependency Graph** - Visual proof step relationships
4. **Alternate Proofs Comparison** - Side-by-side proof variants
5. **Proof Completeness Indicator** - Quality score with details
6. **LaTeX Export** - One-click document generation
7. **Proof Search** - Find theorem usages across proofs
8. **Animated Proof Flow** - Visual proof logic flow

## Files Created

```
src/
├── proof-explorer.js        # Main module (all 8 features)
└── proof-explorer.css       # Styles for enhanced UI

demo-proof-explorer.html     # Standalone demo page
PROOF_EXPLORER_GUIDE.md      # This file
```

## Quick Start

### 1. Basic Integration

```javascript
// In your main.js or equivalent
import { createProofView } from './src/proofView.js'
import ProofExplorer from './src/proof-explorer.js'
import './src/proof-explorer.css'

// Create proof view (existing code)
const proofView = createProofView({
  graph: graphData,
  onNavigate: (id) => { /* your handler */ },
  onBack: () => { /* your handler */ },
  onGalaxy: () => { /* your handler */ }
})

proofView.mount()

// Add Proof Explorer
const explorer = new ProofExplorer(proofView, graphData)

// Auto-enhance when opening proofs
proofView.root.addEventListener('proof:open', (e) => {
  explorer.enhanceProofView(e.detail.id)
})
```

### 2. Manual Feature Usage

```javascript
// Use individual features programmatically

// Highlight specific steps
explorer.stepHighlighter.highlightSteps(['step-1', 'step-2'])

// Export to LaTeX
explorer.latexExporter.downloadAsFile(proof, 'my-proof.tex')

// Search for theorem usages
const usages = explorer.proofSearch.findUsages('valuation-ring')
console.log(`Found ${usages.length} usages`)

// Search proofs by keyword
const results = explorer.proofSearch.searchProofs('赋值环')
results.forEach(r => {
  console.log(r.node.name, r.score, r.matches)
})
```

## Feature Details

### 1. Proof Step Highlighting

**Automatic**: Steps become focusable when proof opens.

**Keyboard shortcuts**:
- `↓` - Next step
- `↑` - Previous step
- `Enter` - Toggle step open/closed
- `Esc` - Close proof view

**Programmatic**:
```javascript
// Focus a step
const stepElement = document.querySelector('.pv-step')
explorer.stepHighlighter.focusStep(stepElement)

// Highlight multiple steps
explorer.stepHighlighter.highlightSteps(['integral-closure-basic', 'one-direction'])

// Clear highlights
explorer.stepHighlighter.clearHighlights()

// Navigate
explorer.stepHighlighter.navigateStep('next')
```

**Events**:
```javascript
proofView.root.addEventListener('step:focus', (e) => {
  console.log('Focused step:', e.detail.stepId)
})
```

---

### 2. Referenced Theorem Popup

**Automatic**: Hovers over `.pv-link[data-theorem-id]` show popup.

**To add theorem IDs to links**:
```javascript
// In your proof rendering code, add data attribute:
link.dataset.theoremId = theorem.id
```

**Customization**:
```javascript
// Popup positioning
theoremPopup.positionPopup(targetElement)

// Manual show/hide
theoremPopup.showPopup(target, theoremId)
theoremPopup.scheduleHide()
```

---

### 3. Dependency Graph

**Automatic**: Renders when proof has `steps` and `dependencies`.

**Manual**:
```javascript
const container = document.createElement('div')
const graph = new DependencyGraph(container)
graph.render(proof, graphData)

// Later cleanup
graph.clear()
```

**Customization**:
```css
/* Adjust graph height */
.pv-dependency-graph canvas {
  height: 500px;
}
```

---

### 4. Alternate Proofs Comparison

**Data structure**: Store alternate proofs in node data:
```javascript
node.alternateProofs = [
  {
    title: 'Geometric Proof',
    steps: [...],
    dependencies: [...],
    explanation: '...'
  },
  // more alternates
]
```

**Render**:
```javascript
const comparer = new AlternateProofsComparer(container)
comparer.render(mainProof, node.alternateProofs)
```

**Event handling**:
```javascript
container.addEventListener('proof:switch', (e) => {
  const newProof = e.detail.proof
  // Re-render with new proof
})
```

---

### 5. Proof Completeness Indicator

**Automatic**: Shows when `enhanceProofView()` is called.

**Manual**:
```javascript
const indicator = new CompletenessIndicator(container)
indicator.render(proof)
```

**Scoring criteria** (calculated automatically):
- Statement: 20%
- Steps: 25%
- Explanation: 15%
- Conclusion: 10%
- Examples: 10%
- References: 10%
- History: 5%
- Remarks: 5%

**Custom thresholds**:
```javascript
// Modify in CompletenessIndicator.getColor()
getColor(score, alpha = 1) {
  if (score >= 90) return `rgba(120, 215, 255, ${alpha})` // Excellent
  if (score >= 70) return `rgba(255, 207, 122, ${alpha})` // Good
  return `rgba(255, 155, 127, ${alpha})` // Needs work
}
```

---

### 6. LaTeX Export

**UI button**: Added automatically to proof view header.

**Programmatic**:
```javascript
// Get LaTeX string
const latex = explorer.latexExporter.export(proof, {
  title: 'Valuation Rings',
  author: 'Formula Nebula'
})

// Download as file
explorer.latexExporter.downloadAsFile(proof, 'proof.tex')
```

**Output structure**:
```latex
\documentclass[12pt]{article}
\usepackage{amsmath, amssymb, amsthm}
\usepackage{xeCJK}
% Theorem environments
\begin{document}
\title{...}
\begin{theorem}...\end{theorem}
\begin{proof}...\end{proof}
% Examples, references
\end{document}
```

**Customization**: Edit `LaTeXExporter` class methods:
- `export()` - Main conversion
- `cleanMath()` - Math delimiter handling
- `cleanText()` - Text escaping

---

### 7. Proof Search

**Find theorem usages**:
```javascript
const usages = explorer.proofSearch.findUsages('valuation-ring')
// Returns: [{proofId, proofName, stepId, stepTitle, context}, ...]
```

**Search proofs by keyword**:
```javascript
const results = explorer.proofSearch.searchProofs('整闭')
// Returns: [{node, score, matches: [{field, text}]}, ...]
```

**Integration example**:
```javascript
// Add usage count badge to proof view
const usages = explorer.proofSearch.findUsages(currentNodeId)
if (usages.length > 0) {
  badge.textContent = `Used in ${usages.length} proofs`
}
```

**Search fields** (weighted):
- Statement: 10 points
- Steps: 5 points each
- Explanation: 3 points

---

### 8. Animated Proof Flow

**Automatic**: Renders when proof has 3+ steps.

**Manual**:
```javascript
const animator = new ProofFlowAnimator(container)
animator.render(proof)

// Cleanup
animator.destroy()
```

**Customization**:
```javascript
// In ProofFlowAnimator class:
createFlow(proof, width, height) {
  // Adjust particle count
  for (let j = 0; j < 5; j++) { // More particles
    this.particles.push({...})
  }
}

// Adjust animation speed
p.vx = 2 + Math.random() // Faster flow
```

**Disable animations**:
```css
@media (prefers-reduced-motion: reduce) {
  .pv-flow-animator canvas {
    display: none;
  }
}
```

---

## Styling

### Color Scheme

The module inherits Formula Nebula's design tokens:

```css
--pv-bg: #080b14         /* Background */
--pv-ink: #f5f8ff        /* Primary text */
--pv-dim: #94a8c4        /* Secondary text */
--pv-mute: #c5d2e6       /* Muted text */
--pv-gold: #ffcf7a       /* Accent gold */
--pv-cyan: #78d7ff       /* Accent cyan */
--pv-coral: #ff9b7f      /* Accent coral */
--pv-violet: #c9aeff     /* Accent violet */
```

### Custom Overrides

```css
/* Change highlight color */
.pv-step-focused {
  background: rgba(255, 100, 100, 0.1) !important;
  border-left-color: #your-color !important;
}

/* Completeness bar color */
.pv-completeness .fill {
  background: linear-gradient(90deg, #custom, #colors);
}

/* Popup styling */
.pv-theorem-popup {
  max-width: 600px;
  font-size: 14px;
}
```

### Responsive Behavior

All features adapt to mobile:
- Graph height reduces to 300px
- Proof comparison switches to single column
- Keyboard shortcuts remain active
- Touch gestures supported

---

## Events

### Built-in Events

```javascript
// Step focus
proofView.root.addEventListener('step:focus', (e) => {
  console.log(e.detail.stepId)
})

// Proof switch (alternate proofs)
container.addEventListener('proof:switch', (e) => {
  console.log(e.detail.proof)
})

// Original proof view events
proofView.root.addEventListener('proof:open', (e) => {
  console.log(e.detail.node, e.detail.navigationType)
})

proofView.root.addEventListener('proof:hide', (e) => {
  console.log('Proof view closed')
})
```

### Custom Events

Add your own:
```javascript
class CustomFeature {
  emit(name, detail) {
    this.container.dispatchEvent(new CustomEvent(name, { detail }))
  }
}
```

---

## Performance Considerations

### Lazy Loading

Features are instantiated only when needed:
```javascript
// Heavy features created on demand
if (proof.steps?.length > 10) {
  this.dependencyGraph = new DependencyGraph(container)
  this.dependencyGraph.render(proof, graph)
}
```

### Memory Management

```javascript
// Always cleanup when switching proofs
proofView.root.addEventListener('proof:open', (e) => {
  // Destroy old instances
  if (currentExplorer) {
    currentExplorer.destroy()
  }
  
  // Create new
  currentExplorer = new ProofExplorer(proofView, graphData)
  currentExplorer.enhanceProofView(e.detail.id)
})
```

### Animation Performance

```javascript
// Use requestAnimationFrame
animate() {
  // ... render frame
  this.animationFrame = requestAnimationFrame(() => this.animate())
}

// Cancel on destroy
destroy() {
  cancelAnimationFrame(this.animationFrame)
}
```

---

## Browser Compatibility

**Supported**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Required APIs**:
- `CustomEvent`
- `IntersectionObserver` (for lazy loading)
- `requestAnimationFrame` (for animations)
- Canvas 2D context
- CSS Grid & Flexbox

**Graceful degradation**:
```javascript
if (!('IntersectionObserver' in window)) {
  // Skip lazy loading, render immediately
}

if (typeof requestAnimationFrame !== 'function') {
  // Skip animations
}
```

---

## Testing

### Manual Testing Checklist

**Step Highlighting**:
- [ ] Click step focuses it
- [ ] Keyboard navigation works (↑↓)
- [ ] Enter toggles open/closed
- [ ] Focused step scrolls into view
- [ ] Multiple highlights work

**Theorem Popup**:
- [ ] Hover shows popup
- [ ] Popup positioned correctly
- [ ] LaTeX renders properly
- [ ] Popup hides on mouse out

**Dependency Graph**:
- [ ] Graph renders all nodes
- [ ] Edges connect correctly
- [ ] Layout is hierarchical
- [ ] Labels are readable

**Completeness**:
- [ ] Score calculated correctly
- [ ] Bar fills to correct %
- [ ] Details panel expands
- [ ] All checks listed

**LaTeX Export**:
- [ ] Download triggered
- [ ] File contains all content
- [ ] LaTeX compiles without errors
- [ ] Chinese characters render

**Search**:
- [ ] Finds all usages
- [ ] Context snippets shown
- [ ] Click navigates to proof
- [ ] Search scoring works

**Flow Animation**:
- [ ] Particles flow smoothly
- [ ] Colors match steps
- [ ] Animation loops
- [ ] Cleanup on destroy

### Automated Testing

```javascript
// Example test structure
describe('ProofStepHighlighter', () => {
  it('should focus step on click', () => {
    const step = document.querySelector('.pv-step')
    highlighter.focusStep(step)
    expect(step.classList.contains('pv-step-focused')).toBe(true)
  })
  
  it('should navigate to next step', () => {
    highlighter.navigateStep('next')
    expect(highlighter.activeStep).toBe(steps[1])
  })
})
```

---

## Troubleshooting

### Common Issues

**1. Popup not showing**
```javascript
// Ensure theorem IDs are set
link.dataset.theoremId = theorem.id

// Check if graph data is loaded
console.log(explorer.theoremPopup.graph)
```

**2. Graph not rendering**
```javascript
// Check proof has dependencies
console.log(proof.dependencies, proof.steps)

// Verify canvas context
console.log(canvas.getContext('2d'))
```

**3. LaTeX export incomplete**
```javascript
// Check proof data structure
console.log(JSON.stringify(proof, null, 2))

// Test individual fields
console.log(exporter.cleanMath(proof.statement))
```

**4. Styles not applied**
```javascript
// Ensure CSS is imported
import './src/proof-explorer.css'

// Check for CSS conflicts
.pv-step-focused { /* your overrides */ }
```

**5. Animation choppy**
```javascript
// Reduce particle count
for (let j = 0; j < 2; j++) { // instead of 3
  this.particles.push({...})
}

// Lower canvas resolution
this.canvas.width = width // instead of width * 2
this.canvas.height = height
```

---

## Examples

### Complete Integration

See `demo-proof-explorer.html` for full working example.

### Minimal Setup

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="src/proof-explorer.css">
</head>
<body>
  <script type="module">
    import { createProofView } from './src/proofView.js'
    import ProofExplorer from './src/proof-explorer.js'
    
    const proofView = createProofView({ graph: graphData })
    const explorer = new ProofExplorer(proofView, graphData)
    
    proofView.mount()
    proofView.open('valuation-ring')
    explorer.enhanceProofView('valuation-ring')
  </script>
</body>
</html>
```

---

## API Reference

### ProofExplorer

```typescript
class ProofExplorer {
  constructor(proofView: ProofView, graph: Graph)
  
  // Main enhancement method
  enhanceProofView(nodeId: string): void
  
  // Feature instances
  stepHighlighter: ProofStepHighlighter
  theoremPopup: TheoremPopup
  latexExporter: LaTeXExporter
  proofSearch: ProofSearch
  dependencyGraph?: DependencyGraph
  completenessIndicator?: CompletenessIndicator
  flowAnimator?: ProofFlowAnimator
  
  // Cleanup
  destroy(): void
}
```

### ProofStepHighlighter

```typescript
class ProofStepHighlighter {
  focusStep(element: HTMLElement): void
  toggleStep(element: HTMLDetailsElement): void
  navigateStep(direction: 'next' | 'prev'): void
  highlightSteps(stepIds: string[]): void
  clearHighlights(): void
}
```

### LaTeXExporter

```typescript
class LaTeXExporter {
  export(proof: Proof, metadata?: {
    title?: string,
    author?: string
  }): string
  
  downloadAsFile(proof: Proof, filename: string): void
}
```

### ProofSearch

```typescript
class ProofSearch {
  findUsages(theoremId: string): Usage[]
  searchProofs(query: string): SearchResult[]
}

interface Usage {
  proofId: string
  proofName: string
  stepId?: string
  stepTitle?: string
  type?: string
  context?: string
}

interface SearchResult {
  node: Node
  score: number
  matches: { field: string, text: string }[]
}
```

---

## Future Enhancements

Potential additions:

1. **Proof Diff Viewer** - Compare proof versions
2. **Interactive Step Editing** - Edit proof steps inline
3. **Proof Templates** - Generate proof outlines
4. **Collaborative Annotations** - Multi-user comments
5. **Proof Verification** - Automated logic checking
6. **3D Dependency Visualization** - WebGL graph
7. **Audio Proof Reading** - Text-to-speech
8. **Mobile Gestures** - Swipe navigation

---

## License

Same as Formula Nebula main project.

## Support

For issues and questions:
1. Check this guide
2. See `demo-proof-explorer.html`
3. Review `src/proof-explorer.js` inline docs
4. Open GitHub issue

---

**Last Updated**: 2026-11-02
**Version**: 1.0.0
