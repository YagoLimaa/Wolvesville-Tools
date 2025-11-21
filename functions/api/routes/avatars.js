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

  if (!response.ok) {
    console.error(`Upstream API for sharedAvatarId failed with status ${response.status}`);
    return jsonResponse(
      { error: `Failed to fetch from upstream API. Status: ${response.status}` }, 
      response.status
    );
  }
  
  const responseData = await response.text();
  
  // The frontend's apiGet helper expects a JSON response.
  // We send the plain text ID back, but JSON-encoded.
  return jsonResponse(responseData);
}

export async function handleAvatarDetails(request) {
  const { sharedAvatarId } = request.params;
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/avatars/${sharedAvatarId}`;
  
  const response = await fetch(requestUrl, request.requestConfig);

  if (!response.ok) {
    console.error(`Upstream API for avatarDetails failed with status ${response.status}`);
    return jsonResponse(
      { error: `Failed to fetch from upstream API. Status: ${response.status}` },
      response.status
    );
  }

  const data = await response.json();
  return jsonResponse(data);
}
