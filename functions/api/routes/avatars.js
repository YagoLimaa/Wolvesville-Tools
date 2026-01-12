import { callApi } from '../utils/ApiService.js';
import { jsonResponse } from '../utils/response.js';

export async function handleAvatars(request) {
  const response = await callApi('items/avatars', { request });
  const data = await response.json();
  return jsonResponse(data);
}

export async function handleSharedAvatarId(request) {
  const { playerId, slotNumber } = request.params;
  const response = await callApi(`avatars/sharedAvatarId/${playerId}/${slotNumber}`, { request });

  if (!response.ok) {
    console.error(`Upstream API for sharedAvatarId failed with status ${response.status}`);
    return jsonResponse(
      { error: `Failed to fetch from upstream API. Status: ${response.status}` },
      response.status
    );
  }

  const responseData = await response.json();
  if (responseData && typeof responseData === 'object' && responseData.sharedAvatarId) {
    return jsonResponse(responseData.sharedAvatarId);
  }
  return jsonResponse(
    { error: "Invalid response from upstream API: sharedAvatarId not found or malformed" },
    500
  );
}

export async function handleAvatarDetails(request) {
  const { sharedAvatarId } = request.params;
  const response = await callApi(`avatars/${sharedAvatarId}`, { request });

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
