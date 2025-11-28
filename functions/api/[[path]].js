import { jsonResponse } from './utils/response';
import { requestConfigMiddleware } from './middleware/requestConfig';
import { errorHandler } from './middleware/errorHandler';

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

router.get('/api/proxy', handleProxy);
router.get('/api/announcements', handleAnnouncements);

// tudo relacionados para avatares
router.get('/api/avatars/sharedAvatarId/:playerId/:slotNumber', handleSharedAvatarId);
router.get('/api/avatars/:sharedAvatarId', handleAvatarDetails);
router.get('/api/avatars', handleAvatars); 

// tudo de battle pass
router.get('/api/battlePass/season', handleBattlePassSeason);
router.get('/api/battlePass/shop', handleBattlePassShop);
router.get('/api/battlePass/challenges', handleBattlePassChallenges);

// tudo de clans
router.get('/api/clans/search', handleClanSearch);
router.get('/api/clans/:id', handleClanDetails);

// tudo de items
router.get('/api/items/tags', handleItemsByTags);
router.get('/api/items/:category', handleItemsByCategory);

// tudo de jogadores
router.get('/api/players/search', handlePlayersSearch);
router.get('/api/players/highscores', handlePlayersHighscores);

// tudo sobre as funções de roles
router.get('/api/roles', handleRoles);
router.get('/api/roleRotations', handleRoleRotations); 

// loja
router.get('/api/shop/activeOffers', handleShopActiveOffers);

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
