import { jsonResponse } from '../utils/response.js';
import { callApi } from '../utils/ApiService.js';
import { processRoleRotations } from '../utils/roleProcessor.js';

export async function handleRoles(request) {
  const response = await callApi('roles', { request });
  const responseData = await response.json();
  return jsonResponse(responseData);
}

export async function handleRoleRotations(request) {
  const response = await callApi('roleRotations', { request });
  const responseData = await response.json();

  if (!response.ok) {
    return jsonResponse(responseData, response.status);
  }

  const rotationsFromApi = Array.isArray(responseData) ? responseData : [];
  const processedRotations = processRoleRotations(rotationsFromApi);
  
  return jsonResponse(processedRotations);
}