export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  console.error('Erro na API:', err.message);

  if (err.response?.status === 404) {
    return res.status(404).json({
      error: 'Recurso não encontrado na API Wolvesville.'
    });
  }

  if (err.response?.status === 401 || err.response?.status === 403) {
    return res.status(401).json({
      error: 'Não autorizado. Verifique sua chave de API.'
    });
  }

  res.status(500).json({
    error: 'Erro interno do servidor.'
  });
};