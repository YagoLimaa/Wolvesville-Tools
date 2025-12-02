import { jsonResponse } from "../utils/response";
import { ValidationError } from "../utils/ApiService";

export function errorHandler(err, request) {
  console.error('Erro na API da Cloudflare Function:', err);

  if (err instanceof ValidationError) {
    return jsonResponse({
      error: err.message,
      details: err.details,
    }, err.status);
  }

  if (err.status === 404) {
    return jsonResponse({ error: 'Recurso não encontrado na API Wolvesville.' }, 404);
  }

  if (err.status === 401 || err.status === 403) {
    return jsonResponse({ error: 'Não autorizado. Verifique sua chave de API.' }, err.status);
  }

  return jsonResponse({ error: 'Erro interno do servidor.' }, 500);
}