const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SearchParams extends PaginationParams {
  [key: string]: string | number | undefined;
}

export async function apiGet<T = unknown>(
  endpoint: string,
  params?: SearchParams
): Promise<ApiResponse<T>> {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Failed to fetch data',
        status: response.status,
      };
    }

    return {
      data: data as T,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

export const playerApi = {
  search: (username: string, page?: number) =>
    apiGet('/players/search', { username, page }),

  highscores: (limit?: number) =>
    apiGet('/players/highscores', { limit }),
};

export const itemsApi = {
  getCategory: (category: string) =>
    apiGet(`/items/${category}`),

  getTags: (season?: string) =>
    apiGet('/items/tags', { season }),
};

export const rolesApi = {
  getAll: () => apiGet<unknown>('/roles'),

  getRotations: () => apiGet<unknown[]>('/roleRotations'),
};

export const battlePassApi = {
  getSeason: () => apiGet('/battlePass/season'),

  getShop: () => apiGet('/battlePass/shop'),

  getChallenges: (locale?: string) =>
    apiGet('/battlePass/challenges', { locale }),
};

export const clansApi = {
  search: (name: string, language?: string, open?: boolean) =>
    apiGet('/clans/search', { name, language, open: open ? 'true' : undefined }),

  getDetails: (id: string) =>
    apiGet(`/clans/${id}`),
};

export const shopApi = {
  getActiveOffers: () =>
    apiGet('/shop/activeOffers'),
};


export const announcementsApi = {
  getAll: (locale?: string) =>
    apiGet('/announcements', { locale }),
};

export interface AvatarDetailsResponse {
  items: Record<string, string>;
}


export const avatarsApi = {
  getSharedId: (playerId: string, slotNumber: number) =>
    apiGet<string>(`/avatars/sharedAvatarId/${playerId}/${slotNumber}`),

  getDetails: (sharedAvatarId: string) =>
    apiGet<AvatarDetailsResponse>(`/avatars/${sharedAvatarId}`),
};

export const validationApi = {

  getItemCategories: () =>
    apiGet<string[]>('/validation/item-categories'),
  getRoleIds: () =>
    apiGet<string[]>('/validation/roles'),
};
