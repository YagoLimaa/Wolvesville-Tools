import { callApi } from './ApiService.js';

async function fetchClanMembers(request, clanId) {
  const response = await callApi(`clans/${clanId}/members/detailed`, { request });
  return response.json();
}

async function fetchPlayerDetails(request, playerId) {
  const response = await callApi(`players/${playerId}`, { request });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function processClanDetails(clanInfo, request) {
  const membersData = await fetchClanMembers(request, clanInfo.id);

  if (!Array.isArray(membersData)) {
    // If members can't be fetched, return the basic clan info
    return { ...clanInfo, members: [] };
  }

  const membersWithDetailsPromises = membersData.map(async (member) => {
    const playerDetails = await fetchPlayerDetails(request, member.playerId);
    
    return {
      id: member.id,
      username: playerDetails?.username || member.username,
      isCoLeader: member.isCoLeader,
      equippedAvatar: playerDetails?.equippedAvatar,
      level: playerDetails?.level,
    };
  });

  const detailedMembers = await Promise.all(membersWithDetailsPromises);

  return {
    ...clanInfo,
    members: detailedMembers,
  };
}
