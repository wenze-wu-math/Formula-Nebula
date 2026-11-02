/**
 * Database Layer Usage Examples
 * Demonstrates all features of the DB abstraction layer
 */

import { initDB, ENGINE } from './db-layer.mjs';
import { initializeSchema } from './db-schema.mjs';

/**
 * Example 1: SQLite with caching
 */
export async function exampleSQLite() {
  console.log('\n=== SQLite Example ===\n');

  // Initialize SQLite database
  const db = await initDB(ENGINE.SQLITE, {
    path: './data/example.db',
    cache: {
      redis: null // Use memory cache only
    }
  });

  // Initialize schema
  await initializeSchema(db, ENGINE.SQLITE);

  // Insert a node
  await db.query(
    'INSERT INTO nodes (id, label, category, description) VALUES (?, ?, ?, ?)',
    ['riemann-hypothesis', 'Riemann Hypothesis', 'conjecture', 'Famous unsolved problem in mathematics']
  );

  // Query with caching
  const results = await db.query(
    'SELECT * FROM nodes WHERE category = ?',
    ['conjecture'],
    {
      cacheKey: 'nodes:category:conjecture',
      ttl: 60000 // 1 minute
    }
  );

  console.log('Query results:', results);

  // Check cache stats
  console.log('Cache stats:', db.getCacheLayer().stats());

  await db.close();
  console.log('✓ SQLite example completed');
}

/**
 * Example 2: PostgreSQL with Redis cache
 */
export async function examplePostgreSQL() {
  console.log('\n=== PostgreSQL Example ===\n');

  try {
    const db = await initDB(ENGINE.POSTGRES, {
      host: 'localhost',
      port: 5432,
      database: 'formula_nebula',
      user: 'postgres',
      password: 'password',
      cache: {
        redis: {
          host: 'localhost',
          port: 6379
        }
      }
    });

    await initializeSchema(db, ENGINE.POSTGRES);

    // Insert with returning
    const result = await db.query(
      'INSERT INTO nodes (id, label, category) VALUES ($1, $2, $3) RETURNING id',
      ['test-theorem', 'Test Theorem', 'theorem']
    );

    console.log('Inserted:', result);

    // Complex query with joins
    const edges = await db.query(`
      SELECT e.*, n1.label as source_label, n2.label as target_label
      FROM edges e
      JOIN nodes n1 ON e.source = n1.id
      JOIN nodes n2 ON e.target = n2.id
      WHERE e.type = $1
      LIMIT 10
    `, ['relates-to']);

    console.log('Edges found:', edges.length);

    await db.close();
    console.log('✓ PostgreSQL example completed');

  } catch (err) {
    console.error('PostgreSQL example failed:', err.message);
    console.log('(This is expected if PostgreSQL is not running)');
  }
}

/**
 * Example 3: MongoDB document operations
 */
export async function exampleMongoDB() {
  console.log('\n=== MongoDB Example ===\n');

  try {
    const db = await initDB(ENGINE.MONGODB, {
      host: 'localhost',
      port: 27017,
      database: 'formula_nebula'
    });

    await initializeSchema(db, ENGINE.MONGODB);

    // Insert document
    const adapter = db.getAdapter();

    await adapter.query('nodes', 'insertOne', {
      document: {
        id: 'fermat-last-theorem',
        label: 'Fermat\'s Last Theorem',
        category: 'theorem',
        description: 'Proved by Andrew Wiles in 1995',
        metadata: {
          year: 1995,
          proof_method: 'modular forms'
        },
        position: { x: 100, y: 200, z: 50 }
      }
    });

    // Find documents
    const results = await adapter.query('nodes', 'find', {
      filter: { category: 'theorem' }
    });

    console.log('Found documents:', results.length);

    // Aggregation pipeline
    const stats = await adapter.query('nodes', 'aggregate', {
      pipeline: [
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]
    });

    console.log('Category stats:', stats);

    await db.close();
    console.log('✓ MongoDB example completed');

  } catch (err) {
    console.error('MongoDB example failed:', err.message);
    console.log('(This is expected if MongoDB is not running)');
  }
}

/**
 * Example 4: Redis caching layer
 */
export async function exampleRedisCache() {
  console.log('\n=== Redis Cache Example ===\n');

  try {
    const db = await initDB(ENGINE.SQLITE, {
      path: './data/cache-test.db',
      cache: {
        redis: {
          host: 'localhost',
          port: 6379
        }
      }
    });

    const cache = db.getCacheLayer();

    // Set values with different TTLs
    await cache.set('fast-lookup', { data: 'immediate' }, 5000); // 5 seconds
    await cache.set('slow-lookup', { data: 'expensive query' }, 300000); // 5 minutes

    // Get cached values
    const fast = await cache.get('fast-lookup');
    const slow = await cache.get('slow-lookup');

    console.log('Fast lookup:', fast);
    console.log('Slow lookup:', slow);

    // Cache stats
    console.log('Cache stats:', cache.stats());

    // Invalidate specific key
    await cache.invalidate('fast-lookup');

    await db.close();
    console.log('✓ Redis cache example completed');

  } catch (err) {
    console.error('Redis cache example failed:', err.message);
    console.log('(This is expected if Redis is not running)');
  }
}

/**
 * Example 5: Query with automatic caching
 */
export async function exampleSmartCaching() {
  console.log('\n=== Smart Caching Example ===\n');

  const db = await initDB(ENGINE.SQLITE, {
    path: './data/smart-cache.db'
  });

  await initializeSchema(db, ENGINE.SQLITE);

  // First query - hits database
  console.time('First query (uncached)');
  const result1 = await db.query(
    'SELECT * FROM nodes WHERE category = ?',
    ['theorem'],
    {
      cacheKey: 'nodes:theorem',
      ttl: 60000
    }
  );
  console.timeEnd('First query (uncached)');

  // Second query - hits cache
  console.time('Second query (cached)');
  const result2 = await db.query(
    'SELECT * FROM nodes WHERE category = ?',
    ['theorem'],
    {
      cacheKey: 'nodes:theorem',
      ttl: 60000
    }
  );
  console.timeEnd('Second query (cached)');

  console.log('Results equal:', JSON.stringify(result1) === JSON.stringify(result2));

  await db.close();
  console.log('✓ Smart caching example completed');
}

/**
 * Example 6: Migration workflow
 */
export async function exampleMigrations() {
  console.log('\n=== Migration Example ===\n');

  const db = await initDB(ENGINE.SQLITE, {
    path: './data/migrations-test.db'
  });

  // Run migrations
  await db.migrate();

  // Database is now ready with schema
  console.log('Database stats:', await db.stats());

  await db.close();
  console.log('✓ Migration example completed');
}

/**
 * Example 7: Multi-engine compatibility
 */
export async function exampleMultiEngine() {
  console.log('\n=== Multi-Engine Compatibility ===\n');

  const engines = [
    { name: 'SQLite', engine: ENGINE.SQLITE, config: { path: './data/multi-test.db' } }
  ];

  // Add PostgreSQL if available
  if (process.env.DB_USER) {
    engines.push({
      name: 'PostgreSQL',
      engine: ENGINE.POSTGRES,
      config: {
        host: 'localhost',
        database: 'formula_nebula',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      }
    });
  }

  for (const { name, engine, config } of engines) {
    try {
      console.log(`\nTesting ${name}...`);

      const db = await initDB(engine, config);
      await initializeSchema(db, engine);

      const stats = await db.stats();
      console.log(`${name} stats:`, stats);

      await db.close();
      console.log(`✓ ${name} compatible`);

    } catch (err) {
      console.error(`✗ ${name} failed:`, err.message);
    }
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Formula Nebula DB Layer Examples       ║');
  console.log('╚══════════════════════════════════════════╝');

  try {
    await exampleSQLite();
    await exampleSmartCaching();
    await exampleMigrations();
    await exampleMultiEngine();

    // These require external services
    if (process.env.RUN_ALL === 'true') {
      await examplePostgreSQL();
      await exampleMongoDB();
      await exampleRedisCache();
    }

    console.log('\n✓ All examples completed successfully\n');

  } catch (err) {
    console.error('\n✗ Examples failed:', err);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}
