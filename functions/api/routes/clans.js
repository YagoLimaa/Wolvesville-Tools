import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { jsonResponse } from '../utils/response.js';

export async function handleClanSearch(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const language = searchParams.get('language');
  const open = searchParams.get('open');

  const searchUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/clans/search`);
  if (name) searchUrl.searchParams.append('name', name);
  if (language && language.toLowerCase() !== 'all') {
    searchUrl.searchParams.append('language', language);
  }

  const response = await fetch(searchUrl.toString(), request.requestConfig);
  let clansFound = await response.json();

  if (Array.isArray(clansFound) && open === 'true') {
    clansFound = clansFound.filter(clan => clan.joinType === 'PUBLIC');
  }

  return jsonResponse(clansFound);
}

export async function handleClanDetails(request) {
  const { id } = request.params;

  const infoUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${id}/info`;
  const membersUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${id}/members/detailed`;

  const [infoResponse, membersResponse] = await Promise.all([
    fetch(infoUrl, request.requestConfig),
    fetch(membersUrl, request.requestConfig)
  ]);

  const infoData = await infoResponse.json();
  const membersData = await membersResponse.json();

  if (!infoData || !infoData.id) {
    return jsonResponse({ error: `Clan with ID ${id} not found.` }, 404);
  }

  const membersWithDetailsPromises = membersData.map(async (member) => {
    try {
      const playerDetailsUrl = `${WOLVESVILLE_API_BASE_URL}/players/${member.playerId}`;
      const playerDetailsResponse = await fetch(playerDetailsUrl, request.requestConfig);
      const playerDetails = await playerDetailsResponse.json();
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
    ...infoData,
    members: detailedMembers,
  };

  return jsonResponse(combinedData);
}