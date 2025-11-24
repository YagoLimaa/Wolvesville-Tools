import { jsonResponse } from '../utils/response';

export const handleProxy = async (request) => {
    const { searchParams } = new URL(request.url);
    const urlToProxy = searchParams.get('url');

    if (!urlToProxy) {
        return jsonResponse({ error: 'URL parameter is missing' }, 400);
    }

    if (!urlToProxy.startsWith('https://cdn.wolvesville.com/')) {
        return jsonResponse({ error: 'URL not allowed for proxying' }, 400);
    }

    try {
        const response = await fetch(urlToProxy, {
            headers: {
                'User-Agent': 'Wolvesville-Website-Proxy/1.0',
            }
        });

        if (!response.ok) {
            return jsonResponse({ proxyError: true, status: response.status });
        }

        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');

        return newResponse;

    } catch (error) {
        return jsonResponse({ proxyError: true, message: error.message });
    }
};
