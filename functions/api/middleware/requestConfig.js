import { jsonResponse } from "../utils/response";

export function getRequestConfig(apiKey) {
  return {
    headers: {
      'Authorization': `Bot ${apiKey}`,
      'Accept': 'application/json'
    }
  };
};

export function requestConfigMiddleware(request) {
  const apiKey = request.env.WOLVESVILLE_API_KEY;

  if (!apiKey || apiKey === 'SUA_CHAVE_API_VEM_AQUI') {
    return jsonResponse({ error: 'A chave da API não está configurada no servidor.' }, 500);
  }

  request.requestConfig = getRequestConfig(apiKey);
}
