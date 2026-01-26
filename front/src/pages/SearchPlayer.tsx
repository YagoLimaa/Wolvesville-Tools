import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { SearchForm } from "@/components/SearchForm";
import { PlayerCard } from "@/components/PlayerCard";
import { Pagination } from "@/components/Pagination";
import { GradientButton } from "@/components/ui/gradient-button";
import { Card, CardContent } from "@/components/ui/card";
import { useItems, Item } from "../components/contexts/ItemsContext";
import { SearchResult, Player } from "@/types/Player";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlayersHighscores } from "@/components/PlayersHighscores";
import { playerApi, avatarsApi } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRoles, Role } from "../components/contexts/RolesContext";
import { useSEO } from "@/hooks/useSEO";

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

interface AvatarInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: { url: string; index: number } | null;
  playerId: string;
}

const AvatarInspectorModal = ({ isOpen, onClose, avatar, playerId }: AvatarInspectorModalProps) => {
  const { t, i18n } = useTranslation();
  const { itemsById, allItems, tagsByItemId } = useItems();
  const [inspectorData, setInspectorData] = useState<Item[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectorError, setInspectorError] = useState<string | null>(null);
  const [selectedItemForSet, setSelectedItemForSet] = useState<Item | null>(null);

  const getInspectorImageUrl = (item: Item) => {
    if (item.name && item.name.includes('Golden Wheel')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune2.5bc3c3e74f636f0dba3f.png';
    } else if (item.name && item.name.includes('Wheel Of Fortune')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune.6cc428f5de217c526190.png';
    } else if (item.name && item.name.includes('Daily Reward')) {
      return 'https://www.wolvesville.com/static/media/daily_reward.web.ebe06948b4678ea75d6a.png';
    }
    return getHighResUrl(item.imageUrl);
  };

  const getBattlePassSeason = (collection: Item): string | null => {
    let representativeItemId: string | undefined = undefined;
    const reverseSearchableCategories = ['avatarItems', 'emojis', 'roseSkins', 'roleIcons', 'loadingScreens', 'bodyPaints', 'backgrounds', 'profileIconBorders'];

    if (selectedItemForSet && selectedItemForSet.id !== collection.id && reverseSearchableCategories.includes(selectedItemForSet.category)) {
        representativeItemId = selectedItemForSet.id;
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

  const getPopupImageUrl = (item: Item) => {
    if (item.name && item.name.includes('Golden Wheel')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune2.5bc3c3e74f636f0dba3f.png';
    } else if (item.name && item.name.includes('Wheel Of Fortune')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune.6cc428f5de217c526190.png';
    } else if (item.name && item.name.includes('Daily Reward')) {
      return 'https://www.wolvesville.com/static/media/daily_reward.web.ebe06948b4678ea75d6a.png';
    }

    const season = getBattlePassSeason(item);
    if (season) {
        return getHighResUrl(`https://cdn.wolvesville.com/battlePass/icons/bp${season}.png`);
    }

    if ((item.event === 'BATTLE_PASS' || (item.imageUrl && item.imageUrl.includes('/bp')))) {
      const match = item.imageUrl.match(/\/bp(\d+)/);
      if (match) {
        const bpNumber = match[1];
        return getHighResUrl(`https://cdn.wolvesville.com/battlePass/icons/bp${bpNumber}.png`);
      }
    }
    return getHighResUrl(item.imageUrl);
  };

  const getPopupTitle = (item: Item) => {
    if ((item.event === 'BATTLE_PASS' || (item.imageUrl && item.imageUrl.includes('/bp')))) {
      const match = item.imageUrl.match(/\/bp(\d+)/);
      if (match) {
        const bpNumber = match[1];
        return `BP${bpNumber} - ${item.name}`;
      }
    }
    if (item.name && item.name.includes('Golden Wheel')) {
      return 'Rose Wheel';
    }
    return item.name;
  };

  const formatEventName = (event: string) => {
    return event.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const getTypeString = (collection: Item) => {
    let representativeItemId: string | undefined = undefined;
    const reverseSearchableCategories = ['avatarItems', 'emojis', 'roseSkins', 'roleIcons', 'loadingScreens', 'bodyPaints', 'backgrounds', 'profileIconBorders'];

    if (selectedItemForSet && selectedItemForSet.id !== collection.id && reverseSearchableCategories.includes(selectedItemForSet.category)) {
        representativeItemId = selectedItemForSet.id;
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
                const translationKey = originTag.replace('origin:', 'origins.').replace(/:/g, '.');

                if (i18n.exists(translationKey)) {
                  return t(translationKey);
                }
  
                const parts = originTag.replace('origin:', '').split(':');
                if (parts.length > 1) {
                  const genericKey = `origins.${parts[0]}`;
                  if (i18n.exists(genericKey)) {
                    const name = parts.slice(1).join(' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return t(genericKey, { name });
                  }
                }

                return originTag
                    .replace('origin:', '')
                    .replace(/_/g, ' ')
                    .replace(/:/g, ' : ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
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

    return null;
  }

  useEffect(() => {
    if (isOpen && avatar) {
      const fetchAvatarItems = async () => {
        setIsInspecting(true);
        setInspectorError(null);
        setInspectorData([]);

        try {
          const sharedIdResponse = await avatarsApi.getSharedId(playerId, avatar.index);
          if (sharedIdResponse.error || typeof sharedIdResponse.data !== 'string') {
            throw new Error("Failed to fetch shared avatar ID");
          }
          const sharedAvatarId = sharedIdResponse.data;

          if (!sharedAvatarId) {
            throw new Error("Invalid shared avatar ID received");
          }

          const response = await avatarsApi.getDetails(sharedAvatarId);
          if (response.error || !response.data) {
            throw new Error(t('playerCard.fetchAvatarError'));
          }
          const data = response.data;
          
          if (data.items && typeof data.items === 'object') {
            const itemIds = Object.values(data.items).filter(id => typeof id === 'string') as string[];
            const items = itemIds.map(id => itemsById.get(id)).filter((item): item is Item => !!item);
            setInspectorData(items);
          } else {
            setInspectorData([]);
          }

        } catch (err: unknown) {
            if (err instanceof Error) {
                setInspectorError(err.message);
            } else {
                setInspectorError(t('playerCard.genericAvatarError'));
            }
        } finally {
          setIsInspecting(false);
        }
      };

      fetchAvatarItems();
    }
  }, [isOpen, avatar, playerId, itemsById, t]);

  const findParentSet = (item: Item): Item | null => {
    if (!allItems) return null;
    if (item.parentSetId) {
      const parent = itemsById.get(item.parentSetId);
      if (parent) return parent;
    }
    const collectionCategories = ['avatarItemSets', 'avatarItemCollections', 'bundles', 'calendars'];
    const reverseSearchableCategories = ['avatarItems', 'emojis', 'roseSkins', 'roleIcons', 'loadingScreens', 'bodyPaints', 'backgrounds', 'profileIconBorders'];

    if (reverseSearchableCategories.includes(item.category)) {
      const parent = allItems.find(
        set => (collectionCategories.includes(set.category)) && 
               (set.avatarItemIds?.includes(item.id) || 
                set.rewards?.some(r => r.avatarItemId === item.id || r.emojiId === item.id) || 
                set.items?.some(i => (i as { avatarItemId?: string }).avatarItemId === item.id))
      );
      if (parent) return parent;
    }
    return null;
  };

  const parentSet = selectedItemForSet ? findParentSet(selectedItemForSet) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('playerCard.avatarInspectorTitle')}</DialogTitle>
          <DialogDescription>
            {t('playerCard.avatarInspectorDescription', "Inspect the items that make up this avatar.")}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-[400px]">
          {isInspecting ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : inspectorError ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive">{inspectorError}</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="order-2 md:order-1 md:w-2/3">
                <h4 className="font-semibold mb-4">{t('playerCard.avatarComposition')}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto pr-2">
                  {inspectorData.map(item => (
                                        <Card
                                          key={item.id}
                                          className="overflow-hidden cursor-pointer hover:border-primary"
                                          onClick={() => setSelectedItemForSet(item)}                    >
                      <CardContent className="p-2 flex flex-col items-center text-center">
                        <img src={getInspectorImageUrl(item)} alt={item.name} className="w-10 h-10 sm:w-16 sm:h-16 object-contain" />
                        <p className="text-xs mt-2 font-semibold leading-tight">{item.name || item.id}</p>
                        {item.rarity && <Badge variant="secondary" className="mt-1 text-xs">{t(`itemsSkins.${item.rarity}`)}</Badge>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2 md:w-1/3">
                <h4 className="font-semibold mb-4 text-center">{t('playerCard.fullAvatar')}</h4>
                {avatar && <img src={getHighResUrl(avatar.url)} alt="Full Avatar" className="rounded-lg mx-auto md:w-full" />}
              </div>
            </div>
          )}
        </div>

        <Dialog open={!!selectedItemForSet} onOpenChange={(open) => !open && setSelectedItemForSet(null)}>
          {selectedItemForSet && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {parentSet ? t('playerCard.setDetailsTitle') : t('playerCard.itemDetailsTitle')}
                </DialogTitle>
                <DialogDescription>
                  {parentSet ? t('playerCard.itemBelongsTo') : t('playerCard.itemDetailsDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center text-center gap-2 mt-4">
                <img src={getPopupImageUrl(parentSet || selectedItemForSet)} alt={(parentSet || selectedItemForSet).name} className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-lg border p-2"/>
                <p className="font-bold text-lg">{getPopupTitle(parentSet || selectedItemForSet)}</p>
                {(() => {
                const typeString = getTypeString(parentSet || selectedItemForSet);
                if (!typeString) return null;
                return (
                    <div className="text-center mt-2">
                        <span className="bg-primary text-primary-foreground font-bold py-1 px-3 rounded-full text-base">
                            {t('playerCard.origin')}: {typeString}
                        </span>
                    </div>
                );
              })()}
              </div>
            </DialogContent>
          )}
        </Dialog>

      </DialogContent>
    </Dialog>
  );
};

const SearchPlayer = () => {
  const { t } = useTranslation();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoading: isLoadingItems } = useItems();
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inspectingAvatar, setInspectingAvatar] = useState<{ player: Player; avatar: { url: string; index: number; }; } | null>(null);

  const username = searchParams.get('username');
  const page = searchParams.get('page');
  useSEO({
    title: username 
      ? `${username} - Wolvesville Player Stats`
      : "Search Players - Wolvesville Tools",
    description: username 
      ? `View detailed stats and avatar information for ${username} in Wolvesville`
      : "Search and view detailed player statistics, rankings, and avatar information in Wolvesville",
    keywords: username
      ? ["wolvesville", "player", "stats", "profile", username]
      : ["wolvesville", "players", "search", "stats", "rankings"],
    url: `https://wolvesville-tools.pages.dev/search${username ? `?username=${encodeURIComponent(username)}` : ''}`,
    schemaMarkup: searchResult && searchResult.players.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${currentQuery} - Wolvesville Player Search Results`,
      "description": `Search results for Wolvesville player: ${currentQuery}`,
      "url": `https://wolvesville-tools.pages.dev/search?username=${encodeURIComponent(currentQuery)}`,
      "mainEntity": searchResult.players.slice(0, 5).map(player => ({
        "@type": "Person",
        "name": player.username,
        "url": `https://wolvesville-tools.pages.dev/search?username=${encodeURIComponent(player.username)}`
      }))
    } : {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "name": "Wolvesville Player Search",
      "description": "Search for players in Wolvesville and view their detailed statistics"
    }
  });

  const handleSearch = useCallback(async (username: string, page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await playerApi.search(username, page);

      if (response.status === 404) {
        setSearchResult({
          players: [],
            pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            limit: 1,
            hasPages: false,
          }
        });
        setCurrentQuery(username);
        setSearchParams({ username, page: page.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsLoading(false);
        return;
      }

      if (response.error) {
        throw new Error(response.error);
      }
      const result = response.data as SearchResult;

      setSearchResult(result);
      setCurrentQuery(username);
      setSearchParams(prev => {
        prev.set('username', username);
        prev.set('page', page.toString());
        return prev;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(t('searchPlayer.searchError'));
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [setSearchParams, t]);

  useEffect(() => {
    if (username) {
      handleSearch(username, parseInt(page ?? "1"));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, page]);

  useEffect(() => {
    if (searchResult && searchResult.players.length > 0) {
      const inspectFromUrl = searchParams.get("inspect");
      if (inspectFromUrl) {
        const [playerId, avatarIndexStr] = inspectFromUrl.split(':');
        const avatarIndex = parseInt(avatarIndexStr, 10);
        const playerToInspect = searchResult.players.find(p => p.id === playerId);

        if (playerToInspect && playerToInspect.avatars[avatarIndex]) {
          if (inspectingAvatar?.player.id !== playerId || inspectingAvatar?.avatar.index !== avatarIndex) {
            setInspectingAvatar({ 
              player: playerToInspect, 
              avatar: {
                url: playerToInspect.avatars[avatarIndex].url,
                index: avatarIndex
              }
            });
          }
        }
      }
    }
  }, [searchResult, searchParams, inspectingAvatar]);

  const handlePageChange = (page: number) => {
    if (currentQuery) {
      handleSearch(currentQuery, page);
    }
  };

  const handleGoBack = () => {
    setSearchResult(null);
    setSearchParams({});
    navigate("/search");
  };

  const handleAvatarClick = (player: Player, avatar: { url: string; index: number; }) => {
    setInspectingAvatar({ player, avatar });
    setSearchParams(prev => {
      prev.set('inspect', `${player.id}:${avatar.index}`);
      return prev;
    });
  };

  const handleCloseInspector = () => {
    setInspectingAvatar(null);
    setSearchParams(prev => {
      prev.delete('inspect');
      return prev;
    });
  };

  const playerCount = searchResult?.players?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-28 py-8">
        {isLoadingItems && (
          <div className="text-center text-muted-foreground text-lg">
            {t('searchPlayer.loadingItems')}
          </div>
        )}
        {!isLoadingItems && (
          <div className="space-y-8">
            {!searchResult && (
              <>
                <div className="text-center max-w-xl mx-auto">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    {t('searchPlayer.title')}
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground">
                    {t('searchPlayer.subtitle')}
                  </p>
                  <div className="mt-8">
                    <SearchForm 
                      onSearch={handleSearch} 
                      isLoading={isLoading}
                      placeholder={t('searchPlayer.placeholder')}
                      label={t('searchPlayer.label')}
                      buttonText={t('searchPlayer.buttonText')}
                    />
                  </div>
                </div>
                <div className="mt-12">
                  <PlayersHighscores />
                </div>
              </>
            )}

            {searchResult && (
              <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
                <GradientButton variant="outline" onClick={handleGoBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('searchPlayer.goBack')}
                </GradientButton>
              
                <div className="text-center md:text-right">
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('searchPlayer.resultsTitle', { query: currentQuery })}
                  </h2>
                  {playerCount > 0 && <p className="text-muted-foreground">
                    {t('searchPlayer.pagination', { currentPage: searchResult.pagination.currentPage, totalPages: searchResult.pagination.totalPages })}
                  </p>}
                </div>
              </div>
            )}

            {isLoading && <p className="text-center text-muted-foreground text-lg">{t('searchPlayer.loadingPlayers')}</p>}

            {searchResult && playerCount > 0 && (
              playerCount === 1 ? (
                <div className="flex justify-center animate-in fade-in zoom-in-95 mt-6">
                  <div className="w-full max-w-4xl">
                    <PlayerCard 
                      player={searchResult.players[0]}
                      onAvatarClick={(avatar) => handleAvatarClick(searchResult.players[0], avatar)} 
                    />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {searchResult.players.map((player, index) => (
                    <div
                      key={player.id}
                      className="animate-in fade-in zoom-in-95"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <PlayerCard 
                        player={player} 
                        onAvatarClick={(avatar) => handleAvatarClick(player, avatar)}
                      />
                    </div>
                  ))}
                </div>
              )
            )}

            {searchResult && playerCount === 0 && !isLoading && (
              <Card className="p-8 text-center bg-secondary">
                <Info className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">{t('searchPlayer.noPlayersFound.title')}</h3>
                <p className="text-muted-foreground">{t('searchPlayer.noPlayersFound.description', { query: currentQuery })}</p>
              </Card>
            )}

            {searchResult && searchResult.pagination.totalPages > 1 && (
              <Pagination
                currentPage={searchResult.pagination.currentPage}
                totalPages={searchResult.pagination.totalPages}
                onPageChange={handlePageChange}
                hasNext={!!searchResult.pagination.nextPage}
                hasPrev={!!searchResult.pagination.prevPage}
              />
            )}
          </div>
        )}
      </main>

      {inspectingAvatar && (
        <AvatarInspectorModal
          isOpen={!!inspectingAvatar}
          onClose={handleCloseInspector}
          avatar={inspectingAvatar.avatar}
          playerId={inspectingAvatar.player.id}
        />
      )}
    </div>
  );
};

export default SearchPlayer;