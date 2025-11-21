import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';

export async function handleClanSearch(searchParams, requestConfig) {
  const searchQuery = searchParams.get('name') || searchParams.get('search');
  const language = searchParams.get('language');
  const offset = searchParams.get('offset') || '0';
  const limit = searchParams.get('limit') || '10';

  if (!searchQuery || searchQuery.trim().length === 0) {
    return {
      error: 'Search query is required',
    };
  }

  const requestUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/clans/search`);
  requestUrl.searchParams.append('search', searchQuery);
  if (language) {
    requestUrl.searchParams.append('language', language);
  }
  requestUrl.searchParams.append('offset', offset);
  requestUrl.searchParams.append('limit', limit);

  const response = await fetch(requestUrl.toString(), requestConfig);
  const responseData = await response.json();
  return responseData;
}

export async function handleClanDetails(params, requestConfig) {
  const clanId = params;

  if (!clanId || clanId.trim().length === 0) {
    return {
      error: 'Clan ID is required',
    };
  }

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${clanId}`;
  const response = await fetch(requestUrl, requestConfig);
  const clanData = await response.json();

  if (!clanData.members) {
    return clanData;
  }

  const memberDetailsPromises = clanData.members.map(member => {
    const memberUrl = `${WOLVESVILLE_API_BASE_URL}/player/${member.playerId}`;
    return fetch(memberUrl, requestConfig).then(res => res.json());
  });

  const memberDetails = await Promise.all(memberDetailsPromises);

  const enrichedMembers = clanData.members.map((member, index) => ({
    ...member,
    ...memberDetails[index],
  }));

  return {
    ...clanData,
    members: enrichedMembers,
  };
}
