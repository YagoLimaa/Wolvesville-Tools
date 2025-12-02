import { z } from 'zod';
import { jsonResponse } from '../utils/response.js';
import { callApi } from '../utils/ApiService.js';
import { enrichPlayersWithClan, paginatePlayers, enrichHighscorePlayers } from '../utils/playerProcessor.js';

const playerSearchSchema = z.object({
  page: z.preprocess(val => (val ? Number(val) : 1), z.number().int().positive().default(1)),
});

const highscoreSchema = z.object({
  limit: z.preprocess(val => (val ? Number(val) : 10), z.number().int().positive().default(10)),
  type: z.string().default('oldRank'),
});

export async function handlePlayersSearch(request) {
  const { searchParams } = new URL(request.url);
  const page = playerSearchSchema.parse(Object.fromEntries(searchParams)).page;

  const response = await callApi('players/search', { request, schema: playerSearchSchema });
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
  const query = highscoreSchema.parse(Object.fromEntries(searchParams));

  const params = new URLSearchParams();
  params.append('type', query.type);
  params.append('limit', query.limit);

  const response = await callApi('players/highscores', { request, customSearchParams: params });
  const responseData = await response.json();

  if (!response.ok) {
    return jsonResponse(responseData, response.status);
  }

  const allPlayersFromApi = responseData.allTime || [];
  const highscorePlayers = allPlayersFromApi.slice(0, query.limit);

  const detailedPlayers = await enrichHighscorePlayers(request, highscorePlayers);
  return jsonResponse(detailedPlayers);
}