/**
 * Migration 001: Initial Schema
 * Creates core tables/collections for knowledge graph
 */

import { SQL_SCHEMA, MONGO_SCHEMA } from '../db-schema.mjs';

export const version = '001';
export const name = 'initial_schema';

export async function up(db, engine) {
  if (engine === 'sqlite' || engine === 'postgresql') {
    // Create nodes table
    let sql = SQL_SCHEMA.nodes;
    if (engine === 'postgresql') {
      sql = sql
        .replace(/JSON/g, 'JSONB')
        .replace(/FULLTEXT idx_description \(description\)/g, '');
    }
    await db.query(sql);

    // Create edges table
    sql = SQL_SCHEMA.edges;
    if (engine === 'postgresql') {
      sql = sql
        .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
        .replace(/JSON/g, 'JSONB');
    }
    await db.query(sql);

    console.log('✓ Created nodes and edges tables');

  } else if (engine === 'mongodb') {
    const adapter = db;

    // Create nodes collection
    await adapter.query('nodes', 'insertOne', {
      document: { _init: true }
    });
    await adapter.query('nodes', 'deleteOne', {
      filter: { _init: true }
    });

    // Create edges collection
    await adapter.query('edges', 'insertOne', {
      document: { _init: true }
    });
    await adapter.query('edges', 'deleteOne', {
      filter: { _init: true }
    });

    console.log('✓ Created nodes and edges collections');
  }
}

export async function down(db, engine) {
  if (engine === 'sqlite' || engine === 'postgresql') {
    await db.query('DROP TABLE IF EXISTS edges');
    await db.query('DROP TABLE IF EXISTS nodes');
    console.log('✓ Dropped nodes and edges tables');

  } else if (engine === 'mongodb') {
    const adapter = db;
    await adapter.db.collection('edges').drop();
    await adapter.db.collection('nodes').drop();
    console.log('✓ Dropped nodes and edges collections');
  }
}
