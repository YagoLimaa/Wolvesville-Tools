import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { ItemImage } from './ItemImage';
import { itemsApi } from '@/lib/api';
import { Item } from '@/components/contexts/ItemsContext';
import { TFunction } from 'i18next';

const rarityColors = {
  common: "border-gray-400/50",
  rare: "border-blue-400/50",
  epic: "border-purple-500/50",
  legendary: "border-yellow-500/50",
};

interface BattlePassSeasonInspectorProps {
  season: string | null;
  onClose: () => void;
  itemsById: Map<string, Item>;
  onImageError: (id: string) => void;
  hoveredItemId: string | null;
  getNameFromUrl: (url: string) => string;
  t: TFunction;
}

export const BattlePassSeasonInspector = ({
  season,
  onClose,
  itemsById,
  onImageError,
  hoveredItemId,
  getNameFromUrl,
  t
}: BattlePassSeasonInspectorProps) => {
  const { data: seasonItemsData, isLoading } = useQuery({
    queryKey: ['bpSeason', season],
    queryFn: async () => {
      if (!season) return [];
      const response = await itemsApi.getTags(season);
      if (response.error) throw new Error(response.error);
      return Array.isArray(response.data) ? response.data : [];
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
    
    return Array.from(uniqueItems.values());
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
};