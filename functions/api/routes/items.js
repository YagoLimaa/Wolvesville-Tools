import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { processItems, parseItemsArray } from '../utils/itemProcessor.js';

export async function handleItemsByCategory(category, requestConfig) {
  if (!category || category.trim().length === 0) {
    return {
      error: 'Category is required',
    };
  }

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/${category}`;
  const response = await fetch(requestUrl, requestConfig);
  const responseData = await response.json();

  const itemsArray = parseItemsArray(responseData);
  return processItems(itemsArray);
}

export async function handleItemsByTags(searchParams, requestConfig) {
  const season = searchParams.get('season');

  try {
    const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/tags`;
    const requestConfig2 = {
      headers: {
        'Authorization': requestConfig.headers.Authorization,
        'Accept': 'application/json'
      }
    };
    const response = await fetch(requestUrl, requestConfig2);
    let tagsData = await response.json();

    if (season) {
      const seasonTag = `origin:battle_pass:season_${season}`;
      tagsData = tagsData.filter(item => item.tags && item.tags.includes(seasonTag));
    }

    return Array.isArray(tagsData) ? tagsData : [];
  } catch (error) {
    console.error("Erro ao buscar tags de itens:", error.message);
    return [];
  }
}
