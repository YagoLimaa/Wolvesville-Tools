import React, { useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useItems } from '@/components/contexts/ItemsContext';
import { collectionCategories, rarityOrder } from '@/lib/itemUtils';

export const useItemFilters = () => {
  const { allItems, tagsByItemId } = useItems();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read all filter values from the URL search parameters
  const searchTerm = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || 'all';
  const rarityFilter = searchParams.get('rarity') || 'all';
  const genderFilter = searchParams.get('gender') || 'all';
  const typeFilter = searchParams.get('type') || 'all';
  const bpSeasonFilter = searchParams.get('bp') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(new Set());

  const handleImageError = useCallback((itemId: string) => {
    setBrokenImageIds(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
  }, []);
  
  const updateFilters = useCallback((newFilters: Record<string, string | number>) => {
    setSearchParams(prev => {
      const currentParams = Object.fromEntries(prev);
      if (Object.keys(newFilters).some(k => k !== 'page')) {
        delete currentParams.page;
      }
      const updatedParams = { ...currentParams, ...newFilters };
      const finalParams: Record<string, string> = {};
      for (const key in updatedParams) {
        const value = updatedParams[key];
        if (value !== '' && value !== 'all' && value !== null && value !== undefined) {
          finalParams[key] = String(value);
        }
      }

      return finalParams;
    }, { replace: true });
  }, [setSearchParams]);

  const createSetter = (name: string) => (value: string | number) => {
    const newFilters = { [name]: value };
    if (name === 'category' && value !== 'all') {
      newFilters.gender = 'all';
      newFilters.type = 'all';
      if (value !== 'avatarItems') {
        newFilters.bp = '';
      }
    }
    updateFilters(newFilters);
  };
  
  const setCategoryFilter = createSetter('category');
  const setSearchTerm = createSetter('search');
  const setRarityFilter = createSetter('rarity');
  const setGenderFilter = createSetter('gender');
  const setTypeFilter = createSetter('type');
  const setBpSeasonFilter = createSetter('bp');
  const setCurrentPage = createSetter('page');

  const sortedItems = useMemo(() => {
    if (!allItems) return [];
    const itemsToSort = [...allItems];

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
    const originCategoryMap = {
      dailyRewards: 'origin:daily_rewards',
      miscellaneous: 'origin:miscellaneous',
      clanQuestsGold: 'origin:clan_quest:gold',
      clanQuestsGems: 'origin:clan_quest:gems',
      staffItens: "origin:staff_items",
    };
    const originCategoryKeys = Object.keys(originCategoryMap);

    return sortedItems.filter(item => {
      const matchesSearch = (item.name || item.id).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = (() => {
        if (categoryFilter === "all") return true;

        if (originCategoryKeys.includes(categoryFilter)) {
          const itemTags = tagsByItemId.get(item.id);
          const targetTag = originCategoryMap[categoryFilter as keyof typeof originCategoryMap];
          return itemTags?.includes(targetTag) ?? false;
        }

        return item.category === categoryFilter;
      })();
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
    currentPage, setCurrentPage,
    handleImageError,
    filteredItems,
    avatarItemTypes,
  };
};