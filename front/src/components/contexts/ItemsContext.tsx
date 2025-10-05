import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

// Mapeia os nomes das chaves da API para nomes amigáveis
const categoryDisplayNames: { [key: string]: string } = {
  avatarItems: "Itens de Avatar",
  bodyPaints: "Pinturas Corporais",
  avatarItemSets: "Conjuntos de Avatar",
  avatarItemCollections: "Coleções de Avatar",
  bundles: "Pacotes",
  calendars: "Calendários",
  profileIcons: "Ícones de Perfil",
  profileIconBorders: "Bordas de Ícone",
  emojis: "Emojis",
  emojiCollections: "Coleções de Emoji",
  backgrounds: "Fundos",
  loadingScreens: "Telas de Loading",
  roleIcons: "Ícones de Papel",
  roseSkins: "Skins de Rosa",
};

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
  [key: string]: unknown; // Permite outras propriedades
}

// Interface para os itens como eles vêm da API, antes de adicionar a categoria
interface ApiItem {
  id: string;
  imageUrl: string;
  gender?: 'male' | 'female' | 'any' | string;
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
  // Busca todas as categorias, incluindo 'tags' e 'advancedRoleCardOffers'
  // 'avatarItemSets' é processado por último para ter prioridade no mapa de IDs.
  const categories = [...Object.keys(categoryDisplayNames), 'tags', 'advancedRoleCardOffers', 'avatarItemSets'];

  const promises = categories.map(async (category) => {
    try {
      const response = await fetch(`/api/items/${category}`);
      if (!response.ok) {
        console.warn(`Falha ao buscar a categoria: ${category}`);
        return [];
      }
      const itemsArray = await response.json() as ApiItem[];
      // Adiciona a categoria a cada item e normaliza o gênero
      return itemsArray.map((apiItem: ApiItem): Item => ({
        ...apiItem,
        category,
        gender: (apiItem.gender as string | undefined)?.toLowerCase() as 'male' | 'female' | 'any' | undefined
      }));
    } catch (error) {
      console.error(`Erro ao buscar a categoria de itens ${category}:`, error);
      return [];
    }
  });

  const results = await Promise.all(promises);
  const allItems = results.flat().filter(item => item && item.id);
  console.log("--- [ItemsContext] Lista final de itens combinados: ---", allItems.length, "itens");
  return allItems;
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