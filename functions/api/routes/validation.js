import { VALID_ITEM_CATEGORIES } from '../utils/constants.js';
import { jsonResponse } from '../utils/response.js';
import { callApi } from '../utils/ApiService.js';

export async function handleItemCategories(request) {
  return jsonResponse(VALID_ITEM_CATEGORIES);
}

export async function handleRoleIds(request) {
  const response = await callApi('roles', { request });
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