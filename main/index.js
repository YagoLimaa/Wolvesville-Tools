// Carrega as variáveis de ambiente do arquivo .env para process.env
const path = require('path');

const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Importa o pacote cors

const app = express();
// Usa a porta definida no .env ou 3000 como padrão
const PORT = process.env.PORT || 3000;

const WOLVESVILLE_API_KEY = process.env.WOLVESVILLE_API_KEY;
const WOLVESVILLE_API_BASE_URL = 'https://api.wolvesville.com';

// Configura o Express para servir arquivos estáticos (CSS, JS, imagens) da pasta 'public'
app.use(express.static('public'));

// Habilita o CORS para permitir requisições do frontend
const allowedOrigins = [
  'http://localhost:8080',
  'https://wolvesvilletools.vercel.app', // Sua URL de desenvolvimento do frontend
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Validação inicial para garantir que a chave da API foi configurada
if (!WOLVESVILLE_API_KEY || WOLVESVILLE_API_KEY === 'SUA_CHAVE_API_VEM_AQUI') {
  console.error('ERRO: A variável de ambiente WOLVESVILLE_API_KEY não foi definida no arquivo .env.');
  console.error('Por favor, adicione sua chave da API ao arquivo .env e reinicie o servidor.');
  process.exit(1); // Encerra o processo se a chave não existir ou não for alterada
}

/**
 * Rota principal: exibe o formulário de busca.
 */
/**
 * Rota de busca: processa o formulário, busca na API e exibe os resultados com paginação.
 */
app.get('/search', async (req, res) => {
  const { username } = req.query;
  const page = parseInt(req.query.page) || 1;
  const resultsPerPage = 5; // Defina quantos resultados por página

  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/players/search`;
    const requestConfig = {
      params: { username },
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };

    // --- Informações de Debug ---
    console.log('--- Iniciando requisição para a API ---');
    console.log('URL de destino:', requestUrl);
    console.log('Parâmetros:', requestConfig.params);
    console.log('Headers enviados:', requestConfig.headers);
    console.log('------------------------------------');
    const response = await axios.get(requestUrl, requestConfig);

    // Garante que allPlayers seja sempre um array.
    // Se a API retornar um objeto (ex: em caso de não encontrar resultados),
    // ele será convertido para um array vazio.
    let allPlayers;
    if (Array.isArray(response.data)) {
      allPlayers = response.data; // A resposta já é um array
    } else if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
      allPlayers = [response.data]; // A resposta é um objeto único, transforma em array
    } else {
      allPlayers = []; // A resposta é um objeto vazio ou outro formato, considera como sem resultados
    }

    // Para cada jogador encontrado, busca os detalhes do clã se ele tiver um clanId
    for (const player of allPlayers) {
      if (player.clanId) {
        try {
          const clanUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${player.clanId}/info`;
          console.log(`Buscando informações do clã em: ${clanUrl}`);
          const clanResponse = await axios.get(clanUrl, {
            headers: {
              'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
              'Accept': 'application/json'
            }
          });
          // Adiciona um objeto simplificado contendo apenas o nome do clã
          player.clan = { name: clanResponse.data.name };
        } catch (clanError) {
          console.error(`Erro ao buscar detalhes do clã ${player.clanId}:`, clanError.message);
          player.clan = null; // Garante que não haverá erro no template se a busca do clã falhar
        }
      }
    }

    if (!allPlayers || allPlayers.length === 0) {
      // Se nenhum jogador for encontrado, retorna uma estrutura JSON vazia
      // que o frontend consegue entender.
      return res.json({
        players: [],
        pagination: { currentPage: 1, totalPages: 1 }
      });
    }

    // Lógica de Paginação
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
    // Em caso de erro, envia uma resposta de erro em JSON
    res.status(500).json({ error: 'Não foi possível conectar à API do Wolvesville. Tente novamente mais tarde.' });
  }
});

/**
 * Rota para buscar a rotação de roles ativa.
 */
app.get('/roleRotations', async (req, res) => {
  try {
    // Usando o endpoint /roleRotations conforme solicitado
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/roleRotations`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };

    console.log(`--- Iniciando requisição para ${requestUrl} ---`);
    const response = await axios.get(requestUrl, requestConfig);
    console.log('--- Requisição para /roleRotations bem-sucedida ---');


    // Processa cada modo de jogo retornado pela API
    const formattedRotations = response.data.map(rotationData => {
      const roles = (rotationData.roleRotations && rotationData.roleRotations.length > 0)
        ? rotationData.roleRotations[0].roleRotation.roles.flat().map(r => {
            // A API pode retornar um array de strings ou um objeto com a propriedade 'role'
            const roleName = typeof r === 'string' ? r : r.role;
            if (!roleName) return null;
            return {
              id: roleName,
              name: roleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              // Simplificado para usar caminhos relativos. O frontend decidirá qual usar.
              // O ideal é ter uma convenção (ex: sempre usar .png ou ter um endpoint que retorne a URL correta)
              imageUrl: `/images/roles/${roleName}.png`
            };
          }).filter(Boolean) // Remove quaisquer roles nulas ou vazias
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

/**
 * Rota para buscar as ofertas ativas da loja.
 */
app.get('/shop/activeOffers', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/shop/activeOffers`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };

    console.log(`--- Iniciando requisição para ${requestUrl} ---`);
    const response = await axios.get(requestUrl, requestConfig);
    console.log('--- Requisição para /shop/activeOffers bem-sucedida ---');

    res.json(response.data);

  } catch (error) {
    console.error("Erro ao buscar ofertas da loja:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar as ofertas da loja. Tente novamente mais tarde.' });
  }
});

/**
 * Rota para buscar os dados da temporada atual do Battle Pass.
 */
app.get('/battlePass/season', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/season`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };

    console.log(`--- Iniciando requisição para ${requestUrl} ---`);
    const response = await axios.get(requestUrl, requestConfig);
    console.log('--- Requisição para /battlePass/season bem-sucedida ---');

    // Envia os dados brutos da API, a lógica da imagem será tratada no frontend
    res.json(response.data);

  } catch (error) {
    console.error("Erro ao buscar dados da temporada do Battle Pass:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar os dados da temporada.' });
  }
});

/**
 * Rota para buscar os dados da loja da temporada do Battle Pass.
 */
app.get('/battlePass/shop', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/shop`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      }
    };

    console.log(`--- Iniciando requisição para ${requestUrl} ---`);
    const response = await axios.get(requestUrl, requestConfig);
    console.log('--- Requisição para /battlePass/shop bem-sucedida ---');

    // Envia os dados brutos da API, a lógica de exibição será tratada no frontend
    res.json(response.data);

  } catch (error) {
    console.error("Erro ao buscar dados da loja do Battle Pass:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar os dados da loja do passe.' });
  }
});

/**
 * Rota para buscar os desafios ativos do Battle Pass.
 */
app.get('/battlePass/challenges', async (req, res) => {
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/battlePass/challenges`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      },
      // Passa o locale para a API do Wolvesville, usando 'pt' como padrão.
      params: {
        locale: req.query.locale || 'pt'
      }
    };

    console.log(`--- Iniciando requisição para ${requestUrl} ---`);
    const response = await axios.get(requestUrl, requestConfig);
    console.log('--- Requisição para /battlePass/challenges bem-sucedida ---');

    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar desafios do Battle Pass:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar os desafios do passe.' });
  }
});

/**
 * Rota para buscar os highscores dos jogadores.
 */
app.get('/players/highscores', async (req, res) => {
  try {
    // Define 'xp' como o tipo de ranking padrão e busca o limite da query.
    const type = 'oldRank'; // Mantém o tipo de ranking
    const { limit = 10 } = req.query; // Reintroduz o limite, com 10 como padrão

    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/players/highscores`;
    const requestConfig = {
      headers: {
        'Authorization': `Bot ${WOLVESVILLE_API_KEY}`,
        'Accept': 'application/json'
      },
      params: { type, limit } // Adiciona o 'limit' à requisição para a API
    };

    console.log(`--- Iniciando requisição para ${requestUrl} com params: ${JSON.stringify(requestConfig.params)} ---`);
    const response = await axios.get(requestUrl, requestConfig);
    console.log('--- Requisição para /players/highscores bem-sucedida ---');

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

    // Aguarda todas as requisições de detalhes terminarem
    const detailedPlayers = await Promise.all(playerDetailPromises);

    res.json(detailedPlayers);

  } catch (error) {
    console.error("Erro ao buscar highscores:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar os highscores.' });
  }
});

/**
 * Rota para buscar clãs por nome e enriquecer com detalhes e membros.
 */
app.get('/clans/search', async (req, res) => {
  const { name, language } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'O nome do clã é obrigatório.' });
  }

  try {
    // 1. Busca clãs pelo nome e idioma
    const searchUrl = `${WOLVESVILLE_API_BASE_URL}/clans/search`;
    const searchConfig = {
      params: { name, language: language || 'pt-br' }, // Usa 'pt-br' como padrão se nenhum idioma for fornecido
      headers: { 'Authorization': `Bot ${WOLVESVILLE_API_KEY}`, 'Accept': 'application/json' }
    };
    console.log(`--- Buscando clãs com nome: ${name} ---`);
    const searchResponse = await axios.get(searchUrl, searchConfig);

    const clansFound = searchResponse.data;
    if (!clansFound || clansFound.length === 0) {
      return res.json([]); // Retorna array vazio se nenhum clã for encontrado
    }

    // 2. Para cada clã, busca informações detalhadas e membros em paralelo
    const detailedClansPromises = clansFound.map(async (clan) => {
      try {
        const infoUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${clan.id}/info`; // Busca informações do clã
        const membersUrl = `${WOLVESVILLE_API_BASE_URL}/clans/${clan.id}/members/detailed`; // Busca membros com detalhes
        const headers = { 'Authorization': `Bot ${WOLVESVILLE_API_KEY}`, 'Accept': 'application/json' };

        // Busca info e membros simultaneamente
        const [infoResponse, membersResponse] = await Promise.all([
          axios.get(infoUrl, { headers }),
          axios.get(membersUrl, { headers })
        ]);

        // Combina os dados do clã com as informações e membros
        return {
          ...clan,
          ...infoResponse.data,
          members: membersResponse.data,
        };
      } catch (detailsError) {
        console.error(`Erro ao buscar detalhes para o clã ${clan.id}:`, detailsError.message);
        return null; // Retorna nulo se houver erro ao buscar detalhes
      }
    });

    const detailedClans = (await Promise.all(detailedClansPromises)).filter(Boolean); // Filtra clãs nulos

    res.json(detailedClans);

  } catch (error) {
    console.error("Erro ao buscar clãs:", error.message);
    res.status(500).json({ error: 'Não foi possível buscar os clãs. Tente novamente mais tarde.' });
  }
});


app.get('/items/:category', async (req, res) => {
  const { category } = req.params;
  // Lista de categorias válidas para segurança
  const validCategories = ['avatarItems', 'bodyPaints', 'avatarItemSets', 'avatarItemCollections', 'bundles', 'calendars', 'tags', 'profileIcons', 'profileIconBorders', 'emojis', 'emojiCollections', 'backgrounds', 'loadingScreens', 'roleIcons', 'advancedRoleCardOffers', 'baseRoleCardOffers', 'roseSkins', 'advancedRoleCardOffers'];

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Categoria de item inválida.' });
  }

  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/${category}`;
    const requestConfig = { headers: { 'Authorization': `Bot ${WOLVESVILLE_API_KEY}`, 'Accept': 'application/json' } };

    console.log(`--- Iniciando requisição para ${requestUrl} ---`);
    const response = await axios.get(requestUrl, requestConfig);

    // Normaliza a resposta para garantir que sempre seja um array de itens
    const itemsArray = Array.isArray(response.data) ? response.data : (response.data.list ? Object.values(response.data.list) : Object.values(response.data));

    // Função para extrair nome da URL se não existir
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

    // Processa cada item para garantir que tenha imageUrl e name
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
      // Converte raridade para minúsculas
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

// Inicia o servidor para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`API pronta para receber requisições em :${PORT}`);
  });
}

// Exporta o app para a Vercel
module.exports = app;
