# Quick Start: Database Layer

Get started with the Formula Nebula database layer in 5 minutes.

## Step 1: Install Dependencies

Choose your database engine:

```bash
# SQLite (recommended for development)
npm install better-sqlite3

# Or use the installer
chmod +x kb-src/install-db-deps.sh
./kb-src/install-db-deps.sh sqlite
```

## Step 2: Configure (Optional)

For SQLite, default configuration works out of the box. For other engines:

```bash
cp kb-src/.env.example kb-src/.env
# Edit .env with your settings
```

## Step 3: Initialize Database

```javascript
import { initDB, ENGINE } from './kb-src/db-layer.mjs';
import { initializeSchema } from './kb-src/db-schema.mjs';

// Connect
const db = await initDB(ENGINE.SQLITE, {
  path: './kb-src/data/formula-nebula.db'
});

// Create schema
await initializeSchema(db, ENGINE.SQLITE);
```

## Step 4: Run Migrations

```bash
node kb-src/migrate.mjs up --engine=sqlite
```

## Step 5: Use It!

```javascript
// Insert a node
await db.query(
  'INSERT INTO nodes (id, label, category, description) VALUES (?, ?, ?, ?)',
  ['riemann-hypothesis', 'Riemann Hypothesis', 'conjecture', 'Famous unsolved problem']
);

// Query nodes
const theorems = await db.query(
  'SELECT * FROM nodes WHERE category = ?',
  ['conjecture']
);

console.log(theorems);

// Close when done
await db.close();
```

## Complete Example

```javascript
import { initDB, ENGINE } from './kb-src/db-layer.mjs';
import { initializeSchema } from './kb-src/db-schema.mjs';

async function main() {
  // 1. Initialize
  const db = await initDB(ENGINE.SQLITE, {
    path: './kb-src/data/formula-nebula.db'
  });

  // 2. Setup schema (first time only)
  await initializeSchema(db, ENGINE.SQLITE);

  // 3. Insert data
  await db.query(
    'INSERT INTO nodes (id, label, category, description) VALUES (?, ?, ?, ?)',
    ['test-theorem', 'Test Theorem', 'theorem', 'A test theorem for demonstration']
  );

  // 4. Query with caching
  const results = await db.query(
    'SELECT * FROM nodes WHERE category = ?',
    ['theorem'],
    {
      cacheKey: 'nodes:theorem',
      ttl: 300000  // Cache for 5 minutes
    }
  );

  console.log(`Found ${results.length} theorems`);

  // 5. Use cache layer directly
  const cache = db.getCacheLayer();
  await cache.set('my-data', { value: 42 }, 60000);
  const cached = await cache.get('my-data');
  console.log('Cached value:', cached);

  // 6. Clean up
  await db.close();
}

main().catch(console.error);
```

## Testing

Run the test suite to verify everything works:

```bash
node kb-src/test-db-layer.mjs
```

Expected output:
```
✓ Initialize SQLite
✓ Initialize schema
✓ Insert node
✓ Query node
✓ Cache functionality
...
✓ ALL TESTS PASSED
```

## Examples

Run working examples:

```bash
node kb-src/db-examples.mjs
```

## Common Operations

### Insert Multiple Nodes

```javascript
const nodes = [
  { id: 'fermat', label: 'Fermat\'s Last Theorem', category: 'theorem' },
  { id: 'riemann', label: 'Riemann Hypothesis', category: 'conjecture' },
  { id: 'poincare', label: 'Poincaré Conjecture', category: 'theorem' }
];

for (const node of nodes) {
  await db.query(
    'INSERT INTO nodes (id, label, category) VALUES (?, ?, ?)',
    [node.id, node.label, node.category]
  );
}
```

### Create Relationships

```javascript
await db.query(
  'INSERT INTO edges (source, target, type, weight) VALUES (?, ?, ?, ?)',
  ['fermat', 'riemann', 'relates-to', 0.85]
);
```

### Complex Queries

```javascript
// Find related nodes
const related = await db.query(`
  SELECT n.*, e.type, e.weight
  FROM nodes n
  JOIN edges e ON n.id = e.target
  WHERE e.source = ?
  ORDER BY e.weight DESC
  LIMIT 10
`, ['fermat']);
```

### Using Cache

```javascript
// First call: hits database
const results1 = await db.query(
  'SELECT * FROM nodes',
  [],
  { cacheKey: 'all-nodes', ttl: 60000 }
);

// Second call: hits cache (much faster)
const results2 = await db.query(
  'SELECT * FROM nodes',
  [],
  { cacheKey: 'all-nodes', ttl: 60000 }
);
```

## Migration Management

### Check Status

```bash
node kb-src/migrate.mjs status --engine=sqlite
```

### Apply Migrations

```bash
node kb-src/migrate.mjs up --engine=sqlite
```

### Rollback Last Migration

```bash
node kb-src/migrate.mjs down --engine=sqlite
```

## Switching to PostgreSQL

When ready for production:

1. Install PostgreSQL client:
```bash
npm install pg
```

2. Update configuration:
```bash
# In .env
DB_ENGINE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=formula_nebula
DB_USER=postgres
DB_PASSWORD=your-password
```

3. Run migrations:
```bash
node kb-src/migrate.mjs up --engine=postgresql
```

4. Update code (same API!):
```javascript
const db = await initDB(ENGINE.POSTGRES, {
  host: 'localhost',
  port: 5432,
  database: 'formula_nebula',
  user: 'postgres',
  password: 'your-password'
});
```

## Troubleshooting

### "Cannot find module 'better-sqlite3'"

```bash
npm install better-sqlite3
```

### "Database not connected"

Make sure to call `await initDB()` before queries:

```javascript
const db = await initDB(ENGINE.SQLITE, config);
// ^^^^^ Don't forget await!
```

### "Table does not exist"

Run migrations:

```bash
node kb-src/migrate.mjs up --engine=sqlite
```

Or initialize schema:

```javascript
await initializeSchema(db, ENGINE.SQLITE);
```

### Cache not working

Check cache stats:

```javascript
const stats = db.getCacheLayer().stats();
console.log(stats);
```

## Next Steps

- Read [DB-README.md](./DB-README.md) for complete documentation
- Check [db-examples.mjs](./db-examples.mjs) for more examples
- Review [DB-IMPLEMENTATION.md](./DB-IMPLEMENTATION.md) for architecture details
- Explore migration scripts in [migrations/](./migrations/)

## Performance Tips

1. **Use caching** for expensive queries
2. **Create indexes** on frequently queried columns
3. **Use batch inserts** for large datasets
4. **Connection pooling** for PostgreSQL (automatic)
5. **Monitor cache hit rates** with `cache.stats()`

## Support

For questions or issues:
- Check the test suite: `node test-db-layer.mjs`
- Run examples: `node db-examples.mjs`
- Read documentation in DB-README.md
