export const getRequestConfig = (apiKey) => {
  return {
    headers: {
      'Authorization': `Bot ${apiKey}`,
      'Accept': 'application/json'
    }
  };
};

export const requestConfigMiddleware = (req, res, next) => {
  const WOLVESVILLE_API_KEY = process.env.WOLVESVILLE_API_KEY;

  if (!WOLVESVILLE_API_KEY || WOLVESVILLE_API_KEY === 'SUA_CHAVE_API_VEM_AQUI') {
    return res.status(500).json({
      error: 'A chave da API não está configurada no servidor.'
    });
  }

  req.requestConfig = getRequestConfig(WOLVESVILLE_API_KEY);
  req.apiKey = WOLVESVILLE_API_KEY;

  next();
};