import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useItems, Item } from "@/components/contexts/ItemsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pagination } from "@/components/Pagination";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, AlertTriangle, Gem, Filter } from "lucide-react";
import { PawPrint } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CustomFontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import Lottie from "lottie-react";

// Interface específica para os itens dentro de coleções, removendo o 'any'
interface ContainedItem {
  type: string;
  amount: number;
  avatarItemId?: string;
  loadingScreenId?: string;
  emojiId?: string;
  [key: string]: string | number | undefined;
}

interface ContainedItemIdentifier {
  id: string | number;
  type: string;
}

const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
const rarityColors = {
  common: "border-gray-400/50",
  rare: "border-blue-400/50",
  epic: "border-purple-500/50",
  legendary: "border-yellow-500/50",
};

const ITEMS_PER_PAGE = 50;

const AnimatedEmoji = ({ urlAnimation }: { urlAnimation: string }) => {
  const { data: animationData, isLoading } = useQuery({
    queryKey: ['emojiAnimation', urlAnimation],
    queryFn: async () => {
      try {
        const response = await fetch(urlAnimation);
        if (!response.ok) {
          throw new Error(`Failed to fetch animation: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching or parsing Lottie animation:', error);
        throw error; // Re-throw to let react-query handle the error state
      }
    },
    staleTime: Infinity, // As animações são estáticas
  });

  if (isLoading) return <Skeleton className="w-full h-full" />;
  if (!animationData) return null;

  return <Lottie animationData={animationData} loop={true} className="w-full h-full" />;
};

const ItemImage = ({ item, onImageError, isHovered }: { item: Item; onImageError: (id: string) => void; isHovered: boolean; }) => {
  const [imageSrc, setImageSrc] = React.useState(item.imageUrl || '');
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImageSrc(item.imageUrl || '');
    setHasError(false);
  }, [item.imageUrl]);

  // Caso especial para emojis com animação
  if (isHovered && item.category === 'emojis' && item.urlAnimation) {
    return <AnimatedEmoji urlAnimation={item.urlAnimation} />;
  }

  // Caso especial para profileIcons que são ícones do FontAwesome
  if (item.category === 'profileIcons' && item.name?.startsWith('font-awesome-')) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CustomFontAwesomeIcon iconName={item.name} className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    );
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      onImageError(item.id);
    }

    // Se a URL original falhar, tenta construir uma URL de fallback para o CDN
    const baseCdn = "https://cdn2.wolvesville.com";
    let fallbackUrl = '';

    switch (item.category) {
      case "avatarItems":
        fallbackUrl = `${baseCdn}/avatarItems/${item.id}.store@2x.png`;
        break;
      case "bodyPaints":
        fallbackUrl = `${baseCdn}/bodyPaints/${item.id}.store@2x.png`;
        break;
      // Adicione outras categorias que possam ter URLs quebradas
      // e para as quais conhecemos o padrão do CDN.
    }

    if (fallbackUrl && fallbackUrl !== imageSrc) {
      setImageSrc(fallbackUrl);
    } else {
      // Verifica para não entrar em loop se a própria imagem de fallback falhar.
      const FALLBACK_IMAGE_URL = "https://cdn-avatars2.wolvesville.com/ad3466d4-8798-4b9b-a5e7-2ae7d2343c58@2x.png";
      if (imageSrc !== FALLBACK_IMAGE_URL) {
        setImageSrc(FALLBACK_IMAGE_URL);
      }
    }
  };

  const isFallback = imageSrc?.includes("ad3466d4-8798-4b9b-a5e7-2ae7d2343c58");

  return (
    <img src={imageSrc} alt={item.name || item.id} className={`w-full h-full ${['bundles', 'avatarItemCollections', 'avatarItemSets'].includes(item.category) ? 'object-cover' : 'object-contain'} ${['bundles', 'avatarItemCollections', 'avatarItemSets'].includes(item.category) ? '' : 'p-2'} ${isFallback ? 'bg-black/20 rounded-md' : ''}`} onError={handleError} />
  );
};

const ItemsSkins = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("avatarItems");
  const [rarityFilter, setRarityFilter] = React.useState("all");
  const [genderFilter, setGenderFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [brokenImageIds, setBrokenImageIds] = React.useState<Set<string>>(new Set());
  const [selectedCollection, setSelectedCollection] = React.useState<Item | null>(null);
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  const { allItems, isLoading, isError } = useItems();

  const getNameFromUrl = (url: string): string => {
    try {
      const filename = url.split('/').pop()?.split('.')[0] ?? '';
      // Remove prefixos e sufixos comuns e substitui hífens/sublinhados por espaços
      const cleanedName = filename
        .replace(/bp\d+-/, '')
        .replace(/_store|@\dx/g, '')
        .replace(/[-_]/g, ' ');
      return cleanedName.replace(/\b\w/g, l => l.toUpperCase());
    } catch {
      return t("common.item");
    }
  };

  const categoryDisplayNames: { [key: string]: string } = {
    avatarItemCollections: t('itemsSkins.categories.avatarItemCollections'),
    avatarItems: t('itemsSkins.categories.avatarItems'),
    avatarItemSets: t('itemsSkins.categories.avatarItemSets'),
    backgrounds: t('itemsSkins.categories.backgrounds'),
    bodyPaints: t('itemsSkins.categories.bodyPaints'),
    bundles: t('itemsSkins.categories.bundles'),
    calendars: t('itemsSkins.categories.calendars'),
    emojiCollections: t('itemsSkins.categories.emojiCollections'),
    emojis: t('itemsSkins.categories.emojis'),
    loadingScreens: t('itemsSkins.categories.loadingScreens'),
    profileIconBorders: t('itemsSkins.categories.profileIconBorders'),
    profileIcons: t('itemsSkins.categories.profileIcons'),
    roleIcons: t('itemsSkins.categories.roleIcons'),
    roseSkins: t('itemsSkins.categories.roseSkins'),
  };

  const handleImageError = React.useCallback((itemId: string) => {
    setBrokenImageIds(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
  }, []);

  const sortedItems = React.useMemo(() => {
    if (!allItems) return [];
    return [...allItems].sort((a, b) => {
      const aIsBroken = brokenImageIds.has(a.id);
      const bIsBroken = brokenImageIds.has(b.id);
      if (aIsBroken !== bIsBroken) return aIsBroken ? 1 : -1; // Itens quebrados vão para o final
      return (rarityOrder[b.rarity!] || 0) - (rarityOrder[a.rarity!] || 0); // Ordenação por raridade (maior primeiro)
    });
  }, [allItems, brokenImageIds]);

  const filteredItems = React.useMemo(() => {
    return sortedItems.filter(item => {
      const matchesSearch = (item.name || item.id).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesRarity = rarityFilter === "all" || !item.rarity || item.rarity === rarityFilter;

      // Aplica filtros de gênero e tipo APENAS se a categoria for 'avatarItems'
      // E o item atual também for dessa categoria.
      let matchesGender = true;
      if (categoryFilter === 'avatarItems' && item.category === 'avatarItems') {
        if (genderFilter === 'all') {
          matchesGender = true;
        } else if (genderFilter === 'any') {
          matchesGender = item.gender === 'any' || !item.gender; // Itens sem gênero são considerados unissex
        } else {
          matchesGender = item.gender === genderFilter;
        }
      }
      const matchesType = categoryFilter !== 'avatarItems' || item.category !== 'avatarItems' || typeFilter === "all" || item.type === typeFilter;

      return matchesSearch && matchesCategory && matchesRarity && matchesGender && matchesType;
    });
  }, [sortedItems, searchTerm, categoryFilter, rarityFilter, genderFilter, typeFilter]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, rarityFilter, genderFilter, typeFilter]);

  const paginatedItems = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  }, [filteredItems]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const avatarItemTypes = React.useMemo(() => {
    if (!allItems) return [];
    const types = new Set(allItems.filter(i => i.category === 'avatarItems' && i.type).map(i => i.type!));
    return Array.from(types).sort();
  }, [allItems]);

  // Categorias que abrem popup
  const collectionCategories = ['avatarItemSets', 'avatarItemCollections', 'bundles', 'calendars', 'emojiCollections'];

  const collectionPieces = React.useMemo(() => {
    if (!selectedCollection || !allItems) return [];

    let pieceIdentifiers: ContainedItemIdentifier[] = [];

    if (selectedCollection.avatarItemIds) { // Para avatarItemSets e avatarItemCollections
      pieceIdentifiers = selectedCollection.avatarItemIds.map(id => ({ id, type: 'avatarItems' }));
    } else if (selectedCollection.emojiIds) { // Para emojiCollections
      pieceIdentifiers = selectedCollection.emojiIds.map(id => ({ id, type: 'emojis' }));
    } else if (selectedCollection.rewards) { // Para calendars
      pieceIdentifiers = selectedCollection.rewards.map(reward => ({
        id: reward.avatarItemId || reward.loadingScreenId || reward.emojiId || '',
        type: reward.type.toLowerCase().replace(/_/g, '') + 's' // ex: AVATAR_ITEM -> avataritems
      })).filter(p => p.id !== '');
    } else if (selectedCollection.category === 'bundles') {
      const bundle = selectedCollection; // 'selectedCollection' já é do tipo 'Item' com as propriedades de bundle
      const pieceArrays = [
        ...(bundle.avatarItemSets?.flatMap(setOrId => {
          if (typeof setOrId === 'string') {
            // Se for apenas o ID de um conjunto, precisamos encontrar esse conjunto nos allItems
            const foundSet = allItems.find(item => item.id === setOrId);
            return (foundSet?.avatarItemIds as string[] | undefined)?.map(id => ({ id, type: 'avatarItems' })) || [];
          }
          // Se for um objeto, podemos acessar os IDs diretamente
          return (setOrId.avatarItemIds as string[] | undefined)?.map(id => ({ id, type: 'avatarItems' })) || [];
        }) || []),
        ...(bundle.emojis?.map(emoji => ({ id: emoji.id, type: 'emojis' })) || []),
        ...(bundle.loadingScreens?.map(screen => ({ id: screen.id, type: 'loadingScreens' })) || []),
        ...(bundle.roleIcons?.map(icon => ({ id: icon.id, type: 'roleIcons' })) || []),
        ...(bundle.bodyPaints?.map(paint => ({ id: paint.id, type: 'bodyPaints' })) || []),
        ...(bundle.roseSkins?.map(skin => ({ id: skin.id, type: 'roseSkins' })) || []),
        ...(bundle.backgrounds?.map(bg => ({ id: bg.id, type: 'backgrounds' })) || []),
        // Adiciona a propriedade 'items' se existir (para bundles mais genéricos)
        ...(bundle.items?.map(item => ({ id: item.avatarItemId || item.id, type: item.type.toLowerCase().replace(/_/g, '') + 's' })) || []),
      ];
      pieceIdentifiers = pieceArrays.filter(p => p && p.id);
    }

    return pieceIdentifiers.map(p => allItems.find(item => String(item.id) === String(p.id))).filter((item): item is Item => !!item);
  }, [selectedCollection, allItems]);

  // Lista de categorias de itens individuais que podem pertencer a uma coleção
  const reverseSearchableCategories = ['avatarItems', 'emojis', 'roseSkins', 'roleIcons', 'loadingScreens', 'bodyPaints', 'backgrounds', 'profileIconBorders'];

  const handleItemClick = (item: Item) => {
    if (collectionCategories.includes(item.category)) {
      setSelectedCollection(item);
    } else if (item.parentSetId && allItems) {
      // Se o item tem um 'parentSetId' (adicionado pelo backend), encontra e exibe o conjunto pai
      const parentSet = allItems.find(set => set.id === item.parentSetId);
      if (parentSet) setSelectedCollection(parentSet);
    } else if (reverseSearchableCategories.includes(item.category) && allItems) {
      const parentSet = allItems.find(
        set => (collectionCategories.includes(set.category)) && 
               (set.avatarItemIds?.includes(item.id) || 
                set.rewards?.some(r => r.avatarItemId === item.id || r.emojiId === item.id) || 
                set.items?.some(i => i.avatarItemId === item.id) ||
                set.emojiIds?.includes(item.id)
               )
      );
      if (parentSet) setSelectedCollection(parentSet);
    }
  };

  const getInspectorImageUrl = (item: Item) => {
    if (item.name && item.name.includes('Golden Wheel')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune2.5bc3c3e74f636f0dba3f.png';
    } else if (item.name && item.name.includes('Wheel Of Fortune')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune.6cc428f5de217c526190.png';
    } else if (item.name && item.name.includes('Daily Reward')) {
      return 'https://www.wolvesville.com/static/media/daily_reward.web.ebe06948b4678ea75d6a.png';
    }
    return (item as Item & { promoImageUrl?: string }).promoImageUrl || item.imageUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-28 py-8 mt-[84px]">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <aside className="lg:col-span-1 mb-8 lg:mb-0 lg:flex lg:flex-col lg:justify-center">
            <Card className="bg-card/50 backdrop-blur border-accent/20 w-full">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  {t('itemsSkins.filters')}
                </h3>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('itemsSkins.searchPlaceholder')}
                      className="pl-10 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Accordion type="multiple" defaultValue={['type', 'rarity', 'gender', 'subtype']} className="w-full">
                  <AccordionItem value="type">
                    <AccordionTrigger>{t('itemsSkins.itemType')}</AccordionTrigger>
                    <AccordionContent>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('itemsSkins.allTypes')}</SelectItem>
                          {Object.entries(categoryDisplayNames)
                            .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
                            .map(([key, name]) => (
                            <SelectItem key={key} value={key}>{t(`itemsSkins.categories.${key}`, name)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="rarity">
                    <AccordionTrigger>{t('itemsSkins.rarity')}</AccordionTrigger>
                    <AccordionContent>
                      <Select value={rarityFilter} onValueChange={setRarityFilter}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('itemsSkins.allRarities')}</SelectItem>
                          <SelectItem value="common"><span className="flex items-center gap-2"><Gem className="w-4 h-4 text-gray-400" /> {t('itemsSkins.common')}</span></SelectItem>
                          <SelectItem value="rare"><span className="flex items-center gap-2"><Gem className="w-4 h-4 text-blue-400" /> {t('itemsSkins.rare')}</span></SelectItem>
                          <SelectItem value="epic"><span className="flex items-center gap-2"><Gem className="w-4 h-4 text-purple-500" /> {t('itemsSkins.epic')}</span></SelectItem>
                          <SelectItem value="legendary"><span className="flex items-center gap-2"><Gem className="w-4 h-4 text-yellow-500" /> {t('itemsSkins.legendary')}</span></SelectItem>
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
                  {/* Filtros que só se aplicam a "Itens de Avatar" */}
                  <AccordionItem value="gender" disabled={categoryFilter !== 'avatarItems'}>
                    <AccordionTrigger>{t('itemsSkins.gender')}</AccordionTrigger>
                    <AccordionContent>
                      <Select value={genderFilter} onValueChange={setGenderFilter} disabled={categoryFilter !== 'avatarItems'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('itemsSkins.allGenders')}</SelectItem>
                          <SelectItem value="male">{t('itemsSkins.male')}</SelectItem>
                          <SelectItem value="female">{t('itemsSkins.female')}</SelectItem>
                          <SelectItem value="any">{t('itemsSkins.unisex')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="subtype" disabled={categoryFilter !== 'avatarItems'}>
                    <AccordionTrigger>{t('itemsSkins.avatarType')}</AccordionTrigger>
                    <AccordionContent>
                      <Select value={typeFilter} onValueChange={setTypeFilter} disabled={categoryFilter !== 'avatarItems'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('itemsSkins.allTypes')}</SelectItem>
                          {avatarItemTypes
                            .sort((a, b) => a.localeCompare(b))
                            .map(type => (
                              <SelectItem key={type} value={type}>
                                {type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </aside>

          <div className="lg:col-span-3">
            {isLoading && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {Array.from({ length: 18 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            )}
            {isError && (
              <Card className="bg-card/50 backdrop-blur border-accent/20 flex items-center justify-center h-96">
                <Alert variant="destructive" className="w-auto">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('itemsSkins.errorLoadingTitle')}</AlertTitle>
                  <AlertDescription>{t('itemsSkins.errorLoadingDescription')}</AlertDescription>
                </Alert>
              </Card>
            )}
            {totalPages > 1 && (
              <div className="mb-4 flex justify-end">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  hasPrev={currentPage > 1}
                  hasNext={currentPage < totalPages}
                />
              </div>
            )}
            {allItems && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {paginatedItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    className={`group relative aspect-square flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 border-2 transition-all hover:scale-105 hover:shadow-glow-primary text-left w-full
                      ${item.rarity ? rarityColors[item.rarity] : 'border-border'}
                      ${collectionCategories.includes(item.category) || item.parentSetId || reverseSearchableCategories.includes(item.category) ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <ItemImage item={item} onImageError={handleImageError} isHovered={hoveredItemId === item.id} />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-md">
                      <p className="text-xs font-semibold text-white truncate">{item.name || getNameFromUrl(item.imageUrl)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {allItems && filteredItems.length === 0 && (
              <Card className="bg-card/50 backdrop-blur border-accent/20 flex items-center justify-center h-96">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-muted-foreground">{t('itemsSkins.noItemsFound')}</h2>
                  <p className="text-muted-foreground mt-2">{t('itemsSkins.adjustFilters')}</p>
                </div>
              </Card>
            )}

          </div>
        </div>
      </main>

      {selectedCollection && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCollection(null)}
        >
          <Card 
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-4 text-center">{selectedCollection.name || getNameFromUrl(selectedCollection.imageUrl)}</h3>
              {(() => {
                const imageUrl = getInspectorImageUrl(selectedCollection);
                if (!imageUrl) return null;
                return (
                  <img
                    src={imageUrl}
                    alt={selectedCollection.name || 'Collection Image'}
                    className="w-full h-auto max-h-48 md:max-h-56 object-contain mb-4 rounded-lg mx-auto"
                  />
                );
              })()}
              {collectionPieces.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {collectionPieces.map(piece => (
                    <div key={piece.id} className={`relative aspect-square flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 border-2 ${rarityColors[piece.rarity!] || 'border-gray-600/50'}`}>
                      <ItemImage item={piece} onImageError={handleImageError} isHovered={hoveredItemId === piece.id} />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-center">
                        <p className="text-xs font-semibold text-white truncate">{piece.name || getNameFromUrl(piece.imageUrl)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">{t('itemsSkins.collectionDetailsError')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ItemsSkins;