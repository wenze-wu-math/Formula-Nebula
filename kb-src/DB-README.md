# Database Layer Abstraction

Unified database interface supporting multiple backends with caching, migrations, and query optimization.

## Features

- **Multi-Backend Support**: SQLite, PostgreSQL, MongoDB, Redis
- **Unified API**: Same interface across all database engines
- **Smart Caching**: Built-in cache layer with TTL and Redis integration
- **Migration System**: Version-controlled schema updates
- **Type Safety**: Consistent data structures across backends
- **Production Ready**: Connection pooling, error handling, performance optimization

## Architecture

```
┌─────────────────────────────────────────┐
│         Application Layer               │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          DB Layer (Unified API)         │
│   ┌──────────┬──────────┬────────────┐  │
│   │  Query   │  Cache   │ Migration  │  │
│   └──────────┴──────────┴────────────┘  │
└────────┬───────┬────────┬───────────────┘
         │       │        │
    ┌────▼──┐ ┌─▼───┐ ┌──▼─────┐
    │SQLite │ │PG   │ │MongoDB │
    └───────┘ └─────┘ └────────┘
                  │
              ┌───▼───┐
              │ Redis │ (cache)
              └───────┘
```

## Installation

### Required Dependencies

```bash
# Core (always required)
npm install

# SQLite (local development)
npm install better-sqlite3

# PostgreSQL (production)
npm install pg

# MongoDB (document storage)
npm install mongodb

# Redis (caching)
npm install redis
```

## Quick Start

### 1. Initialize Database

```javascript
import { initDB, ENGINE } from './db-layer.mjs';

// SQLite (simplest for dev)
const db = await initDB(ENGINE.SQLITE, {
  path: './data/formula-nebula.db'
});

// PostgreSQL (production)
const db = await initDB(ENGINE.POSTGRES, {
  host: 'localhost',
  port: 5432,
  database: 'formula_nebula',
  user: 'postgres',
  password: 'your-password'
});

// MongoDB (flexible schema)
const db = await initDB(ENGINE.MONGODB, {
  host: 'localhost',
  port: 27017,
  database: 'formula_nebula'
});
```

### 2. Initialize Schema

```javascript
import { initializeSchema } from './db-schema.mjs';

await initializeSchema(db, ENGINE.SQLITE);
```

### 3. Run Migrations

```javascript
await db.migrate();
```

### 4. Execute Queries

```javascript
// Insert data
await db.query(
  'INSERT INTO nodes (id, label, category) VALUES (?, ?, ?)',
  ['fermat-theorem', 'Fermat\'s Last Theorem', 'theorem']
);

// Query with caching
const results = await db.query(
  'SELECT * FROM nodes WHERE category = ?',
  ['theorem'],
  {
    cacheKey: 'nodes:theorem',
    ttl: 300000 // 5 minutes
  }
);

console.log(results);
```

### 5. Close Connection

```javascript
await db.close();
```

## API Reference

### DBLayer Class

#### `initDB(engine, config)`

Initialize database connection.

**Parameters:**
- `engine` (string): Database engine (`ENGINE.SQLITE`, `ENGINE.POSTGRES`, `ENGINE.MONGODB`, `ENGINE.REDIS`)
- `config` (object): Engine-specific configuration

**Returns:** Promise<DBLayer>

**Example:**
```javascript
const db = await initDB(ENGINE.SQLITE, {
  path: './data/app.db',
  cache: {
    redis: {
      host: 'localhost',
      port: 6379
    }
  }
});
```

#### `query(sql, params, options)`

Execute database query with optional caching.

**Parameters:**
- `sql` (string): SQL query or operation name
- `params` (array): Query parameters
- `options` (object): Query options
  - `cacheKey` (string): Cache key for result
  - `ttl` (number): Time-to-live in milliseconds

**Returns:** Promise<array|object>

**Example:**
```javascript
const nodes = await db.query(
  'SELECT * FROM nodes WHERE category = ?',
  ['theorem'],
  { cacheKey: 'nodes:theorem', ttl: 60000 }
);
```

#### `getCacheLayer()`

Get cache layer for manual cache operations.

**Returns:** CacheLayer instance

**Example:**
```javascript
const cache = db.getCacheLayer();
await cache.set('my-key', { data: 'value' }, 30000);
const value = await cache.get('my-key');
```

#### `migrate()`

Run pending database migrations.

**Returns:** Promise<void>

#### `close()`

Close database connection and clear cache.

**Returns:** Promise<void>

#### `stats()`

Get database statistics.

**Returns:** Promise<object>

### CacheLayer Class

#### `get(key)`

Get cached value.

**Returns:** Promise<any|null>

#### `set(key, value, ttl)`

Set cached value with TTL.

**Parameters:**
- `key` (string): Cache key
- `value` (any): Value to cache
- `ttl` (number): Time-to-live in milliseconds (default: 300000)

#### `invalidate(key)`

Invalidate cache entry.

#### `clear()`

Clear all cache entries.

#### `stats()`

Get cache statistics.

**Returns:** object with entries count and status

## Schema Design

### Tables/Collections

#### nodes
Core knowledge graph nodes (theorems, conjectures, concepts)

```javascript
{
  id: 'unique-identifier',
  label: 'Human-readable name',
  category: 'theorem|conjecture|concept',
  description: 'Full description',
  latex: 'LaTeX formula',
  metadata: {
    // Additional properties
  }
}
```

#### edges
Relationships between nodes

```javascript
{
  source: 'node-id',
  target: 'node-id',
  type: 'relates-to|depends-on|generalizes',
  weight: 0.95,
  metadata: {}
}
```

#### proofs
Theorem proofs

```javascript
{
  theoremId: 'node-id',
  proofType: 'constructive|contradiction|induction',
  content: 'Proof text',
  formalStatement: 'Lean/Coq code',
  verified: true
}
```

#### researchers
Researcher profiles

```javascript
{
  id: 'researcher-id',
  name: 'Full name',
  affiliation: 'Institution',
  fields: ['algebraic-geometry', 'number-theory'],
  hIndex: 42
}
```

#### papers
Academic papers

```javascript
{
  id: 'paper-id',
  title: 'Paper title',
  authors: ['author1', 'author2'],
  abstract: 'Abstract text',
  year: 2024,
  arxivId: '2401.12345'
}
```

## Migration System

### Creating Migrations

Migrations are versioned scripts in `migrations/` directory.

**File naming:** `{version}_{name}.mjs`

Example: `001_initial_schema.mjs`

```javascript
export const version = '001';
export const name = 'initial_schema';

export async function up(db, engine) {
  // Apply migration
  if (engine === 'sqlite' || engine === 'postgresql') {
    await db.query('CREATE TABLE ...');
  } else if (engine === 'mongodb') {
    await db.query('collection', 'insertOne', {...});
  }
}

export async function down(db, engine) {
  // Rollback migration
  await db.query('DROP TABLE ...');
}
```

### Running Migrations

```bash
# Show status
node kb-src/migrate.mjs status --engine=sqlite

# Run all pending migrations
node kb-src/migrate.mjs up --engine=sqlite

# Rollback last migration
node kb-src/migrate.mjs down --engine=sqlite
```

### Migration Best Practices

1. **Always provide `down()` function** for rollback capability
2. **Test migrations** on a copy of production data
3. **Make migrations idempotent** (can run multiple times safely)
4. **Use transactions** for multi-step migrations
5. **Version control migrations** (never modify existing migrations)

## Caching Strategy

### Memory Cache (Default)

Fast in-memory cache with TTL support. No external dependencies.

```javascript
const db = await initDB(ENGINE.SQLITE, {
  path: './data/app.db'
  // Cache is automatic
});
```

### Redis Cache (Production)

Distributed cache with persistence.

```javascript
const db = await initDB(ENGINE.SQLITE, {
  path: './data/app.db',
  cache: {
    redis: {
      host: 'redis.example.com',
      port: 6379,
      password: 'secret',
      database: 0
    }
  }
});
```

### Cache Usage Patterns

#### Query Result Caching

```javascript
// Expensive query - cache for 10 minutes
const results = await db.query(
  'SELECT * FROM nodes JOIN edges ON nodes.id = edges.source',
  [],
  {
    cacheKey: 'graph:full',
    ttl: 600000
  }
);
```

#### Manual Cache Management

```javascript
const cache = db.getCacheLayer();

// Store computed data
await cache.set('expensive-computation', result, 300000);

// Retrieve later
const cached = await cache.get('expensive-computation');

// Invalidate when data changes
await cache.invalidate('expensive-computation');
```

#### Cache Key Strategies

- **Entity-based**: `nodes:{id}`, `edges:{source}:{target}`
- **Query-based**: `query:{hash}`, `search:{term}`
- **Category-based**: `nodes:category:{category}`
- **Time-based**: Include timestamp for auto-expiry

## Engine-Specific Features

### SQLite

**Best for:**
- Local development
- Single-user applications
- Embedded systems
- Testing

**Features:**
- Zero configuration
- File-based storage
- WAL mode for better concurrency
- Full-text search

**Configuration:**
```javascript
{
  path: './data/app.db'
}
```

### PostgreSQL

**Best for:**
- Production environments
- Multi-user applications
- Complex queries
- Scalability

**Features:**
- ACID transactions
- Connection pooling
- Advanced indexing
- JSONB support

**Configuration:**
```javascript
{
  host: 'localhost',
  port: 5432,
  database: 'formula_nebula',
  user: 'postgres',
  password: 'password',
  maxConnections: 20
}
```

### MongoDB

**Best for:**
- Flexible schemas
- Document storage
- Rapid prototyping
- Hierarchical data

**Features:**
- Schema-less design
- Rich query language
- Aggregation pipelines
- Geospatial queries

**Configuration:**
```javascript
{
  host: 'localhost',
  port: 27017,
  database: 'formula_nebula',
  // Or use connection string:
  uri: 'mongodb://localhost:27017/formula_nebula'
}
```

### Redis

**Best for:**
- Caching layer
- Session storage
- Real-time data
- Pub/sub

**Features:**
- In-memory storage
- Key expiration
- Atomic operations
- Multiple data structures

**Configuration:**
```javascript
{
  host: 'localhost',
  port: 6379,
  password: 'optional',
  database: 0
}
```

## Performance Optimization

### Indexing

```javascript
// SQLite/PostgreSQL
await db.query('CREATE INDEX idx_category ON nodes(category)');
await db.query('CREATE INDEX idx_edges ON edges(source, target)');

// MongoDB (automatically created from schema)
```

### Query Optimization

```javascript
// Use prepared statements (automatic with parameterized queries)
await db.query('SELECT * FROM nodes WHERE id = ?', [nodeId]);

// Use LIMIT for large result sets
await db.query('SELECT * FROM nodes LIMIT 100');

// Use specific columns instead of SELECT *
await db.query('SELECT id, label FROM nodes');
```

### Connection Pooling

PostgreSQL uses connection pooling by default:

```javascript
{
  maxConnections: 20,        // Max pool size
  idleTimeoutMillis: 30000,  // Close idle connections
  connectionTimeoutMillis: 2000
}
```

### Batch Operations

```javascript
// Instead of multiple inserts:
for (const node of nodes) {
  await db.query('INSERT INTO nodes ...', [node.id, ...]);
}

// Use batch insert:
const values = nodes.map(n => `('${n.id}', '${n.label}')`).join(',');
await db.query(`INSERT INTO nodes (id, label) VALUES ${values}`);
```

## Error Handling

```javascript
try {
  const db = await initDB(ENGINE.POSTGRES, config);
  const results = await db.query('SELECT * FROM nodes');
  await db.close();

} catch (err) {
  if (err.message.includes('connection')) {
    console.error('Database connection failed:', err);
  } else if (err.message.includes('syntax')) {
    console.error('Invalid SQL:', err);
  } else {
    console.error('Database error:', err);
  }
}
```

## Testing

Run the example suite:

```bash
# Basic examples (SQLite only)
node kb-src/db-examples.mjs

# All examples (requires all services running)
RUN_ALL=true node kb-src/db-examples.mjs
```

## Environment Variables

```bash
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=formula_nebula
DB_USER=postgres
DB_PASSWORD=secret

# MongoDB
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=formula_nebula

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secret
```

## Production Checklist

- [ ] Use PostgreSQL or MongoDB (not SQLite)
- [ ] Configure Redis for caching
- [ ] Set up connection pooling
- [ ] Create database indexes
- [ ] Enable query logging
- [ ] Set up backups
- [ ] Configure monitoring
- [ ] Test migrations on staging
- [ ] Set appropriate cache TTLs
- [ ] Implement query timeouts

## Troubleshooting

### "Database not connected"
Ensure `await initDB()` completed successfully before queries.

### "Migration failed"
Check that migration scripts match your database engine. Run with `--engine=<type>`.

### Cache not working
Verify Redis connection or check memory cache with `db.getCacheLayer().stats()`.

### Slow queries
Add indexes, use query caching, or optimize WHERE clauses.

## License

MIT
