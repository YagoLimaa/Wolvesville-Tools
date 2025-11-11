import axios from 'axios';

// Helper para criar respostas JSON com cabeçalhos CORS
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      // Adicione cabeçalhos CORS se precisar de acesso de domínios diferentes
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

      const requestUrl = `${WOLVESVILLE_API_BASE_URL}/players/search`;
      const response = await axios.get(requestUrl, { ...requestConfig, params: { username } });

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
            const clanResponse = await axios.get(clanUrl, requestConfig);
            player.clan = { id: player.clanId, name: clanResponse.data.name };
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

    // Rota para rotação de papéis
    if (path === '/roleRotations') {
      const response = await axios.get(`${WOLVESVILLE_API_BASE_URL}/roleRotations`, requestConfig);
      const rotationsFromApi = Array.isArray(response.data) ? response.data : [];

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
        const gameModeName = rotationData?.gameModeName || gameMode.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

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
              // Ensure probability is always a number for consistency
              // and apply the 50% filter as requested
              // If setupProbability is not 50%, it will be removed later if not explicitly needed
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
        // Handle sandbox mode without roleRotations array, if it exists
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

      // Apply the probability filtering for sandbox setups
      const finalRotations = sortedRotations.map(rotation => {
        if (rotation.gameMode === 'sandbox' && rotation.setups) {
          rotation.setups = rotation.setups.map(setup => {
            // Remove setup probability if it's not 50%
            if (setup.probability !== undefined && setup.probability !== 50) {
              delete setup.probability;
            }
            return setup;
          });
        }
        return rotation;
      });

      // Use jsonResponse directly as it already handles CORS
      return jsonResponse(finalRotations);
    }

    if (path === '/roles') {
        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/roles`;
        const response = await axios.get(requestUrl, requestConfig);
        return jsonResponse(response.data);
    }

    if (path === '/shop/activeOffers') {
        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/shop/activeOffers`;
        const response = await axios.get(requestUrl, requestConfig);
        return jsonResponse(response.data);
    }

    if (path === '/battlePass/season') {
      const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/season`;
      const response = await axios.get(requestUrl, requestConfig);
      const seasonData = response.data;

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
      const rosesResponse = await axios.get(rosesUrl, requestConfig);
      const roses = rosesResponse.data;

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
        const response = await axios.get(requestUrl, requestConfig);
        return jsonResponse(response.data);
    }

    if (path === '/battlePass/challenges') {
        const locale = searchParams.get('locale') || 'en';
        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/challenges`;
        const response = await axios.get(requestUrl, { ...requestConfig, params: { locale } });
        return jsonResponse(response.data);
    }

    if (path === '/players/highscores') {
        const type = 'oldRank';
        const limit = parseInt(searchParams.get('limit')) || 10;

        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/players/highscores`;
        const response = await axios.get(requestUrl, { ...requestConfig, params: { type, limit } });

        const allPlayersFromApi = response.data.allTime || [];
        const highscorePlayers = allPlayersFromApi.slice(0, limit);

        const playerDetailPromises = highscorePlayers.map(player => {
            const playerDetailsUrl = `${WOLVESVILLE_API_BASE_URL}/players/${player.playerId}`;
            return axios.get(playerDetailsUrl, requestConfig)
                .then(detailsResponse => ({ ...player, ...detailsResponse.data }))
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
        const searchUrl = `${WOLVESVILLE_API_BASE_URL}/clans/search`;

        const searchParamsData = {};
        if (name) searchParamsData.name = name;
        if (language && language.toLowerCase() !== 'all') searchParamsData.language = language;

        const searchResponse = await axios.get(searchUrl, { ...requestConfig, params: searchParamsData });
        const clansFound = Array.isArray(searchResponse.data) ? searchResponse.data : [];
        return jsonResponse(clansFound);
    }

    // Rota para /clan/:id
    const clanMatch = path.match(/^\/clan\/([^/]+)$/);
    if (clanMatch) {
        const id = clanMatch[1];
        const infoUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${id}/info`;
        const membersUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${id}/members/detailed`;

        const [infoResponse, membersResponse] = await Promise.all([
            axios.get(infoUrl, requestConfig),
            axios.get(membersUrl, requestConfig)
        ]);

        if (!infoResponse.data || !infoResponse.data.id) {
            return jsonResponse({ error: `Clan with ID ${id} not found.` }, 404);
        }

        const membersWithDetailsPromises = membersResponse.data.map(async (member) => {
            try {
                const playerDetailsUrl = `${WOLVESVILLE_API_BASE_URL}/players/${member.playerId}`;
                const playerDetailsResponse = await axios.get(playerDetailsUrl, requestConfig);
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

        return jsonResponse(combinedData);
    }

    if (path === '/announcements') {
        const requestUrl = `${WOLVESVILLE_API_BASE_URL}/announcements`;
        const response = await axios.get(requestUrl, requestConfig);
        return jsonResponse(response.data);
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
        const response = await axios.get(requestUrl, requestConfig);

        const itemsArray = Array.isArray(response.data) ? response.data : (response.data.list ? Object.values(response.data.list) : Object.values(response.data));

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
            const response = await axios.get(requestUrl, { headers: { 'Authorization': `Bot ${WOLVESVILLE_API_KEY}` } });
            return new Response(response.data, {
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
                const response = await axios.get(requestUrl, requestConfig);
                return jsonResponse(response.data);
            } catch (error) {
                console.error(`Erro ao buscar detalhes do avatar ${sharedAvatarId}:`, error.message);
                return jsonResponse({ error: 'Não foi possível buscar os detalhes do avatar.' }, 500);
            }
        }
    }

    // Se nenhuma rota corresponder
    return jsonResponse({ error: 'Rota não encontrada' }, 404);

  } catch (error) {
    console.error("Erro na API da Cloudflare Function:", error);
    if (error.response) {
        return jsonResponse(error.response.data, error.response.status);
    }
    return jsonResponse({ error: 'Erro interno do servidor.' }, 500);
  }
}