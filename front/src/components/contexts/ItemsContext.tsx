import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { itemsApi, validationApi } from '@/lib/api';

interface ContainedItem {
  type: string;
  amount: number;
  avatarItemId?: string;
  loadingScreenId?: string;
  emojiId?: string;
  [key: string]: string | number | undefined;
}

export interface Item {
  id: string;
  category: string;
  imageUrl: string;
  name?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  gender?: 'male' | 'female' | 'any';
  type?: string;
  parentSetId?: string;
  avatarItemIds?: string[];
  rewards?: ContainedItem[];
  items?: ContainedItem[] | { roleIconId: string }[];
  avatarItemSetId?: string;
  urlAnimation?: string;
  emojiIds?: string[];
  avatarItemSets?: (
    | {
        id: string;
        avatarItemIds?: string[];
        promoImageUrl?: string;
      }
    | string
  )[];
  emojis?: { id: string; }[];
  loadingScreens?: { id: string; rarity?: string; image?: { url: string; }; imageWide?: { url: string; }; }[];
  roleIcons?: { id: string; rarity?: string; image?: { url: string; }; roleId?: string; }[];
  bodyPaints?: { id: string; }[];
  roseSkins?: { id: string; }[];
  backgrounds?: { id: string; }[];
  [key: string]: unknown;
}

interface ApiItem {
  id: string;
  imageUrl: string;
  gender?: 'male' | 'female' | 'any' | string;
  [key: string]: unknown;
}

interface ApiTag {
  avatarItemId: string;
  tags: string[];
}

interface ItemsContextType {
  allItems: Item[];
  itemsById: Map<string, Item>;
  tagsByItemId: Map<string, string[]>;
  isLoading: boolean;
  isError: boolean;
}

const ItemsContext = React.createContext<ItemsContextType | undefined>(undefined);

/**
 * Fetch all items from all categories
 * Backend validates categories - frontend just passes them
 */
const fetchAllItems = async (categories: string[], t: any): Promise<Item[]> => {
  const promises = categories.map(async (category) => {
    try {
      const response = await itemsApi.getCategory(category);
      if (response.error) {
        console.warn(t('itemsContext.fetchCategoryFailed', { category }));
        return [];
      }
      const itemsArray = (response.data || []) as any[];
      return itemsArray.map((apiItem): Item => ({
        ...apiItem,
        category,
        gender: (apiItem.gender as string | undefined)?.toLowerCase() as 'male' | 'female' | 'any' | undefined
      }));
    } catch (error) {
      console.error(t('itemsContext.fetchCategoryError', { category }), error);
      return [];
    }
  });

  const results = await Promise.all(promises);
  const allItemsRaw = results.flat().filter(item => item && item.id);

  const itemMap = new Map<string, Item>();
  for (const item of allItemsRaw) {
    if (itemMap.has(item.id)) {
      const existingItem = itemMap.get(item.id)!;
      itemMap.set(item.id, { ...item, ...existingItem });
    } else {
      itemMap.set(item.id, item);
    }
  }
  const allItems = Array.from(itemMap.values());

  return allItems;
};

/**
 * Fetch item tags
 */
const fetchTags = async (): Promise<Map<string, string[]>> => {
  try {
    const response = await itemsApi.getTags();
    if (response.error) {
      console.warn('Failed to fetch item tags');
      return new Map();
    }
    const tagsData = (response.data || []) as ApiTag[];
    const map = new Map<string, string[]>();
    if (Array.isArray(tagsData)) {
      for (const tagInfo of tagsData) {
        if (tagInfo.avatarItemId && tagInfo.tags) {
          map.set(tagInfo.avatarItemId, tagInfo.tags);
        }
      }
    }
    return map;
  } catch (error) {
    console.error('Error fetching item tags:', error);
    return new Map();
  }
};

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  // Fetch valid categories from backend
  const { data: categoriesResponse } = useQuery({
    queryKey: ['itemCategories'],
    queryFn: () => validationApi.getItemCategories(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });

  const categories = categoriesResponse?.data || [];

  // Fetch all items only after we have categories
  const { data: allItems = [], isLoading, isError } = useQuery<Item[]>({
    queryKey: ['allItemsGlobal', categories],
    queryFn: () => fetchAllItems(categories, t),
    enabled: categories.length > 0, // Only fetch when we have categories
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });

  const { data: tagsByItemId = new Map() } = useQuery<Map<string, string[]>>({
    queryKey: ['itemTags'],
    queryFn: fetchTags,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });

  const itemsById = React.useMemo(() => {
    const map = new Map<string, Item>();
    for (const item of allItems) {
      if (item.id) {
        map.set(item.id, item);
      }
    }
    return map;
  }, [allItems]);

  const value = { allItems, itemsById, tagsByItemId, isLoading: isLoading || categories.length === 0, isError };

  return (
    <ItemsContext.Provider value={value}>
      {children}
    </ItemsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useItems = (): ItemsContextType => {
  const context = React.useContext(ItemsContext);
  const { t } = useTranslation();
  if (context === undefined) {
    throw new Error(t('itemsContext.hookScopeError'));
  }
  return context;
};