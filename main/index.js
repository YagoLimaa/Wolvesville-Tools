const path = require('path');

// Este arquivo não será mais o servidor principal, mas pode ser mantido para desenvolvimento local.
// A lógica principal será movida para /functions/api/[[path]].js para deploy na Cloudflare.
// Para manter o desenvolvimento local funcionando, você pode adaptar este arquivo ou
// usar uma ferramenta como `wrangler` da Cloudflare.
// Por enquanto, vamos focar no deploy.

// As dependências ainda são necessárias para a lógica da API.
const axios = require('axios');
const cors = require('cors');
const express = require('express'); // Mantido para o servidor de desenvolvimento local

if (process.env.NODE_ENV !== 'production') { require('dotenv').config({ path: path.resolve(__dirname, '.env') }); }

const allowedOrigins = [ // A configuração de CORS será gerenciada de outra forma na Cloudflare
  'http://localhost:8080',
  'https://wolvesvilletools.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
].filter(Boolean);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: (origin, callback) => {
    // Para desenvolvimento local, a lógica de CORS permanece.
    // Em produção na Cloudflare, você pode configurar cabeçalhos personalizados se necessário,
    // mas geralmente a origem da requisição será a mesma do seu site,
    // ou você pode configurar domínios personalizados.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

const WOLVESVILLE_API_KEY = process.env.WOLVESVILLE_API_KEY;
const WOLVESVILLE_API_BASE_URL = 'https://api.wolvesville.com';

app.use(express.static('public'));

if (!WOLVESVILLE_API_KEY || WOLVESVILLE_API_KEY === 'SUA_CHAVE_API_VEM_AQUI') {
  console.error('ERRO: A variável de ambiente WOLVESVILLE_API_KEY não foi definida no arquivo .env.');
  console.error('Por favor, adicione sua chave da API ao arquivo .env e reinicie o servidor.');
  process.exit(1); 
}

const apiRouter = express.Router();
// A lógica abaixo será movida para /functions/api/[[path]].js
apiRouter.get('/search', async (req, res) => {
  const { username } = req.query;
  const page = parseInt(req.query.page) || 1;
  const resultsPerPage = 5;

  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/players/search`;
    const requestConfig = {
      params: { username },
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };

    const response = await axios.get(requestUrl, requestConfig);

    // Garante que allPlayers seja sempre um array.
    // Se a API retornar um objeto (ex: em caso de não encontrar resultados),
    // ele será convertido para um array vazio.
    let allPlayers;
    if (Array.isArray(response.data)) {
      allPlayers = response.data;
    } else if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
      allPlayers = [response.data];
    } else {
      allPlayers = [];
    }

    // Para cada jogador encontrado, busca os detalhes do clã se ele tiver um clanId
    for (const player of allPlayers) {
      if (player.clanId) {
        try {
          const clanUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${player.clanId}/info`;
          const clanResponse = await axios.get(clanUrl, {
            headers: {
              'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
              'Accept': 'application/json'
            }
          });
          player.clan = { id: player.clanId, name: clanResponse.data.name };
        } catch (clanError) {
          console.error(`Erro ao buscar detalhes do clã ${player.clanId}:`, clanError.message);
          player.clan = null; // Garante que não haverá erro no template se a busca do clã falhar
        }
      }
    }

    if (!allPlayers || allPlayers.length === 0) {
      return res.json({
        players: [],
        pagination: { currentPage: 1, totalPages: 1 }
      });
    }

    const totalPages = Math.ceil(allPlayers.length / resultsPerPage);
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const paginatedPlayers = allPlayers.slice(startIndex, endIndex);

    // Em vez de renderizar uma página HTML, enviamos os dados em formato JSON.
    // A estrutura do objeto (players, pagination) corresponde ao que o frontend espera.
    res.json({
      players: paginatedPlayers,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        hasPages: totalPages > 1,
        prevPage: page > 1 ? page - 1 : undefined,
        nextPage: page < totalPages ? page + 1 : undefined
      }
    });

  } catch (error) {
    console.error("Erro ao buscar dados da API Wolvesville:", error.message);
    res.status(500).json({ error: 'Não foi possível conectar à API do Wolvesville. Tente novamente mais tarde.' });
  }
});

apiRouter.get('/roleRotations', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/roleRotations`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };
    const response = await axios.get(requestUrl, requestConfig);

    const formattedRotations = response.data.map(rotationData => {
      const roles = (rotationData.roleRotations && rotationData.roleRotations.length > 0)
        ? rotationData.roleRotations[0].roleRotation.roles.flat().map(roleIdentifier => {
            let roleId = typeof roleIdentifier === 'string' ? roleIdentifier : roleIdentifier.role;
            if (roleId === 'red-lady') {
              roleId = 'harlot';
            }
            return { id: roleId }; 
          }).filter(Boolean) 
        : [];

      return {
        gameMode: rotationData.gameMode,
        // Usa gameModeName se existir, senão formata o gameMode
        gameModeName: rotationData.gameModeName || rotationData.gameMode.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        roles: roles
      };
    });

    // Filtra as rotações para não incluir as ligas ranqueadas Prata e Ouro
    const filteredRotations = formattedRotations.filter(rotation => 
      rotation.gameMode !== 'ranked-league-silver' && rotation.gameMode !== 'ranked-league-gold'
    );

    // Define a ordem desejada para os modos de jogo
    const desiredOrder = ['quick', 'crazy-fun', 'advanced', 'sandbox'];

    const sortedRotations = filteredRotations.sort((a, b) => {
      const indexA = desiredOrder.indexOf(a.gameMode);
      const indexB = desiredOrder.indexOf(b.gameMode);

      // Se um dos modos não estiver na lista de ordem, ele vai para o final
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

    res.json(sortedRotations);

  } catch (error) {
    console.error("Erro ao buscar rotação de roles:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar a rotação de roles. Tente novamente mais tarde.' });
  }
});

apiRouter.get('/roles', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/roles`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };
    const response = await axios.get(requestUrl, requestConfig);
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar a lista de roles:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar a lista de roles.' });
  }
});

apiRouter.get('/shop/activeOffers', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/shop/activeOffers`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };
    const response = await axios.get(requestUrl, requestConfig);
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar ofertas da loja:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar as ofertas da loja. Tente novamente mais tarde.' });
  }
});

apiRouter.get('/battlePass/season', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/season`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };
    const response = await axios.get(requestUrl, requestConfig);
    // Envia os dados brutos da API, a lógica da imagem será tratada no frontend
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar dados da temporada do Battle Pass:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar os dados da temporada.' });
  }
});

apiRouter.get('/battlePass/shop', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/shop`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };
    const response = await axios.get(requestUrl, requestConfig);
    // Envia os dados brutos da API, a lógica de exibição será tratada no frontend
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar dados da loja do Battle Pass:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar os dados da loja do passe.' });
  }
});

apiRouter.get('/battlePass/challenges', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/challenges`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      },
      params: {
        locale: req.query.locale || 'en'
      }
    };
    const response = await axios.get(requestUrl, requestConfig);
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar desafios do Battle Pass:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar os desafios do passe.' });
  }
});

apiRouter.get('/players/highscores', async (req, res) => {
  try {
    const type = 'oldRank';
    const { limit = 10 } = req.query;

    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/players/highscores`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      },
      params: { type, limit }
    };
    const response = await axios.get(requestUrl, requestConfig);

    // A API não respeita o 'limit' para 'oldRank', então cortamos a lista manualmente.
    const allPlayersFromApi = response.data.allTime || [];
    // Garante que vamos processar apenas o número de jogadores solicitado no 'limit'.
    const highscorePlayers = allPlayersFromApi.slice(0, limit);

    // Busca os detalhes de todos os jogadores em paralelo para otimizar o tempo
    const playerDetailPromises = highscorePlayers.map(player => {
      const playerDetailsUrl = `${WOLVESVILLE_API_BASE_URL}/players/${player.playerId}`;
      return axios.get(playerDetailsUrl, {
        headers: {
          'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
          'Accept': 'application/json'
        }
      }).then(detailsResponse => ({ ...player, ...detailsResponse.data }))
        .catch(detailsError => {
          console.error(`Erro ao buscar detalhes para o jogador ${player.username}:`, detailsError.message);
          return player; // Retorna o jogador sem detalhes em caso de erro
        });
    });

    const detailedPlayers = await Promise.all(playerDetailPromises);

    res.json(detailedPlayers);

  } catch (error) {
    console.error("Erro ao buscar highscores:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar os highscores.' });
  }
});

apiRouter.get('/clans/search', async (req, res) => {
  const { name, language } = req.query;

  try {
    const searchUrl = `${WOLVESVILLE_API_BASE_URL}/clans/search`;
    
    const searchParams = {};
    if (name) {
      searchParams.name = name;
    }
    if (language && language.toLowerCase() !== 'all') {
      searchParams.language = language;
    }

    const searchConfig = {
      params: searchParams, 
      headers: { 'Authorization': `Bot ${WOLVESVILLE_API_KEY}`, 'Accept': 'application/json' }
    };
    const searchResponse = await axios.get(searchUrl, searchConfig);

    const clansFound = Array.isArray(searchResponse.data) ? searchResponse.data : [];
    
    res.json(clansFound);

  } catch (error) {
    console.error("Erro ao buscar clãs:", error.message);
    // Passa o erro da API externa através, se possível
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: 'Não foi possível buscar os clãs. Tente novamente mais tarde.' });
  }
});

apiRouter.get('/clan/:id', async (req, res) => {
  const { id } = req.params;
  const headers = { 'Authorization': `Bot ${WOLVESVILLE_API_KEY}`, 'Accept': 'application/json' };

  try {
    const infoUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${id}/info`;
    const membersUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${id}/members/detailed`;

    const [infoResponse, membersResponse] = await Promise.all([
      axios.get(infoUrl, { headers }),
      axios.get(membersUrl, { headers })
    ]);

    if (!infoResponse.data || !infoResponse.data.id) {
      return res.status(404).json({ error: `Clan with ID ${id} not found.` });
    }

    const membersWithDetailsPromises = membersResponse.data.map(async (member) => {
        try {
            const playerDetailsUrl = `${WOLVESVILLE_API_BASE_URL}/players/${member.playerId}`;
            const playerDetailsResponse = await axios.get(playerDetailsUrl, { headers });
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

    res.json(combinedData);

  } catch (error) {
    console.error(`Erro ao buscar dados do clã ${id}:`, error.message);
    res.status(500).json({ error: 'Não foi possível buscar os dados do clã.' });
  }
});

apiRouter.get('/announcements', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/announcements`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };
    const response = await axios.get(requestUrl, requestConfig);
    // A API retorna os anúncios mais recentes primeiro, vamos manter essa ordem.
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar os anúncios.' });
  }
});


apiRouter.get('/items/:category', async (req, res) => {
  const { category } = req.params;
  // Lista de categorias válidas para segurança
  const validCategories = ['avatarItems', 'bodyPaints', 'avatarItemSets', 'avatarItemCollections', 'bundles', 'calendars', 'tags', 'profileIcons', 'profileIconBorders', 'emojis', 'emojiCollections', 'backgrounds', 'loadingScreens', 'roleIcons', 'advancedRoleCardOffers', 'baseRoleCardOffers', 'roseSkins', 'advancedRoleCardOffers'];

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Categoria de item inválida.' });
  }

  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/${category}`;
    const requestConfig = { headers: { 'Authorization': `Bot ${WOLVESVILLE_API_KEY}`, 'Accept': 'application/json' } };

    const response = await axios.get(requestUrl, requestConfig);

    // Normaliza a resposta para garantir que sempre seja um array de itens
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
      // Garante que imageUrl exista, pegando de fontes alternativas
      if (!newItem.imageUrl) {
        newItem.imageUrl = newItem.promoImageUrl || newItem.iconUrl || (newItem.image && newItem.image.url) || newItem.singleImageUrl || newItem.urlPreview || (newItem.imageDay && newItem.imageDay.url) || (newItem.imageSmall && newItem.imageSmall.url);
      }
      // Garante que o nome exista, derivando da URL se necessário
      if (!newItem.name) {
        newItem.name = newItem.title || getNameFromUrl(newItem.imageUrl);
      }
      if (newItem.rarity) {
        newItem.rarity = String(newItem.rarity).toLowerCase();
      }
      return newItem;
    });

    res.json(processedItems);
  } catch (error) {
    console.error(`Erro ao buscar itens da categoria ${category}:`, error.message);
    res.status(500).json({ error: `Não foi possível buscar os itens da categoria ${category}.` });
  }
});

app.use('/api', apiRouter);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`API pronta para receber requisições em :${PORT}`);
  });
}

module.exports = app;