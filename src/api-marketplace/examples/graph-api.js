/**
 * Graph Query API
 * Example API for knowledge graph operations
 */

export async function createGraphAPI(marketplace) {
  const api = await marketplace.publishAPI({
    name: 'Knowledge Graph Query',
    version: '1.0.0',
    description: 'Search and traverse the mathematical knowledge graph',
    category: ['graph', 'search', 'knowledge-base'],
    publisher: {
      userId: 'formula-nebula',
      displayName: 'Formula Nebula Team',
      reputation: 100
    },
    endpoints: [
      {
        path: '/search',
        method: 'GET',
        description: 'Search for concepts in the knowledge graph',
        handler: searchGraph,
        exampleRequest: {
          query: 'pythagorean theorem',
          limit: 10
        },
        exampleResponse: {
          results: [
            {
              id: 'pythagoras-theorem',
              name: 'Pythagorean Theorem',
              category: 'geometry',
              connections: 12,
              score: 0.95
            }
          ],
          total: 1
        }
      },
      {
        path: '/path',
        method: 'GET',
        description: 'Find shortest path between two concepts',
        handler: findPath,
        exampleRequest: {
          from: 'group-theory',
          to: 'manifold'
        },
        exampleResponse: {
          path: ['group-theory', 'topology', 'differential-geometry', 'manifold'],
          distance: 3,
          edges: [
            { from: 'group-theory', to: 'topology', type: 'related-to' },
            { from: 'topology', to: 'differential-geometry', type: 'prerequisite' },
            { from: 'differential-geometry', to: 'manifold', type: 'studies' }
          ]
        }
      },
      {
        path: '/neighbors',
        method: 'GET',
        description: 'Get neighboring concepts',
        handler: getNeighbors,
        exampleRequest: {
          conceptId: 'linear-algebra',
          depth: 1
        },
        exampleResponse: {
          concept: {
            id: 'linear-algebra',
            name: 'Linear Algebra'
          },
          neighbors: [
            { id: 'vector-space', name: 'Vector Space', relationship: 'studies' },
            { id: 'matrix-theory', name: 'Matrix Theory', relationship: 'includes' }
          ]
        }
      },
      {
        path: '/subgraph',
        method: 'POST',
        description: 'Extract subgraph around concepts',
        handler: getSubgraph,
        exampleRequest: {
          concepts: ['calculus', 'analysis'],
          depth: 2
        },
        exampleResponse: {
          nodes: [
            { id: 'calculus', name: 'Calculus', category: 'analysis' },
            { id: 'analysis', name: 'Analysis', category: 'analysis' },
            { id: 'limit', name: 'Limit', category: 'analysis' }
          ],
          edges: [
            { from: 'calculus', to: 'limit', type: 'uses' },
            { from: 'analysis', to: 'limit', type: 'defines' }
          ]
        }
      }
    ],
    pricing: {
      model: 'tiered',
      tiers: [
        { name: 'free', limit: 500, price: 0 },
        { name: 'basic', limit: 10000, price: 19 },
        { name: 'professional', limit: 100000, price: 79 }
      ]
    },
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerDay: 5000,
      burstLimit: 120
    }
  });

  return api;
}

// Mock graph data
const mockGraph = {
  nodes: new Map([
    ['linear-algebra', { id: 'linear-algebra', name: 'Linear Algebra', category: 'algebra' }],
    ['vector-space', { id: 'vector-space', name: 'Vector Space', category: 'algebra' }],
    ['matrix-theory', { id: 'matrix-theory', name: 'Matrix Theory', category: 'algebra' }],
    ['group-theory', { id: 'group-theory', name: 'Group Theory', category: 'algebra' }],
    ['topology', { id: 'topology', name: 'Topology', category: 'topology' }],
    ['differential-geometry', { id: 'differential-geometry', name: 'Differential Geometry', category: 'geometry' }],
    ['manifold', { id: 'manifold', name: 'Manifold', category: 'geometry' }]
  ]),
  edges: [
    { from: 'linear-algebra', to: 'vector-space', type: 'studies' },
    { from: 'linear-algebra', to: 'matrix-theory', type: 'includes' },
    { from: 'group-theory', to: 'topology', type: 'related-to' },
    { from: 'topology', to: 'differential-geometry', type: 'prerequisite' },
    { from: 'differential-geometry', to: 'manifold', type: 'studies' }
  ]
};

async function searchGraph(data, context) {
  const { query, limit = 10 } = data;

  if (!query) {
    throw new Error('Query required');
  }

  const lowerQuery = query.toLowerCase();
  const results = [];

  for (const [id, node] of mockGraph.nodes) {
    const nameMatch = node.name.toLowerCase().includes(lowerQuery);
    const categoryMatch = node.category.toLowerCase().includes(lowerQuery);

    if (nameMatch || categoryMatch) {
      const score = nameMatch ? 0.9 : 0.6;
      results.push({
        ...node,
        connections: mockGraph.edges.filter(e => e.from === id || e.to === id).length,
        score
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return {
    results: results.slice(0, limit),
    total: results.length,
    query
  };
}

async function findPath(data, context) {
  const { from, to } = data;

  if (!from || !to) {
    throw new Error('From and to concepts required');
  }

  // Simple BFS pathfinding
  const queue = [[from]];
  const visited = new Set([from]);

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];

    if (current === to) {
      // Construct edge list
      const edges = [];
      for (let i = 0; i < path.length - 1; i++) {
        const edge = mockGraph.edges.find(
          e => (e.from === path[i] && e.to === path[i + 1]) ||
               (e.to === path[i] && e.from === path[i + 1])
        );
        if (edge) {
          edges.push(edge);
        }
      }

      return {
        path,
        distance: path.length - 1,
        edges
      };
    }

    // Get neighbors
    const neighbors = mockGraph.edges
      .filter(e => e.from === current || e.to === current)
      .map(e => e.from === current ? e.to : e.from)
      .filter(n => !visited.has(n));

    for (const neighbor of neighbors) {
      visited.add(neighbor);
      queue.push([...path, neighbor]);
    }
  }

  return {
    path: null,
    distance: Infinity,
    message: 'No path found'
  };
}

async function getNeighbors(data, context) {
  const { conceptId, depth = 1 } = data;

  if (!conceptId) {
    throw new Error('Concept ID required');
  }

  const concept = mockGraph.nodes.get(conceptId);
  if (!concept) {
    throw new Error('Concept not found');
  }

  const neighbors = mockGraph.edges
    .filter(e => e.from === conceptId || e.to === conceptId)
    .map(e => {
      const neighborId = e.from === conceptId ? e.to : e.from;
      const neighbor = mockGraph.nodes.get(neighborId);
      return {
        ...neighbor,
        relationship: e.type
      };
    });

  return {
    concept,
    neighbors,
    depth
  };
}

async function getSubgraph(data, context) {
  const { concepts, depth = 2 } = data;

  if (!concepts || concepts.length === 0) {
    throw new Error('At least one concept required');
  }

  const nodes = new Set(concepts);
  const edges = new Set();

  // BFS to collect nodes up to depth
  let frontier = [...concepts];
  for (let d = 0; d < depth; d++) {
    const nextFrontier = [];

    for (const nodeId of frontier) {
      const connectedEdges = mockGraph.edges.filter(
        e => e.from === nodeId || e.to === nodeId
      );

      for (const edge of connectedEdges) {
        edges.add(edge);
        const neighbor = edge.from === nodeId ? edge.to : edge.from;
        if (!nodes.has(neighbor)) {
          nodes.add(neighbor);
          nextFrontier.push(neighbor);
        }
      }
    }

    frontier = nextFrontier;
  }

  return {
    nodes: Array.from(nodes).map(id => mockGraph.nodes.get(id)).filter(Boolean),
    edges: Array.from(edges),
    depth
  };
}

export default createGraphAPI;
