import { useState } from 'react';
import { useItems, Item } from '@/components/contexts/ItemsContext';
import { collectionCategories, reverseSearchableCategories, getCollectionPieces } from '@/lib/itemUtils';

export const useItemSelection = () => {
  const { allItems, itemsById, tagsByItemId } = useItems();
  
  const [selectedCollection, setSelectedCollection] = useState<Item | null>(null);
  const [clickedItem, setClickedItem] = useState<Item | null>(null);
  const [inspectingBpSeason, setInspectingBpSeason] = useState<string | null>(null);

  const getSeasonFromItem = (item: Item): string | null => {
    const tags = tagsByItemId.get(item.id);
    if (tags) {
        const originTag = tags.find(t => t.startsWith('origin:battle_pass:season_'));
        if (originTag) return originTag.split('_').pop() || null;
    }
    const match = item.imageUrl?.match(/\/bp(\d+)-/);
    return match?.[1] || null;
  }

  const handleItemClick = (item: Item) => {
    setClickedItem(item);

    let parentSet: Item | undefined | null = null;
    if (collectionCategories.includes(item.category)) {
      parentSet = item;
    } else if (item.parentSetId) {
      parentSet = itemsById.get(item.parentSetId);
    } else if (reverseSearchableCategories.includes(item.category)) {
      parentSet = allItems?.find(
        set => collectionCategories.includes(set.category) &&
               (set.avatarItemIds?.includes(item.id) ||
                set.rewards?.some(r => r.avatarItemId === item.id || r.emojiId === item.id) ||
                set.items?.some(i => i.avatarItemId === item.id) ||
                set.emojiIds?.includes(item.id))
      );
    }

    if (parentSet && getCollectionPieces(parentSet, allItems, itemsById).length > 0) {
      setSelectedCollection(parentSet);
      return;
    }
    
    const season = getSeasonFromItem(item);
    if (season) {
      setInspectingBpSeason(season);
      return;
    }
    
    if (parentSet) {
      setSelectedCollection(parentSet);
    }
  };
  
  return {
    selectedCollection,
    setSelectedCollection,
    clickedItem,
    inspectingBpSeason,
    setInspectingBpSeason,
    handleItemClick,
    getSeasonFromItem,
  };
};