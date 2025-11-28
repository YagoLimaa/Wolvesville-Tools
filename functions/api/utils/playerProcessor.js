import { proxyRequest } from './apiProxy.js';

async function fetchClanInfo(request, clanId) {
  try {
    const response = await proxyRequest(request, `clans/${clanId}/info`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching clan info for ID ${clanId}:`, error.message);
    return null;
  }
}

export async function enrichPlayersWithClan(request, players) {
  const enrichedPlayersPromises = players.map(async (player) => {
    if (!player.clanId) return player;
    
    const clanData = await fetchClanInfo(request, player.clanId);
    return {
      ...player,
      clan: clanData ? { id: player.clanId, name: clanData.name } : null,
    };
  });
  return Promise.all(enrichedPlayersPromises);
}

export function paginatePlayers(players, page = 1, resultsPerPage = 5) {
  const totalPages = Math.ceil(players.length / resultsPerPage);
  const startIndex = (page - 1) * resultsPerPage;
  const paginatedPlayers = players.slice(startIndex, startIndex + resultsPerPage);

  return {
    players: paginatedPlayers,
    pagination: {
      currentPage: page,
      totalPages: totalPages > 0 ? totalPages : 1,
      hasPages: totalPages > 1,
      prevPage: page > 1 ? page - 1 : undefined,
      nextPage: page < totalPages ? page + 1 : undefined,
    },
  };
}

async function fetchPlayerDetails(request, playerId) {
    try {
        const response = await proxyRequest(request, `players/${playerId}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Error fetching player details for ID ${playerId}:`, error.message);
        return null;
    }
}

export async function enrichHighscorePlayers(request, players) {
    const enrichedPlayersPromises = players.map(async (player) => {
        const detailsData = await fetchPlayerDetails(request, player.playerId);
        return { ...player, ...detailsData };
    });
    return Promise.all(enrichedPlayersPromises);
}
