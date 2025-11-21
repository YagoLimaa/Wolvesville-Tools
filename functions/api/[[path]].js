import apiRoutes from './routes/index.js';
import { jsonResponse } from './utils/response.js';

// Simple adapter to make Express work with Cloudflare's request
function createExpressRequest(request, env, params) {
  const url = new URL(request.url);
  const { pathname } = url;
  
  // Fake request object
  const req = {
    ...request,
    url: pathname,
    path: pathname,
    query: Object.fromEntries(url.searchParams),
    params: params,
    env: env,
    get: (header) => request.headers.get(header),
  };

  // Add requestConfig from a middleware-like function
  const WOLVESVILLE_API_KEY = env.WOLVESVILLE_API_KEY;
  if (WOLVESVILLE_API_KEY) {
    req.requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };
  }
  
  return req;
}

function createExpressResponse() {
  let _status = 200;
  let _headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  let _body = null;
  let _ended = false;

  const res = {
    status(code) {
      _status = code;
      return this;
    },
    json(data) {
      this.setHeader('Content-Type', 'application/json');
      _body = JSON.stringify(data);
      this.end();
    },
    send(data) {
      _body = data;
      this.end();
    },
    end() {
      _ended = true;
    },
    setHeader(name, value) {
      _headers[name] = value;
    },
    getHeader(name) {
      return _headers[name];
    },
    toCloudflareResponse() {
      return new Response(_body, { status: _status, headers: _headers });
    },
    isEnded: () => _ended,
  };
  
  return res;
}

export async function onRequest(context) {
  const { request, env, params } = context;

  // We need to remove the `/api` prefix for the router to work
  const url = new URL(request.url);
  let pathname = url.pathname;
  if (pathname.startsWith('/api')) {
    pathname = pathname.substring(4);
  }
  
  const req = createExpressRequest(request, env, params);
  req.url = pathname;
  req.path = pathname;

  const res = createExpressResponse();

  return new Promise((resolve) => {
    // A simple 'next' function for the router
    const next = (err) => {
      if (err) {
        // For now, simple error handling. In the future, could use the errorHandler middleware
        console.error("Router error:", err);
        return resolve(jsonResponse({ error: 'Internal Server Error' }, 500));
      }
      resolve(jsonResponse({ error: 'Not Found' }, 404));
    };
    
    apiRoutes(req, res, next);
    
    // Periodically check if the response has ended
    const checkInterval = setInterval(() => {
      if (res.isEnded()) {
        clearInterval(checkInterval);
        resolve(res.toCloudflareResponse());
      }
    }, 10); // check every 10ms
  });
}