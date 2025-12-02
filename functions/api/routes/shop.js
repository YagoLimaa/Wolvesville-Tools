import { jsonResponse } from '../utils/response.js';
import { callApi } from '../utils/ApiService.js';

export async function handleShopActiveOffers(request) {
  const response = await callApi('shop/activeOffers', { request });
  const responseData = await response.json();
  return jsonResponse(responseData);
}