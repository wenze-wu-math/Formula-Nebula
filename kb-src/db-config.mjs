/**
 * Database Configuration Loader
 * Loads configuration from environment variables with sensible defaults
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load .env file (simple implementation)
 */
async function loadEnv() {
  try {
    const envPath = join(__dirname, '.env');
    const content = await readFile(envPath, 'utf-8');

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();

      if (key && value) {
        process.env[key] = value;
      }
    }
  } catch (err) {
    // .env file is optional
  }
}

/**
 * Get database configuration from environment
 */
export async function getConfig() {
  await loadEnv();

  const engine = process.env.DB_ENGINE || 'sqlite';

  const config = {
    engine,

    sqlite: {
      path: process.env.SQLITE_PATH || join(__dirname, 'data', 'formula-nebula.db')
    },

    postgresql: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'formula_nebula',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20')
    },

    mongodb: {
      host: process.env.MONGO_HOST || 'localhost',
      port: parseInt(process.env.MONGO_PORT || '27017'),
      database: process.env.MONGO_DB || 'formula_nebula',
      uri: process.env.MONGO_URI
    },

    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB || '0')
    },

    cache: {
      enabled: process.env.CACHE_ENABLED !== 'false',
      defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300000'),
      maxMemory: parseInt(process.env.CACHE_MAX_MEMORY || '100')
    },

    query: {
      timeout: parseInt(process.env.QUERY_TIMEOUT || '30000'),
      enableLog: process.env.ENABLE_QUERY_LOG === 'true'
    },

    migration: {
      autoMigrate: process.env.AUTO_MIGRATE === 'true'
    }
  };

  return config;
}

/**
 * Get engine-specific configuration
 */
export async function getEngineConfig(engine) {
  const config = await getConfig();

  const engineConfigs = {
    sqlite: config.sqlite,
    postgresql: config.postgresql,
    mongodb: config.mongodb,
    redis: config.redis
  };

  const engineConfig = engineConfigs[engine];

  // Add cache configuration if Redis is enabled
  if (config.cache.enabled && engine !== 'redis') {
    engineConfig.cache = {
      redis: config.redis
    };
  }

  return engineConfig;
}

/**
 * Validate configuration
 */
export async function validateConfig() {
  const config = await getConfig();
  const errors = [];

  // Validate engine
  const validEngines = ['sqlite', 'postgresql', 'mongodb', 'redis'];
  if (!validEngines.includes(config.engine)) {
    errors.push(`Invalid DB_ENGINE: ${config.engine}. Must be one of: ${validEngines.join(', ')}`);
  }

  // Validate PostgreSQL config
  if (config.engine === 'postgresql') {
    if (!config.postgresql.user) {
      errors.push('DB_USER is required for PostgreSQL');
    }
    if (!config.postgresql.password && config.postgresql.host !== 'localhost') {
      errors.push('DB_PASSWORD is recommended for PostgreSQL');
    }
  }

  // Validate MongoDB config
  if (config.engine === 'mongodb') {
    if (!config.mongodb.uri && !config.mongodb.host) {
      errors.push('MONGO_URI or MONGO_HOST is required for MongoDB');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    config
  };
}

/**
 * Print configuration (with sensitive data masked)
 */
export function printConfig(config) {
  const masked = JSON.parse(JSON.stringify(config));

  // Mask sensitive fields
  if (masked.postgresql?.password) {
    masked.postgresql.password = '***';
  }
  if (masked.redis?.password) {
    masked.redis.password = '***';
  }

  console.log('Database Configuration:');
  console.log(JSON.stringify(masked, null, 2));
}

/**
 * Quick setup helper
 */
export async function quickSetup() {
  console.log('Validating configuration...');

  const validation = await validateConfig();

  if (!validation.valid) {
    console.error('\n❌ Configuration errors:');
    validation.errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nPlease check your .env file or environment variables.');
    return null;
  }

  console.log('✓ Configuration valid');

  return validation.config;
}
