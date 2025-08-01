interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export class StockCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 60000; // Default 1 minute
    this.maxSize = options.maxSize || 1000; // Default 1000 entries

    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Get an item from the cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set an item in the cache
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // Check cache size and remove oldest entry if needed
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.findOldestEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const data = this.get(key);
    return data !== null;
  }

  /**
   * Delete an item from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const size = this.cache.size;
    // In a real implementation, you'd track hits and misses
    return {
      size,
      hits: 0,
      misses: 0,
      hitRate: 0
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Find the oldest entry in the cache
   */
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Destroy the cache and clear intervals
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Create singleton instances for different cache types
export const stockQuoteCache = new StockCache({
  ttl: 60000, // 1 minute for real-time quotes
  maxSize: 500
});

export const stockProfileCache = new StockCache({
  ttl: 3600000, // 1 hour for company profiles
  maxSize: 200
});

export const analysisCache = new StockCache({
  ttl: 300000, // 5 minutes for analysis results
  maxSize: 100
});

// Helper function to create cache keys
export function createCacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

// Decorator for caching method results
export function cached(cacheName: 'quote' | 'profile' | 'analysis', ttl?: number) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = cacheName === 'quote' ? stockQuoteCache : 
                  cacheName === 'profile' ? stockProfileCache : 
                  analysisCache;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = createCacheKey(propertyKey, ...(args as (string | number)[]));
      
      // Check cache first
      const cachedResult = cache.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Call original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      cache.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}