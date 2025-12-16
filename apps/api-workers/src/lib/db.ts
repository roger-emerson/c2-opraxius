import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Type for Cloudflare Worker environment bindings
export interface Env {
  HYPERDRIVE?: {
    connectionString: string;
  };
  DATABASE_URL?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  JWT_SECRET?: string;
  ENVIRONMENT?: string;
}

/**
 * Create a database connection for Cloudflare Workers
 * Uses Hyperdrive for connection pooling when available
 */
export function createDb(env: Env) {
  // Use Hyperdrive connection string if available, otherwise fall back to DATABASE_URL
  const connectionString = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('No database connection string available. Configure HYPERDRIVE or DATABASE_URL.');
  }

  // Create postgres connection with Workers-compatible settings
  const queryClient = postgres(connectionString, {
    // Connection options optimized for serverless
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(queryClient);
}

// Re-export schema types for convenience
export type Database = ReturnType<typeof createDb>;

