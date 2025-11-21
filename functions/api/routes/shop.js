import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';

export async function handleShopActiveOffers(requestConfig) {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/shop/activeOffers`;
  const response = await fetch(requestUrl, requestConfig);
  const responseData = await response.json();
  return responseData;
}
