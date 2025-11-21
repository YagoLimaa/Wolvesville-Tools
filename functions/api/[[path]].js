// Importar todos os módulos de rotas
import { handlePlayersSearch, handlePlayersHighscores } from './routes/players.js';
import { handleRoles, handleRoleRotations } from './routes/roles.js';
import { handleShopActiveOffers } from './routes/shop.js';
import { handleBattlePassSeason, handleBattlePassShop, handleBattlePassChallenges } from './routes/battlePass.js';
import { handleClanSearch, handleClanDetails } from './routes/clans.js';
import { handleItemsByCategory, handleItemsByTags } from './routes/items.js';
import { handleAvatars } from './routes/avatars.js';
import { handleAnnouncements } from './routes/announcements.js';
import { handleItemCategories, handleRoleIds } from './routes/validation.js';

// Importar utilitários
import { VALID_ITEM_CATEGORIES } from './utils/constants.js';
import { getRequestConfig, jsonResponse } from './utils/response.js';

// Função principal que será executada pela Cloudflare
export async function onRequest(context) {
  const path = `/${context.params.path.join('/')}`;
  const url = new URL(context.request.url);
  const { searchParams } = url;

  const WOLVESVILLE_API_KEY = context.env.WOLVESVILLE_API_KEY;

  if (!WOLVESVILLE_API_KEY || WOLVESVILLE_API_KEY === 'SUA_CHAVE_API_VEM_AQUI') {
    return jsonResponse({ error: 'A chave da API não está configurada no servidor.' }, 500);
  }

  const requestConfig = getRequestConfig(WOLVESVILLE_API_KEY);

  try {
    // Roteamento baseado no caminho da URL
    if (path === '/players/search') {
      const responseData = await handlePlayersSearch(searchParams, requestConfig);
      return jsonResponse(responseData);
    }

    if (path === '/players/highscores') {
      const responseData = await handlePlayersHighscores(searchParams, requestConfig);
      return jsonResponse(responseData);
    }

    if (path === '/roleRotations') {
      const responseData = await handleRoleRotations(requestConfig);
      return jsonResponse(responseData);
    }

    if (path === '/roles') {
      const responseData = await handleRoles(requestConfig);
      return jsonResponse(responseData);
    }

    if (path === '/shop/activeOffers') {
      const responseData = await handleShopActiveOffers(requestConfig);
      return jsonResponse(responseData);
    }

    if (path === '/battlePass/season') {
      const responseData = await handleBattlePassSeason(requestConfig);
      return jsonResponse(responseData);
    }

    if (path === '/battlePass/shop') {
      const responseData = await handleBattlePassShop(requestConfig);
      return jsonResponse(responseData);
    }

    if (path === '/battlePass/challenges') {
      const responseData = await handleBattlePassChallenges(searchParams, requestConfig);
      return jsonResponse(responseData);
    }

    if (path === '/clans/search') {
      const responseData = await handleClanSearch(searchParams, requestConfig);
      return jsonResponse(responseData);
    }

    if (path === '/announcements') {
      const responseData = await handleAnnouncements(searchParams, requestConfig);
      return jsonResponse(responseData);
    }

    // Validation routes
    if (path === '/validation/item-categories') {
      const responseData = await handleItemCategories();
      return jsonResponse(responseData);
    }

    if (path === '/validation/roles') {
      const responseData = await handleRoleIds(requestConfig);
      return jsonResponse(responseData);
    }

    // Rota para /clan/:id
    const clanMatch = path.match(/^\/clan\/([^/]+)$/);
    if (clanMatch) {
      const id = clanMatch[1];
      const responseData = await handleClanDetails(id, requestConfig);
      return jsonResponse(responseData);
    }

    // Rota para /items/:category
    const itemsMatch = path.match(/^\/items\/([^/]+)$/);
    if (itemsMatch) {
      const category = itemsMatch[1];
      
      // Validar categorias
      if (!VALID_ITEM_CATEGORIES.includes(category)) {
        return jsonResponse({ error: 'Categoria de item inválida.' }, 400);
      }

      const responseData = await handleItemsByCategory(category, requestConfig);
      return jsonResponse(responseData);
    }

    // Rota para /items/tags
    if (path === '/items/tags') {
      const responseData = await handleItemsByTags(searchParams, requestConfig);
      return jsonResponse(responseData);
    }

    // Rota para /avatars/sharedAvatarId/:playerId/:slotNumber
    const sharedIdMatch = path.match(/^\/avatars\/sharedAvatarId\/([^/]+)\/([^/]+)$/);
    if (sharedIdMatch) {
      const [, playerId, slotNumber] = sharedIdMatch;
      const { WOLVESVILLE_API_BASE_URL } = await import('./utils/constants.js');
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
        const { WOLVESVILLE_API_BASE_URL } = await import('./utils/constants.js');
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