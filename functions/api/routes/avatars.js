import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { jsonResponse } from '../utils/response.js';

export async function handleAvatars(request) {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/avatars`;
  const response = await fetch(requestUrl, request.requestConfig);
  const data = await response.json();
  return jsonResponse(data);
}

export async function handleSharedAvatarId(request) {
  const { playerId, slotNumber } = request.params;
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/avatars/sharedAvatarId/${playerId}/${slotNumber}`;
  
  const response = await fetch(requestUrl, request.requestConfig);
  const responseData = await response.text();
  
  // This endpoint returns plain text, so we create a text response
  // but still use jsonResponse's headers for CORS.
  const textResponse = new Response(responseData, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      ...jsonResponse(null, 204).headers, // get CORS headers
    },
  });
  return textResponse;
}

export async function handleAvatarDetails(request) {
  const { sharedAvatarId } = request.params;
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/avatars/${sharedAvatarId}`;
  
  const response = await fetch(requestUrl, request.requestConfig);
  const data = await response.json();
  return jsonResponse(data);
}
