# Graph Analytics Dashboard

Interactive metrics and insights panel for the Formula Nebula knowledge graph.

## Features

### 1. Degree Distribution Histogram
- Visualizes the distribution of node connections across the graph
- Shows how many nodes have each degree value
- Color-coded from blue to purple based on degree magnitude
- **Stats displayed:**
  - Total nodes
  - Total links
  - Average degree
  - Maximum degree

### 2. Centrality Rankings (PageRank-style)
- Computes PageRank scores to identify most influential nodes
- Top 20 nodes displayed as horizontal bar chart
- Top 10 listed below with exact scores
- Uses iterative algorithm with dampingFactor=0.85
- **Insight:** Identifies hub theorems and foundational concepts

### 3. Community Detection Visualization
- Groups nodes by family membership
- Displays as pie chart showing relative sizes
- **Stats displayed:**
  - Total communities detected
  - Largest community size
  - Smallest community size
- **Insight:** Reveals mathematical sub-domains and their scale

### 4. Cross-Source Connection Matrix
- Heatmap showing connections between knowledge sources
- Sources: knowledge, stacks, nlab, mathlib, conjecture, researcher, wikipedia
- Cell intensity indicates connection count
- **Insight:** Shows how different mathematical knowledge bases interconnect

### 5. Family Connectivity Heatmap
- Symmetric matrix of inter-family connections
- Purple color gradient indicates connection strength
- Shows which mathematical families are closely related
- **Stats displayed:**
  - Total families
  - Total inter-family links
- **Insight:** Reveals cross-domain mathematical relationships

### 6. Isolated Nodes List
- Lists all nodes with no connections
- Shows family and source information
- Empty state when all nodes are connected
- **Insight:** Identifies orphaned concepts needing integration

### 7. Most Referenced Theorems
- Ranks theorems by incoming link count
- Bar chart shows top 15
- List shows top 10 with reference counts
- **Insight:** Identifies foundational results used widely across the graph

### 8. Proof Completeness Gauge
- Circular gauge showing percentage of theorems with proofs
- Gradient from cyan to purple
- **Categories:**
  - Complete proofs (proof/proofUrl/mathlib formal proofs)
  - Partial proofs (sketches/hints)
  - No proofs
- **Stats displayed:**
  - Total theorems
  - Complete/Partial/None counts
- **Insight:** Measures knowledge base maturity and proof coverage

## Implementation Details

- **No external chart libraries** - All visualizations rendered with Canvas 2D API
- **Responsive** - Adapts to viewport with devicePixelRatio support
- **Interactive** - Hover states on all panels
- **Color schemes** - Consistent HSL color gradients for data encoding
- **Performance** - Efficient graph algorithms with caching

## Usage

1. Start the development server:
   ```bash
   npm run start:designs
   ```

2. Navigate to:
   ```
   http://localhost:5190/analytics/
   ```

3. The dashboard loads and computes all metrics automatically

## Technical Notes

- **Data source:** Uses `designs/shared/kb.js` to access unified graph
- **Algorithm complexity:**
  - Degree computation: O(E) where E = edges
  - PageRank: O(20 × E) = O(E) for fixed iterations
  - Community detection: O(N) where N = nodes
  - Cross-source matrix: O(E)
  - Reference counting: O(E)

- **Canvas rendering:** All charts use high-DPI rendering with pixel ratio scaling

## Files

- `index.html` - Dashboard structure and layout
- `analytics.css` - Styling and theme (dark mode)
- `main.js` - All analytics logic and canvas rendering
- `README.md` - This file

## Future Enhancements

Possible additions:
- Export charts as PNG/SVG
- Filter by date/source
- Time-series evolution of metrics
- Graph clustering quality metrics
- Shortest path calculator
- Subgraph extraction tools
