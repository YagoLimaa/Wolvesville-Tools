import { proxyRequest } from '../utils/apiProxy.js';
import { jsonResponse } from '../utils/response.js';
import { processClanDetails } from '../utils/clanProcessor.js';

export async function handleClanSearch(request) {
  const { searchParams } = new URL(request.url);
  const open = searchParams.get('open');

  const params = new URLSearchParams();
  const name = searchParams.get('name');
  const language = searchParams.get('language');

  if (name) {
    params.append('name', name);
  }
  if (language && language.toLowerCase() !== 'all') {
    params.append('language', language);
  }

  const response = await proxyRequest(request, 'clans/search', { customSearchParams: params });
  let clansFound = await response.json();

  if (!response.ok) {
    return jsonResponse(clansFound, response.status);
  }

  // Post-processing filter for 'open' clans
  if (Array.isArray(clansFound) && open === 'true') {
    clansFound = clansFound.filter(clan => clan.joinType === 'PUBLIC');
  }

  return jsonResponse(clansFound);
}

export async function handleClanDetails(request) {
  const { id } = request.params;
  const infoResponse = await proxyRequest(request, `clans/${id}/info`);
  const infoData = await infoResponse.json();

  if (!infoResponse.ok) {
    return jsonResponse({ error: `Clan with ID ${id} not found.` }, 404);
  }

  const combinedData = await processClanDetails(infoData, request);

  return jsonResponse(combinedData);
}