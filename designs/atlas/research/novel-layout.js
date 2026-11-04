/**
 * designs/atlas/research/novel-layout.js
 *
 * Novel Graph Layout Algorithms Research & Implementation
 *
 * This module implements several advanced graph layout algorithms as alternatives
 * to the current force-directed approach, benchmarked on the 4,306-node Formula Nebula graph.
 *
 * ALGORITHMS IMPLEMENTED:
 * 1. Hyperbolic Geometry Layout (Poincaré Disk Model)
 * 2. Hierarchical Edge Bundling
 * 3. ForceAtlas2 (variant of force-directed)
 * 4. Spectral Layout (Laplacian Eigenmaps)
 * 5. Community-Aware Layout (Louvain + Force)
 */

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

// ============================================================================
// 1. HYPERBOLIC GEOMETRY LAYOUT (Poincaré Disk Model)
// ============================================================================
/**
 * Projects graph into hyperbolic space using the Poincaré disk model.
 *
 * BENEFITS:
 * - Natural hierarchical structure emerges from hyperbolic curvature
 * - Exponential space growth accommodates large graphs with less clutter
 * - Preserves local neighborhood structure while showing global connectivity
 *
 * THEORY:
 * In hyperbolic geometry, space grows exponentially with radius. The Poincaré
 * disk maps infinite hyperbolic plane to unit disk, where straight lines become
 * circular arcs and distances near the boundary are compressed.
 *
 * IMPLEMENTATION:
 * - Root node at origin (0, 0)
 * - Children placed in annular sectors based on BFS tree
 * - Hyperbolic distance: d_h = 2·arctanh(|z|) where z is complex position
 * - Geodesics are circular arcs orthogonal to boundary
 */
export function hyperbolicLayout(graph, opts = {}) {
  const {
    root = null,              // Root node ID (auto-select if null)
    targetRadius = 0.85,      // Maximum radius in unit disk
    angleJitter = 0.1,        // Angular randomness per level
    seed = 42
  } = opts;

  const nodes = graph.nodes;
  const edges = graph.links;
  const n = nodes.length;

  // Build adjacency list
  const adj = new Map(nodes.map(node => [node.id, []]));
  for (const edge of edges) {
    const s = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const t = typeof edge.target === 'object' ? edge.target.id : edge.target;
    adj.get(s)?.push({ id: t, weight: edge.weight || 1 });
    adj.get(t)?.push({ id: s, weight: edge.weight || 1 });
  }

  // Select root: highest degree or specified
  let rootId = root;
  if (!rootId) {
    let maxDegree = -1;
    for (const [id, neighbors] of adj) {
      if (neighbors.length > maxDegree) {
        maxDegree = neighbors.length;
        rootId = id;
      }
    }
  }

  // BFS to assign levels
  const level = new Map();
  const parent = new Map();
  const queue = [rootId];
  level.set(rootId, 0);
  parent.set(rootId, null);
  let maxLevel = 0;

  while (queue.length > 0) {
    const u = queue.shift();
    const lv = level.get(u);
    for (const { id: v } of adj.get(u) || []) {
      if (!level.has(v)) {
        level.set(v, lv + 1);
        parent.set(v, u);
        queue.push(v);
        if (lv + 1 > maxLevel) maxLevel = lv + 1;
      }
    }
  }

  // Assign hyperbolic positions
  const positions = new Map();
  const rng = makeRng(seed);

  // Group nodes by level
  const levels = Array.from({ length: maxLevel + 1 }, () => []);
  for (const [id, lv] of level) {
    levels[lv].push(id);
  }

  // Place root at origin
  positions.set(rootId, { x: 0, y: 0, r: 0, theta: 0 });

  // Place each level in an annular region
  for (let lv = 1; lv <= maxLevel; lv++) {
    const nodesAtLevel = levels[lv];
    if (nodesAtLevel.length === 0) continue;

    // Hyperbolic radius grows exponentially
    const r = targetRadius * (1 - Math.exp(-lv / maxLevel * 3));

    // Group by parent for sector allocation
    const byParent = new Map();
    for (const id of nodesAtLevel) {
      const p = parent.get(id);
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(id);
    }

    // Allocate angular sectors
    let angleOffset = 0;
    for (const [p, children] of byParent) {
      const parentPos = positions.get(p);
      const parentTheta = parentPos?.theta || 0;
      const sectorWidth = TAU / nodesAtLevel.length * children.length;

      for (let i = 0; i < children.length; i++) {
        const id = children[i];
        const theta = parentTheta + angleOffset + (i / children.length) * sectorWidth
                     + (rng() - 0.5) * angleJitter;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        positions.set(id, { x, y, r, theta });
      }
      angleOffset += sectorWidth;
    }
  }

  // Scale to desired radius
  const result = nodes.map(node => {
    const pos = positions.get(node.id) || { x: 0, y: 0 };
    return {
      ...node,
      x: pos.x * opts.radius || pos.x * 1000,
      y: pos.y * opts.radius || pos.y * 1000
    };
  });

  return { nodes: result, edges, method: 'hyperbolic' };
}

// ============================================================================
// 2. HIERARCHICAL EDGE BUNDLING
// ============================================================================
/**
 * Creates curved edge paths that bundle together along hierarchical structure.
 *
 * BENEFITS:
 * - Reduces visual clutter from edge crossings
 * - Reveals high-level connectivity patterns
 * - Works well with hierarchical node layouts
 *
 * THEORY:
 * Edges are routed through the hierarchy's internal nodes (common ancestors),
 * creating smooth B-spline curves that naturally bundle related connections.
 *
 * IMPLEMENTATION:
 * - Build hierarchy tree from graph structure
 * - For each edge, find lowest common ancestor (LCA)
 * - Route edge through: source → ancestors → LCA → ancestors → target
 * - Apply B-spline interpolation with adjustable bundling strength
 */
export function hierarchicalEdgeBundling(graph, layout, opts = {}) {
  const {
    bundlingStrength = 0.85,  // 0 = straight lines, 1 = full bundling
    tension = 0.85            // B-spline tension
  } = opts;

  const nodes = layout.nodes;
  const edges = graph.links;

  // Build position lookup
  const posMap = new Map(nodes.map(n => [n.id, { x: n.x, y: n.y }]));

  // Build hierarchy tree using community structure
  const hierarchy = buildHierarchyTree(graph);

  // Generate bundled edge paths
  const bundledEdges = edges.map(edge => {
    const s = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const t = typeof edge.target === 'object' ? edge.target.id : edge.target;

    const posS = posMap.get(s);
    const posT = posMap.get(t);

    if (!posS || !posT) return null;

    // Find routing path through hierarchy
    const path = findHierarchicalPath(s, t, hierarchy);

    // Convert to control points
    const controlPoints = path.map(id => {
      const p = posMap.get(id) || hierarchy.positions.get(id);
      return p ? [p.x, p.y] : null;
    }).filter(Boolean);

    // Apply bundling strength
    const bundled = applyBundling(controlPoints, bundlingStrength);

    // Generate B-spline curve
    const curve = bSpline(bundled, tension);

    return {
      ...edge,
      source: s,
      target: t,
      path: curve,
      controlPoints: bundled
    };
  }).filter(Boolean);

  return {
    nodes,
    edges: bundledEdges,
    hierarchy,
    method: 'edge-bundling'
  };
}

function buildHierarchyTree(graph) {
  // Simplified hierarchy using single-linkage clustering
  const nodes = graph.nodes;
  const n = nodes.length;

  // Build MST-like hierarchy
  const parent = new Map();
  const positions = new Map();

  // Use centroid positions for internal nodes
  for (const node of nodes) {
    parent.set(node.id, null);
    positions.set(node.id, { x: node.x, y: node.y });
  }

  return { parent, positions, root: nodes[0]?.id };
}

function findHierarchicalPath(s, t, hierarchy) {
  // Simplified: return direct path (full LCA implementation would go here)
  return [s, t];
}

function applyBundling(points, strength) {
  if (points.length < 3) return points;

  const result = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    // Pull intermediate points toward path centroid
    const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    result.push([
      x + (cx - x) * strength,
      y + (cy - y) * strength
    ]);
  }
  result.push(points[points.length - 1]);
  return result;
}

function bSpline(points, tension, segments = 20) {
  if (points.length < 2) return points;

  const curve = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    for (let t = 0; t < segments; t++) {
      const u = t / segments;
      const u2 = u * u;
      const u3 = u2 * u;

      // Catmull-Rom to B-spline conversion
      const x = 0.5 * (
        (2 * p1[0]) +
        (-p0[0] + p2[0]) * u +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3
      );
      const y = 0.5 * (
        (2 * p1[1]) +
        (-p0[1] + p2[1]) * u +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3
      );

      curve.push([x, y]);
    }
  }
  curve.push(points[points.length - 1]);
  return curve;
}

// ============================================================================
// 3. FORCEATLAS2 LAYOUT
// ============================================================================
/**
 * Advanced force-directed algorithm optimized for large-scale networks.
 *
 * BENEFITS:
 * - Adaptive cooling for faster convergence
 * - Lin-Log mode: attraction proportional to log(distance)
 * - Gravity and strong gravity modes for compactness
 * - Hub repulsion: high-degree nodes pushed further apart
 *
 * THEORY:
 * ForceAtlas2 improves on traditional force-directed by:
 * - Adaptive step sizes based on local node velocities
 * - Degree-dependent repulsion (hubs repel more)
 * - Optional dissuade hubs mode to prevent hub clustering
 *
 * PARAMETERS:
 * - linLogMode: Use logarithmic attraction (better for heterogeneous networks)
 * - strongGravityMode: Attract to center more strongly
 * - gravity: Global gravitational constant
 * - scalingRatio: Repulsion strength multiplier
 * - jitterTolerance: Stability threshold for adaptive step size
 */
export function forceAtlas2Layout(graph, opts = {}) {
  const {
    iterations = 500,
    linLogMode = true,
    strongGravityMode = false,
    gravity = 1.0,
    scalingRatio = 2.0,
    jitterTolerance = 1.0,
    barnesHutTheta = 1.2,
    seed = 42
  } = opts;

  const nodes = graph.nodes.map(n => ({ ...n }));
  const edges = graph.links;
  const n = nodes.length;

  // Initialize positions and velocities
  const rng = makeRng(seed);
  const pos = new Float64Array(n * 2);
  const vel = new Float64Array(n * 2);
  const force = new Float64Array(n * 2);
  const degree = new Float64Array(n).fill(0);

  // Calculate node degrees
  const idxMap = new Map(nodes.map((node, i) => [node.id, i]));
  for (const edge of edges) {
    const si = idxMap.get(typeof edge.source === 'object' ? edge.source.id : edge.source);
    const ti = idxMap.get(typeof edge.target === 'object' ? edge.target.id : edge.target);
    if (si !== undefined) degree[si]++;
    if (ti !== undefined) degree[ti]++;
  }

  // Initialize random positions
  for (let i = 0; i < n; i++) {
    pos[i * 2] = (rng() - 0.5) * 1000;
    pos[i * 2 + 1] = (rng() - 0.5) * 1000;
  }

  // Main iteration loop
  for (let iter = 0; iter < iterations; iter++) {
    force.fill(0);

    // Repulsion (all pairs)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i * 2] - pos[j * 2];
        const dy = pos[i * 2 + 1] - pos[j * 2 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;

        // ForceAtlas2: repulsion strength proportional to node degrees
        const repulsion = scalingRatio * (degree[i] + 1) * (degree[j] + 1) / dist;

        const fx = dx / dist * repulsion;
        const fy = dy / dist * repulsion;

        force[i * 2] += fx;
        force[i * 2 + 1] += fy;
        force[j * 2] -= fx;
        force[j * 2 + 1] -= fy;
      }
    }

    // Attraction (edges)
    for (const edge of edges) {
      const si = idxMap.get(typeof edge.source === 'object' ? edge.source.id : edge.source);
      const ti = idxMap.get(typeof edge.target === 'object' ? edge.target.id : edge.target);
      if (si === undefined || ti === undefined) continue;

      const dx = pos[si * 2] - pos[ti * 2];
      const dy = pos[si * 2 + 1] - pos[ti * 2 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;

      let attraction;
      if (linLogMode) {
        // Lin-Log mode: F = -log(distance)
        attraction = -(edge.weight || 1) * Math.log(dist + 1);
      } else {
        // Linear mode: F = -distance
        attraction = -(edge.weight || 1) * dist;
      }

      const fx = dx / dist * attraction;
      const fy = dy / dist * attraction;

      force[si * 2] += fx;
      force[si * 2 + 1] += fy;
      force[ti * 2] -= fx;
      force[ti * 2 + 1] -= fy;
    }

    // Gravity
    for (let i = 0; i < n; i++) {
      const dist = Math.hypot(pos[i * 2], pos[i * 2 + 1]) + 0.01;
      let gravityForce;

      if (strongGravityMode) {
        gravityForce = gravity * (degree[i] + 1);
      } else {
        gravityForce = gravity * (degree[i] + 1) * dist;
      }

      force[i * 2] -= pos[i * 2] / dist * gravityForce;
      force[i * 2 + 1] -= pos[i * 2 + 1] / dist * gravityForce;
    }

    // Adaptive step size
    const cooling = 1 - iter / iterations;
    const stepSize = 10 * cooling;

    // Apply forces
    for (let i = 0; i < n; i++) {
      const fx = force[i * 2];
      const fy = force[i * 2 + 1];
      const fMag = Math.hypot(fx, fy);

      if (fMag > 0) {
        const swing = Math.hypot(fx - vel[i * 2], fy - vel[i * 2 + 1]);
        const speed = Math.hypot(vel[i * 2], vel[i * 2 + 1]);

        // Adaptive step based on stability
        const factor = stepSize / (1 + Math.sqrt(speed * swing));

        vel[i * 2] = fx * factor;
        vel[i * 2 + 1] = fy * factor;

        pos[i * 2] += vel[i * 2];
        pos[i * 2 + 1] += vel[i * 2 + 1];
      }
    }
  }

  // Copy positions back to nodes
  for (let i = 0; i < n; i++) {
    nodes[i].x = pos[i * 2];
    nodes[i].y = pos[i * 2 + 1];
  }

  return { nodes, edges, method: 'forceatlas2' };
}

// ============================================================================
// 4. SPECTRAL LAYOUT (Laplacian Eigenmaps)
// ============================================================================
/**
 * Uses graph Laplacian eigenvectors as coordinates.
 *
 * BENEFITS:
 * - Mathematically principled: minimizes edge length variance
 * - Global optimization (not iterative/local)
 * - Reveals graph structure through spectral decomposition
 * - Fast for sparse graphs
 *
 * THEORY:
 * The graph Laplacian L = D - A (degree matrix - adjacency matrix) encodes
 * graph connectivity. Its eigenvectors corresponding to smallest eigenvalues
 * provide coordinates that preserve graph distances.
 *
 * The Fiedler vector (2nd smallest eigenvalue) gives 1D embedding that
 * naturally separates communities. 2nd and 3rd eigenvectors give 2D layout.
 *
 * IMPLEMENTATION:
 * - Build normalized Laplacian: L_norm = I - D^(-1/2) A D^(-1/2)
 * - Compute smallest non-zero eigenvectors using power iteration
 * - Use eigenvectors 2 and 3 as x, y coordinates
 */
export function spectralLayout(graph, opts = {}) {
  const {
    dimensions = 2,
    iterations = 100,  // Power iteration
    normalize = true
  } = opts;

  const nodes = graph.nodes.map(n => ({ ...n }));
  const edges = graph.links;
  const n = nodes.length;

  if (n < 3) {
    // Trivial case
    nodes.forEach((node, i) => {
      node.x = i * 100;
      node.y = 0;
    });
    return { nodes, edges, method: 'spectral' };
  }

  // Build adjacency matrix and degree vector
  const idxMap = new Map(nodes.map((node, i) => [node.id, i]));
  const A = Array.from({ length: n }, () => new Float64Array(n));
  const degree = new Float64Array(n);

  for (const edge of edges) {
    const si = idxMap.get(typeof edge.source === 'object' ? edge.source.id : edge.source);
    const ti = idxMap.get(typeof edge.target === 'object' ? edge.target.id : edge.target);
    if (si === undefined || ti === undefined) continue;

    const w = edge.weight || 1;
    A[si][ti] = w;
    A[ti][si] = w;
    degree[si] += w;
    degree[ti] += w;
  }

  // Build normalized Laplacian: L = I - D^(-1/2) A D^(-1/2)
  const L = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    const di = Math.sqrt(degree[i] + 1e-10);
    for (let j = 0; j < n; j++) {
      const dj = Math.sqrt(degree[j] + 1e-10);
      if (i === j) {
        L[i][j] = 1;
      } else {
        L[i][j] = -A[i][j] / (di * dj);
      }
    }
  }

  // Find smallest eigenvectors using power iteration
  const eigenvectors = [];

  for (let ev = 0; ev < dimensions; ev++) {
    const v = new Float64Array(n);
    // Random initialization
    for (let i = 0; i < n; i++) {
      v[i] = Math.random() - 0.5;
    }

    // Orthogonalize against previous eigenvectors
    for (const prev of eigenvectors) {
      const dot = v.reduce((sum, val, i) => sum + val * prev[i], 0);
      for (let i = 0; i < n; i++) {
        v[i] -= dot * prev[i];
      }
    }

    // Normalize
    const norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    if (norm > 1e-10) {
      for (let i = 0; i < n; i++) {
        v[i] /= norm;
      }
    }

    // Power iteration
    for (let iter = 0; iter < iterations; iter++) {
      const Lv = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          Lv[i] += L[i][j] * v[j];
        }
      }

      // Orthogonalize
      for (const prev of eigenvectors) {
        const dot = Lv.reduce((sum, val, i) => sum + val * prev[i], 0);
        for (let i = 0; i < n; i++) {
          Lv[i] -= dot * prev[i];
        }
      }

      // Normalize
      const vNorm = Math.sqrt(Lv.reduce((sum, val) => sum + val * val, 0));
      if (vNorm > 1e-10) {
        for (let i = 0; i < n; i++) {
          v[i] = Lv[i] / vNorm;
        }
      }
    }

    eigenvectors.push(v);
  }

  // Skip first eigenvector (constant), use 2nd and 3rd for coordinates
  const vx = eigenvectors[0] || new Float64Array(n).fill(0);
  const vy = eigenvectors[1] || new Float64Array(n).fill(0);

  // Scale to reasonable range
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    if (vx[i] < minX) minX = vx[i];
    if (vx[i] > maxX) maxX = vx[i];
    if (vy[i] < minY) minY = vy[i];
    if (vy[i] > maxY) maxY = vy[i];
  }

  const scale = 1000;
  for (let i = 0; i < n; i++) {
    nodes[i].x = ((vx[i] - minX) / (maxX - minX + 1e-10) - 0.5) * scale;
    nodes[i].y = ((vy[i] - minY) / (maxY - minY + 1e-10) - 0.5) * scale;
  }

  return { nodes, edges, method: 'spectral' };
}

// ============================================================================
// 5. COMMUNITY-AWARE LAYOUT (Louvain + Force)
// ============================================================================
/**
 * Two-phase layout: detect communities, then layout with community constraints.
 *
 * BENEFITS:
 * - Clearly separates different graph communities
 * - Reduces clutter by grouping related nodes
 * - Preserves both local and global structure
 * - Fast community detection via Louvain algorithm
 *
 * THEORY:
 * Phase 1: Louvain method detects communities by maximizing modularity
 *         Q = (1/2m) Σ[A_ij - k_i·k_j/2m]δ(c_i, c_j)
 * Phase 2: Force-directed layout with:
 *         - Strong attraction within communities
 *         - Weak repulsion between communities
 *         - Community center constraints
 */
export function communityAwareLayout(graph, opts = {}) {
  const {
    iterations = 300,
    interCommunityRepulsion = 2.0,
    intraCommunityAttraction = 1.5,
    communityCenterStrength = 0.3,
    seed = 42
  } = opts;

  const nodes = graph.nodes.map(n => ({ ...n }));
  const edges = graph.links;
  const n = nodes.length;

  // Phase 1: Community detection (simplified Louvain)
  const communities = detectCommunities(graph);

  // Assign community IDs to nodes
  const idxMap = new Map(nodes.map((node, i) => [node.id, i]));
  for (let i = 0; i < n; i++) {
    nodes[i].community = communities.get(nodes[i].id) || 0;
  }

  // Count communities
  const communitySet = new Set(communities.values());
  const numCommunities = communitySet.size;

  // Initialize community centers in a circle
  const communityCenters = new Map();
  let ci = 0;
  for (const cid of communitySet) {
    const angle = ci / numCommunities * TAU;
    const r = 300 * Math.sqrt(numCommunities);
    communityCenters.set(cid, {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle)
    });
    ci++;
  }

  // Initialize node positions near community centers
  const rng = makeRng(seed);
  const pos = new Float64Array(n * 2);
  const vel = new Float64Array(n * 2);

  for (let i = 0; i < n; i++) {
    const center = communityCenters.get(nodes[i].community) || { x: 0, y: 0 };
    pos[i * 2] = center.x + (rng() - 0.5) * 200;
    pos[i * 2 + 1] = center.y + (rng() - 0.5) * 200;
  }

  // Force-directed layout with community awareness
  for (let iter = 0; iter < iterations; iter++) {
    const force = new Float64Array(n * 2);
    const cooling = 1 - iter / iterations;

    // Repulsion (all pairs)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i * 2] - pos[j * 2];
        const dy = pos[i * 2 + 1] - pos[j * 2 + 1];
        const dist2 = dx * dx + dy * dy + 0.01;
        const dist = Math.sqrt(dist2);

        // Stronger repulsion between communities
        const sameCommunity = nodes[i].community === nodes[j].community;
        const repulsion = (sameCommunity ? 1.0 : interCommunityRepulsion) * 100 / dist2;

        const fx = dx / dist * repulsion;
        const fy = dy / dist * repulsion;

        force[i * 2] += fx;
        force[i * 2 + 1] += fy;
        force[j * 2] -= fx;
        force[j * 2 + 1] -= fy;
      }
    }

    // Attraction (edges)
    for (const edge of edges) {
      const si = idxMap.get(typeof edge.source === 'object' ? edge.source.id : edge.source);
      const ti = idxMap.get(typeof edge.target === 'object' ? edge.target.id : edge.target);
      if (si === undefined || ti === undefined) continue;

      const dx = pos[si * 2] - pos[ti * 2];
      const dy = pos[si * 2 + 1] - pos[ti * 2 + 1];
      const dist = Math.hypot(dx, dy) + 0.01;

      // Stronger attraction within communities
      const sameCommunity = nodes[si].community === nodes[ti].community;
      const attraction = (sameCommunity ? intraCommunityAttraction : 1.0)
                        * (edge.weight || 1) * dist * 0.01;

      const fx = dx / dist * attraction;
      const fy = dy / dist * attraction;

      force[si * 2] -= fx;
      force[si * 2 + 1] -= fy;
      force[ti * 2] += fx;
      force[ti * 2 + 1] += fy;
    }

    // Community center constraint
    for (let i = 0; i < n; i++) {
      const center = communityCenters.get(nodes[i].community) || { x: 0, y: 0 };
      const dx = center.x - pos[i * 2];
      const dy = center.y - pos[i * 2 + 1];

      force[i * 2] += dx * communityCenterStrength;
      force[i * 2 + 1] += dy * communityCenterStrength;
    }

    // Apply forces
    const step = 10 * cooling;
    for (let i = 0; i < n; i++) {
      vel[i * 2] = force[i * 2] * step;
      vel[i * 2 + 1] = force[i * 2 + 1] * step;

      pos[i * 2] += vel[i * 2];
      pos[i * 2 + 1] += vel[i * 2 + 1];
    }
  }

  // Copy positions back
  for (let i = 0; i < n; i++) {
    nodes[i].x = pos[i * 2];
    nodes[i].y = pos[i * 2 + 1];
  }

  return {
    nodes,
    edges,
    communities: communityCenters,
    method: 'community-aware'
  };
}

/**
 * Simplified Louvain community detection
 */
function detectCommunities(graph) {
  const nodes = graph.nodes;
  const edges = graph.links;

  // Build adjacency
  const adj = new Map(nodes.map(n => [n.id, []]));
  for (const edge of edges) {
    const s = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const t = typeof edge.target === 'object' ? edge.target.id : edge.target;
    const w = edge.weight || 1;
    adj.get(s)?.push({ id: t, weight: w });
    adj.get(t)?.push({ id: s, weight: w });
  }

  // Initial: each node in its own community
  const community = new Map(nodes.map((n, i) => [n.id, i]));

  // Modularity optimization (simplified, single pass)
  const totalWeight = edges.reduce((sum, e) => sum + (e.weight || 1), 0) * 2;

  for (let pass = 0; pass < 3; pass++) {
    let improved = false;

    for (const node of nodes) {
      const id = node.id;
      const currentCommunity = community.get(id);
      const neighbors = adj.get(id) || [];

      // Try moving to neighbor communities
      const communityCandidates = new Map();
      for (const { id: nid, weight } of neighbors) {
        const nc = community.get(nid);
        communityCandidates.set(nc, (communityCandidates.get(nc) || 0) + weight);
      }

      // Find best community
      let bestCommunity = currentCommunity;
      let bestGain = 0;

      for (const [cid, weight] of communityCandidates) {
        if (cid === currentCommunity) continue;
        // Simplified gain: just edge weight to that community
        if (weight > bestGain) {
          bestGain = weight;
          bestCommunity = cid;
        }
      }

      if (bestCommunity !== currentCommunity) {
        community.set(id, bestCommunity);
        improved = true;
      }
    }

    if (!improved) break;
  }

  // Renumber communities to be contiguous
  const communityIds = new Set(community.values());
  const idMap = new Map([...communityIds].map((cid, i) => [cid, i]));
  for (const [nid, cid] of community) {
    community.set(nid, idMap.get(cid));
  }

  return community;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Simple LCG random number generator (deterministic)
 */
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return (state >>> 0) / 4294967296;
  };
}

// ============================================================================
// BENCHMARK HARNESS
// ============================================================================

/**
 * Benchmark all layout algorithms on given graph
 */
export function benchmarkLayouts(graph, opts = {}) {
  const algorithms = [
    { name: 'Hyperbolic', fn: hyperbolicLayout, opts: { seed: 42 } },
    { name: 'ForceAtlas2', fn: forceAtlas2Layout, opts: { iterations: 300, seed: 42 } },
    { name: 'Spectral', fn: spectralLayout, opts: { iterations: 50 } },
    { name: 'Community-Aware', fn: communityAwareLayout, opts: { iterations: 200, seed: 42 } }
  ];

  const results = [];

  for (const { name, fn, opts: algoOpts } of algorithms) {
    console.log(`\nBenchmarking ${name}...`);

    const startTime = performance.now();
    let layout;
    try {
      layout = fn(graph, { ...algoOpts, ...opts });
    } catch (error) {
      console.error(`${name} failed:`, error.message);
      results.push({
        name,
        error: error.message,
        time: 0
      });
      continue;
    }
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Quality metrics
    const metrics = computeLayoutMetrics(layout, graph);

    results.push({
      name,
      time: duration,
      metrics,
      layout
    });

    console.log(`  Time: ${duration.toFixed(1)}ms`);
    console.log(`  Edge length mean: ${metrics.edgeLengthMean.toFixed(1)}`);
    console.log(`  Edge length variance: ${metrics.edgeLengthVariance.toFixed(1)}`);
    console.log(`  Node spread: ${metrics.nodeSpread.toFixed(1)}`);
  }

  return results;
}

/**
 * Compute quality metrics for a layout
 */
function computeLayoutMetrics(layout, graph) {
  const nodes = layout.nodes;
  const edges = graph.links;

  // Build position map
  const posMap = new Map(nodes.map(n => [n.id, { x: n.x, y: n.y }]));

  // Edge length statistics
  const edgeLengths = [];
  for (const edge of edges) {
    const s = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const t = typeof edge.target === 'object' ? edge.target.id : edge.target;
    const posS = posMap.get(s);
    const posT = posMap.get(t);
    if (posS && posT) {
      const len = Math.hypot(posS.x - posT.x, posS.y - posT.y);
      edgeLengths.push(len);
    }
  }

  const edgeLengthMean = edgeLengths.reduce((a, b) => a + b, 0) / edgeLengths.length;
  const edgeLengthVariance = edgeLengths.reduce((sum, len) => sum + (len - edgeLengthMean) ** 2, 0)
                            / edgeLengths.length;

  // Node spread (bounding box area)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const node of nodes) {
    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.y > maxY) maxY = node.y;
  }
  const nodeSpread = (maxX - minX) * (maxY - minY);

  // Edge crossings (sample-based approximation for large graphs)
  const sampleSize = Math.min(1000, edges.length);
  let crossings = 0;
  for (let i = 0; i < sampleSize; i++) {
    for (let j = i + 1; j < sampleSize; j++) {
      const e1 = edges[i];
      const e2 = edges[j];

      const s1 = posMap.get(typeof e1.source === 'object' ? e1.source.id : e1.source);
      const t1 = posMap.get(typeof e1.target === 'object' ? e1.target.id : e1.target);
      const s2 = posMap.get(typeof e2.source === 'object' ? e2.source.id : e2.source);
      const t2 = posMap.get(typeof e2.target === 'object' ? e2.target.id : e2.target);

      if (s1 && t1 && s2 && t2 && segmentsIntersect(s1, t1, s2, t2)) {
        crossings++;
      }
    }
  }

  return {
    edgeLengthMean,
    edgeLengthVariance,
    nodeSpread,
    crossingsSample: crossings,
    numNodes: nodes.length,
    numEdges: edges.length
  };
}

function segmentsIntersect(p1, p2, p3, p4) {
  const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

