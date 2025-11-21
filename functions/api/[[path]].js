// Importar todos os módulos de rotas
import { handlePlayersSearch, handlePlayersHighscores } from './routes/players.js';
import { handleRoles, handleRoleRotations } from './routes/roles.js';
import { handleShopActiveOffers } from './routes/shop.js';
import { handleBattlePassSeason, handleBattlePassShop, handleBattlePassChallenges } from './routes/battlePass.js';
import { handleClanSearch, handleClanDetails } from './routes/clans.js';
import { handleItemsByCategory, handleItemsByTags } from './routes/items.js';
import { handleAvatars } from './routes/avatars.js';
import { handleAnnouncements } from './routes/announcements.js';

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
      const responseData = await handlePlayersSearch(searchParams, requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    if (path === '/roleRotations') {
      const responseData = await handleRoleRotations(requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    if (path === '/roles') {
      const responseData = await handleRoles(requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    if (path === '/shop/activeOffers') {
      const responseData = await handleShopActiveOffers(requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    if (path === '/battlePass/season') {
      const responseData = await handleBattlePassSeason(requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    if (path === '/battlePass/shop') {
      const responseData = await handleBattlePassShop(requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    if (path === '/battlePass/challenges') {
      const responseData = await handleBattlePassChallenges(searchParams, requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    if (path === '/players/highscores') {
      const responseData = await handlePlayersHighscores(searchParams, requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    if (path === '/clans/search') {
      const responseData = await handleClanSearch(searchParams, requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    if (path === '/announcements') {
      const responseData = await handleAnnouncements(searchParams, requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    // Rota para /clan/:id
    const clanMatch = path.match(/^\/clan\/([^/]+)$/);
    if (clanMatch) {
      const id = clanMatch[1];
      const responseData = await handleClanDetails(id, requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    // Rota para /items/:category
    const itemsMatch = path.match(/^\/items\/([^/]+)$/);
    if (itemsMatch) {
      const category = itemsMatch[1];
      
      // Validar categorias
      const validCategories = ['avatarItems', 'bodyPaints', 'avatarItemSets', 'avatarItemCollections', 'bundles', 'calendars', 'tags', 'profileIcons', 'profileIconBorders', 'emojis', 'emojiCollections', 'backgrounds', 'loadingScreens', 'roleIcons', 'advancedRoleCardOffers', 'baseRoleCardOffers', 'roseSkins', 'roses'];

      if (!validCategories.includes(category)) {
        return jsonResponse({ error: 'Categoria de item inválida.' }, 400);
      }

      const responseData = await handleItemsByCategory(category, requestConfig, WOLVESVILLE_API_BASE_URL);
      return jsonResponse(responseData);
    }

    // Rota para /items/tags
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