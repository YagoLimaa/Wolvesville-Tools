

// Helper para criar respostas JSON com cabeçalhos CORS
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Função principal que será executada pela Cloudflare
export async function onRequest(context) {
  // O `context.params.path` contém as partes da URL após /api/
  // Ex: /api/search -> context.params.path = ['search']
  // Ex: /api/items/avatarItems -> context.params.path = ['items', 'avatarItems']
  const path = `/${context.params.path.join('/')}`;
  const url = new URL(context.request.url);
  const { searchParams } = url;

  const WOLVESVILLE_API_KEY = context.env.WOLVESVILLE_API_KEY;
  const WOLVESVILLE_API_BASE_URL = 'https://api.wolvesville.com';

  if (!WOLVESVILLE_API_KEY || WOLVESVILLE_API_KEY === 'SUA_CHAVE_API_VEM_AQUI') {
    return jsonResponse({ error: 'A chave da API não está configurada no servidor.' }, 500);
  }

  const requestConfig = {
    headers: {
      'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
      'Accept': 'application/json'
    }
  };

  try {
    // Roteamento baseado no caminho da URL
    if (path === '/search') {
      const username = searchParams.get('username');
      const page = parseInt(searchParams.get('page')) || 1;
      const resultsPerPage = 5;

      const requestUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/players/search`);
      if (username) {
        requestUrl.searchParams.append('username', username);
      }
      
      const response = await fetch(requestUrl.toString(), requestConfig);
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
            const clanResponse = await fetch(clanUrl, requestConfig);
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

      return jsonResponse({
        players: paginatedPlayers,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          hasPages: totalPages > 1,
          prevPage: page > 1 ? page - 1 : undefined,
          nextPage: page < totalPages ? page + 1 : undefined
        }
      });
    }

    if (path === '/roleRotations') {
      const response = await fetch(`${WOLVESVILLE_API_BASE_URL}/roleRotations`, requestConfig);
      const responseData = await response.json();
      const rotationsFromApi = Array.isArray(responseData) ? responseData : [];

      const extractRoles = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data.flatMap(extractRoles);

        let roleId;
        let probability;

        if (typeof data === 'string') {
          roleId = data;
        } else if (data && typeof data.role === 'string') {
          roleId = data.role;
          if (typeof data.probability === 'number') {
            probability = data.probability;
          }
        } else if (data && Array.isArray(data.roles)) {
          return data.roles.flatMap(extractRoles);
        }

        if (roleId) {
          const roleInfo = { id: roleId === 'red-lady' ? 'harlot' : roleId };
          if (probability !== undefined) {
            roleInfo.probability = probability <= 1 ? probability * 100 : probability;
          }
          // Remove probability if it's not 50% as per user request
          if (roleInfo.probability !== undefined && roleInfo.probability !== 50) {
            delete roleInfo.probability;
          }
          return [roleInfo];
        }
        return [];
      };

      const formattedRotations = rotationsFromApi.map(rotationData => {
        const gameMode = rotationData?.gameMode ?? '';
        const gameModeName = (rotationData?.gameModeName || gameMode.replace(/-/g, ' ')).replace(/\b\w/g, l => l.toUpperCase());

        if (gameMode === 'sandbox' && Array.isArray(rotationData.roleRotations)) {
          const processRole = (roleData) => {
            let roleId;
            let probability;

            if (typeof roleData === 'string') {
              roleId = roleData;
            } else if (roleData && typeof roleData.role === 'string') {
              roleId = roleData.role;
              if (typeof roleData.probability === 'number') {
                probability = roleData.probability;
              }
            }

            if (roleId) {
              const result = { id: roleId === 'red-lady' ? 'harlot' : roleId };
              if (probability !== undefined) {
                // Ensure probability is always a number for consistency
                // and apply the 50% filter as requested
                result.probability = probability <= 1 ? probability * 100 : probability;
              }
              return result;
            }
            return null;
          };

          const setups = rotationData.roleRotations.map(setupData => {
            const setupProbability = setupData.probability;
            const rolesSource = setupData.roleRotation?.roles ?? [];

            const processedRoles = rolesSource.map(roleOrChoice => {
              if (Array.isArray(roleOrChoice)) {
                return roleOrChoice.map(processRole).filter(Boolean);
              }
              return [processRole(roleOrChoice)].filter(Boolean);
            }).filter(r => r.length > 0);

            return {
              probability: setupProbability !== undefined ? (setupProbability <= 1 ? setupProbability * 100 : setupProbability) : undefined,
              roles: processedRoles,
            };
          });

          return {
            gameMode,
            gameModeName,
            setups,
        };
      } else if (gameMode === 'sandbox' && !Array.isArray(rotationData.roleRotations)) {
        return {
          gameMode,
          gameModeName,
          };
        } else {
          const rolesSource = rotationData?.roleRotations?.[0]?.roleRotation?.roles ?? [];
          const roles = extractRoles(rolesSource);
          return {
            gameMode,
            gameModeName,
            roles,
          };
        }
      });

      const filteredRotations = formattedRotations.filter(rotation =>
        rotation.gameMode !== 'ranked-league-silver' && rotation.gameMode !== 'ranked-league-gold'
      );

      const desiredOrder = ['quick', 'crazy-fun', 'advanced', 'sandbox'];
      const sortedRotations = filteredRotations.sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.gameMode);
        const indexB = desiredOrder.indexOf(b.gameMode);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      return jsonResponse(sortedRotations);
    }

    if (path === '/roles') {
        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/roles`;
        const response = await fetch(requestUrl, requestConfig);
        const responseData = await response.json();
        return jsonResponse(responseData);
    }

    if (path === '/shop/activeOffers') {
        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/shop/activeOffers`;
        const response = await fetch(requestUrl, requestConfig);
        const responseData = await response.json();
        return jsonResponse(responseData);
    }

    if (path === '/battlePass/season') {
      const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/season`;
      const response = await fetch(requestUrl, requestConfig);
      const seasonData = await response.json();

      const currencyTotals = {
        GOLD: 0,
        SINGLE_ROSE: 0,
        SERVER_ROSE: 0,
        BATTLE_PASS_COIN: 0,
        GEM: 0,
      };

      seasonData.rewards.forEach(reward => {
        if (reward.type === 'GOLD') {
          currencyTotals.GOLD += reward.amount;
        } else if (reward.type === 'BATTLE_PASS_COIN') {
          currencyTotals.BATTLE_PASS_COIN += reward.amount;
        } else if (reward.type === 'GEM') {
          currencyTotals.GEM += reward.amount;
        } else if (reward.type === 'ROSE_PACKAGE') {
          if (reward.rosePackageId === 'U0s') { // SERVER_ROSE
            currencyTotals.SERVER_ROSE += reward.amount;
          } else if (reward.rosePackageId === 'mkQ') { // SINGLE_ROSE
            currencyTotals.SINGLE_ROSE += reward.amount;
          }
        }
      });

      // Fetch rose icons
      const rosesUrl = `${WOLVESVILLE_API_BASE_URL}/items/roses`;
      const rosesResponse = await fetch(rosesUrl, requestConfig);
      const roses = await rosesResponse.json();

      const currencyIcons = {
        GOLD: "https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png",
        GEM: "https://www.wolvesville.com/static/media/gem.439d7650def0b35d6a66.png",
        BATTLE_PASS_COIN: `https://cdn2.wolvesville.com/battlePass/coins/bp${seasonData.number}_single@2x.png`,
        ROSES: {
          SERVER_ROSE: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png",
          SINGLE_ROSE: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png"
        },
      };

      if (Array.isArray(roses)) {
        for (const rose of roses) {
          if (rose.id === 'U0s') { // SERVER_ROSE
            currencyIcons.ROSES.SERVER_ROSE = rose.imageUrl;
          } else if (rose.id === 'mkQ') { // SINGLE_ROSE
            currencyIcons.ROSES.SINGLE_ROSE = rose.imageUrl;
          }
        }
      }

      const responseData = {
        ...seasonData,
        currencyTotals,
        currencyIcons,
      };

      return jsonResponse(responseData);
    }

    if (path === '/battlePass/shop') {
        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/shop`;
        const response = await fetch(requestUrl, requestConfig);
        const responseData = await response.json();
        return jsonResponse(responseData);
    }

    if (path === '/battlePass/challenges') {
        const locale = searchParams.get('locale') || 'en';
        const requestUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/battlePass/challenges`);
        requestUrl.searchParams.append('locale', locale);
        
        const response = await fetch(requestUrl.toString(), requestConfig);
        const responseData = await response.json();
        return jsonResponse(responseData);
    }

    if (path === '/players/highscores') {
        const type = 'oldRank';
        const limit = parseInt(searchParams.get('limit')) || 10;

        const requestUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/players/highscores`);
        requestUrl.searchParams.append('type', type);
        requestUrl.searchParams.append('limit', limit);

        const response = await fetch(requestUrl.toString(), requestConfig);
        const responseData = await response.json();

        const allPlayersFromApi = responseData.allTime || [];
        const highscorePlayers = allPlayersFromApi.slice(0, limit);

        const playerDetailPromises = highscorePlayers.map(player => {
            const playerDetailsUrl = `${WOLVESVILLE_API_BASE_URL}/players/${player.playerId}`;
            return fetch(playerDetailsUrl, requestConfig)
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

    if (path === '/clans/search') {
        const name = searchParams.get('name');
        const language = searchParams.get('language');
        const searchUrl = new URL(`${WOLVESVILLE_API_BASE_URL}/clans/search`);

        if (name) searchUrl.searchParams.append('name', name);
        if (language && language.toLowerCase() !== 'all') searchUrl.searchParams.append('language', language);

        const searchResponse = await fetch(searchUrl.toString(), requestConfig);
        const responseData = await searchResponse.json();
        const clansFound = Array.isArray(responseData) ? responseData : [];
        return jsonResponse(clansFound);
    }

    if (path === '/items/tags') {
        const season = searchParams.get('season');
        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/tags`;
        const response = await fetch(requestUrl, requestConfig);
        let tagsData = await response.json();

        if (season) {
          const seasonTag = `origin:battle_pass:season_${season}`;
          tagsData = tagsData.filter(item => item.tags && item.tags.includes(seasonTag));
        }

        return jsonResponse(tagsData);
    }

    // Rota para /clan/:id
    const clanMatch = path.match(/^\/clan\/([^/]+)$/);
    if (clanMatch) {
        const id = clanMatch[1];
        const infoUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${id}/info`;
        const membersUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${id}/members/detailed`;

        const [infoResponse, membersResponse] = await Promise.all([
            fetch(infoUrl, requestConfig),
            fetch(membersUrl, requestConfig)
        ]);

        const infoData = await infoResponse.json();
        const membersData = await membersResponse.json();

        if (!infoData || !infoData.id) {
            return jsonResponse({ error: `Clan with ID ${id} not found.` }, 404);
        }

        const membersWithDetailsPromises = membersData.map(async (member) => {
            try {
                const playerDetailsUrl = `${WOLVESVILLE_API_BASE_URL}/players/${member.playerId}`;
                const playerDetailsResponse = await fetch(playerDetailsUrl, requestConfig);
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

    if (path === '/announcements') {
        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/announcements`;
        const response = await fetch(requestUrl, requestConfig);
        const responseData = await response.json();
        return jsonResponse(responseData);
    }

    // Rota para /items/:category
    const itemsMatch = path.match(/^\/items\/([^/]+)$/);
    if (itemsMatch) {
        const category = itemsMatch[1];
        const validCategories = ['avatarItems', 'bodyPaints', 'avatarItemSets', 'avatarItemCollections', 'bundles', 'calendars', 'tags', 'profileIcons', 'profileIconBorders', 'emojis', 'emojiCollections', 'backgrounds', 'loadingScreens', 'roleIcons', 'advancedRoleCardOffers', 'baseRoleCardOffers', 'roseSkins', 'roses', 'advancedRoleCardOffers'];

        if (!validCategories.includes(category)) {
            return jsonResponse({ error: 'Categoria de item inválida.' }, 400);
        }

        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/${category}`;
        const response = await fetch(requestUrl, requestConfig);
        const responseData = await response.json();

        const itemsArray = Array.isArray(responseData) ? responseData : (responseData.list ? Object.values(responseData.list) : Object.values(responseData));

        const getNameFromUrl = (url) => {
            if (!url || typeof url !== 'string') return "Item";
            try {
                const filename = url.split('/').pop()?.split('.')[0] ?? '';
                const cleanedName = filename.replace(/bp\d+-/, '').replace(/_store|@\dx/g, '').replace(/[-_]/g, ' ');
                return cleanedName.replace(/\b\w/g, l => l.toUpperCase());
            } catch {
                return "Item";
            }
        };

        const processedItems = itemsArray.map(item => {
            const newItem = { ...item };
            if (!newItem.imageUrl) {
                newItem.imageUrl = newItem.promoImageUrl || newItem.iconUrl || (newItem.image && newItem.image.url) || newItem.singleImageUrl || newItem.urlPreview || (newItem.imageDay && newItem.imageDay.url) || (newItem.imageSmall && newItem.imageSmall.url);
            }
            if (!newItem.name) {
                newItem.name = newItem.title || getNameFromUrl(newItem.imageUrl);
            }
            if (newItem.rarity) {
                newItem.rarity = String(newItem.rarity).toLowerCase();
            }
            return newItem;
        });

        return jsonResponse(processedItems);
    }

    // Rota para /avatars/sharedAvatarId/:playerId/:slotNumber
    const sharedIdMatch = path.match(/^\/avatars\/sharedAvatarId\/([^/]+)\/([^/]+)$/);
    if (sharedIdMatch) {
        const [, playerId, slotNumber] = sharedIdMatch;
        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/avatars/sharedAvatarId/${playerId}/${slotNumber}`;
        try {
            const response = await fetch(requestUrl, { headers: { 'Authorization': `Bot ${WOLVESVILLE_API_KEY}` } });
            const responseData = await response.text();
            return new Response(responseData, {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            });
        } catch (error) {
            console.error(`Erro ao buscar sharedAvatarId para o jogador ${playerId}:`, error.message);
            return jsonResponse({ error: 'Não foi possível buscar o ID do avatar compartilhado.' }, 500);
        }
    }

    // Rota para /avatars/:sharedAvatarId
    const avatarDetailsMatch = path.match(/^\/avatars\/([^/]+)$/);
    if (avatarDetailsMatch) {
        const [, sharedAvatarId] = avatarDetailsMatch;
        if (sharedAvatarId !== 'sharedAvatarId') {
            const requestUrl = `${WOLVESVILLE_API_BASE_URL}/avatars/${sharedAvatarId}`;
            try {
                const response = await fetch(requestUrl, requestConfig);
                const responseData = await response.json();
                return jsonResponse(responseData);
            } catch (error) {
                console.error(`Erro ao buscar detalhes do avatar ${sharedAvatarId}:`, error.message);
                return jsonResponse({ error: 'Não foi possível buscar os detalhes do avatar.' }, 500);
            }
        }
    }


    return jsonResponse({ error: 'Rota não encontrada' }, 404);

  } catch (error) {
    console.error("Erro na API da Cloudflare Function:", error);
    return jsonResponse({ error: 'Erro interno do servidor.' }, 500);
  }
}