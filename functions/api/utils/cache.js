import { jsonResponse } from './response';

function withCache(handler, durationInSeconds = 60) {
  // Cloudflare KV has a minimum TTL of 60 seconds.
  const expirationTtl = Math.max(durationInSeconds, 60);

  return async function(request) {
    const kv = request.env.API_CACHE;
    if (!kv) {
      // If KV is not bound, log an error and run the handler without caching.
      console.error("Cloudflare KV namespace 'API_CACHE' is not bound. Skipping cache.");
      return handler(request);
    }

    const key = request.url;
    
    try {
      const cachedText = await kv.get(key, { type: 'text' });

      if (cachedText) {
        console.log(`[Cache] HIT for key: ${key}`);
        const cachedData = JSON.parse(cachedText);
        const response = jsonResponse(cachedData.data, cachedData.status);
        response.headers.set('X-Response-Time', '0ms');
        return response;
      }
    } catch (e) {
      // Log the error but continue to fetch from origin
      console.error(`KV cache read/parse failed for key ${key}: ${e}`);
    }

    const startTime = Date.now();
    const response = await handler(request);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.status === 200) {
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        
        const cachePromise = kv.put(key, JSON.stringify({ data, status: response.status }), { expirationTtl })
          .then(() => console.log(`[Cache] Stored key: ${key}`))
          .catch(e => console.error(`KV put failed: ${e}`));

        // Do not block the response while writing to the cache.
        // request.waitUntil allows the write to happen in the background.
        if (typeof request.waitUntil === 'function') {
          request.waitUntil(cachePromise);
        }
      } catch (e) {
        console.error(`Failed to parse JSON from origin response for key ${key}: ${e}`);
      }
    }
    
    const responseWithHeader = new Response(response.body, response);
    responseWithHeader.headers.set('X-Response-Time', `${responseTime}ms`);

    return responseWithHeader;
  };
}

export { withCache };

