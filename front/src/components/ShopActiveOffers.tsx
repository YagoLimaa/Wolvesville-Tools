import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Gem, AlertTriangle } from "lucide-react";
import { useItems, Item } from "./contexts/ItemsContext";
import { shopApi } from "@/lib/api";

interface Offer {
  type: string;
  expireDate: string;
  promoImageUrl: string;
  iconUrl?: string;
  costInGems?: number;
  avatarItemIds?: string[];
  avatarItemSetIds?: (
    | {
        id: string;
        avatarItemIds?: string[];
      }
    | string
  )[];
  advancedRoleCardOfferId?: string;
  avatarItemsCollectionId?: string;
  emojisCollectionId?: string;
}

interface ContainedItemForShop {
  avatarItemId?: string;
}

const fetchShopOffers = async (): Promise<Offer[]> => {
  const response = await shopApi.getActiveOffers();
  if (response.error) {
    throw new Error(response.error);
  }
  return Array.isArray(response.data) ? response.data : [];
};

const getOfferNameFromUrl = (url: string, t: (key: string) => string): string => {
  try {
    const filename = url.split('/').pop()?.split('.')[0] ?? '';
    return filename.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  } catch {
    return t('shop.offer');
  }
};

export const ShopActiveOffers = () => {
  const { t } = useTranslation();
  const { data: offers, isLoading, isError } = useQuery<Offer[], Error>({
    queryKey: ["shopOffers"],
    queryFn: fetchShopOffers,
  });
  const [selectedSet, setSelectedSet] = React.useState<Item | null>(null);
  const { itemsById, allItems } = useItems();

  const collectionPieces = React.useMemo(() => {
    if (!selectedSet) return [];
    const allItemIds: string[] = [];

    if (selectedSet.avatarItemIds && Array.isArray(selectedSet.avatarItemIds)) {
      allItemIds.push(...selectedSet.avatarItemIds);
    }
    if (selectedSet.items && Array.isArray(selectedSet.items)) {
      const itemIdsFromItems = (selectedSet.items as ContainedItemForShop[])
        .map(i => i.avatarItemId)
        .filter(Boolean) as string[];
      allItemIds.push(...itemIdsFromItems);
    }

    const uniqueItemIds = [...new Set(allItemIds)];
    return uniqueItemIds
      .map(itemId => itemsById.get(itemId))
      .filter((item): item is NonNullable<typeof item> => !!item);
  }, [selectedSet, itemsById]);

  const categorizedSkins = React.useMemo(() => {
    const categories = new Map<string, React.ReactNode[]>();
    if (!offers) return categories;

    for (const offer of offers) {
      const categoryName = t(`shop.types.${offer.type}`, { defaultValue: getOfferNameFromUrl(offer.promoImageUrl, t) });
      let cards: React.ReactNode[] = [];

      const hasSets = offer.avatarItemSetIds && offer.avatarItemSetIds.length > 0;
      const isAdvancedRoleCard = offer.type === 'ADVANCED_ROLE_CARD' && offer.advancedRoleCardOfferId;
      const isAvatarItems = offer.type === 'AVATAR_ITEMS' && offer.avatarItemsCollectionId;

      if (hasSets) {
        cards = offer.avatarItemSetIds!.map(setIdObj => {
          const setId = typeof setIdObj === 'string' ? setIdObj : setIdObj.id;
          const itemSet = itemsById.get(setId);
          if (!itemSet || !itemSet.promoImageUrl) return null;
          const displayName = (itemSet.name as string) || getOfferNameFromUrl(itemSet.promoImageUrl as string, t);
          return (
            <Tooltip key={setId}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSelectedSet(itemSet)}
                  className="relative group overflow-hidden rounded-lg border border-border hover:border-primary transition-colors duration-300 text-left w-full"
                >
                  <img src={itemSet.promoImageUrl as string} alt={displayName} className="w-full h-41 object-contain p-2 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  {offer.costInGems && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        <Gem className="w-3 h-3 mr-1" />
                        {offer.costInGems}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {displayName}
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent><p>{displayName}</p></TooltipContent>
            </Tooltip>
          );
        });
      } else if (isAdvancedRoleCard) {
        const intermediateItem = itemsById.get(offer.advancedRoleCardOfferId!);
        if (intermediateItem && intermediateItem.avatarItemSetId && typeof intermediateItem.avatarItemSetId === 'string') {
          const finalSet = allItems.find(item => item.id === (intermediateItem.avatarItemSetId as string) && item.category === 'avatarItemSets');
          if (finalSet && finalSet.promoImageUrl) {
            const displayName = (finalSet.name as string) || getOfferNameFromUrl(finalSet.promoImageUrl as string, t);
            cards.push(
              <Tooltip key={finalSet.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedSet(finalSet)}
                    className="relative group overflow-hidden rounded-lg border border-border hover:border-primary transition-colors duration-300 text-left w-full"
                  >
                    <img src={finalSet.promoImageUrl as string} alt={displayName} className="w-full h-41 object-contain p-2 transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {offer.costInGems && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          <Gem className="w-3 h-3 mr-1" />
                          {offer.costInGems}
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {displayName}
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>{displayName}</p></TooltipContent>
              </Tooltip>
            );
          }
        }
      } else if (isAvatarItems) {
        const collectionItem = itemsById.get(offer.avatarItemsCollectionId!);
        if (collectionItem) {
          const displaySet: Item = {
            ...collectionItem,
            promoImageUrl: offer.promoImageUrl,
            name: collectionItem.name || getOfferNameFromUrl(offer.promoImageUrl, t)
          };
          const displayName = displaySet.name;
          cards.push(
            <Tooltip key={displaySet.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSelectedSet(displaySet)}
                  className="relative group overflow-hidden rounded-lg border border-border hover:border-primary transition-colors duration-300 text-left w-full"
                >
                  <img src={offer.iconUrl || offer.promoImageUrl} alt={displayName} className="w-full h-28 object-contain p-2 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  {offer.costInGems && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        <Gem className="w-3 h-3 mr-1" />
                        {offer.costInGems}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {displayName}
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent><p>{displayName}</p></TooltipContent>
            </Tooltip>
          );
        }
      } else {
        cards.push(
          <Tooltip key={offer.promoImageUrl}>
            <TooltipTrigger asChild>
              <button
                onClick={() => { /* Handle non-set click */ }}
                className="relative group overflow-hidden rounded-lg border border-border hover:border-primary transition-colors duration-300 text-left w-full"
              >
                <img src={offer.promoImageUrl} alt={offer.type} className="w-full h-28 object-contain p-2 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                {offer.costInGems && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      <Gem className="w-3 h-3 mr-1" />
                      {offer.costInGems}
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {getOfferNameFromUrl(offer.promoImageUrl, t)}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent><p>{getOfferNameFromUrl(offer.promoImageUrl, t)}</p></TooltipContent>
          </Tooltip>
        );
      }

      if (!categories.has(categoryName)) {
        categories.set(categoryName, []);
      }
      categories.get(categoryName)!.push(...cards.filter(Boolean));
    }

    return categories;
  }, [offers, itemsById, allItems, t]);

  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShoppingBag className="w-5 h-5 text-primary" />
          {t('shop.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{t('shop.fetchError')}</AlertDescription>
          </Alert>
        )}

        {offers && (
          <div className="space-y-6">
            {Array.from(categorizedSkins.entries()).map(([category, cards]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-primary mb-3">
                  {category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {cards}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedSet} onOpenChange={(isOpen) => !isOpen && setSelectedSet(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            {selectedSet && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl font-bold">{(selectedSet.name as string) || ""}</DialogTitle>
                  <DialogDescription className="text-center text-muted-foreground">
                    {t('shop.setDetailsDescription', 'Here are the items included in this set.')}
                  </DialogDescription>
                </DialogHeader>
                <div className="relative mb-4 flex justify-center">
                  <img src={selectedSet.promoImageUrl as string} alt={selectedSet.name as string} className="h-auto max-h-40 object-contain rounded-lg border border-border" />
                </div>
                <div className="overflow-y-auto pr-4 -mr-4">
                  {collectionPieces.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {collectionPieces.map(piece => piece && (
                        <div key={piece.id} className="flex flex-col items-center gap-2 text-center">
                          <div className="aspect-square w-full p-2 rounded-lg bg-secondary/50 border border-border">
                            <img src={piece.imageUrl} alt={piece.name} className="w-full h-full object-contain" />
                          </div>
                          <p className="text-xs font-semibold text-white truncate w-full">{piece.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">{t('shop.detailsError')}</p>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};