import { cacheInvalidationPatterns } from './cacheManager.js';

export function withCacheInvalidation(handler, invalidatePatterns) {
  const patterns = Array.isArray(invalidatePatterns) 
    ? invalidatePatterns 
    : [invalidatePatterns];

  return async function(request) {
    const response = await handler(request);
    if (response.status >= 200 && response.status < 300) {
      patterns.forEach(pattern => {
        if (typeof cacheInvalidationPatterns[pattern] === 'function') {
          cacheInvalidationPatterns[pattern]();
        }
      });
    }

    return response;
  };
}

export const onDataUpdate = {

  player: () => {
    console.log('[Cache] Invalidating player data');
    cacheInvalidationPatterns.players();
  },

  clan: () => {
    console.log('[Cache] Invalidating clan data');
    cacheInvalidationPatterns.clans();
  },

  items: () => {
    console.log('[Cache] Invalidating items data');
    cacheInvalidationPatterns.items();
  },

  avatars: () => {
    console.log('[Cache] Invalidating avatars data');
    cacheInvalidationPatterns.avatars();
  },

  battlePass: () => {
    console.log('[Cache] Invalidating battle pass data');
    cacheInvalidationPatterns.battlePass();
  },

  roles: () => {
    console.log('[Cache] Invalidating roles data');
    cacheInvalidationPatterns.roles();
  },

  shop: () => {
    console.log('[Cache] Invalidating shop data');
    cacheInvalidationPatterns.shop();
  },

  announcements: () => {
    console.log('[Cache] Invalidating announcements data');
    cacheInvalidationPatterns.announcements();
  },

  all: () => {
    console.log('[Cache] Invalidating all data');
    cacheInvalidationPatterns.all();
  },
};

export function setupAutoInvalidation(dataType, checkFn, interval = 300000) {
  let lastHash = null;

  setInterval(async () => {
    try {
      const currentHash = await checkFn();
      
      if (currentHash && currentHash !== lastHash) {
        lastHash = currentHash;
        onDataUpdate[dataType]?.();
      }
    } catch (error) {
      console.error(`[Cache] Auto-invalidation error for ${dataType}:`, error.message);
    }
  }, interval);

  console.log(`[Cache] Auto-invalidation setup for ${dataType} (interval: ${interval}ms)`);
}

export default {
  withCacheInvalidation,
  onDataUpdate,
  setupAutoInvalidation,
};
