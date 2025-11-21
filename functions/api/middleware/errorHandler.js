import { jsonResponse } from "../utils/response";

export function errorHandler(err, request) {
  console.error('Erro na API da Cloudflare Function:', err);

  if (err.status === 404) {
    return jsonResponse({ error: 'Recurso não encontrado na API Wolvesville.' }, 404);
  }

  if (err.status === 401 || err.status === 403) {
    return jsonResponse({ error: 'Não autorizado. Verifique sua chave de API.' }, err.status);
  }

  // Default to 500
  return jsonResponse({ error: 'Erro interno do servidor.' }, 500);
}