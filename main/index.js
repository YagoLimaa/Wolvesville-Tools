// Carrega as variáveis de ambiente do arquivo .env para process.env
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const { engine } = require('express-handlebars');

const app = express();
// Usa a porta definida no .env ou 3000 como padrão
const PORT = process.env.PORT || 3000;

const WOLVESVILLE_API_KEY = process.env.WOLVESVILLE_API_KEY;
const WOLVESVILLE_API_BASE_URL = 'https://api.wolvesville.com';

// Configuração do Handlebars
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    // Helper para remover quebras de linha e espaços excessivos
    stripAndTrim: function (str) {
      if (typeof str !== 'string') return '';
      return str.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
    },
    // Helper para buscar a imagem da badge com base no ID
    getBadgeImage: function (badgeId) {
      // Retorna o caminho para sua imagem local na pasta public
      return `/images/badges/${badgeId}.png`;
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

// Configura o Express para servir arquivos estáticos (CSS, JS, imagens) da pasta 'public'
app.use(express.static('public'));


// Validação inicial para garantir que a chave da API foi configurada
if (!WOLVESVILLE_API_KEY || WOLVESVILLE_API_KEY === 'SUA_CHAVE_API_VEM_AQUI') {
  console.error('ERRO: A variável de ambiente WOLVESVILLE_API_KEY não foi definida no arquivo .env.');
  console.error('Por favor, adicione sua chave da API ao arquivo .env e reinicie o servidor.');
  process.exit(1); // Encerra o processo se a chave não existir ou não for alterada
}

/**
 * Rota principal: exibe o formulário de busca.
 */
app.get('/', (req, res) => {
  res.render('home');
});

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
      return res.render('players', { query: username, players: [] });
    }

    // Lógica de Paginação
    const totalPages = Math.ceil(allPlayers.length / resultsPerPage);
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const paginatedPlayers = allPlayers.slice(startIndex, endIndex);

    res.render('players', {
      query: username,
      players: paginatedPlayers,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        hasPages: totalPages > 1,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null
      }
    });

  } catch (error) {
    console.error("Erro ao buscar dados da API Wolvesville:", error.message);
    res.render('home', { error: 'Não foi possível conectar à API do Wolvesville. Tente novamente mais tarde.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse http://localhost:${PORT} para começar.`);
});
