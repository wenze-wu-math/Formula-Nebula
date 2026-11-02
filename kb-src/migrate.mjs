#!/usr/bin/env node
/**
 * Database Migration Runner
 * Usage: node migrate.mjs [up|down|status] [--engine sqlite|postgresql|mongodb]
 */

import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initDB, ENGINE } from './db-layer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  const engine = args.find(a => a.startsWith('--engine='))?.split('=')[1] || 'sqlite';

  return { command, engine };
}

/**
 * Get database configuration
 */
function getDBConfig(engine) {
  const configs = {
    sqlite: {
      path: join(__dirname, 'data', 'formula-nebula.db')
    },
    postgresql: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'formula_nebula',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || ''
    },
    mongodb: {
      host: process.env.MONGO_HOST || 'localhost',
      port: parseInt(process.env.MONGO_PORT || '27017'),
      database: process.env.MONGO_DB || 'formula_nebula'
    }
  };

  return configs[engine];
}

/**
 * Load migration files
 */
async function loadMigrations() {
  const migrationsDir = join(__dirname, 'migrations');
  const files = await readdir(migrationsDir);

  const migrations = [];

  for (const file of files.sort()) {
    if (file.endsWith('.mjs')) {
      const migrationPath = join(migrationsDir, file);
      const migration = await import(migrationPath);

      migrations.push({
        version: migration.version,
        name: migration.name,
        up: migration.up,
        down: migration.down,
        filename: file
      });
    }
  }

  return migrations.sort((a, b) => a.version.localeCompare(b.version));
}

/**
 * Ensure migrations table exists
 */
async function ensureMigrationsTable(db, engine) {
  if (engine === ENGINE.SQLITE || engine === ENGINE.POSTGRES) {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id ${engine === ENGINE.SQLITE ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'SERIAL PRIMARY KEY'},
        version VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(sql);
  } else if (engine === ENGINE.MONGODB) {
    // MongoDB creates collections automatically
    const adapter = db.getAdapter();
    try {
      await adapter.query('migrations', 'insertOne', {
        document: { _init: true, createdAt: new Date() }
      });
      await adapter.query('migrations', 'deleteOne', {
        filter: { _init: true }
      });
    } catch (err) {
      // Collection might already exist
    }
  }
}

/**
 * Get applied migrations
 */
async function getAppliedMigrations(db, engine) {
  if (engine === ENGINE.SQLITE || engine === ENGINE.POSTGRES) {
    const rows = await db.query('SELECT version, name, applied_at FROM migrations ORDER BY version');
    return rows;
  } else if (engine === ENGINE.MONGODB) {
    const adapter = db.getAdapter();
    const docs = await adapter.query('migrations', 'find', {
      filter: {}
    });
    return docs.filter(d => d.version).map(d => ({
      version: d.version,
      name: d.name,
      applied_at: d.appliedAt
    }));
  }
  return [];
}

/**
 * Record migration
 */
async function recordMigration(db, engine, version, name) {
  if (engine === ENGINE.SQLITE || engine === ENGINE.POSTGRES) {
    await db.query(
      'INSERT INTO migrations (version, name) VALUES (?, ?)',
      [version, name]
    );
  } else if (engine === ENGINE.MONGODB) {
    const adapter = db.getAdapter();
    await adapter.query('migrations', 'insertOne', {
      document: { version, name, appliedAt: new Date() }
    });
  }
}

/**
 * Remove migration record
 */
async function removeMigrationRecord(db, engine, version) {
  if (engine === ENGINE.SQLITE || engine === ENGINE.POSTGRES) {
    await db.query('DELETE FROM migrations WHERE version = ?', [version]);
  } else if (engine === ENGINE.MONGODB) {
    const adapter = db.getAdapter();
    await adapter.query('migrations', 'deleteOne', {
      filter: { version }
    });
  }
}

/**
 * Run migrations up
 */
async function migrateUp(db, engine) {
  await ensureMigrationsTable(db, engine);

  const allMigrations = await loadMigrations();
  const applied = await getAppliedMigrations(db, engine);
  const appliedVersions = new Set(applied.map(m => m.version));

  const pending = allMigrations.filter(m => !appliedVersions.has(m.version));

  if (pending.length === 0) {
    console.log('\n✓ No pending migrations\n');
    return;
  }

  console.log(`\nRunning ${pending.length} migration(s)...\n`);

  for (const migration of pending) {
    try {
      console.log(`→ Applying ${migration.version} - ${migration.name}`);

      const adapter = engine === ENGINE.MONGODB ? db.getAdapter() : db;
      await migration.up(adapter, engine);

      await recordMigration(db, engine, migration.version, migration.name);

      console.log(`✓ ${migration.version} completed\n`);
    } catch (err) {
      console.error(`✗ ${migration.version} failed:`, err.message);
      throw err;
    }
  }

  console.log('✓ All migrations completed\n');
}

/**
 * Rollback last migration
 */
async function migrateDown(db, engine) {
  await ensureMigrationsTable(db, engine);

  const applied = await getAppliedMigrations(db, engine);

  if (applied.length === 0) {
    console.log('\n✓ No migrations to rollback\n');
    return;
  }

  const lastApplied = applied[applied.length - 1];
  const allMigrations = await loadMigrations();
  const migration = allMigrations.find(m => m.version === lastApplied.version);

  if (!migration) {
    console.error(`\n✗ Migration ${lastApplied.version} not found\n`);
    return;
  }

  console.log(`\n→ Rolling back ${migration.version} - ${migration.name}\n`);

  try {
    const adapter = engine === ENGINE.MONGODB ? db.getAdapter() : db;
    await migration.down(adapter, engine);

    await removeMigrationRecord(db, engine, migration.version);

    console.log(`✓ ${migration.version} rolled back\n`);
  } catch (err) {
    console.error(`✗ Rollback failed:`, err.message);
    throw err;
  }
}

/**
 * Show migration status
 */
async function showStatus(db, engine) {
  await ensureMigrationsTable(db, engine);

  const allMigrations = await loadMigrations();
  const applied = await getAppliedMigrations(db, engine);
  const appliedVersions = new Set(applied.map(m => m.version));

  console.log('\nMigration Status:\n');
  console.log('Version | Name                  | Status   | Applied At');
  console.log('--------|----------------------|----------|------------------');

  for (const migration of allMigrations) {
    const isApplied = appliedVersions.has(migration.version);
    const appliedInfo = applied.find(a => a.version === migration.version);
    const status = isApplied ? '✓ Applied' : '○ Pending';
    const appliedAt = appliedInfo?.applied_at
      ? new Date(appliedInfo.applied_at).toISOString().slice(0, 16).replace('T', ' ')
      : '-';

    console.log(
      `${migration.version.padEnd(7)} | ${migration.name.padEnd(20)} | ${status.padEnd(8)} | ${appliedAt}`
    );
  }

  console.log('');
}

/**
 * Main execution
 */
async function main() {
  const { command, engine } = parseArgs();

  console.log(`\nFormula Nebula Migration Tool`);
  console.log(`Engine: ${engine}\n`);

  let db;

  try {
    // Initialize database
    const config = getDBConfig(engine);
    db = await initDB(engine, config);

    // Execute command
    switch (command) {
      case 'up':
        await migrateUp(db, engine);
        break;
      case 'down':
        await migrateDown(db, engine);
        break;
      case 'status':
        await showStatus(db, engine);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Usage: node migrate.mjs [up|down|status] [--engine=sqlite|postgresql|mongodb]');
        process.exit(1);
    }

  } catch (err) {
    console.error('\n✗ Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
