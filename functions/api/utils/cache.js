const { jsonResponse } = require('./response');

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
      // Use { type: 'json' } to automatically parse the JSON response from KV
      const cachedData = await kv.get(key, { type: 'json' });

      if (cachedData) {
        const response = jsonResponse(cachedData.data, cachedData.status);
        response.headers.set('X-Response-Time', '0ms');

        return response;
      }
    } catch (e) {
      console.error(`KV get failed: ${e}`);
    }

    const startTime = Date.now();
    const response = await handler(request);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.status === 200) {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      // Do not block the response while writing to the cache.
      // request.waitUntil allows the write to happen in the background.
      request.waitUntil(
        kv.put(key, JSON.stringify({ data, status: response.status }), { expirationTtl })
          .catch(e => console.error(`KV put failed: ${e}`))
      );
    }
    
    const responseWithHeader = new Response(response.body, response);
    responseWithHeader.headers.set('X-Response-Time', `${responseTime}ms`);

    return responseWithHeader;
  };
}

module.exports = { withCache };

