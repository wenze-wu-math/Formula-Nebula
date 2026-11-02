/**
 * Database Schema Definitions
 * Unified schema for knowledge graph entities
 */

/**
 * SQL Schema (SQLite/PostgreSQL)
 */
export const SQL_SCHEMA = {
  // Core nodes table
  nodes: `
    CREATE TABLE IF NOT EXISTS nodes (
      id VARCHAR(255) PRIMARY KEY,
      label VARCHAR(500) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      latex TEXT,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      INDEX idx_category (category),
      INDEX idx_label (label),
      FULLTEXT idx_description (description)
    )
  `,

  // Edges/relationships
  edges: `
    CREATE TABLE IF NOT EXISTS edges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source VARCHAR(255) NOT NULL,
      target VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      weight REAL DEFAULT 1.0,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (source) REFERENCES nodes(id) ON DELETE CASCADE,
      FOREIGN KEY (target) REFERENCES nodes(id) ON DELETE CASCADE,
      INDEX idx_source (source),
      INDEX idx_target (target),
      INDEX idx_type (type),
      UNIQUE INDEX idx_edge_unique (source, target, type)
    )
  `,

  // Proofs
  proofs: `
    CREATE TABLE IF NOT EXISTS proofs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theorem_id VARCHAR(255) NOT NULL,
      proof_type VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      formal_statement TEXT,
      dependencies JSON,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (theorem_id) REFERENCES nodes(id) ON DELETE CASCADE,
      INDEX idx_theorem (theorem_id),
      INDEX idx_verified (verified)
    )
  `,

  // Conjectures
  conjectures: `
    CREATE TABLE IF NOT EXISTS conjectures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(500) NOT NULL,
      statement TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'open',
      field VARCHAR(100),
      difficulty VARCHAR(20),
      year_proposed INTEGER,
      proposer VARCHAR(255),
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      INDEX idx_status (status),
      INDEX idx_field (field),
      INDEX idx_year (year_proposed)
    )
  `,

  // Researchers
  researchers: `
    CREATE TABLE IF NOT EXISTS researchers (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      affiliation VARCHAR(500),
      fields JSON,
      papers JSON,
      links JSON,
      h_index INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      INDEX idx_name (name),
      FULLTEXT idx_affiliation (affiliation)
    )
  `,

  // Papers
  papers: `
    CREATE TABLE IF NOT EXISTS papers (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(1000) NOT NULL,
      authors JSON NOT NULL,
      abstract TEXT,
      year INTEGER,
      venue VARCHAR(500),
      doi VARCHAR(255),
      arxiv_id VARCHAR(50),
      citations INTEGER DEFAULT 0,
      fields JSON,
      keywords JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      INDEX idx_year (year),
      INDEX idx_arxiv (arxiv_id),
      INDEX idx_doi (doi),
      FULLTEXT idx_title (title),
      FULLTEXT idx_abstract (abstract)
    )
  `,

  // Cross-references (external sources)
  cross_refs: `
    CREATE TABLE IF NOT EXISTS cross_refs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id VARCHAR(255) NOT NULL,
      source VARCHAR(50) NOT NULL,
      external_id VARCHAR(500) NOT NULL,
      url TEXT,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
      INDEX idx_node (node_id),
      INDEX idx_source (source),
      INDEX idx_external (external_id),
      UNIQUE INDEX idx_ref_unique (node_id, source, external_id)
    )
  `,

  // Search index (for full-text search optimization)
  search_index: `
    CREATE TABLE IF NOT EXISTS search_index (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      tokens JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      INDEX idx_entity (entity_type, entity_id),
      FULLTEXT idx_content (content)
    )
  `,

  // User queries and recommendations
  user_queries: `
    CREATE TABLE IF NOT EXISTS user_queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_text TEXT NOT NULL,
      query_type VARCHAR(50),
      results JSON,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      INDEX idx_timestamp (timestamp),
      FULLTEXT idx_query (query_text)
    )
  `,

  // Cache metadata (for cache invalidation tracking)
  cache_metadata: `
    CREATE TABLE IF NOT EXISTS cache_metadata (
      cache_key VARCHAR(255) PRIMARY KEY,
      entity_type VARCHAR(50),
      dependencies JSON,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      INDEX idx_entity_type (entity_type)
    )
  `
};

/**
 * MongoDB Schema Definitions (as validation schemas)
 */
export const MONGO_SCHEMA = {
  nodes: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["id", "label", "category"],
        properties: {
          id: { bsonType: "string" },
          label: { bsonType: "string" },
          category: { bsonType: "string" },
          description: { bsonType: "string" },
          latex: { bsonType: "string" },
          metadata: { bsonType: "object" },
          position: {
            bsonType: "object",
            properties: {
              x: { bsonType: "number" },
              y: { bsonType: "number" },
              z: { bsonType: "number" }
            }
          },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" }
        }
      }
    },
    indexes: [
      { key: { id: 1 }, unique: true },
      { key: { category: 1 } },
      { key: { label: "text", description: "text" } }
    ]
  },

  edges: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["source", "target", "type"],
        properties: {
          source: { bsonType: "string" },
          target: { bsonType: "string" },
          type: { bsonType: "string" },
          weight: { bsonType: "number" },
          metadata: { bsonType: "object" },
          createdAt: { bsonType: "date" }
        }
      }
    },
    indexes: [
      { key: { source: 1, target: 1, type: 1 }, unique: true },
      { key: { source: 1 } },
      { key: { target: 1 } },
      { key: { type: 1 } }
    ]
  },

  proofs: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["theoremId", "proofType", "content"],
        properties: {
          theoremId: { bsonType: "string" },
          proofType: { bsonType: "string" },
          content: { bsonType: "string" },
          formalStatement: { bsonType: "string" },
          dependencies: { bsonType: "array" },
          verified: { bsonType: "bool" },
          createdAt: { bsonType: "date" }
        }
      }
    },
    indexes: [
      { key: { theoremId: 1 } },
      { key: { verified: 1 } }
    ]
  },

  conjectures: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "statement"],
        properties: {
          name: { bsonType: "string" },
          statement: { bsonType: "string" },
          status: { bsonType: "string", enum: ["open", "solved", "refuted", "unknown"] },
          field: { bsonType: "string" },
          difficulty: { bsonType: "string" },
          yearProposed: { bsonType: "int" },
          proposer: { bsonType: "string" },
          metadata: { bsonType: "object" },
          createdAt: { bsonType: "date" }
        }
      }
    },
    indexes: [
      { key: { name: "text", statement: "text" } },
      { key: { status: 1 } },
      { key: { field: 1 } }
    ]
  },

  researchers: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["id", "name"],
        properties: {
          id: { bsonType: "string" },
          name: { bsonType: "string" },
          affiliation: { bsonType: "string" },
          fields: { bsonType: "array" },
          papers: { bsonType: "array" },
          links: { bsonType: "object" },
          hIndex: { bsonType: "int" },
          createdAt: { bsonType: "date" }
        }
      }
    },
    indexes: [
      { key: { id: 1 }, unique: true },
      { key: { name: "text", affiliation: "text" } }
    ]
  },

  papers: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["id", "title", "authors"],
        properties: {
          id: { bsonType: "string" },
          title: { bsonType: "string" },
          authors: { bsonType: "array" },
          abstract: { bsonType: "string" },
          year: { bsonType: "int" },
          venue: { bsonType: "string" },
          doi: { bsonType: "string" },
          arxivId: { bsonType: "string" },
          citations: { bsonType: "int" },
          fields: { bsonType: "array" },
          keywords: { bsonType: "array" },
          createdAt: { bsonType: "date" }
        }
      }
    },
    indexes: [
      { key: { id: 1 }, unique: true },
      { key: { title: "text", abstract: "text" } },
      { key: { arxivId: 1 } },
      { key: { year: 1 } }
    ]
  }
};

/**
 * Schema initialization helper
 */
export async function initializeSchema(db, engine) {
  if (engine === 'sqlite' || engine === 'postgresql') {
    console.log('Initializing SQL schema...');

    for (const [tableName, createSQL] of Object.entries(SQL_SCHEMA)) {
      try {
        // Adapt for PostgreSQL
        let sql = createSQL;
        if (engine === 'postgresql') {
          sql = sql
            .replace(/AUTOINCREMENT/g, 'GENERATED ALWAYS AS IDENTITY')
            .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
            .replace(/BOOLEAN/g, 'BOOLEAN')
            .replace(/JSON/g, 'JSONB')
            .replace(/FULLTEXT/g, 'GIN')
            .replace(/INDEX idx_/g, 'INDEX idx_');
        }

        await db.query(sql);
        console.log(`✓ Table created: ${tableName}`);
      } catch (err) {
        console.error(`✗ Failed to create ${tableName}:`, err.message);
      }
    }

    console.log('SQL schema initialized');

  } else if (engine === 'mongodb') {
    console.log('Initializing MongoDB schema...');

    const adapter = db.getAdapter();

    for (const [collName, schema] of Object.entries(MONGO_SCHEMA)) {
      try {
        // Create collection with validation
        await adapter.db.createCollection(collName, schema.validator ? { validator: schema.validator } : {});

        // Create indexes
        if (schema.indexes) {
          for (const index of schema.indexes) {
            await adapter.db.collection(collName).createIndex(index.key, index.unique ? { unique: true } : {});
          }
        }

        console.log(`✓ Collection created: ${collName}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`→ Collection exists: ${collName}`);
        } else {
          console.error(`✗ Failed to create ${collName}:`, err.message);
        }
      }
    }

    console.log('MongoDB schema initialized');
  }
}

/**
 * Sample data structure examples
 */
export const EXAMPLES = {
  node: {
    id: "riemann-hypothesis",
    label: "Riemann Hypothesis",
    category: "conjecture",
    description: "The non-trivial zeros of the Riemann zeta function have real part 1/2",
    latex: "\\zeta(s) = 0 \\implies \\Re(s) = \\frac{1}{2}",
    metadata: {
      difficulty: "millennium",
      field: "analytic number theory",
      year: 1859,
      status: "open"
    }
  },

  edge: {
    source: "riemann-hypothesis",
    target: "prime-number-theorem",
    type: "relates-to",
    weight: 0.95,
    metadata: {
      description: "The Riemann Hypothesis would strengthen the error term in the Prime Number Theorem"
    }
  },

  proof: {
    theoremId: "fermat-last-theorem",
    proofType: "constructive",
    content: "Proof by Andrew Wiles using modular forms and Galois representations...",
    formalStatement: "theorem fermat_last : ∀ n > 2, ∀ a b c : ℤ, a^n + b^n ≠ c^n",
    dependencies: ["taniyama-shimura", "frey-curve"],
    verified: true
  },

  conjecture: {
    name: "P vs NP",
    statement: "Does P equal NP?",
    status: "open",
    field: "computational complexity",
    difficulty: "millennium",
    yearProposed: 1971,
    proposer: "Stephen Cook",
    metadata: {
      prize: "1000000 USD",
      attempts: "thousands"
    }
  }
};
