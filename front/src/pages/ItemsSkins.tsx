import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useItems, Item } from '@/components/contexts/ItemsContext';

import { NavigationBar } from '@/components/ui/navigation-bar';
import { Pagination } from '@/components/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

import { useItemFilters } from '@/hooks/useItemFilters';
import { useItemSelection } from '@/hooks/useItemSelection';
import { getTypeString, getInspectorImageUrl, getNameFromUrl } from '@/lib/itemUtils';

import { ItemFilterSidebar } from '@/components/itemSkins/ItemFilterSidebar';
import { ItemGrid } from '@/components/itemSkins/ItemGrid';
import { CollectionInspector } from '@/components/itemSkins/CollectionInspector';
import { BattlePassSeasonInspector } from '@/components/itemSkins/BattlePassSeasonInspector';

const ITEMS_PER_PAGE = 50;

const ItemsSkins = () => {
  const { t } = useTranslation();
  const { isLoading, isError, itemsById, tagsByItemId } = useItems();
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);
  
  const {
    searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter,
    rarityFilter, setRarityFilter,
    genderFilter, setGenderFilter,
    typeFilter, setTypeFilter,
    bpSeasonFilter, setBpSeasonFilter,
    currentPage, setCurrentPage,
    handleImageError,
    filteredItems,
    avatarItemTypes,
  } = useItemFilters();

  const {
    selectedCollection, setSelectedCollection,
    clickedItem,
    inspectingBpSeason, setInspectingBpSeason,
    handleItemClick,
  } = useItemSelection();

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
  
  const localGetNameFromUrl = (url: string) => getNameFromUrl(url, t);

  const localGetTypeString = (item: Item) => getTypeString(item, clickedItem, itemsById, tagsByItemId, t);

  const localGetInspectorImageUrl = (item: Item) => getInspectorImageUrl(item, clickedItem, itemsById, tagsByItemId);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-28 py-8 mt-[5px]">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8 min-h-[70vh]">
          <ItemFilterSidebar
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
            rarityFilter={rarityFilter} setRarityFilter={setRarityFilter}
            genderFilter={genderFilter} setGenderFilter={setGenderFilter}
            typeFilter={typeFilter} setTypeFilter={setTypeFilter}
            bpSeasonFilter={bpSeasonFilter} setBpSeasonFilter={setBpSeasonFilter}
            avatarItemTypes={avatarItemTypes}
          />

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
            {!isLoading && !isError && (
              <>
                <div className="mb-4 flex justify-end">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    hasPrev={currentPage > 1}
                    hasNext={currentPage < totalPages}
                  />
                </div>
                <ItemGrid
                  items={paginatedItems}
                  handleItemClick={handleItemClick}
                  hoveredItemId={hoveredItemId}
                  setHoveredItemId={setHoveredItemId}
                  onImageError={handleImageError}
                  categoryFilter={categoryFilter}
                  t={t}
                />
              </>
            )}
          </div>
        </div>
      </main>
      
      <CollectionInspector
        selectedCollection={selectedCollection}
        setSelectedCollection={setSelectedCollection}
        allItems={filteredItems}
        itemsById={itemsById}
        onImageError={handleImageError}
        hoveredItemId={hoveredItemId}
        getNameFromUrl={localGetNameFromUrl}
        getTypeString={localGetTypeString}
        getInspectorImageUrl={localGetInspectorImageUrl}
        t={t}
      />

      <BattlePassSeasonInspector 
        season={inspectingBpSeason} 
        onClose={() => setInspectingBpSeason(null)}
        itemsById={itemsById}
        onImageError={handleImageError}
        hoveredItemId={hoveredItemId}
        getNameFromUrl={localGetNameFromUrl}
        t={t}
      />
    </div>
  );
};

export default ItemsSkins;
