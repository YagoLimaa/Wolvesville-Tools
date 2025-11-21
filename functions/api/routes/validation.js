import { VALID_ITEM_CATEGORIES, WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { jsonResponse } from '../utils/response.js';

export async function handleItemCategories(request) {
  return jsonResponse(VALID_ITEM_CATEGORIES);
}

export async function handleRoleIds(request) {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/roles`;
  const response = await fetch(requestUrl, request.requestConfig);
  const responseData = await response.json();

  let roleIds = [];
  if (Array.isArray(responseData)) {
    roleIds = responseData.map(role => role.id);
  }

  return jsonResponse(roleIds);
}