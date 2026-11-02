/**
 * Database Layer Abstraction
 * Supports: SQLite, PostgreSQL, MongoDB, Redis
 * Provides unified interface for queries, caching, and migrations
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Database Engine Types
 */
export const ENGINE = {
  SQLITE: 'sqlite',
  POSTGRES: 'postgresql',
  MONGODB: 'mongodb',
  REDIS: 'redis'
};

/**
 * Cache Layer with TTL support
 */
class CacheLayer {
  constructor(redisClient = null) {
    this.memoryCache = new Map();
    this.ttls = new Map();
    this.redisClient = redisClient;
  }

  /**
   * Get cached value
   */
  async get(key) {
    // Check if expired
    if (this.ttls.has(key)) {
      if (Date.now() > this.ttls.get(key)) {
        this.memoryCache.delete(key);
        this.ttls.delete(key);
        return null;
      }
    }

    // Memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Redis fallback
    if (this.redisClient) {
      try {
        const value = await this.redisClient.get(key);
        if (value) {
          const parsed = JSON.parse(value);
          this.memoryCache.set(key, parsed);
          return parsed;
        }
      } catch (err) {
        console.warn('Redis get failed:', err.message);
      }
    }

    return null;
  }

  /**
   * Set cached value with TTL (milliseconds)
   */
  async set(key, value, ttl = 300000) {
    this.memoryCache.set(key, value);

    if (ttl > 0) {
      this.ttls.set(key, Date.now() + ttl);
    }

    // Persist to Redis
    if (this.redisClient) {
      try {
        await this.redisClient.setex(key, Math.floor(ttl / 1000), JSON.stringify(value));
      } catch (err) {
        console.warn('Redis set failed:', err.message);
      }
    }
  }

  /**
   * Invalidate cache entry
   */
  async invalidate(key) {
    this.memoryCache.delete(key);
    this.ttls.delete(key);

    if (this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        console.warn('Redis del failed:', err.message);
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    this.memoryCache.clear();
    this.ttls.clear();

    if (this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch (err) {
        console.warn('Redis flush failed:', err.message);
      }
    }
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      entries: this.memoryCache.size,
      withTTL: this.ttls.size,
      redis: this.redisClient ? 'connected' : 'unavailable'
    };
  }
}

/**
 * SQLite Adapter
 */
class SQLiteAdapter {
  constructor(config) {
    this.config = config;
    this.db = null;
    this.sqlite3 = null;
  }

  async connect() {
    try {
      // Dynamic import to avoid hard dependency
      const sqlite3Module = await import('better-sqlite3');
      this.sqlite3 = sqlite3Module.default;

      // Ensure directory exists
      const dbPath = this.config.path || join(__dirname, 'data', 'formula-nebula.db');
      await mkdir(dirname(dbPath), { recursive: true });

      this.db = new this.sqlite3(dbPath);
      this.db.pragma('journal_mode = WAL');

      console.log(`SQLite connected: ${dbPath}`);
    } catch (err) {
      throw new Error(`SQLite connection failed: ${err.message}`);
    }
  }

  async query(sql, params = []) {
    if (!this.db) throw new Error('Database not connected');

    const isSelect = sql.trim().toLowerCase().startsWith('select');

    if (isSelect) {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params);
    } else {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...params);
      return {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid
      };
    }
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/**
 * PostgreSQL Adapter
 */
class PostgreSQLAdapter {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async connect() {
    try {
      const { default: pg } = await import('pg');
      const { Pool } = pg;

      this.pool = new Pool({
        host: this.config.host || 'localhost',
        port: this.config.port || 5432,
        database: this.config.database || 'formula_nebula',
        user: this.config.user,
        password: this.config.password,
        max: this.config.maxConnections || 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      client.release();

      console.log(`PostgreSQL connected: ${this.config.database}`);
    } catch (err) {
      throw new Error(`PostgreSQL connection failed: ${err.message}`);
    }
  }

  async query(sql, params = []) {
    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (err) {
      throw new Error(`Query failed: ${err.message}`);
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

/**
 * MongoDB Adapter
 */
class MongoDBAdapter {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const { MongoClient } = await import('mongodb');

      const uri = this.config.uri ||
        `mongodb://${this.config.host || 'localhost'}:${this.config.port || 27017}`;

      this.client = new MongoClient(uri);
      await this.client.connect();

      this.db = this.client.db(this.config.database || 'formula_nebula');

      console.log(`MongoDB connected: ${this.config.database || 'formula_nebula'}`);
    } catch (err) {
      throw new Error(`MongoDB connection failed: ${err.message}`);
    }
  }

  async query(collection, operation, params = {}) {
    if (!this.db) throw new Error('Database not connected');

    const coll = this.db.collection(collection);

    switch (operation) {
      case 'find':
        return await coll.find(params.filter || {}).toArray();
      case 'findOne':
        return await coll.findOne(params.filter || {});
      case 'insert':
        return await coll.insertOne(params.document);
      case 'insertMany':
        return await coll.insertMany(params.documents);
      case 'update':
        return await coll.updateOne(params.filter, params.update);
      case 'updateMany':
        return await coll.updateMany(params.filter, params.update);
      case 'delete':
        return await coll.deleteOne(params.filter);
      case 'deleteMany':
        return await coll.deleteMany(params.filter);
      case 'aggregate':
        return await coll.aggregate(params.pipeline).toArray();
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

/**
 * Redis Adapter
 */
class RedisAdapter {
  constructor(config) {
    this.config = config;
    this.client = null;
  }

  async connect() {
    try {
      const { createClient } = await import('redis');

      this.client = createClient({
        socket: {
          host: this.config.host || 'localhost',
          port: this.config.port || 6379
        },
        password: this.config.password,
        database: this.config.database || 0
      });

      this.client.on('error', (err) => console.error('Redis error:', err));

      await this.client.connect();

      console.log(`Redis connected: ${this.config.host || 'localhost'}:${this.config.port || 6379}`);
    } catch (err) {
      throw new Error(`Redis connection failed: ${err.message}`);
    }
  }

  async get(key) {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.get(key);
  }

  async set(key, value, ttl = null) {
    if (!this.client) throw new Error('Redis not connected');
    if (ttl) {
      return await this.client.setEx(key, ttl, value);
    }
    return await this.client.set(key, value);
  }

  async setex(key, ttl, value) {
    return await this.set(key, value, ttl);
  }

  async del(key) {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.del(key);
  }

  async flushdb() {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.flushDb();
  }

  async close() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}

/**
 * Migration Manager
 */
class MigrationManager {
  constructor(db, engine) {
    this.db = db;
    this.engine = engine;
    this.migrationsPath = join(__dirname, 'migrations');
  }

  async ensureMigrationsTable() {
    if (this.engine === ENGINE.SQLITE || this.engine === ENGINE.POSTGRES) {
      const sql = `
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY ${this.engine === ENGINE.SQLITE ? 'AUTOINCREMENT' : ''},
          version VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await this.db.query(sql);
    } else if (this.engine === ENGINE.MONGODB) {
      // MongoDB creates collections automatically
      await this.db.query('migrations', 'insertOne', {
        document: { _schema: true, createdAt: new Date() }
      });
      await this.db.query('migrations', 'deleteOne', { filter: { _schema: true } });
    }
  }

  async getAppliedMigrations() {
    if (this.engine === ENGINE.SQLITE || this.engine === ENGINE.POSTGRES) {
      const rows = await this.db.query('SELECT version FROM migrations ORDER BY version');
      return rows.map(r => r.version);
    } else if (this.engine === ENGINE.MONGODB) {
      const docs = await this.db.query('migrations', 'find', {});
      return docs.map(d => d.version).filter(Boolean);
    }
    return [];
  }

  async recordMigration(version, name) {
    if (this.engine === ENGINE.SQLITE || this.engine === ENGINE.POSTGRES) {
      await this.db.query(
        'INSERT INTO migrations (version, name) VALUES (?, ?)',
        [version, name]
      );
    } else if (this.engine === ENGINE.MONGODB) {
      await this.db.query('migrations', 'insertOne', {
        document: { version, name, appliedAt: new Date() }
      });
    }
  }

  async runMigrations() {
    await this.ensureMigrationsTable();

    const applied = await this.getAppliedMigrations();
    const migrations = await this.loadMigrationFiles();

    const pending = migrations.filter(m => !applied.includes(m.version));

    if (pending.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Running ${pending.length} migrations...`);

    for (const migration of pending) {
      console.log(`Applying: ${migration.version} - ${migration.name}`);

      try {
        await migration.up(this.db, this.engine);
        await this.recordMigration(migration.version, migration.name);
        console.log(`✓ ${migration.version} applied`);
      } catch (err) {
        console.error(`✗ ${migration.version} failed:`, err.message);
        throw err;
      }
    }

    console.log('All migrations completed');
  }

  async loadMigrationFiles() {
    try {
      await mkdir(this.migrationsPath, { recursive: true });
    } catch (err) {
      // Directory exists
    }

    // Return empty array for now - migrations are registered manually
    return [];
  }
}

/**
 * Database Layer - Main Class
 */
export class DBLayer {
  constructor() {
    this.adapter = null;
    this.cache = null;
    this.engine = null;
    this.migrationManager = null;
  }

  /**
   * Initialize database connection
   */
  async init(engine, config = {}) {
    this.engine = engine;

    switch (engine) {
      case ENGINE.SQLITE:
        this.adapter = new SQLiteAdapter(config);
        break;
      case ENGINE.POSTGRES:
        this.adapter = new PostgreSQLAdapter(config);
        break;
      case ENGINE.MONGODB:
        this.adapter = new MongoDBAdapter(config);
        break;
      case ENGINE.REDIS:
        this.adapter = new RedisAdapter(config);
        break;
      default:
        throw new Error(`Unknown engine: ${engine}`);
    }

    await this.adapter.connect();

    // Initialize Redis cache if configured
    let redisClient = null;
    if (config.cache?.redis) {
      try {
        const redisAdapter = new RedisAdapter(config.cache.redis);
        await redisAdapter.connect();
        redisClient = redisAdapter.client;
      } catch (err) {
        console.warn('Redis cache unavailable, using memory only:', err.message);
      }
    }

    this.cache = new CacheLayer(redisClient);
    this.migrationManager = new MigrationManager(this.adapter, engine);

    return this;
  }

  /**
   * Execute query with optional caching
   */
  async query(sql, params = [], options = {}) {
    const cacheKey = options.cacheKey;
    const ttl = options.ttl || 300000; // 5 minutes default

    // Check cache
    if (cacheKey) {
      const cached = await this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Execute query
    const result = await this.adapter.query(sql, params);

    // Cache result
    if (cacheKey && result) {
      await this.cache.set(cacheKey, result, ttl);
    }

    return result;
  }

  /**
   * Get cache layer for manual operations
   */
  getCacheLayer() {
    return this.cache;
  }

  /**
   * Run database migrations
   */
  async migrate() {
    if (!this.migrationManager) {
      throw new Error('Migration manager not initialized');
    }
    return await this.migrationManager.runMigrations();
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.adapter) {
      await this.adapter.close();
    }
    if (this.cache) {
      await this.cache.clear();
    }
  }

  /**
   * Get raw adapter for engine-specific operations
   */
  getAdapter() {
    return this.adapter;
  }

  /**
   * Get database statistics
   */
  async stats() {
    return {
      engine: this.engine,
      cache: this.cache?.stats(),
      connected: this.adapter !== null
    };
  }
}

/**
 * Factory function for quick initialization
 */
export async function initDB(engine, config = {}) {
  const db = new DBLayer();
  await db.init(engine, config);
  return db;
}

/**
 * Export convenience functions
 */
export { CacheLayer };
