import { jsonResponse } from './utils/response';
import { requestConfigMiddleware } from './middleware/requestConfig';
import { errorHandler } from './middleware/errorHandler';

// Import all route handlers
import { handleAnnouncements } from './routes/announcements';
import { handleAvatars, handleSharedAvatarId, handleAvatarDetails } from './routes/avatars';
import { handleBattlePassSeason, handleBattlePassShop, handleBattlePassChallenges } from './routes/battlePass';
import { handleClanSearch, handleClanDetails } from './routes/clans';
import { handleItemsByCategory, handleItemsByTags } from './routes/items';
import { handlePlayersSearch, handlePlayersHighscores } from './routes/players';
import { handleRoles, handleRoleRotations } from './routes/roles';
import { handleShopActiveOffers } from './routes/shop';
import { handleItemCategories, handleRoleIds } from './routes/validation';

const routes = [];
const addRoute = (method, path, handler) => {
  const pathRegex = new RegExp(`^${path.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`);
  routes.push({ method, pathRegex, handler });
};

// --- Define Routes ---
const router = {
  get: (path, handler) => addRoute('GET', path, handler),
  post: (path, handler) => addRoute('POST', path, handler),
  all: (path, handler) => addRoute('ALL', path, handler),
};

// Announcements
router.get('/api/announcements', handleAnnouncements);

// Avatars
router.get('/api/avatars/sharedAvatarId/:playerId/:slotNumber', handleSharedAvatarId);
router.get('/api/avatars/:sharedAvatarId', handleAvatarDetails);
router.get('/api/avatars', handleAvatars); 

// Battle Pass
router.get('/api/battlePass/season', handleBattlePassSeason);
router.get('/api/battlePass/shop', handleBattlePassShop);
router.get('/api/battlePass/challenges', handleBattlePassChallenges);

// Clans
router.get('/api/clans/search', handleClanSearch);
router.get('/api/clans/:id', handleClanDetails);
router.get('/api/clan/:id', handleClanDetails); // backward compatibility

// Items
router.get('/api/items/tags', handleItemsByTags);
router.get('/api/items/:category', handleItemsByCategory);

// Players
router.get('/api/players/search', handlePlayersSearch);
router.get('/api/players/highscores', handlePlayersHighscores);

// Roles
router.get('/api/roles', handleRoles);
router.get('/api/roles/rotations', handleRoleRotations);
router.get('/api/roleRotations', handleRoleRotations); // Alias

// Shop
router.get('/api/shop/activeOffers', handleShopActiveOffers);
router.get('/api/shop/active', handleShopActiveOffers); // Alias

// Validation
router.get('/api/validation/item-categories', handleItemCategories);
router.get('/api/validation/roles', handleRoleIds);

// --- Request Handler ---
export async function onRequest(context) {
  const { request, env } = context;
  const { pathname } = new URL(request.url);

  // Attach env to the request object so middleware can access it
  request.env = env;

  try {
    // Run middleware
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
