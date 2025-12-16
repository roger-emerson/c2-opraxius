import { Redis } from '@upstash/redis';
import type { Env } from './db';

/**
 * Create an Upstash Redis client for Cloudflare Workers
 */
export function createRedis(env: Env): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis not configured. UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN required.');
    return null;
  }

  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Cache helper for common operations
 */
export class CacheService {
  constructor(private redis: Redis | null) {}

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    return this.redis.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return;
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return;
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

