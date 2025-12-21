import NodeCache from 'node-cache';
import { config } from './env.config';

// Create cache instance
export const cache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.ttl * 0.2, // Check for expired keys every 20% of TTL
  useClones: false, // For better performance
  deleteOnExpire: true,
});

// Cache statistics
cache.on('set', (key, value) => {
  console.log(`[Cache] SET: ${key}`);
});

cache.on('del', (key, value) => {
  console.log(`[Cache] DEL: ${key}`);
});

cache.on('expired', (key, value) => {
  console.log(`[Cache] EXPIRED: ${key}`);
});

// Helper functions
export const cacheHelper = {
  get: <T>(key: string): T | undefined => {
    if (!config.cache.enabled) return undefined;
    return cache.get<T>(key);
  },

  set: <T>(key: string, value: T, ttl?: number): boolean => {
    if (!config.cache.enabled) return false;
    return cache.set(key, value, ttl || config.cache.ttl);
  },

  del: (key: string): number => {
    return cache.del(key);
  },

  flush: (): void => {
    cache.flushAll();
  },

  getStats: () => {
    return cache.getStats();
  },
};
