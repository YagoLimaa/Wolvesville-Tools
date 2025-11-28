import { proxyRequest } from '../utils/apiProxy.js';
import { jsonResponse } from '../utils/response.js';

export async function handleAvatars(request) {
  const response = await proxyRequest(request, 'items/avatars');
  const data = await response.json();
  return jsonResponse(data);
}

export async function handleSharedAvatarId(request) {
  const { playerId, slotNumber } = request.params;
  const response = await proxyRequest(request, `avatars/sharedAvatarId/${playerId}/${slotNumber}`);

  if (!response.ok) {
    console.error(`Upstream API for sharedAvatarId failed with status ${response.status}`);
    return jsonResponse(
      { error: `Failed to fetch from upstream API. Status: ${response.status}` },
      response.status
    );
  }

  const responseData = await response.text();
  return jsonResponse(responseData);
}

export async function handleAvatarDetails(request) {
  const { sharedAvatarId } = request.params;
  const response = await proxyRequest(request, `avatars/${sharedAvatarId}`);

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
