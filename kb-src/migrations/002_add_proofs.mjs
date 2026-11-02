/**
 * Migration 002: Add Proofs Support
 * Adds proofs table/collection for theorem proofs
 */

import { SQL_SCHEMA } from '../db-schema.mjs';

export const version = '002';
export const name = 'add_proofs';

export async function up(db, engine) {
  if (engine === 'sqlite' || engine === 'postgresql') {
    let sql = SQL_SCHEMA.proofs;
    if (engine === 'postgresql') {
      sql = sql
        .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
        .replace(/JSON/g, 'JSONB')
        .replace(/BOOLEAN/g, 'BOOLEAN');
    }
    await db.query(sql);
    console.log('✓ Created proofs table');

  } else if (engine === 'mongodb') {
    const adapter = db;
    await adapter.query('proofs', 'insertOne', {
      document: { _init: true }
    });
    await adapter.query('proofs', 'deleteOne', {
      filter: { _init: true }
    });
    console.log('✓ Created proofs collection');
  }
}

export async function down(db, engine) {
  if (engine === 'sqlite' || engine === 'postgresql') {
    await db.query('DROP TABLE IF EXISTS proofs');
    console.log('✓ Dropped proofs table');

  } else if (engine === 'mongodb') {
    const adapter = db;
    await adapter.db.collection('proofs').drop();
    console.log('✓ Dropped proofs collection');
  }
}
