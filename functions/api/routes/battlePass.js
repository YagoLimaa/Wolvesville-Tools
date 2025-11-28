import { proxyRequest } from '../utils/apiProxy.js';
import { jsonResponse } from '../utils/response.js';
import { processBattlePassSeason } from '../utils/battlePassProcessor.js';

export async function handleBattlePassSeason(request) {
  const response = await proxyRequest(request, 'battlePass/season');
  const seasonData = await response.json();

  if (!response.ok) {
    return jsonResponse(seasonData, response.status);
  }

  const processedData = await processBattlePassSeason(seasonData, request);
  return jsonResponse(processedData);
}

export async function handleBattlePassShop(request) {
  const response = await proxyRequest(request, 'battlePass/shop');
  const responseData = await response.json();
  return jsonResponse(responseData);
}

export async function handleBattlePassChallenges(request) {
  const response = await proxyRequest(request, 'battlePass/challenges');
  const responseData = await response.json();
  return jsonResponse(responseData);
}