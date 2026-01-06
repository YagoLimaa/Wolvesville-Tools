import { callApi } from './ApiService.js';

async function fetchClanMembers(request, clanId) {
  const response = await callApi(`clans/${clanId}/members`, { request });
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
    return { ...clanInfo, members: [] };
  }

  const leaderId = clanInfo.leaderId; 

  let membersWithDetails = await Promise.all(membersData.map(async (member) => {
    const playerDetails = await fetchPlayerDetails(request, member.playerId);
    
    const isLeader = playerDetails ? playerDetails.id === leaderId : false;
    
    return {
      id: member.playerId,
      username: playerDetails?.username || member.username,
      isLeader: isLeader,
      isCoLeader: !isLeader && (member.isCoLeader || false),
      equippedAvatar: playerDetails?.equippedAvatar,
      level: playerDetails?.level,
    };
  }));

  const leaderIsInList = membersWithDetails.some(m => m.id === leaderId);

  if (leaderId && !leaderIsInList) {
    const leaderDetails = await fetchPlayerDetails(request, leaderId);
    if (leaderDetails) {
      membersWithDetails.unshift({
        id: leaderId,
        username: leaderDetails.username,
        isLeader: true,
        isCoLeader: false,
        equippedAvatar: leaderDetails.equippedAvatar,
        level: leaderDetails.level,
      });
    }
  }

  return {
    ...clanInfo,
    members: membersWithDetails,
  };
}
