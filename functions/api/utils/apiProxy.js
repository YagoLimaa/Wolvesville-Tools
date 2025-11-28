import { WOLVESVILLE_API_BASE_URL } from './constants.js';

export async function proxyRequest(request, path, options = {}) {
  const { customSearchParams } = options;
  const originalUrl = new URL(request.url);

  const url = new URL(`${WOLVESVILLE_API_BASE_URL}/${path}`);
  const paramsToForward = customSearchParams || originalUrl.searchParams;
  
  paramsToForward.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return fetch(url.toString(), request.requestConfig);
}
