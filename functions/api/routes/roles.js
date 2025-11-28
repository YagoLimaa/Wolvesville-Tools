import { jsonResponse } from '../utils/response.js';
import { proxyRequest } from '../utils/apiProxy.js';
import { processRoleRotations } from '../utils/roleProcessor.js';

export async function handleRoles(request) {
  const response = await proxyRequest(request, 'roles');
  const responseData = await response.json();
  return jsonResponse(responseData);
}

export async function handleRoleRotations(request) {
  const response = await proxyRequest(request, 'roleRotations');
  const responseData = await response.json();

  if (!response.ok) {
    return jsonResponse(responseData, response.status);
  }

  const rotationsFromApi = Array.isArray(responseData) ? responseData : [];
  const processedRotations = processRoleRotations(rotationsFromApi);
  
  return jsonResponse(processedRotations);
}