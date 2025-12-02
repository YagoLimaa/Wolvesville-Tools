import { WOLVESVILLE_API_BASE_URL } from './constants.js';
import { jsonResponse } from './response.js';

/**
 * A custom error class for validation errors.
 */
export class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.details = details;
  }
}

/**
 * A centralized service for making requests to the Wolvesville API.
 * It handles URL construction, query parameter validation, and the actual fetch call.
 *
 * @param {string} path - The API path to request (e.g., 'players/search').
 * @param {object} options - The options for the API call.
 * @param {Request} options.request - The original incoming request object.
 * @param {import('zod').ZodSchema} [options.schema] - An optional Zod schema to validate query parameters.
 * @param {URLSearchParams} [options.customSearchParams] - Optional custom search params to override the ones from the request.
 * @returns {Promise<Response>} - A promise that resolves to the fetch Response object.
 */
export async function callApi(path, { request, schema, customSearchParams }) {
  const originalUrl = new URL(request.url);
  const searchParams = customSearchParams || originalUrl.searchParams;
  
  const queryParams = Object.fromEntries(searchParams.entries());

  if (schema) {
    const validationResult = schema.safeParse(queryParams);
    if (!validationResult.success) {
      // Throw a specific error that can be caught and handled appropriately.
      throw new ValidationError('Invalid query parameters', validationResult.error.flatten());
    }
    // Use the validated (and possibly transformed) data to build the query string.
    const validatedParams = new URLSearchParams(validationResult.data);
    searchParams.forEach((value, key) => {
        if (!validatedParams.has(key)) {
            validatedParams.append(key, value)
        }
    });
    
    // Reconstruct the URL with validated and transformed params
    const finalUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/${path}`);
    finalUrl.search = validatedParams.toString();
    
    return fetch(finalUrl.toString(), request.requestConfig);
  }

  // Fallback to original behavior if no schema is provided
  const finalUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/${path}`);
  finalUrl.search = searchParams.toString();

  return fetch(finalUrl.toString(), request.requestConfig);
}
