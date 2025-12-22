
// Duração padrão do cache em segundos
export const CACHE_DURATIONS = {
  // Curto prazo (5 minutos)
  SHORT: 300,

  // Médio prazo (30 minutos)
  MEDIUM: 1800,

  // Longo prazo (1 hora)
  LONG: 3600,

  // Muito longo (12 horas)
  VERY_LONG: 43200,

  // Máximo (24 horas)
  MAXIMUM: 86400,

  // Sem cache
  NONE: 0,
};

// Configuração de cache por rota
export const CACHE_CONFIG = {
  '/api/announcements': {
    duration: CACHE_DURATIONS.VERY_LONG,
    invalidateOn: ['announcements'],
  },

  '/api/battlePass': {
    duration: CACHE_DURATIONS.VERY_LONG,
    invalidateOn: ['battlePass'],
  },

  '/api/items': {
    duration: CACHE_DURATIONS.VERY_LONG,
    invalidateOn: ['items'],
  },

  '/api/avatars': {
    duration: CACHE_DURATIONS.VERY_LONG,
    invalidateOn: ['avatars'],
  },

  '/api/roles': {
    duration: CACHE_DURATIONS.VERY_LONG,
    invalidateOn: ['roles'],
  },

  '/api/shop': {
    duration: CACHE_DURATIONS.VERY_LONG,
    invalidateOn: ['shop'],
  },

  '/api/clans': {
    duration: CACHE_DURATIONS.VERY_LONG,
    invalidateOn: ['clans'],
  },

  '/api/players/highscores': {
    duration: CACHE_DURATIONS.VERY_LONG,
    invalidateOn: ['players'],
  },

  '/api/players/search': {
    duration: CACHE_DURATIONS.NONE,
    invalidateOn: [],
  },

  '/api/clans/search': {
    duration: CACHE_DURATIONS.NONE,
    invalidateOn: [],
  },
};

// Configuração do CacheManager
export const CACHE_MANAGER_CONFIG = {
  maxEntries: 1000,

  // Intervalo de limpeza em ms (padrão 60 segundos)
  cleanupInterval: 60000,
  verbose: true,
  enableMetrics: true,
};


export const CACHE_EXCLUDE_PARAMS = {

  pagination: ['page', 'offset', 'limit', 'sort'],
  filter: ['filter', 'search'],
  always: ['timestamp', 'debug', 'v'], 
};

export const AUTO_INVALIDATION = {
  // Checar a cada 5 minutos por mudanças
  checkInterval: 300000,

  monitoredTypes: [
    'items',
    'battlePass',
    'roles',
    'shop',
    'announcements',
  ],

  skipTypes: [
    'players',
    'clans',
  ],
};

export default {
  CACHE_DURATIONS,
  CACHE_CONFIG,
  CACHE_MANAGER_CONFIG,
  CACHE_EXCLUDE_PARAMS,
  AUTO_INVALIDATION,
};
