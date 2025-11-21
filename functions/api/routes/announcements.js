import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { jsonResponse } from '../utils/response.js';

export async function handleAnnouncements(request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';
  
  const requestUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/announcements`);
  requestUrl.searchParams.append('locale', locale);
  
  const response = await fetch(requestUrl.toString(), request.requestConfig);
  const responseData = await response.json();
  
  return jsonResponse(responseData);
}