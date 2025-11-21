export async function handleAnnouncements(searchParams, requestConfig, WOLVESVILLE_API_BASE_URL) {
  const locale = searchParams.get('locale') || 'en';
  const requestUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/announcements`);
  requestUrl.searchParams.append('locale', locale);
  
  const response = await fetch(requestUrl.toString(), requestConfig);
  const responseData = await response.json();
  return responseData;
}
