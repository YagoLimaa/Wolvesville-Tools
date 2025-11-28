import { useState, useMemo, useCallback, useEffect } from 'react';
import { useItems } from '@/components/contexts/ItemsContext';
import { collectionCategories, rarityOrder } from '@/lib/itemUtils';

export const useItemFilters = () => {
  const { allItems, tagsByItemId } = useItems();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [bpSeasonFilter, setBpSeasonFilter] = useState("");
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(new Set());

  const handleImageError = useCallback((itemId: string) => {
    setBrokenImageIds(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
  }, []);

  const sortedItems = useMemo(() => {
    if (!allItems) return [];
    
    let itemsToSort = [...allItems];

    if (['calendars', 'bundles', 'roseSkins', 'avatarItemSets'].includes(categoryFilter)) {
      itemsToSort.reverse();
    }

    return itemsToSort.sort((a, b) => {
      const aIsBroken = brokenImageIds.has(a.id);
      const bIsBroken = brokenImageIds.has(b.id);
      if (aIsBroken !== bIsBroken) return aIsBroken ? 1 : -1;

      return (rarityOrder[b.rarity!] || 0) - (rarityOrder[a.rarity!] || 0);
    });
  }, [allItems, brokenImageIds, categoryFilter]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter(item => {
      const matchesSearch = (item.name || item.id).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesRarity = rarityFilter === "all" || !item.rarity || item.rarity === rarityFilter;

      let matchesGender = true;
      if (item.category === 'avatarItems' && genderFilter !== 'all') {
        matchesGender = genderFilter === 'any'
          ? item.gender === 'any' || !item.gender
          : item.gender === genderFilter;
      }
      
      const matchesType = item.category !== 'avatarItems' || typeFilter === "all" || item.type === typeFilter;

      const matchesBpSeason = (() => {
        if (!bpSeasonFilter) return true;
        const seasonTag = `origin:battle_pass:season_${bpSeasonFilter}`;
        
        const itemTags = tagsByItemId.get(item.id);
        if (itemTags?.includes(seasonTag)) return true;

        if (collectionCategories.includes(item.category)) {
          const pieceIds = item.avatarItemIds || item.emojiIds || item.rewards?.map(r => r.avatarItemId || r.emojiId) || [];
          for (const pieceId of pieceIds) {
            if (pieceId) {
              const pieceTags = tagsByItemId.get(pieceId);
              if (pieceTags?.includes(seasonTag)) return true;
            }
          }
        }
        return false;
      })();

      return matchesSearch && matchesCategory && matchesRarity && matchesGender && matchesType && matchesBpSeason;
    });
  }, [sortedItems, searchTerm, categoryFilter, rarityFilter, genderFilter, typeFilter, bpSeasonFilter, tagsByItemId]);
  
  useEffect(() => {
    if (categoryFilter !== "all") {
        setGenderFilter("all");
        setTypeFilter("all");
    }
    if (categoryFilter !== 'all' && categoryFilter !== 'avatarItems') {
      setBpSeasonFilter("");
    }
  }, [categoryFilter]);

  const avatarItemTypes = useMemo(() => {
    if (!allItems) return [];
    const types = new Set(allItems.filter(i => i.category === 'avatarItems' && i.type).map(i => i.type!));
    return Array.from(types);
  }, [allItems]);

  return {
    searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter,
    rarityFilter, setRarityFilter,
    genderFilter, setGenderFilter,
    typeFilter, setTypeFilter,
    bpSeasonFilter, setBpSeasonFilter,
    handleImageError,
    filteredItems,
    avatarItemTypes,
  };
};