/**
 * Migration 003: Add Researchers and Papers
 * Adds support for researcher profiles and academic papers
 */

import { SQL_SCHEMA } from '../db-schema.mjs';

export const version = '003';
export const name = 'add_researchers';

export async function up(db, engine) {
  if (engine === 'sqlite' || engine === 'postgresql') {
    // Researchers table
    let sql = SQL_SCHEMA.researchers;
    if (engine === 'postgresql') {
      sql = sql
        .replace(/JSON/g, 'JSONB')
        .replace(/FULLTEXT idx_affiliation \(affiliation\)/g, '');
    }
    await db.query(sql);

    // Papers table
    sql = SQL_SCHEMA.papers;
    if (engine === 'postgresql') {
      sql = sql
        .replace(/JSON/g, 'JSONB')
        .replace(/FULLTEXT idx_title \(title\)/g, '')
        .replace(/FULLTEXT idx_abstract \(abstract\)/g, '');
    }
    await db.query(sql);

    console.log('✓ Created researchers and papers tables');

  } else if (engine === 'mongodb') {
    const adapter = db;

    await adapter.query('researchers', 'insertOne', {
      document: { _init: true }
    });
    await adapter.query('researchers', 'deleteOne', {
      filter: { _init: true }
    });

    await adapter.query('papers', 'insertOne', {
      document: { _init: true }
    });
    await adapter.query('papers', 'deleteOne', {
      filter: { _init: true }
    });

    console.log('✓ Created researchers and papers collections');
  }
}

export async function down(db, engine) {
  if (engine === 'sqlite' || engine === 'postgresql') {
    await db.query('DROP TABLE IF EXISTS papers');
    await db.query('DROP TABLE IF EXISTS researchers');
    console.log('✓ Dropped researchers and papers tables');

  } else if (engine === 'mongodb') {
    const adapter = db;
    await adapter.db.collection('papers').drop();
    await adapter.db.collection('researchers').drop();
    console.log('✓ Dropped researchers and papers collections');
  }
}
