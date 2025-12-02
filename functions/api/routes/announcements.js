import { callApi } from '../utils/ApiService.js';
import { jsonResponse } from '../utils/response.js';

export async function handleAnnouncements(request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';

  const params = new URLSearchParams();
  params.set('locale', locale);

  const response = await callApi('announcements', { request, customSearchParams: params });
  const responseData = await response.json();

  let announcements = [];
  if (Array.isArray(responseData)) {
    announcements = responseData;
  } else if (responseData && Array.isArray(responseData.announcements)) {
    announcements = responseData.announcements;
  }

  return jsonResponse(announcements);
}