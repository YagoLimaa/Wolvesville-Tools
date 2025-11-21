export async function handleAvatars(requestConfig, WOLVESVILLE_API_BASE_URL) {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/avatars`;
  const response = await fetch(requestUrl, requestConfig);
  const responseData = await response.json();
  return responseData;
}
