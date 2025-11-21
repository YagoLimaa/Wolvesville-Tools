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
import { Search, AlertTriangle, Gem, Filter, Loader2, X } from "lucide-react";
import { PawPrint } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CustomFontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Lottie from "lottie-react";
import { itemsApi } from "@/lib/api";

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

const getHighResUrl = (url: string | undefined, resolution: '2x' | '3x' = '3x'): string => {
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
        throw error; 
      }
    },
    staleTime: Infinity, 
  });

  if (isLoading) return <Skeleton className="w-full h-full" />;
  if (!animationData) return null;

  return <Lottie animationData={animationData} loop={true} className="w-full h-full" />;
};

const ItemImage = ({ item, onImageError, isHovered }: { item: Item; onImageError: (id: string) => void; isHovered: boolean; }) => {
  const [imageSrc, setImageSrc] = React.useState(getHighResUrl(item.imageUrl) || '');
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImageSrc(getHighResUrl(item.imageUrl) || '');
    setHasError(false);
  }, [item.imageUrl]);

  if (isHovered && item.category === 'emojis' && item.urlAnimation) {
    return <AnimatedEmoji urlAnimation={item.urlAnimation} />;
  }

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

    const baseCdn = "https://cdn2.wolvesville.com";
    let fallbackUrl = '';

    switch (item.category) {
      case "avatarItems":
        fallbackUrl = `${baseCdn}/avatarItems/${item.id}.store@3x.png`;
        break;
      case "bodyPaints":
        fallbackUrl = `${baseCdn}/bodyPaints/${item.id}.store@3x.png`;
        break;
    }

    if (fallbackUrl && fallbackUrl !== imageSrc) {
      setImageSrc(fallbackUrl);
    } else {
      const FALLBACK_IMAGE_URL = "https://cdn-avatars2.wolvesville.com/ad3466d4-8798-4b9b-a5e7-2ae7d2343c58@3x.png";
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

const BattlePassSeasonInspector = ({ season, onClose, itemsById, onImageError, hoveredItemId, getNameFromUrl, t }) => {
  const { data: seasonItemsData, isLoading } = useQuery({
      queryKey: ['bpSeason', season],
      queryFn: async () => {
        const response = await itemsApi.getTags(season);
        if (response.error) throw new Error(response.error);
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && typeof response.data === 'object') {
          return [];
        }
        return [];
      },
      enabled: !!season,
  });

  const seasonItems = React.useMemo(() => {
    if (!seasonItemsData || !Array.isArray(seasonItemsData) || !itemsById) {
      return [];
    }

    const uniqueItems = new Map<string, Item>();
    seasonItemsData.forEach(tagInfo => {
      let item: Item | undefined;
      if (tagInfo && tagInfo.id) { 
          item = tagInfo;
      } else if (tagInfo && tagInfo.avatarItemId) {
          item = itemsById.get(tagInfo.avatarItemId);
      }
      
      if (item && !uniqueItems.has(item.id)) {
          uniqueItems.set(item.id, item);
      }
    });
    
    const finalItems = Array.from(uniqueItems.values());
    return finalItems;
  }, [seasonItemsData, itemsById]);

  return (
      <Dialog open={!!season} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card custom-scrollbar">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <img src={`https://cdn.wolvesville.com/battlePass/icons/bp${season}@3x.png`} alt={`BP ${season}`} className="w-14 h-14" />
                    {t('itemsSkins.battlePassSeason')} {season}
                  </DialogTitle>
              </DialogHeader>
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {seasonItems.map(piece => (
                    <div key={piece.id} className={`relative aspect-square flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 border-2 ${rarityColors[piece.rarity] || 'border-gray-600/50'}`}>
                      <ItemImage item={piece} onImageError={onImageError} isHovered={hoveredItemId === piece.id} />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-center">
                        <p className="text-xs font-semibold text-white truncate">{piece.name || getNameFromUrl(piece.imageUrl)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </DialogContent>
      </Dialog>
  );
}

const getCollectionPieces = (collection: Item | null, allItems: Item[] | null, itemsById: Map<string, Item>): Item[] => {
  if (!collection || !allItems) {
    return [];
  }

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

  const result = Array.from(uniquePieces.values());
  return result;
};

const ItemsSkins = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [rarityFilter, setRarityFilter] = React.useState("all");
  const [genderFilter, setGenderFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [bpSeasonFilter, setBpSeasonFilter] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [brokenImageIds, setBrokenImageIds] = React.useState<Set<string>>(new Set());
  const [selectedCollection, setSelectedCollection] = React.useState<Item | null>(null);
  const [clickedItem, setClickedItem] = React.useState<Item | null>(null);
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);
  const [inspectingBpSeason, setInspectingBpSeason] = React.useState<string | null>(null);

  const { allItems, isLoading, isError, tagsByItemId, itemsById } = useItems();

  const collectionCategories = ['avatarItemSets', 'avatarItemCollections', 'bundles', 'calendars', 'emojiCollections'];
  const reverseSearchableCategories = ['avatarItems', 'emojis', 'roseSkins', 'roleIcons', 'loadingScreens', 'bodyPaints', 'backgrounds', 'profileIconBorders'];

  const getSeasonFromItem = (item: Item): string | null => {
    const tags = tagsByItemId.get(item.id);
    if (tags) {
        const originTag = tags.find(t => t.startsWith('origin:battle_pass:season_'));
        if (originTag) {
            const season = originTag.split('_').pop() || null;
            return season;
        }
    }

    if (item.imageUrl) {
        const match = item.imageUrl.match(/\/bp(\d+)-/);
        if (match && match[1]) {
            const season = match[1];
            return season;
        }
    }
    
    return null;
  }

  const getNameFromUrl = (url: string): string => {
    try {
      const filename = url.split('/').pop()?.split('.')[0] ?? '';
      const cleanedName = filename
        .replace(/bp\d+-/, '')
        .replace(/_store|@\dx/g, '')
        .replace(/[-_]/g, ' ');
      return cleanedName.replace(/\b\w/g, l => l.toUpperCase());
    } catch {
      return t("common.item");
    }
  };

  const formatEventName = (event: string) => {
    return event.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const getTypeString = (collection: Item) => {
    let representativeItemId: string | undefined = undefined;

    if (clickedItem && clickedItem.id !== collection.id && reverseSearchableCategories.includes(clickedItem.category)) {
        representativeItemId = clickedItem.id;
    }

    else if (collection.avatarItemIds && collection.avatarItemIds.length > 0) {
        representativeItemId = collection.avatarItemIds[0];
    }
    else if (collection.category === 'bundles' && collection.avatarItemSets && collection.avatarItemSets.length > 0) {
        const firstSetOrId = collection.avatarItemSets[0];
        if (typeof firstSetOrId === 'string') {
            const set = itemsById.get(firstSetOrId);
            if (set && set.avatarItemIds && set.avatarItemIds.length > 0) {
                representativeItemId = set.avatarItemIds[0];
            }
        } else if (firstSetOrId.avatarItemIds && firstSetOrId.avatarItemIds.length > 0) {
            representativeItemId = firstSetOrId.avatarItemIds[0];
        }
    }

    if (representativeItemId) {
        const tags = tagsByItemId.get(representativeItemId);
        if (tags) {
            const originTag = tags.find(t => t.startsWith('origin:'));
            if (originTag) {
                if (originTag.startsWith('origin:battle_pass:season_')) {
                  const seasonNumber = originTag.split('_').pop()?.replace(/^0+/, '');
                  return t('origins.battle_pass_season', { season: seasonNumber });
                }

                const translationKey = originTag.replace('origin:', 'origins.').replace(/:/g, '.');
                const defaultValue = originTag
                  .replace('origin:', '')
                  .replace(/_/g, ' ')
                  .replace(/:/g, ' : ')
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                return t(translationKey, defaultValue);
            }
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

  const categoryKeys = React.useMemo(() => [
    "avatarItemCollections",
    "avatarItems",
    "avatarItemSets",
    "backgrounds",
    "bodyPaints",
    "bundles",
    "calendars",
    "emojiCollections",
    "emojis",
    "loadingScreens",
    "profileIconBorders",
    "profileIcons",
    "roleIcons",
    "roseSkins",
  ], []);

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
      if (aIsBroken !== bIsBroken) return aIsBroken ? 1 : -1; 
      return (rarityOrder[b.rarity!] || 0) - (rarityOrder[a.rarity!] || 0);
    });
  }, [allItems, brokenImageIds]);

  const filteredItems = React.useMemo(() => {
    return sortedItems.filter(item => {
      const matchesSearch = (item.name || item.id).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesRarity = rarityFilter === "all" || !item.rarity || item.rarity === rarityFilter;

      let matchesGender = true;
      if (categoryFilter === 'avatarItems' && item.category === 'avatarItems') {
        if (genderFilter === 'all') {
          matchesGender = true;
        } else if (genderFilter === 'any') {
          matchesGender = item.gender === 'any' || !item.gender; 
        } else {
          matchesGender = item.gender === genderFilter;
        }
      }
      const matchesType = categoryFilter !== 'avatarItems' || item.category !== 'avatarItems' || typeFilter === "all" || item.type === typeFilter;

      const matchesBpSeason = (() => {
        if (!bpSeasonFilter) return true;
        const seasonTag = `origin:battle_pass:season_${bpSeasonFilter}`;
        
        const itemTags = tagsByItemId.get(item.id);
        if (itemTags && itemTags.includes(seasonTag)) {
          return true;
        }

        if (collectionCategories.includes(item.category)) {
            const pieceIds = item.avatarItemIds || item.emojiIds || item.rewards?.map(r => r.avatarItemId || r.emojiId) || [];
            for (const pieceId of pieceIds) {
                if (pieceId) {
                    const pieceTags = tagsByItemId.get(pieceId);
                    if (pieceTags && pieceTags.includes(seasonTag)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
      })();

      return matchesSearch && matchesCategory && matchesRarity && matchesGender && matchesType && matchesBpSeason;
    });
  }, [sortedItems, searchTerm, categoryFilter, rarityFilter, genderFilter, typeFilter, bpSeasonFilter, tagsByItemId]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, rarityFilter, genderFilter, typeFilter, bpSeasonFilter]);



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
    return Array.from(types);
  }, [allItems]);

  const collectionPieces = React.useMemo(() => {
    return getCollectionPieces(selectedCollection, allItems, itemsById);
  }, [selectedCollection, allItems, itemsById]);

  const handleItemClick = (item: Item) => {
    setClickedItem(item);

    let parentSet: Item | undefined | null = null;
    if (collectionCategories.includes(item.category)) {
      parentSet = item;
    } else if (item.parentSetId && itemsById) {
      parentSet = itemsById.get(item.parentSetId);
    } else if (reverseSearchableCategories.includes(item.category) && allItems) {
      parentSet = allItems.find(
        set => (collectionCategories.includes(set.category)) &&
               (set.avatarItemIds?.includes(item.id) ||
                set.rewards?.some(r => r.avatarItemId === item.id || r.emojiId === item.id) ||
                set.items?.some(i => i.avatarItemId === item.id) ||
                set.emojiIds?.includes(item.id)
               )
      );
    }
    const pieces = parentSet ? getCollectionPieces(parentSet, allItems, itemsById) : [];

    if (parentSet && pieces.length > 0) {
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

  const getBattlePassSeasonFromCollection = (collection: Item): string | null => {
    let representativeItemId: string | undefined = undefined;

    if (clickedItem && clickedItem.id !== collection.id && reverseSearchableCategories.includes(clickedItem.category)) {
        representativeItemId = clickedItem.id;
    }
    else if (collection.avatarItemIds && collection.avatarItemIds.length > 0) {
        representativeItemId = collection.avatarItemIds[0];
    }
    else if (collection.category === 'bundles' && collection.avatarItemSets && collection.avatarItemSets.length > 0) {
        const firstSetOrId = collection.avatarItemSets[0];
        if (typeof firstSetOrId === 'string') {
            const set = itemsById.get(firstSetOrId);
            if (set && set.avatarItemIds && set.avatarItemIds.length > 0) {
                representativeItemId = set.avatarItemIds[0];
            }
        } else if (firstSetOrId.avatarItemIds && firstSetOrId.avatarItemIds.length > 0) {
            representativeItemId = firstSetOrId.avatarItemIds[0];
        }
    }

    if (representativeItemId) {
        const tags = tagsByItemId.get(representativeItemId);
        if (tags) {
            const originTag = tags.find(t => t.startsWith('origin:battle_pass:season_'));
            if (originTag) {
                return originTag.split('_').pop() || null;
            }
        }
    }
    return null;
  }

  const getInspectorImageUrl = (item: Item) => {
    if (item.name && item.name.includes('Golden Wheel')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune2.5bc3c3e74f636f0dba3f.png';
    } else if (item.name && item.name.includes('Wheel Of Fortune')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune.6cc428f5de217c526190.png';
    } else if (item.name && item.name.includes('Daily Reward')) {
      return 'https://www.wolvesville.com/static/media/daily_reward.web.ebe06948b4678ea75d6a.png';
    }
    
    const season = getBattlePassSeasonFromCollection(item);
    if (season) {
        return getHighResUrl(`https://cdn.wolvesville.com/battlePass/icons/bp${season}.png`);
    }

    return getHighResUrl((item as Item & { promoImageUrl?: string }).promoImageUrl || item.imageUrl);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-28 py-8 mt-[5px]">
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
                <Accordion type="multiple" defaultValue={['type', 'rarity', 'gender', 'subtype', 'bp_season']} className="w-full">
                  <AccordionItem value="type">
                    <AccordionTrigger>{t('itemsSkins.itemType')}</AccordionTrigger>
                    <AccordionContent>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('itemsSkins.allTypes')}</SelectItem>
                          {categoryKeys
                            .map(key => ({
                              key: key,
                              name: t(`itemsSkins.categories.${key}`)
                            }))
                            .sort((a, b) => a.name.localeCompare(b.name, i18n.language))
                            .map(category => (
                              <SelectItem key={category.key} value={category.key}>
                                {category.name}
                              </SelectItem>
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
                  <AccordionItem value="gender">
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
                  <AccordionItem value="subtype">
                    <AccordionTrigger>{t('itemsSkins.avatarType')}</AccordionTrigger>
                    <AccordionContent>
                      <Select value={typeFilter} onValueChange={setTypeFilter} disabled={categoryFilter !== 'avatarItems'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('itemsSkins.allTypes')}</SelectItem>
                          {avatarItemTypes
                            .map(type => ({
                              key: type,
                              name: t(`itemsSkins.avatarTypes.${type}`, type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
                            }))
                            .sort((a, b) => a.name.localeCompare(b.name, i18n.language))
                            .map(item => (
                              <SelectItem key={item.key} value={item.key}>
                                {item.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="bp_season">
                    <AccordionTrigger>{t('itemsSkins.battlePassSeason')}</AccordionTrigger>
                    <AccordionContent>
                      <Select
                        value={bpSeasonFilter}
                        onValueChange={(value) => setBpSeasonFilter(value === 'all' ? '' : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('itemsSkins.selectSeasonPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom">
                          <SelectItem value="all">{t('itemsSkins.allSeasons')}</SelectItem>
                          {Array.from({ length: 45 }, (_, i) => 45 - i).sort((a, b) => a - b).map(season => (
                            <SelectItem key={season} value={String(season).padStart(2, '0')}>
                              {t('itemsSkins.season', { season: String(season).padStart(2, '0') })}
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
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCollection(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-center">{selectedCollection.name || getNameFromUrl(selectedCollection.imageUrl)}</h3>
              {(() => {
                const typeString = getTypeString(selectedCollection);
                if (!typeString) return null;
                return (
                    <div className="text-center mb-4">
                        <span className="bg-primary text-primary-foreground font-bold py-1 px-4 rounded-full text-lg">
                            {t('itemsSkins.origin')}: {typeString}
                        </span>
                    </div>
                );
              })()}
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

      <BattlePassSeasonInspector 
        season={inspectingBpSeason} 
        onClose={() => setInspectingBpSeason(null)}
        itemsById={itemsById}
        onImageError={handleImageError}
        hoveredItemId={hoveredItemId}
        getNameFromUrl={getNameFromUrl}
        t={t}
      />
    </div>
  );
};

export default ItemsSkins;