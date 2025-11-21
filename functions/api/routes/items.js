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
  const tags = searchParams.get('tags');

  if (!tags || tags.trim().length === 0) {
    return {
      error: 'Tags are required',
    };
  }

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/items/tags`;
  const response = await fetch(requestUrl, requestConfig);
  let tagsData = await response.json();

  if (tags) {
    const seasonTag = `origin:battle_pass:season_${tags}`;
    // Filtra apenas items que têm a tag da season
    tagsData = tagsData.filter(item => item.tags && item.tags.includes(seasonTag));
    
    // Processa os items para garantir que tenham imageUrl e name
    tagsData = tagsData.map(item => {
      const newItem = { ...item };
      if (!newItem.imageUrl) {
        newItem.imageUrl = newItem.promoImageUrl || newItem.iconUrl || (newItem.image && newItem.image.url) || newItem.singleImageUrl || newItem.urlPreview || (newItem.imageDay && newItem.imageDay.url) || (newItem.imageSmall && newItem.imageSmall.url);
      }
      if (!newItem.name) {
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
        newItem.name = newItem.title || getNameFromUrl(newItem.imageUrl);
      }
      if (newItem.rarity) {
        newItem.rarity = String(newItem.rarity).toLowerCase();
      }
      return newItem;
    });
  }

  return tagsData;
}
