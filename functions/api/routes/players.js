import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { jsonResponse } from '../utils/response.js';

export async function handlePlayersSearch(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const page = parseInt(searchParams.get('page')) || 1;
  const resultsPerPage = 5;

  const requestUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/players/search`);
  if (username) {
    requestUrl.searchParams.append('username', username);
  }
  
  const response = await fetch(requestUrl.toString(), request.requestConfig);
  const responseData = await response.json();

  let allPlayers;
  if (Array.isArray(responseData)) {
    allPlayers = responseData;
  } else if (responseData && typeof responseData === 'object' && responseData.id) {
    allPlayers = [responseData];
  } else {
    allPlayers = [];
  }

  for (const player of allPlayers) {
    if (player.clanId) {
      try {
        const clanUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${player.clanId}/info`;
        const clanResponse = await fetch(clanUrl, request.requestConfig);
        const clanData = await clanResponse.json();
        player.clan = { id: player.clanId, name: clanData.name };
      } catch (clanError) {
        console.error(`Erro ao buscar detalhes do clã ${player.clanId}:`, clanError.message);
        player.clan = null;
      }
    }
  }

  if (!allPlayers || allPlayers.length === 0) {
    return jsonResponse({ players: [], pagination: { currentPage: 1, totalPages: 1 } });
  }

  const totalPages = Math.ceil(allPlayers.length / resultsPerPage);
  const startIndex = (page - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedPlayers = allPlayers.slice(startIndex, endIndex);

  const data = {
    players: paginatedPlayers,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      hasPages: totalPages > 1,
      prevPage: page > 1 ? page - 1 : undefined,
      nextPage: page < totalPages ? page + 1 : undefined
    }
  };
  return jsonResponse(data);
}

export async function handlePlayersHighscores(request) {
  const { searchParams } = new URL(request.url);
  const type = 'oldRank';
  const limit = parseInt(searchParams.get('limit')) || 10;

  const requestUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/players/highscores`);
  requestUrl.searchParams.append('type', type);
  requestUrl.searchParams.append('limit', limit);

  const response = await fetch(requestUrl.toString(), request.requestConfig);
  const responseData = await response.json();

  const allPlayersFromApi = responseData.allTime || [];
  const highscorePlayers = allPlayersFromApi.slice(0, limit);

  const playerDetailPromises = highscorePlayers.map(player => {
    const playerDetailsUrl = `${WOLVESVILLE_API_BASE_URL}/players/${player.playerId}`;
    return fetch(playerDetailsUrl, request.requestConfig)
      .then(detailsResponse => detailsResponse.json())
      .then(detailsData => ({ ...player, ...detailsData }))
      .catch(detailsError => {
        console.error(`Erro ao buscar detalhes para o jogador ${player.username}:`, detailsError.message);
        return player;
      });
  });

  const detailedPlayers = await Promise.all(playerDetailPromises);
  return jsonResponse(detailedPlayers);
}