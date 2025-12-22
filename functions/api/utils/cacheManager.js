import { invalidateCache, getCacheStats, clearAllCache } from './cache.js';
import { jsonResponse } from './response.js';

export async function handleCacheStats(request) {
  const stats = getCacheStats();
  return jsonResponse({
    cache: stats,
    timestamp: new Date().toISOString(),
  });
}

export async function handleCacheInvalidate(request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const url = new URL(request.url);
    const pattern = url.searchParams.get('pattern');

    if (!pattern) {
      return jsonResponse({ error: 'Missing pattern parameter' }, 400);
    }

    const deleted = invalidateCache(pattern);
    return jsonResponse({
      success: true,
      deleted,
      pattern,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function handleCacheClear(request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    clearAllCache();
    return jsonResponse({
      success: true,
      message: 'All cache cleared',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

export const cacheInvalidationPatterns = {
  players: () => invalidateCache('/api/players.*'),
  
  clans: () => invalidateCache('/api/clans.*'),
  
  items: () => invalidateCache('/api/items.*'),

  avatars: () => invalidateCache('/api/avatars.*'),

  battlePass: () => invalidateCache('/api/battlePass.*'),

  roles: () => invalidateCache('/api/role.*'),

  shop: () => invalidateCache('/api/shop.*'),

  announcements: () => invalidateCache('/api/announcements.*'),

  all: () => clearAllCache(),
};
