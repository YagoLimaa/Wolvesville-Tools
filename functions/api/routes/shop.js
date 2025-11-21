import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { jsonResponse } from '../utils/response.js';

export async function handleShopActiveOffers(request) {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/shop/activeOffers`;
  const response = await fetch(requestUrl, request.requestConfig);
  const responseData = await response.json();
  return jsonResponse(responseData);
}