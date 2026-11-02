# Formula Nebula User Guide
# 公式诗云 · 用户指南

A comprehensive guide to exploring algebraic geometry through an interactive 3D nebula visualization.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Atlas Guide](#3-atlas-guide)
4. [Map Guide](#4-map-guide)
5. [Manuscript Guide](#5-manuscript-guide)
6. [Nebula Guide](#6-nebula-guide)
7. [Search and Filters](#7-search-and-filters)
8. [Proof View](#8-proof-view)
9. [Keyboard Shortcuts](#9-keyboard-shortcuts)
10. [Tips and Tricks](#10-tips-and-tricks)

---

## 1. Introduction

### What is Formula Nebula?

Formula Nebula (公式诗云) is an interactive 3D visualization of algebraic geometry's knowledge landscape. It presents **464 mathematical theorems, constructions, and conjectures** as a spiral galaxy, where:

- **The main galaxy** (405 theorems) forms a disk with 4 spiral arms
- **The conjecture cluster** (59 conjectures) forms a spherical star cluster
- **Position encodes importance**: theorems closer to the center are more fundamental
- **Connections show relationships**: glowing arcs link related knowledge

Inspired by Liu Cixin's "The Poems" (诗云), Formula Nebula transforms mathematical knowledge into a cosmic visualization where you can explore connections, understand proof structures, and navigate the entire field at once.

### Key Features

- **464 nodes**: 405 theorems + 59 conjectures, each with LaTeX-rendered formulas
- **1,620 relationships**: typed connections showing how knowledge builds upon itself
- **4 galaxy shapes**: spiral, barred spiral, concentric rings, diffuse disk
- **8 knowledge families**: color-coded domains (schemes, cohomology, curves, etc.)
- **3 viewports**: full view, main galaxy only, conjecture cluster only
- **Interactive proofs**: 8 enhanced features for exploring proof structures
- **Real-time search**: find theorems by name, field, status, or logical relationships
- **Deep linking**: share exact views via URL

### Who is it for?

- **Math students**: Navigate the landscape of algebraic geometry visually
- **Researchers**: Find connections between theorems and explore proof dependencies
- **Educators**: Present mathematical structures with engaging visualizations
- **Enthusiasts**: Discover the beauty of mathematical knowledge organization

---

## 2. Getting Started

### Installation

**Requirements:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Node.js 16+ (for local development)

**Quick Start:**

```bash
# Clone or download the project
git clone [repository-url]
cd formula-nebula

# Install dependencies
npm install

# Start development server (port 5175)
npm run dev

# Open in browser
# Navigate to http://localhost:5175
```

**Production Build:**

```bash
# Build for production
npm run build

# Preview production build (port 5176)
npm run preview
```

### First Launch

When you first open Formula Nebula:

1. **Loading screen** appears with a progress bar
   - 464 LaTeX formulas are being rendered (3-6 seconds)
   - This happens once per session; subsequent views are instant

2. **Initial view** shows the full nebula
   - Main galaxy disk tilted at 40° for optimal viewing
   - Conjecture cluster visible on the right side
   - Everything is gently rotating

3. **Start exploring** by:
   - Dragging to rotate the view
   - Scrolling to zoom in/out
   - Hovering over formulas to see their names
   - Clicking a formula to see details

---

## 3. Atlas Guide

The Atlas view is the main 3D nebula visualization.

### Basic Controls

| Action | Effect |
|--------|--------|
| **Drag** | Rotate the nebula |
| **Scroll / Pinch** | Zoom in/out |
| **Hover** | Highlight formula + show name tooltip |
| **Click formula** | Focus camera on it + open detail panel |
| **Click empty space** | Close panel + return to initial view |
| **Press `Esc`** | Close panels progressively |

### Understanding the Layout

**Main Galaxy (Disk):**
- **Center to edge**: Importance gradient (core theorems → specialized results)
- **4 spiral arms**: Organized by knowledge family
- **Size**: Larger formulas are more important
- **Brightness**: Brighter formulas are more fundamental
- **Glow**: Each formula has a small light point at its center

**Conjecture Cluster (Sphere):**
- **Distance from center**: Fame/importance of conjecture
- **6 directions**: Different mathematical fields
- **Status dots**: Color-coded status indicators
  - 🟠 Orange-red: Still unsolved (33)
  - 🟡 Yellow: Partially solved (9)
  - 🟢 Green: Now proven (15)
  - 🔴 Pink: Disproved (2)

### Camera and Focus

**Automatic focusing:**

When you click a formula:
- Camera **flies smoothly** to center it in view
- Detail panel opens on the right side
- **Connections appear**: glowing arcs to directly related formulas
- Camera follows the formula as it bobs gently

**Panel offset:**
The formula is positioned slightly left of center so the panel doesn't cover it.

**Returning to overview:**
- Close the panel (X button or `Esc`)
- Camera **returns to the initial viewpoint**
- All connection arcs disappear

**Navigating between formulas:**
Click any "Related Knowledge" link in the panel to jump to that formula.

### Visual Elements

**Formulas:**
- Rendered with MathJax as high-quality LaTeX
- Always face the camera (billboard effect)
- Gentle floating animation (can be disabled)
- Color represents knowledge family or status

**Connection Lines:**
- **Focus mode** (default): Only visible when a formula is selected
- **Always-on mode**: Available in Settings → Display Layers
- **Color coding**: 
  - Blue shades: Internal galaxy connections
  - Purple/violet: Cross-cluster connections (conjecture ↔ theorem)
  - Typed relationships: 11 colors for different logical relationships

**Background:**
- Deep space starfield with depth parallax
- Spiral arms rendered as glowing streams
- Bloom effects for atmospheric depth

### Settings Panel

Press **S** or click the **⚙ Settings** button (top right) to open:

**Galaxy Shape** (changes main disk only):
- **Spiral Galaxy** (default): 4 logarithmic spiral arms + core bulge
- **Barred Spiral**: Central bar + 2 arms (highlights core theorems)
- **Concentric Rings**: 16 rings like a target (pure importance hierarchy)
- **Diffuse Disk**: Smooth exponential disk (no structure, density only)

**Viewport** (instant switch, no rebuild):
- **Full View**: See both galaxy and cluster
- **Main Galaxy**: Focus on theorems only
- **Conjecture Cluster**: Focus on conjectures only

**Coloring**:
- **By Knowledge Family** (default): 8 colors for 8 theorem families
- **By Conjecture Status**: Color conjectures by solved/unsolved/disproved
- **By Conjecture Field**: 6 colors for 6 mathematical domains
- **Unified Orange**: Monochrome, only brightness varies

**Parameters** (real-time sliders):
- Galaxy rotation speed
- Background differential rotation
- Glow point size & brightness
- Bloom threshold
- Formula brightness
- Connection line opacity
- Hover magnification

**Display Layers** (instant on/off):
- Connection lines (focus/all/off modes)
- Conjecture cluster visibility
- Cluster soft glow (the outer sphere)
- Status dots on conjectures
- Background nebula streams
- Deep space starfield
- Disk glow layer
- Post-processing bloom
- Legend panel
- Formula bobbing animation
- Camera auto-rotate

**Gravity Mode**:
- Camera co-rotates with galaxy
- Formulas appear **stationary on screen** (easier to read/click)
- Background still flows (maintains motion feel)
- Essential for reading small formulas in full view

---

## 4. Map Guide

The Map view provides 2D overview and export capabilities.

### SVG Export

Click **"导出 SVG"** (Export SVG) in the bottom-left corner:

**What it captures:**
- Current viewport (follows your selected view)
- All visible formulas as text
- Connection lines with proper styling
- Follows current camera angle and zoom

**What you get:**
- Vector SVG file (scalable without quality loss)
- Compatible with Adobe Illustrator, Inkscape, web browsers
- Suitable for academic papers, presentations, posters
- File size ~500KB-2MB depending on complexity

**Use cases:**
- Create publication figures
- Print large-format posters
- Annotate in vector graphics software
- Include in LaTeX documents

**Tips:**
- Switch to desired viewport first (galaxy/cluster/full)
- Zoom to your preferred framing
- Disable auto-rotation for stable export
- Use gravity mode to stabilize formula positions

### Reading the Map

**Top view (bird's eye):**
The exported map is a **top-down projection** of the 3D space:
- Z-axis (depth) is preserved in layer ordering
- Formulas closer to camera appear on top
- Connection lines may overlap but follow depth

**Spatial relationships:**
- Radial distance = importance (closer = more fundamental)
- Angular position = knowledge family
- Line bundles = groups of related theorems

---

## 5. Manuscript Guide

The Manuscript view is the formula detail panel.

### Opening a Formula

Click any formula in the nebula to open its detail panel on the right side.

**Panel sections:**

**1. Header:**
- **Name** in Chinese and English
- **LaTeX formula** (large, rendered)
- **Knowledge family** badge
- **Importance score** (0-100%)

**2. Overview:**
- Summary of what the theorem states
- Historical context (who, when, why important)
- Mathematical domain and prerequisites

**3. Related Knowledge:**
- **Direct connections** to other theorems
- Click any link to navigate there
- **Relationship type** (if determined):
  - Equivalent, Implies, Generalizes, Defines, etc.
  - Color-coded by relationship type
- **Connection reason** explains why they're linked

**4. For Conjectures (additional info):**
- **Status**: Open, Partially Solved, Proved, Disproved
- **Proposed by**: Name and year
- **Latest progress**: Most recent development (with year)
- **Field**: Specific mathematical domain

**5. Proof View Button:**
"阅读证明与知识脉络" (Read Proof and Knowledge Context)
- Opens dedicated proof exploration interface
- Available for theorems with proof data
- Still accessible for conjectures (shows context even without formal proof)

### Navigation in Panel

**Within current formula:**
- Scroll to read full content
- Expand/collapse sections
- Click external links (if any)

**Between formulas:**
- Click **"Related Knowledge"** entries to jump
- Camera follows to the new formula
- Panel updates with new content
- Connection arcs update to show new relationships

**Returning to nebula:**
- Click **X** (close button)
- Press **Esc**
- Click empty space in the 3D view

### Understanding Relationships

**57.0% of connections** have identified relationship types:

| Type | Color | Meaning |
|------|-------|---------|
| Equivalent | Cyan-green | A ⟺ B (two ways to state same thing) |
| Defines | Sky blue | A defines the concept in B |
| Implies | Rose | A ⟹ B (logical consequence) |
| Generalizes | Grass green | A is broader version of B |
| Computes | Olive | A calculates/constructs B |
| Property | Warm gray | A has property B |
| Depends | Amber | A requires B as prerequisite |
| Same Family | Indigo | A and B belong to same domain |
| Contrast | Gray-purple | A vs B (comparison) |
| Provenance | Slate | Cross-reference to database entry |
| Analogy | Orchid | A is analogous to B |

**43% marked "Related"**: connection exists but specific type unclear from source data.

---

## 6. Nebula Guide

Advanced 3D interaction techniques.

### Camera Control

**Mouse/Trackpad:**
- Drag: Orbit around center
- Scroll: Zoom in/out
- Two-finger drag: Pan (if enabled)

**Touch (Mobile):**
- One finger: Rotate
- Two fingers: Pinch to zoom
- Two-finger drag: Pan

**Keyboard:**
- Arrow keys: Rotate
- +/- : Zoom
- S: Open settings
- Esc: Close panels

### Understanding Depth

**Visual cues:**
- **Size**: Closer objects appear larger (perspective)
- **Bloom intensity**: Closer lights bloom more
- **Occlusion**: Far objects hidden behind near ones
- **Line thickness**: Connection lines vary with distance

**Parallax effects:**
- Background starfield moves slower (depth illusion)
- Nebula streams at different depths
- Formula bobbing creates depth perception

### Finding Specific Formulas

**When you know the name:**
Use search (top-right corner) - see [Section 7](#7-search-and-filters)

**When exploring visually:**

1. **Look at color** (if colored by family):
   - 🟡 Gold: Core concepts (schemes, varieties)
   - 🔵 Blue: Cohomology theories
   - 🟣 Purple: Modern techniques
   - 🟢 Green: Curve theory
   - Etc.

2. **Look at position**:
   - Center: Foundational (rings, schemes, morphisms)
   - Mid-range: Standard tools (cohomology, sheaves)
   - Outer regions: Specialized results

3. **Look at size**:
   - Large + bright = very important
   - Small + dim = specialized/technical

4. **Use gravity mode**:
   - Press S → Enable "Gravity"
   - Formulas freeze on screen (easier to read names)

### Working with Connections

**Focus mode** (default):
- Click formula → see only its direct connections
- Clean, readable network
- Easy to understand immediate neighbors

**Always-on mode**:
Settings → Display Layers → Connection Lines → "Always"
- All 1,620 connections visible at once
- Beautiful web of knowledge
- Can be overwhelming, best with zoom

**Hover to inspect**:
- Hover mouse over a connection line
- Tooltip shows: source → target, relationship type, reason
- Works in both modes

**Connection colors**:
If "Color by Relationship Type" is enabled:
- Each typed connection shows its relationship color
- Blue connections remain for untyped ("related")
- Purple connections for cross-cluster links

**Tracing paths**:
- Click formula A
- Note its connections (shown in panel)
- Click one of them (formula B)
- Connections update to show B's neighbors
- Continue clicking to "walk the graph"

---

## 7. Search and Filters

The search box (top-right corner) is a powerful query interface.

### Basic Search

**Simple text search:**
```
霍奇
```
Finds all formulas containing "霍奇" in:
- Chinese name
- English name
- Node ID
- LaTeX code

**Case insensitive, partial match.**

### Field Queries

**Search specific fields:**

```
family:scheme          # All scheme-theory theorems
status:open            # Unsolved conjectures only
importance:>0.9        # Top 10% most important
field:geometry         # Conjectures in geometry
```

**Available fields:**
- `family`: scheme, cohomology, curve, modern, topology, number, valuation, historic
- `status`: open, partial, proved, disproved
- `field`: algebraic-geometry, number-theory, topology, etc.
- `importance`: 0.0-1.0 (use >, <, >=, <=)
- `degree`: connection count
- `rank`: normalized importance rank
- `cluster`: true/false (is it in conjecture cluster?)
- `name`, `en`, `id`, `latex`: text fields

**Comparison operators:**
```
importance:>0.8
importance:>=0.9
importance:<0.5
degree:>20              # Highly connected nodes
```

### Boolean Logic

**Combine conditions:**

```
family:scheme OR family:cohomology          # Either family
family:curve -status:proved                 # Curves that aren't proven (i.e., conjectures)
(importance:>0.9) AND (family:scheme)       # Core scheme theory
```

**Operators:**
- `OR` (must be uppercase)
- `-` prefix (negation)
- `( )` parentheses for grouping

**Complex queries:**
```
(family:scheme OR family:curve) -status:proved importance:>0.8
```
→ Important conjectures in scheme or curve theory

### Pathfinding

**Find connections between theorems:**

```
霍奇猜想 -> 黎曼猜想
```

Results show:
- **Hop count**: How many steps (shortest path)
- **Strength cost**: Sum of edge weights (strongest connections)

**Two paths are shown:**
1. Fewest hops (may use weak connections)
2. Lowest strength cost (uses strong connections, may be longer)

**Example results:**
```
希尔伯特零点定理 → Hodge 猜想
- Shortest: 5 hops, cost 1.200
- Strongest: 10 hops, cost 0.750
```

The strongest path uses twice as many steps but each connection is much more direct.

**Graph statistics:**
- Network diameter: 7 hops
- Average distance: 3.7 hops
- All 464 nodes are connected

### Search Results

**Result display:**
- Matched formulas listed below search box
- Click to fly camera to that formula
- Shows status badge for conjectures
- Highlights matched text

**No results:**
If search returns nothing, check:
- Spelling (try English or Chinese)
- Field names (case-sensitive: `family:Scheme` won't work)
- Boolean syntax (`or` must be uppercase `OR`)

---

## 8. Proof View

The proof explorer provides 8 interactive features for deep understanding.

### Opening Proof View

From the detail panel, click:
**"阅读证明与知识脉络"** (Read Proof and Knowledge Context)

### Feature 1: Step-by-Step Navigation

**Click any proof step** to focus it:
- Step highlights with colored border
- Automatically scrolls into view
- Use **↑/↓** arrow keys to navigate between steps
- Press **Enter** to expand/collapse current step

**Use cases:**
- Read long proofs systematically
- Compare multiple steps
- Present proofs in lectures

### Feature 2: Theorem Reference Tooltips

**Hover over theorem citations**:
- Instant popup shows:
  - Theorem name
  - Full statement (LaTeX rendered)
  - Brief summary
- No need to leave current proof
- Positioned to avoid viewport edges

**Helps with:**
- Quick reference while reading
- Understanding dependencies without context switching

### Feature 3: Dependency Graph

**Automatic visualization** (when proof has multiple steps):
- Shows logical flow of proof
- **Nodes**: Current theorem (gold) → proof steps (cyan) → dependencies (violet)
- **Arrows**: Show which steps depend on which
- Hierarchical layout reveals proof structure

**Reveals:**
- Circular dependencies (rare, indicates error)
- Critical lemmas (many arrows pointing to them)
- Proof skeleton at a glance

### Feature 4: Alternate Proofs Comparison

If multiple proofs exist (rare in current dataset):
- Side-by-side grid layout
- Shows metadata: step count, dependencies, difficulty
- Click to switch between proofs
- Highlights different approaches

**Educational value:**
- See multiple techniques for same result
- Compare elegance vs. elementary approaches
- Learn different mathematical styles

### Feature 5: Completeness Indicator

**Quality score** (0-100%) with breakdown:
- Statement: 20% (is theorem statement clear?)
- Steps: 25% (are proof steps provided?)
- Explanation: 15% (is reasoning explained?)
- Conclusion: 10% (is conclusion stated?)
- Examples: 10% (are examples given?)
- References: 10% (are sources cited?)
- History: 5% (is historical context provided?)
- Remarks: 5% (are additional notes included?)

**Color coding:**
- 🟦 Cyan (≥70%): Good documentation
- 🟨 Gold (50-69%): Adequate
- 🟧 Coral (<50%): Needs improvement

**Expandable details** show exactly what's present/missing.

### Feature 6: LaTeX Export

**Click "📄 导出 LaTeX"** button:
- Downloads `.tex` file immediately
- Includes all proof content:
  - Statement in theorem environment
  - Proof in proof environment
  - Examples, references, history
- Uses standard packages (amsmath, amsthm, xeCJK)
- **Ready to compile** with XeLaTeX

**Output structure:**
```latex
\documentclass[12pt]{article}
\usepackage{amsmath, amssymb, amsthm}
\usepackage{xeCJK}

\begin{document}
\title{Theorem Name}

\begin{theorem}
  Statement here...
\end{theorem}

\begin{proof}
  Step 1: ...
  Step 2: ...
\end{proof}

\subsection*{Examples}
...

\subsection*{References}
...
\end{document}
```

**Use cases:**
- Academic paper preparation
- Homework assignments
- Lecture notes
- Offline study

### Feature 7: Proof Search

**Find theorem usages across all proofs:**

```javascript
// Programmatic access (developers)
explorer.proofSearch.findUsages('valuation-ring')
```

Returns list of all proofs that cite this theorem, with:
- Proof name
- Step where it's used
- Context snippet

**Full-text search:**
```javascript
explorer.proofSearch.searchProofs('赋值环')
```

**Search weighting:**
- Statement match: 10 points
- Step match: 5 points each
- Explanation match: 3 points

**Impact analysis:**
See how important a theorem is by counting its usages.

### Feature 8: Animated Proof Flow

**Visual proof structure animation:**
- Colored particles flow through proof steps
- Hue varies with step position (cyan → blue gradient)
- Smooth 60fps canvas animation
- Shows logical direction at a glance

**Purely decorative**, but helps:
- Visualize proof as a process
- Engage visual learners
- Create appealing presentations

**Performance note:**
Auto-disables on low-end devices.

---

## 9. Keyboard Shortcuts

### Global

| Key | Action |
|-----|--------|
| `S` | Open/close Settings panel |
| `Esc` | Close panels (proof → search → detail → settings) |
| `?` | Show help (if implemented) |

### Proof View

| Key | Action |
|-----|--------|
| `↓` | Focus next proof step |
| `↑` | Focus previous proof step |
| `Enter` | Expand/collapse current step |
| `Esc` | Close proof view |

### Camera (when supported)

| Key | Action |
|-----|--------|
| `←` `→` | Rotate left/right |
| `↑` `↓` | Rotate up/down |
| `+` `=` | Zoom in |
| `-` `_` | Zoom out |
| `Home` | Reset to initial view |

---

## 10. Tips and Tricks

### For Students

**Learning new topics:**
1. Start with the center (most fundamental concepts)
2. Use gravity mode to freeze formulas
3. Click through "Related Knowledge" to build mental map
4. Export LaTeX proofs for offline study
5. Use search to find theorems mentioned in textbooks

**Understanding connections:**
1. Enable "Color by Relationship Type"
2. Hover over lines to see why theorems connect
3. Look for "Implies" (logical flow) vs "Same Family" (categorization)
4. Use pathfinding to see how distant concepts relate

**Exam prep:**
1. Search `importance:>0.8` for core theorems
2. Read proofs systematically with step navigation
3. Check completeness indicators to find well-documented proofs
4. Export key proofs to PDF for review

### For Researchers

**Finding related work:**
1. Search your area: `field:topology` or `family:cohomology`
2. Use proof search to find theorem usages
3. Check dependency graphs to see proof techniques
4. Explore alternate proofs for different approaches

**Writing papers:**
1. Export LaTeX for theorem statements
2. Use relationship types to phrase connections accurately
3. Check historical context in detail panels
4. Cite using provided references

**Discovering connections:**
1. Use pathfinding to find unexpected relationships
2. Switch galaxy shapes to see different organizational perspectives
3. Explore conjecture cluster to find open problems
4. Filter by status to see recently solved conjectures

### For Educators

**Lecture preparation:**
1. Use gravity mode for stable screen recording
2. Export SVG maps for lecture slides
3. Demonstrate proof steps with keyboard navigation
4. Show dependency graphs to explain proof structure

**Creating exercises:**
1. Find theorems with partial proofs (low completeness score)
2. Ask students to fill in missing steps
3. Use pathfinding for "prove A implies C using B" problems
4. Export alternate proofs for comparison assignments

**Visual aids:**
1. Show spiral arms to demonstrate field organization
2. Use concentric rings to emphasize importance hierarchy
3. Highlight connection types to teach logical relationships
4. Animate proof flow for intuitive understanding

### Performance Optimization

**If nebula is slow:**
1. Disable post-processing bloom (Settings → Display Layers)
2. Turn off formula bobbing animation
3. Use gravity mode (reduces camera calculation)
4. Close other browser tabs
5. Update graphics drivers

**If formulas are too small:**
1. Enable gravity mode
2. Zoom in (scroll wheel)
3. Click formula to focus camera on it
4. Use viewport filters (show only galaxy or cluster)
5. Export SVG and zoom in PDF viewer

**If too cluttered:**
1. Use focus mode for connections (default)
2. Switch to galaxy-only or cluster-only viewport
3. Disable background nebula streams
4. Use monochrome coloring (unified orange)
5. Reduce formula brightness

### Advanced Techniques

**Combining features:**
- Search → Result click → Detail panel → Proof view → LaTeX export
- Pathfinding → Click intermediate nodes → Read dependencies
- Hover connection → Click endpoint → Compare relationship types

**URL sharing:**
Every state is encoded in URL:
- Selected node: `?node=valuation-ring`
- Viewport: `&view=galaxy`
- Galaxy shape: `&shape=barred`
- Coloring: `&color=family`
- All parameters: `&rot=0.5&glow=0.8` etc.

**Copy URL to share exact view** with colleagues.

**Browser compatibility:**
- Best: Chrome/Edge (latest)
- Good: Firefox (latest)
- OK: Safari 14+ (some WebGL limitations)
- Not supported: IE11 or earlier

**Mobile usage:**
- Rotate: One-finger drag
- Zoom: Pinch
- Select: Tap (may be less precise due to small targets)
- Settings: Tap ⚙ icon
- Best on tablets (phones work but cramped)

### Troubleshooting

**Formulas not rendering:**
- Wait for loading screen to complete
- Reload page (Ctrl+R or Cmd+R)
- Clear browser cache
- Check browser console for errors

**Performance issues:**
- Close other tabs/applications
- Disable bloom and bobbing
- Use smaller viewport (galaxy or cluster only)
- Update browser to latest version

**Search not working:**
- Check Boolean syntax (`OR` must be uppercase)
- Verify field names (lowercase: `family:scheme`)
- Use quotes for multi-word values: `name:"Hodge conjecture"`

**Panel not opening:**
- Ensure JavaScript is enabled
- Check if browser blocks popups
- Try clicking empty space first, then formula
- Reload page

**Export not downloading:**
- Check browser download settings
- Allow downloads from this site
- Try different browser
- Check disk space

---

## Appendix: Screenshots Reference

Screenshots are located in `shots/` directory:

| File | Shows |
|------|-------|
| `nebula.png` | Full nebula view with both structures |
| `v5-ui.png` | Interface with detail panel open |
| `camera-focus.png` | Camera focusing on formula |
| `focus-links.png` | Connection lines in focus mode |
| `interaction.png` | User interaction states |
| `shots/proof-targets/` | Proof view examples |
| `shots/designs/` | Alternate design variants |

Use these as visual reference while reading this guide.

---

## Appendix: Data Structure

For developers integrating or extending Formula Nebula:

**Node structure:**
```javascript
{
  id: 'scheme',                    // Unique identifier
  name: '概形',                    // Chinese name
  en: 'Scheme',                    // English name
  latex: '\\text{Spec}(A)',        // LaTeX formula
  family: 'scheme',                // Knowledge family
  importance: 0.95,                // 0-1 scale
  summary: '...',                  // Brief description
  detail: '...',                   // Full explanation
  proof: { ... },                  // Proof data (if available)
  // Conjectures only:
  status: 'open',                  // open/partial/proved/disproved
  field: 'algebraic-geometry',     // Mathematical field
  year: 1950,                      // Year proposed
  proposer: '...',                 // Who proposed it
  progress: 2026                   // Latest progress year
}
```

**Edge structure:**
```javascript
['source-id', 'target-id', 0.8, '解释为什么相关', 'defines']
//                         ^^^   ^^^^^^^^^^^^^^^  ^^^^^^^^
//                       weight    reason        relationship type
```

**Graph statistics:**
- Nodes: 464 (405 theorems + 59 conjectures)
- Edges: 1,620 (typed: 924, untyped: 696)
- Relationship types: 11 identified categories
- Median degree: 7 connections per node
- Diameter: 7 hops

---

## Getting Help

**Documentation:**
- This guide (comprehensive)
- `README.md` (technical details, layout algorithms)
- `PROOF_EXPLORER_GUIDE.md` (proof features API)
- `HANDOFF.md` (development history)

**Common Questions:**

Q: **Why are formulas so small in full view?**
A: Mathematics! 464 formulas can't all be large in one screen. Zoom in, use gravity mode, or click to focus. See README.md § "为什么单个字这么小".

Q: **Can I add my own theorems?**
A: Yes, edit `src/data/batch-*.js` files. See README.md § "怎么改内容".

Q: **Why 4 spiral arms?**
A: 8 knowledge families grouped onto 4 arms. See README.md § "形状：为什么是一个核心 + 四条旋臂".

Q: **Is the data accurate?**
A: Curated from Stacks Project, nLab, MathLib, Wikipedia, zbMATH. Verified with automated scripts. Status data is snapshot from 2026-07.

Q: **Can I use this for research/teaching?**
A: Yes! Export SVG for papers, LaTeX for proofs, URLs for sharing views. Attribution appreciated.

---

**Document Version:** 1.0  
**Created:** 2026-11-02  
**Formula Nebula Version:** 0.1.0  
**Total Formulas:** 464 (405 theorems + 59 conjectures)  
**Data as of:** 2026-07

---

**Enjoy exploring the mathematical cosmos!**

For the latest updates and source code, visit the project repository.
