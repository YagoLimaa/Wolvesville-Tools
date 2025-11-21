export async function handleShopActiveOffers(requestConfig, WOLVESVILLE_API_BASE_URL) {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/shop/activeOffers`;
  const response = await fetch(requestUrl, requestConfig);
  const responseData = await response.json();
  return responseData;
}
