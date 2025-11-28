import { jsonResponse } from '../utils/response.js';
import { proxyRequest } from '../utils/apiProxy.js';
import { enrichPlayersWithClan, paginatePlayers, enrichHighscorePlayers } from '../utils/playerProcessor.js';

export async function handlePlayersSearch(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;

  const response = await proxyRequest(request, 'players/search');
  const responseData = await response.json();

  if (!response.ok) {
    return jsonResponse(responseData, response.status);
  }

  let allPlayers;
  if (Array.isArray(responseData)) {
    allPlayers = responseData;
  } else if (responseData && typeof responseData === 'object' && responseData.id) {
    allPlayers = [responseData];
  } else {
    allPlayers = [];
  }

  if (allPlayers.length === 0) {
    return jsonResponse({ players: [], pagination: { currentPage: 1, totalPages: 1 } });
  }

  const enrichedPlayers = await enrichPlayersWithClan(request, allPlayers);
  const paginatedData = paginatePlayers(enrichedPlayers, page);

  return jsonResponse(paginatedData);
}

export async function handlePlayersHighscores(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit')) || 10;

  const params = new URLSearchParams();
  params.append('type', 'oldRank');
  params.append('limit', limit);
  
  const response = await proxyRequest(request, 'players/highscores', { customSearchParams: params });
  const responseData = await response.json();

  if (!response.ok) {
    return jsonResponse(responseData, response.status);
  }

  const allPlayersFromApi = responseData.allTime || [];
  const highscorePlayers = allPlayersFromApi.slice(0, limit);

  const detailedPlayers = await enrichHighscorePlayers(request, highscorePlayers);
  return jsonResponse(detailedPlayers);
}