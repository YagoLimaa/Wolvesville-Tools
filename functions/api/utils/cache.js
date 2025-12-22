import { jsonResponse } from './response';

class CacheManager {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
    this.maxEntries = 1000;
    this.lastCleanup = Date.now();
    this.cleanupInterval = 60000; 
  }

  get(key) {
    const entry = this.store.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.delete(key);
      this.metrics.misses++;
      return null;
    }

    this.metrics.hits++;
    entry.lastAccess = Date.now();
    entry.accessCount = (entry.accessCount || 0) + 1;
    return entry.value;
  }

  set(key, value, durationInSeconds = 3600) {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      this.evictLRU();
    }

    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    const expiresAt = Date.now() + (durationInSeconds * 1000);
    this.store.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      accessCount: 0,
    });

    const timer = setTimeout(() => {
      this.delete(key);
    }, durationInSeconds * 1000 + 1000); 

    this.timers.set(key, timer);
  }

  delete(key) {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    return this.store.delete(key);
  }

  deletePattern(pattern) {
    const regex = new RegExp(pattern);
    let deleted = 0;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        deleted++;
      }
    }

    return deleted;
  }
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.store.clear();
  }

  evictLRU() {
    let lruKey = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.store.entries()) {
      const accessTime = entry.lastAccess || entry.createdAt;
      if (accessTime < lruTime) {
        lruTime = accessTime;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
      this.metrics.evictions++;
    }
  }

  getStats() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests * 100).toFixed(2) : 0;

    return {
      size: this.store.size,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: `${hitRate}%`,
      evictions: this.metrics.evictions,
      maxEntries: this.maxEntries,
    };
  } 
  cleanup() {
    let expired = 0;
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        this.delete(key);
        expired++;
      }
    }
    
    if (expired > 0) {
      console.log(`[Cache] Cleanup: Removed ${expired} expired entries. Current size: ${this.store.size}`);
    }
    
    return expired;
  }
}

const globalCache = globalThis.cacheManager instanceof CacheManager ? globalThis.cacheManager : new CacheManager();
globalThis.cacheManager = globalCache;

function withCache(handler, durationInSeconds = 3600, options = {}) {
  const {
    keyPrefix = '',
    excludeParams = [],
  } = options;

  return async function(request) {
    const url = new URL(request.url);
    
    if (Date.now() - globalCache.lastCleanup > globalCache.cleanupInterval) {
      globalCache.cleanup();
      globalCache.lastCleanup = Date.now();
    }

    let cacheKey = keyPrefix || url.pathname;
    
    if (url.search) {
      const params = new URLSearchParams(url.search);
      const filteredParams = new URLSearchParams();
      
      for (const [key, value] of params.entries()) {
        if (!excludeParams.includes(key)) {
          filteredParams.append(key, value);
        }
      }
      
      if (filteredParams.toString()) {
        cacheKey += `?${filteredParams.toString()}`;
      }
    }

    const cachedData = globalCache.get(cacheKey);
    if (cachedData) {
      console.log(`[Cache] HIT for key: ${cacheKey}`);
      const response = jsonResponse(cachedData.data, cachedData.status);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Response-Time', '0ms');
      return response;
    }

    console.log(`[Cache] MISS for key: ${cacheKey}`);
    const startTime = Date.now();
    const response = await handler(request);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.status === 200) {
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        globalCache.set(cacheKey, { data, status: response.status }, durationInSeconds);
        console.log(`[Cache] STORED for key: ${cacheKey} (TTL: ${durationInSeconds}s)`);
      } catch (e) {
        console.error(`[Cache] Failed to parse response for key ${cacheKey}: ${e.message}`);
      }
    }

    const responseWithHeader = new Response(response.body, response);
    responseWithHeader.headers.set('X-Cache', 'MISS');
    responseWithHeader.headers.set('X-Response-Time', `${responseTime}ms`);

    return responseWithHeader;
  };
}
function invalidateCache(pattern) {
  const deleted = globalCache.deletePattern(pattern);
  console.log(`[Cache] Invalidated ${deleted} entries matching pattern: ${pattern}`);
  return deleted;
}

function getCacheStats() {
  return globalCache.getStats();
}

function clearAllCache() {
  globalCache.clear();
  console.log('[Cache] All cache cleared');
}

export { withCache, invalidateCache, getCacheStats, clearAllCache };

