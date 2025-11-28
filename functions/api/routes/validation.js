import { VALID_ITEM_CATEGORIES } from '../utils/constants.js';
import { jsonResponse } from '../utils/response.js';
import { proxyRequest } from '../utils/apiProxy.js';

export async function handleItemCategories(request) {
  return jsonResponse(VALID_ITEM_CATEGORIES);
}

export async function handleRoleIds(request) {
  const response = await proxyRequest(request, 'roles');
  const responseData = await response.json();

  if (!response.ok) {
    return jsonResponse(responseData, response.status);
  }

  let roleIds = [];
  if (Array.isArray(responseData)) {
    roleIds = responseData.map(role => role.id);
  }

  return jsonResponse(roleIds);
}