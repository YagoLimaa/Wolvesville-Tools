export async function handleItemsByCategory(category, requestConfig, WOLVESVILLE_API_BASE_URL) {
  if (!category || category.trim().length === 0) {
    return {
      error: 'Category is required',
    };
  }

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/${category}`;
  const response = await fetch(requestUrl, requestConfig);
  const responseData = await response.json();

  let itemsArray = [];
  if (Array.isArray(responseData)) {
    itemsArray = responseData;
  } else if (responseData.list) {
    itemsArray = Object.values(responseData.list);
  } else {
    itemsArray = Object.values(responseData);
  }

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

  const processedItems = itemsArray.map(item => {
    const newItem = { ...item };
    if (!newItem.imageUrl) {
      newItem.imageUrl = newItem.promoImageUrl || newItem.iconUrl || (newItem.image && newItem.image.url) || newItem.singleImageUrl || newItem.urlPreview || (newItem.imageDay && newItem.imageDay.url) || (newItem.imageSmall && newItem.imageSmall.url);
    }
    if (!newItem.name) {
      newItem.name = newItem.title || getNameFromUrl(newItem.imageUrl);
    }
    if (newItem.rarity) {
      newItem.rarity = String(newItem.rarity).toLowerCase();
    }
    return newItem;
  });

  return processedItems;
}

export async function handleItemsByTags(searchParams, requestConfig, WOLVESVILLE_API_BASE_URL) {
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

    return tagsData;
  } catch (error) {
    console.error("Erro ao buscar tags de itens:", error.message);
    return { error: 'Não foi possível buscar as tags de itens.' };
  }
}
