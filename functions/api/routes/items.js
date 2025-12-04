import { VALID_ITEM_CATEGORIES } from '../utils/constants.js';
import { processItems, parseItemsArray } from '../utils/itemProcessor.js';
import { jsonResponse } from '../utils/response.js';
import { callApi } from '../utils/ApiService.js';

export async function handleItemsByCategory(request) {
  const { category } = request.params;

  if (!VALID_ITEM_CATEGORIES.includes(category)) {
    return jsonResponse({ error: 'Categoria de item inválida.' }, 400);
  }

  const response = await callApi(`items/${category}`, { request });

  if (!response.ok) {
    try {
        const errorData = await response.json();
        return jsonResponse(errorData, response.status);
    } catch (e) {
        return jsonResponse({ error: `A API de origem retornou um erro ${response.status}.` }, response.status);
    }
  }

  try {
    const responseData = await response.json();

    if (category === 'tags') {
      return jsonResponse(responseData);
    }

    const itemsArray = parseItemsArray(responseData);
    const processedItems = processItems(itemsArray);

    return jsonResponse(processedItems);
  } catch (e) {
    console.error(`Falha ao processar a categoria '${category}'. A resposta da origem provavelmente não é um JSON válido. Erro: ${e.message}`);
    return jsonResponse({ error: `Falha ao processar a resposta da API de origem para a categoria: ${category}` }, 502); // 502 Bad Gateway
  }
}

export async function handleItemsByTags(request) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get('season');
  const category = searchParams.get('category');

  // mapeando as categorias para as tags corretas de /items/tags
  const categoryMap = {
    dailyRewards: 'daily_rewards',
    miscellaneous: 'miscellaneous',
    clanQuestsGold: 'clan_quests_gold',
    clanQuestGems: 'clan_quests_gems',
    staffItens: "staff_items",
  };

  const response = await callApi('items/tags', { request });
  let tagsData = await response.json();

  if (!response.ok) {
    return jsonResponse(tagsData, response.status);
  }

  let parsedTags = parseItemsArray(tagsData);

  if (season) {
    const seasonTag = `origin:battle_pass:season_${season}`;
    parsedTags = parsedTags.filter(item => item.tags && item.tags.includes(seasonTag));
  }

  if (category && categoryMap[category]) {
    const origintag = `origin:${categoryMap[category]}`;
    parsedTags = parsedTags.filter(item => item.tags && item.tags.includes(origintag));
  }
  return jsonResponse(parsedTags);
}