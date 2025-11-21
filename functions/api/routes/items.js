import { WOLVESVILLE_API_BASE_URL, VALID_ITEM_CATEGORIES } from '../utils/constants.js';
import { processItems, parseItemsArray } from '../utils/itemProcessor.js';
import { jsonResponse } from '../utils/response.js';

export async function handleItemsByCategory(request) {
  const { category } = request.params;

  if (!VALID_ITEM_CATEGORIES.includes(category)) {
    return jsonResponse({ error: 'Categoria de item inválida.' }, 400);
  }

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/${category}`;
  const response = await fetch(requestUrl, request.requestConfig);
  const responseData = await response.json();

  if (category === 'tags') {
    return jsonResponse(responseData);
  }

  const itemsArray = parseItemsArray(responseData);
  const processedItems = processItems(itemsArray);

  return jsonResponse(processedItems);
}

export async function handleItemsByTags(request) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get('season');

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/tags`;
  const response = await fetch(requestUrl, request.requestConfig);
  let tagsData = await response.json();
  let parsedTags = parseItemsArray(tagsData);

  if (season) {
    const seasonTag = `origin:battle_pass:season_${season}`;
    parsedTags = parsedTags.filter(item => item.tags && item.tags.includes(seasonTag));
  }

  return jsonResponse(parsedTags);
}