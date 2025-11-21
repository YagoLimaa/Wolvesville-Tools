import express from 'express';
import axios from 'axios';
import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/search', asyncHandler(async (req, res) => {
  const { name, language, open } = req.query;

  const searchUrl = `${WOLVESVILLE_API_BASE_URL}/clans/search`;

  const searchParams = {};
  if (name) searchParams.name = name;
  if (language && language.toLowerCase() !== 'all') {
    searchParams.language = language;
  }

  const searchConfig = {
    ...req.requestConfig,
    params: searchParams
  };

  const searchResponse = await axios.get(searchUrl, searchConfig);
  let clansFound = Array.isArray(searchResponse.data) ? searchResponse.data : [];
  if (open === 'true') {
    clansFound = clansFound.filter(clan => clan.joinType === 'PUBLIC');
  }

  res.json(clansFound);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const infoUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${id}/info`;
  const membersUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${id}/members/detailed`;

  const [infoResponse, membersResponse] = await Promise.all([
    axios.get(infoUrl, req.requestConfig),
    axios.get(membersUrl, req.requestConfig)
  ]);

  if (!infoResponse.data || !infoResponse.data.id) {
    return res.status(404).json({ error: `Clan with ID ${id} not found.` });
  }

  const membersWithDetailsPromises = membersResponse.data.map(async (member) => {
    try {
      const playerDetailsUrl = `${WOLVESVILLE_API_BASE_URL}/players/${member.playerId}`;
      const playerDetailsResponse = await axios.get(playerDetailsUrl, req.requestConfig);
      const playerDetails = playerDetailsResponse.data;
      return {
        id: member.id,
        username: playerDetails.username || member.username,
        isCoLeader: member.isCoLeader,
        equippedAvatar: playerDetails.equippedAvatar,
        level: playerDetails.level,
      };
    } catch (playerDetailsError) {
      console.error(`Erro ao buscar detalhes do jogador ${member.username} (ID: ${member.playerId}):`, playerDetailsError.message);
      return member;
    }
  });

  const detailedMembers = await Promise.all(membersWithDetailsPromises);

  const combinedData = {
    ...infoResponse.data,
    members: detailedMembers,
  };

  res.json(combinedData);
}));

export default router;