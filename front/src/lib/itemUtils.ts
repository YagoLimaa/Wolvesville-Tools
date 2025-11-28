import { Item } from "@/components/contexts/ItemsContext";
import { TFunction } from "i18next";

export interface ContainedItem {
  type: string;
  amount: number;
  avatarItemId?: string;
  loadingScreenId?: string;
  emojiId?: string;
  [key: string]: string | number | undefined;
}

export interface ContainedItemIdentifier {
  id: string | number;
  type: string;
}

export const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };

export const rarityColors = {
  common: "border-gray-400/50",
  rare: "border-blue-400/50",
  epic: "border-purple-500/50",
  legendary: "border-yellow-500/50",
};

export const collectionCategories = ['avatarItemSets', 'avatarItemCollections', 'bundles', 'calendars', 'emojiCollections'];
export const reverseSearchableCategories = ['avatarItems', 'emojis', 'roseSkins', 'roleIcons', 'loadingScreens', 'bodyPaints', 'backgrounds', 'profileIconBorders'];

export const getHighResUrl = (url: string | undefined, resolution: '2x' | '3x' = '3x'): string => {
  if (!url) return "";
  if (url.includes('wolvesville.com/static/media') || url.includes('via.placeholder.com') || url.match(/@\dx\./)) {
    return url;
  }
  const extensions = ['.png', '.jpg', '.jpeg'];
  for (const ext of extensions) {
    if (url.endsWith(ext)) {
      return url.slice(0, -ext.length) + `@${resolution}` + ext;
    }
  }
  return url;
};

export const getCollectionPieces = (collection: Item | null, allItems: Item[] | null, itemsById: Map<string, Item>): Item[] => {
  if (!collection || !allItems) return [];
  let pieceIdentifiers: ContainedItemIdentifier[] = [];
  if (collection.avatarItemIds) {
    pieceIdentifiers = collection.avatarItemIds.map(id => ({ id, type: 'avatarItems' }));
  } else if (collection.emojiIds) {
    pieceIdentifiers = collection.emojiIds.map(id => ({ id, type: 'emojis' }));
  } else if (collection.rewards) {
    pieceIdentifiers = collection.rewards.map(reward => ({
      id: reward.avatarItemId || reward.loadingScreenId || reward.emojiId || '',
      type: reward.type.toLowerCase().replace(/_/g, '') + 's'
    })).filter(p => p.id !== '');
  } else if (collection.category === 'bundles' && collection.items) {
      pieceIdentifiers = (collection.items as ContainedItem[]).map((item) => ({
        id: item.avatarItemId || item.loadingScreenId || item.emojiId || '',
        type: item.type.toLowerCase().replace(/_/g, '') + 's'
      })).filter(p => p.id !== '');
  }
  const uniquePieces = new Map<string, Item>();
  pieceIdentifiers.forEach(p => {
    const item = itemsById.get(String(p.id));
    if (item && !uniquePieces.has(item.id)) {
      uniquePieces.set(item.id, item);
    }
  });
  return Array.from(uniquePieces.values());
};

export const getNameFromUrl = (url: string, t: TFunction): string => {
  try {
    const filename = url.split('/').pop()?.split('.')[0] ?? '';
    const cleanedName = filename.replace(/bp\d+-/, '').replace(/_store|@\dx/g, '').replace(/[-_]/g, ' ');
    return cleanedName.replace(/\b\w/g, l => l.toUpperCase());
  } catch {
    return t("common.item");
  }
};

export const formatEventName = (event: string) => {
  return event.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getBattlePassSeasonFromCollection = (collection: Item, clickedItem: Item | null, itemsById: Map<string, Item>, tagsByItemId: Map<string, string[]>): string | null => {
    let representativeItemId: string | undefined = undefined;
    if (clickedItem && clickedItem.id !== collection.id && reverseSearchableCategories.includes(clickedItem.category)) {
        representativeItemId = clickedItem.id;
    } else if (collection.avatarItemIds?.[0]) {
        representativeItemId = collection.avatarItemIds[0];
    } else if (collection.category === 'bundles' && collection.avatarItemSets?.[0]) {
        const firstSetOrId = collection.avatarItemSets[0];
        if (typeof firstSetOrId === 'string') {
            const set = itemsById.get(firstSetOrId);
            if (set?.avatarItemIds?.[0]) {
                representativeItemId = set.avatarItemIds[0];
            }
        } else if (firstSetOrId.avatarItemIds?.[0]) {
            representativeItemId = firstSetOrId.avatarItemIds[0];
        }
    }
    if (representativeItemId) {
        const tags = tagsByItemId.get(representativeItemId);
        const originTag = tags?.find(t => t.startsWith('origin:battle_pass:season_'));
        if (originTag) {
            return originTag.split('_').pop() || null;
        }
    }
    return null;
}

export const getInspectorImageUrl = (item: Item, clickedItem: Item | null, itemsById: Map<string, Item>, tagsByItemId: Map<string, string[]>) => {
    if (item.name?.includes('Golden Wheel')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune2.5bc3c3e74f636f0dba3f.png';
    } else if (item.name?.includes('Wheel Of Fortune')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune.6cc428f5de217c526190.png';
    } else if (item.name?.includes('Daily Reward')) {
      return 'https://www.wolvesville.com/static/media/daily_reward.web.ebe06948b4678ea75d6a.png';
    }
    const season = getBattlePassSeasonFromCollection(item, clickedItem, itemsById, tagsByItemId);
    if (season) {
        return getHighResUrl(`https://cdn.wolvesville.com/battlePass/icons/bp${season}.png`);
    }
    return getHighResUrl((item as Item & { promoImageUrl?: string }).promoImageUrl || item.imageUrl);
};

export const getTypeString = (collection: Item, clickedItem: Item | null, itemsById: Map<string, Item>, tagsByItemId: Map<string, string[]>, t: TFunction) => {
    let representativeItemId: string | undefined = undefined;
    if (clickedItem && clickedItem.id !== collection.id && reverseSearchableCategories.includes(clickedItem.category)) {
        representativeItemId = clickedItem.id;
    } else if (collection.avatarItemIds?.[0]) {
        representativeItemId = collection.avatarItemIds[0];
    } else if (collection.category === 'bundles' && collection.avatarItemSets?.[0]) {
        const firstSetOrId = collection.avatarItemSets[0];
        if (typeof firstSetOrId === 'string') {
            const set = itemsById.get(firstSetOrId);
            if (set?.avatarItemIds?.[0]) {
                representativeItemId = set.avatarItemIds[0];
            }
        } else if (firstSetOrId.avatarItemIds?.[0]) {
            representativeItemId = firstSetOrId.avatarItemIds[0];
        }
    }
    if (representativeItemId) {
        const tags = tagsByItemId.get(representativeItemId);
        const originTag = tags?.find(t => t.startsWith('origin:'));
        if (originTag) {
            if (originTag.startsWith('origin:battle_pass:season_')) {
                const seasonNumber = originTag.split('_').pop()?.replace(/^0+/, '');
                return t('origins.battle_pass_season', { season: seasonNumber });
            }
            const translationKey = originTag.replace('origin:', 'origins.').replace(/:/g, '.');
            const defaultValue = originTag.replace('origin:', '').replace(/_/g, ' ').replace(/:/g, ' : ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return t(translationKey, defaultValue);
        }
    }
    const event = (collection as Item & { event?: string }).event;
    if (event === 'BATTLE_PASS') return t('origins.battle_pass', "BP (Battle Pass)");
    if (event) return t(`origins.event.${event}`, formatEventName(event));
    if (collection.category === 'bundles') return t('origins.bundle', "Bundle");
    if (['avatarItemSets', 'avatarItemCollections'].includes(collection.category)) {
        return t('origins.item_set', "Item Set");
    }
    return t(`itemsSkins.categories.${collection.category}`);
}
