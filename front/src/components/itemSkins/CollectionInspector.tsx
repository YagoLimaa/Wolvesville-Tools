import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Item } from '@/components/contexts/ItemsContext';
import { ItemImage } from './ItemImage';
import { getCollectionPieces, rarityColors } from '@/lib/itemUtils';
import { TFunction } from 'i18next';
import { Dispatch, SetStateAction } from 'react';

interface CollectionInspectorProps {
  selectedCollection: Item | null;
  setSelectedCollection: Dispatch<SetStateAction<Item | null>>;
  allItems: Item[];
  itemsById: Map<string, Item>;
  onImageError: (id: string) => void;
  hoveredItemId: string | null;
  getNameFromUrl: (url: string) => string;
  getTypeString: (item: Item) => string;
  getInspectorImageUrl: (item: Item) => string;
  t: TFunction;
}

export const CollectionInspector = ({
  selectedCollection,
  setSelectedCollection,
  allItems,
  itemsById,
  onImageError,
  hoveredItemId,
  getNameFromUrl,
  getTypeString,
  getInspectorImageUrl,
  t,
}: CollectionInspectorProps) => {
  const collectionPieces = React.useMemo(() => {
    return getCollectionPieces(selectedCollection, allItems, itemsById);
  }, [selectedCollection, allItems, itemsById]);

  if (!selectedCollection) return null;

  return (
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
                  <ItemImage item={piece} onImageError={onImageError} isHovered={hoveredItemId === piece.id} />
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
  );
};