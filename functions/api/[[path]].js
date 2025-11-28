import { jsonResponse } from './utils/response';
import { requestConfigMiddleware } from './middleware/requestConfig';
import { errorHandler } from './middleware/errorHandler';
import { withCache } from './utils/cache';

import { handleAnnouncements } from './routes/announcements';
import { handleAvatars, handleSharedAvatarId, handleAvatarDetails } from './routes/avatars';
import { handleBattlePassSeason, handleBattlePassShop, handleBattlePassChallenges } from './routes/battlePass';
import { handleClanSearch, handleClanDetails } from './routes/clans';
import { handleItemsByCategory, handleItemsByTags } from './routes/items';
import { handlePlayersSearch, handlePlayersHighscores } from './routes/players';
import { handleRoles, handleRoleRotations } from './routes/roles';
import { handleShopActiveOffers } from './routes/shop';
import { handleItemCategories, handleRoleIds } from './routes/validation';
import { handleProxy } from './routes/proxy';

const routes = [];
const addRoute = (method, path, handler) => {
  const pathRegex = new RegExp(`^${path.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`);
  routes.push({ method, pathRegex, handler });
};

const router = {
  get: (path, handler) => addRoute('GET', path, handler),
  post: (path, handler) => addRoute('POST', path, handler),
  all: (path, handler) => addRoute('ALL', path, handler),
};

const CACHE_DURATION_12_HOURS = 43200;

router.get('/api/proxy', handleProxy);
router.get('/api/announcements', withCache(handleAnnouncements, CACHE_DURATION_12_HOURS));

// tudo relacionados para avatares
router.get('/api/avatars/sharedAvatarId/:playerId/:slotNumber', withCache(handleSharedAvatarId, CACHE_DURATION_12_HOURS));
router.get('/api/avatars/:sharedAvatarId', withCache(handleAvatarDetails, CACHE_DURATION_12_HOURS));
router.get('/api/avatars', withCache(handleAvatars, CACHE_DURATION_12_HOURS));

// tudo de battle pass
router.get('/api/battlePass/season', withCache(handleBattlePassSeason, CACHE_DURATION_12_HOURS));
router.get('/api/battlePass/shop', withCache(handleBattlePassShop, CACHE_DURATION_12_HOURS));
router.get('/api/battlePass/challenges', withCache(handleBattlePassChallenges, CACHE_DURATION_12_HOURS));

// tudo de clans
router.get('/api/clans/search', handleClanSearch);
router.get('/api/clans/:id', withCache(handleClanDetails, CACHE_DURATION_12_HOURS));

// tudo de items
router.get('/api/items/tags', withCache(handleItemsByTags, CACHE_DURATION_12_HOURS));
router.get('/api/items/:category', withCache(handleItemsByCategory, CACHE_DURATION_12_HOURS));

// tudo de jogadores
router.get('/api/players/search', handlePlayersSearch);
router.get('/api/players/highscores', withCache(handlePlayersHighscores, CACHE_DURATION_12_HOURS));

// tudo sobre as funções de roles
router.get('/api/roles', withCache(handleRoles, CACHE_DURATION_12_HOURS));
router.get('/api/roleRotations', withCache(handleRoleRotations, CACHE_DURATION_12_HOURS));

// loja
router.get('/api/shop/activeOffers', withCache(handleShopActiveOffers, CACHE_DURATION_12_HOURS));

// fazer as validações
router.get('/api/validation/item-categories', handleItemCategories);
router.get('/api/validation/roles', handleRoleIds);

export async function onRequest(context) {
  const { request, env } = context;
  const { pathname } = new URL(request.url);

  request.env = env;

  try {
    const middlewareResponse = requestConfigMiddleware(request);
    if (middlewareResponse) return middlewareResponse;

    for (const route of routes) {
      if (request.method === route.method || route.method === 'ALL') {
        const match = pathname.match(route.pathRegex);
        if (match) {
          request.params = match.groups || {};
          return await route.handler(request);
        }
      }
    }

    return jsonResponse({ error: 'Rota não encontrada' }, 404);
  } catch (err) {
    return errorHandler(err, request);
  }
}
