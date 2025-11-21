import express from 'express';
import axios from 'axios';
import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/search', asyncHandler(async (req, res) => {
  const { username } = req.query;
  const page = parseInt(req.query.page) || 1;
  const resultsPerPage = 5;

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/players/search`;
  const requestConfig = {
    params: { username },
    headers: req.requestConfig.headers
  };

  const response = await axios.get(requestUrl, requestConfig);

  let allPlayers;
  if (Array.isArray(response.data)) {
    allPlayers = response.data;
  } else if (response.data && typeof response.data === 'object' && response.data.id) {
    allPlayers = [response.data];
  } else {
    allPlayers = [];
  }

  for (const player of allPlayers) {
    if (player.clanId) {
      try {
        const clanUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${player.clanId}/info`;
        const clanResponse = await axios.get(clanUrl, req.requestConfig);
        player.clan = { id: player.clanId, name: clanResponse.data.name };
      } catch (clanError) {
        console.error(`Erro ao buscar detalhes do clã ${player.clanId}:`, clanError.message);
        player.clan = null;
      }
    }
  }

  if (!allPlayers || allPlayers.length === 0) {
    return res.json({
      players: [],
      pagination: { currentPage: 1, totalPages: 1 }
    });
  }

  const totalPages = Math.ceil(allPlayers.length / resultsPerPage);
  const startIndex = (page - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedPlayers = allPlayers.slice(startIndex, endIndex);

  res.json({
    players: paginatedPlayers,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      hasPages: totalPages > 1,
      prevPage: page > 1 ? page - 1 : undefined,
      nextPage: page < totalPages ? page + 1 : undefined
    }
  });
}));

router.get('/highscores', asyncHandler(async (req, res) => {
  const type = 'oldRank';
  const { limit = 10 } = req.query;

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/players/highscores`;
  const requestConfig = {
    headers: req.requestConfig.headers,
    params: { type, limit }
  };

  const response = await axios.get(requestUrl, requestConfig);

  const allPlayersFromApi = response.data.allTime || [];
  const highscorePlayers = allPlayersFromApi.slice(0, limit);

  const playerDetailPromises = highscorePlayers.map(player => {
    const playerDetailsUrl = `${WOLVESVILLE_API_BASE_URL}/players/${player.playerId}`;
    return axios.get(playerDetailsUrl, req.requestConfig)
      .then(detailsResponse => ({ ...player, ...detailsResponse.data }))
      .catch(detailsError => {
        console.error(`Erro ao buscar detalhes para o jogador ${player.username}:`, detailsError.message);
        return player;
      });
  });

  const detailedPlayers = await Promise.all(playerDetailPromises);

  res.json(detailedPlayers);
}));

export default router;