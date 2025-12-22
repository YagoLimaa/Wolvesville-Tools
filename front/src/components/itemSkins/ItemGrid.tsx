import * as React from 'react';
import { Item } from '@/components/contexts/ItemsContext';
import { Card } from '@/components/ui/card';
import { ItemImage } from './ItemImage';
import { collectionCategories, reverseSearchableCategories, rarityColors, getNameFromUrl } from '@/lib/itemUtils';
import { TFunction } from 'i18next';
import { Dispatch, SetStateAction } from 'react';

interface ItemGridProps {
  items: Item[];
  handleItemClick: (item: Item) => void;
  hoveredItemId: string | null;
  setHoveredItemId: Dispatch<SetStateAction<string | null>>;
  onImageError: (itemId: string) => void;
  categoryFilter: string;
  t: TFunction;
}

export const ItemGrid = ({
  items,
  handleItemClick,
  hoveredItemId,
  setHoveredItemId,
  onImageError,
  categoryFilter,
  t,
}: ItemGridProps) => {
  if (items.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-accent/20 flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">{t('itemsSkins.noItemsFound')}</h2>
          <p className="text-muted-foreground mt-2">{t('itemsSkins.adjustFilters')}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => setHoveredItemId(item.id)}
          onMouseLeave={() => setHoveredItemId(null)}
          className={`group relative aspect-square flex flex-col items-center justify-center ${item.category === 'bundles' ? '' : 'p-2'} rounded-lg bg-background/50 border-2 transition-all hover:scale-105 hover:shadow-glow-primary text-left w-full
            ${item.rarity ? rarityColors[item.rarity] : 'border-border'}
            ${collectionCategories.includes(item.category) || item.parentSetId || reverseSearchableCategories.includes(item.category) ? 'cursor-pointer' : 'cursor-default'}
          `}
        >
          <ItemImage item={item} onImageError={onImageError} isHovered={hoveredItemId === item.id} categoryFilter={categoryFilter} />
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-md">
            <p className="text-xs font-semibold text-white truncate">{item.name || getNameFromUrl(item.imageUrl, t)}</p>
          </div>
        </button>
      ))}
    </div>
  );
};