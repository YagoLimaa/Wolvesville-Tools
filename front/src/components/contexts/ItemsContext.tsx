import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

export interface Item {
  id: string;
  category: string;
  imageUrl: string;
  name?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  gender?: 'male' | 'female' | 'any';
  type?: string;
  [key: string]: unknown;
}

// Interface para os itens como eles vêm da API, antes de adicionar a categoria
interface ApiItem {
  id: string;
  [key: string]: unknown;
}

interface ItemsContextType {
  allItems: Item[];
  itemsById: Map<string, Item>;
  isLoading: boolean;
  isError: boolean;
}

const ItemsContext = React.createContext<ItemsContextType | undefined>(undefined);

const fetchAllItems = async (): Promise<Item[]> => {
  // Categorias que contêm itens com imagens que queremos referenciar
  const categories = ['avatarItems', 'bodyPaints', 'avatarItemSets', 'avatarItemCollections', 'bundles', 'calendars', 'tags', 'profileIcons', 'profileIconBorders', 'emojis', 'emojiCollections', 'backgrounds', 'loadingScreens', 'roleIcons', 'roseSkins'];

  const promises = categories.map(async (category) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/items/${category}`);
      if (!response.ok) return [];
      const items = await response.json();
      // Adiciona a categoria a cada item para referência futura
      return items.map((item: ApiItem) => ({ ...item, category }));
    } catch (error) {
      console.error(`Erro ao buscar a categoria de itens ${category}:`, error);
      return [];
    }
  });

  const results = await Promise.all(promises);
  return results.flat();
};

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: allItems = [], isLoading, isError } = useQuery<Item[]>({
    queryKey: ['allItemsGlobal'],
    queryFn: fetchAllItems,
    staleTime: 1000 * 60 * 60, // Cache de 1 hora
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

  const value = { allItems, itemsById, isLoading, isError };

  return (
    <ItemsContext.Provider value={value}>
      {children}
    </ItemsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useItems = (): ItemsContextType => {
  const context = React.useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useItems deve ser usado dentro de um ItemsProvider');
  }
  return context;
};