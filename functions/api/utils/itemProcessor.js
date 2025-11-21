export function getNameFromUrl(url) {
  if (!url || typeof url !== 'string') return 'Item';
  try {
    const filename = url.split('/').pop()?.split('.')[0] ?? '';
    const cleanedName = filename.replace(/bp\d+-/, '').replace(/_store|@\dx/g, '').replace(/[-_]/g, ' ');
    return cleanedName.replace(/\b\w/g, l => l.toUpperCase());
  } catch {
    return 'Item';
  }
}

export function processItem(item) {
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
}

export function processItems(itemsArray) {
  return itemsArray.map(processItem);
}

export function parseItemsArray(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  } else if (responseData.list) {
    return Object.values(responseData.list);
  } else {
    return Object.values(responseData);
  }
}
