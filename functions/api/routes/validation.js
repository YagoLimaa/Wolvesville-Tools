import { VALID_ITEM_CATEGORIES } from '../utils/constants.js';

/**
 * Retorna as categorias de item válidas
 */
export async function handleItemCategories() {
  return {
    categories: VALID_ITEM_CATEGORIES
  };
}

/**
 * Retorna os IDs de papéis válidos
 */
export async function handleRoleIds(requestConfig) {
  const { WOLVESVILLE_API_BASE_URL } = await import('../utils/constants.js');
  
  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/roles`;
    const response = await fetch(requestUrl, requestConfig);
    const responseData = await response.json();

    if (Array.isArray(responseData)) {
      const roleIds = responseData.map(role => role.id);
      return {
        roleIds: roleIds
      };
    }

    return {
      roleIds: []
    };
  } catch (error) {
    console.error('Erro ao buscar IDs de papéis:', error.message);
    return {
      roleIds: []
    };
  }
}
