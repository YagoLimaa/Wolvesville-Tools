import { jsonResponse } from '../utils/response.js';
import { proxyRequest } from '../utils/apiProxy.js';

export async function handleShopActiveOffers(request) {
  const response = await proxyRequest(request, 'shop/activeOffers');
  const responseData = await response.json();
  return jsonResponse(responseData);
}