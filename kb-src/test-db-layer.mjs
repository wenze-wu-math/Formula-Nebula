#!/usr/bin/env node
/**
 * Database Layer Test Suite
 * Comprehensive tests for all database operations
 */

import { initDB, ENGINE } from './db-layer.mjs';
import { initializeSchema } from './db-schema.mjs';
import { rmdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_DIR = join(__dirname, 'test-data');

/**
 * Test utilities
 */
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async test(name, fn) {
    process.stdout.write(`  ${name}... `);

    try {
      await fn();
      console.log('✓');
      this.passed++;
      this.tests.push({ name, status: 'passed' });
    } catch (err) {
      console.log(`✗\n    Error: ${err.message}`);
      this.failed++;
      this.tests.push({ name, status: 'failed', error: err.message });
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertExists(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message || 'Value does not exist');
    }
  }

  summary() {
    console.log('\n' + '='.repeat(50));
    console.log(`Tests: ${this.passed + this.failed}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log('='.repeat(50));

    return this.failed === 0;
  }
}

/**
 * Setup test environment
 */
async function setupTestEnv() {
  try {
    await rmdir(TEST_DIR, { recursive: true });
  } catch (err) {
    // Directory doesn't exist
  }

  await mkdir(TEST_DIR, { recursive: true });
}

/**
 * Test Suite: SQLite
 */
async function testSQLite() {
  console.log('\n📦 SQLite Tests');
  const runner = new TestRunner();

  let db;

  await runner.test('Initialize SQLite', async () => {
    db = await initDB(ENGINE.SQLITE, {
      path: join(TEST_DIR, 'test.db')
    });
    runner.assertExists(db);
  });

  await runner.test('Initialize schema', async () => {
    await initializeSchema(db, ENGINE.SQLITE);
  });

  await runner.test('Insert node', async () => {
    const result = await db.query(
      'INSERT INTO nodes (id, label, category) VALUES (?, ?, ?)',
      ['test-1', 'Test Theorem', 'theorem']
    );
    runner.assertExists(result);
  });

  await runner.test('Query node', async () => {
    const results = await db.query(
      'SELECT * FROM nodes WHERE id = ?',
      ['test-1']
    );
    runner.assertEqual(results.length, 1);
    runner.assertEqual(results[0].label, 'Test Theorem');
  });

  await runner.test('Insert edge', async () => {
    await db.query(
      'INSERT INTO nodes (id, label, category) VALUES (?, ?, ?)',
      ['test-2', 'Related Theorem', 'theorem']
    );

    const result = await db.query(
      'INSERT INTO edges (source, target, type) VALUES (?, ?, ?)',
      ['test-1', 'test-2', 'relates-to']
    );
    runner.assertExists(result);
  });

  await runner.test('Query with join', async () => {
    const results = await db.query(`
      SELECT e.*, n1.label as source_label, n2.label as target_label
      FROM edges e
      JOIN nodes n1 ON e.source = n1.id
      JOIN nodes n2 ON e.target = n2.id
      WHERE e.source = ?
    `, ['test-1']);

    runner.assertEqual(results.length, 1);
    runner.assertEqual(results[0].source_label, 'Test Theorem');
  });

  await runner.test('Cache functionality', async () => {
    const cache = db.getCacheLayer();

    await cache.set('test-key', { value: 42 }, 5000);
    const cached = await cache.get('test-key');

    runner.assertExists(cached);
    runner.assertEqual(cached.value, 42);
  });

  await runner.test('Query with caching', async () => {
    const results1 = await db.query(
      'SELECT * FROM nodes WHERE category = ?',
      ['theorem'],
      { cacheKey: 'nodes:theorem', ttl: 10000 }
    );

    const results2 = await db.query(
      'SELECT * FROM nodes WHERE category = ?',
      ['theorem'],
      { cacheKey: 'nodes:theorem', ttl: 10000 }
    );

    runner.assertEqual(results1.length, results2.length);
  });

  await runner.test('Database stats', async () => {
    const stats = await db.stats();
    runner.assertExists(stats);
    runner.assertEqual(stats.engine, ENGINE.SQLITE);
  });

  await runner.test('Close connection', async () => {
    await db.close();
  });

  return runner.summary();
}

/**
 * Test Suite: Cache Layer
 */
async function testCacheLayer() {
  console.log('\n💾 Cache Layer Tests');
  const runner = new TestRunner();

  let db;

  await runner.test('Initialize with memory cache', async () => {
    db = await initDB(ENGINE.SQLITE, {
      path: join(TEST_DIR, 'cache-test.db')
    });
    runner.assertExists(db.getCacheLayer());
  });

  const cache = db.getCacheLayer();

  await runner.test('Set and get value', async () => {
    await cache.set('key1', { data: 'value1' }, 5000);
    const value = await cache.get('key1');

    runner.assertExists(value);
    runner.assertEqual(value.data, 'value1');
  });

  await runner.test('TTL expiration', async () => {
    await cache.set('expire-key', { data: 'temp' }, 100); // 100ms

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));

    const value = await cache.get('expire-key');
    runner.assertEqual(value, null);
  });

  await runner.test('Invalidate key', async () => {
    await cache.set('invalid-key', { data: 'remove' }, 10000);
    await cache.invalidate('invalid-key');

    const value = await cache.get('invalid-key');
    runner.assertEqual(value, null);
  });

  await runner.test('Cache stats', async () => {
    await cache.clear();
    await cache.set('stat1', {}, 5000);
    await cache.set('stat2', {}, 5000);

    const stats = cache.stats();
    runner.assertExists(stats);
    runner.assertEqual(stats.entries >= 2, true);
  });

  await runner.test('Clear all cache', async () => {
    await cache.clear();
    const stats = cache.stats();
    runner.assertEqual(stats.entries, 0);
  });

  await db.close();

  return runner.summary();
}

/**
 * Test Suite: Schema Initialization
 */
async function testSchemaInit() {
  console.log('\n🏗️  Schema Initialization Tests');
  const runner = new TestRunner();

  let db;

  await runner.test('Initialize database', async () => {
    db = await initDB(ENGINE.SQLITE, {
      path: join(TEST_DIR, 'schema-test.db')
    });
  });

  await runner.test('Initialize schema', async () => {
    await initializeSchema(db, ENGINE.SQLITE);
  });

  await runner.test('Verify nodes table', async () => {
    const result = await db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='nodes'"
    );
    runner.assertEqual(result.length, 1);
  });

  await runner.test('Verify edges table', async () => {
    const result = await db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='edges'"
    );
    runner.assertEqual(result.length, 1);
  });

  await runner.test('Verify proofs table', async () => {
    const result = await db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='proofs'"
    );
    runner.assertEqual(result.length, 1);
  });

  await runner.test('Verify researchers table', async () => {
    const result = await db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='researchers'"
    );
    runner.assertEqual(result.length, 1);
  });

  await runner.test('Verify papers table', async () => {
    const result = await db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='papers'"
    );
    runner.assertEqual(result.length, 1);
  });

  await db.close();

  return runner.summary();
}

/**
 * Test Suite: Complex Operations
 */
async function testComplexOperations() {
  console.log('\n🔧 Complex Operations Tests');
  const runner = new TestRunner();

  let db;

  await runner.test('Initialize database', async () => {
    db = await initDB(ENGINE.SQLITE, {
      path: join(TEST_DIR, 'complex-test.db')
    });
    await initializeSchema(db, ENGINE.SQLITE);
  });

  await runner.test('Batch insert nodes', async () => {
    for (let i = 1; i <= 10; i++) {
      await db.query(
        'INSERT INTO nodes (id, label, category) VALUES (?, ?, ?)',
        [`node-${i}`, `Node ${i}`, i % 2 === 0 ? 'theorem' : 'concept']
      );
    }

    const results = await db.query('SELECT COUNT(*) as count FROM nodes');
    runner.assertEqual(results[0].count >= 10, true);
  });

  await runner.test('Complex query with aggregation', async () => {
    const results = await db.query(`
      SELECT category, COUNT(*) as count
      FROM nodes
      GROUP BY category
      ORDER BY count DESC
    `);

    runner.assertExists(results);
    runner.assert(results.length > 0, 'Should have category aggregations');
  });

  await runner.test('Insert proof', async () => {
    await db.query(`
      INSERT INTO proofs (theorem_id, proof_type, content, verified)
      VALUES (?, ?, ?, ?)
    `, ['node-1', 'constructive', 'This is a test proof', 1]);

    const results = await db.query(
      'SELECT * FROM proofs WHERE theorem_id = ?',
      ['node-1']
    );

    runner.assertEqual(results.length, 1);
  });

  await runner.test('Transaction-like operations', async () => {
    // Insert related data
    await db.query(
      'INSERT INTO researchers (id, name, affiliation) VALUES (?, ?, ?)',
      ['researcher-1', 'John Doe', 'MIT']
    );

    await db.query(
      'INSERT INTO papers (id, title, authors, year) VALUES (?, ?, ?, ?)',
      ['paper-1', 'Test Paper', JSON.stringify(['researcher-1']), 2024]
    );

    const researchers = await db.query('SELECT * FROM researchers WHERE id = ?', ['researcher-1']);
    const papers = await db.query('SELECT * FROM papers WHERE id = ?', ['paper-1']);

    runner.assertEqual(researchers.length, 1);
    runner.assertEqual(papers.length, 1);
  });

  await db.close();

  return runner.summary();
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Database Layer Test Suite               ║');
  console.log('╚══════════════════════════════════════════╝');

  await setupTestEnv();

  const results = [];

  results.push(await testSQLite());
  results.push(await testCacheLayer());
  results.push(await testSchemaInit());
  results.push(await testComplexOperations());

  const allPassed = results.every(r => r === true);

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✓ ALL TESTS PASSED');
  } else {
    console.log('✗ SOME TESTS FAILED');
  }
  console.log('='.repeat(50) + '\n');

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests();
