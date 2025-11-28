import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Filter, Gem } from 'lucide-react';

interface ItemFilterSidebarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  rarityFilter: string;
  setRarityFilter: (value: string) => void;
  genderFilter: string;
  setGenderFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  bpSeasonFilter: string;
  setBpSeasonFilter: (value: string) => void;
  avatarItemTypes: string[];
}

export const ItemFilterSidebar: React.FC<ItemFilterSidebarProps> = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  rarityFilter,
  setRarityFilter,
  genderFilter,
  setGenderFilter,
  typeFilter,
  setTypeFilter,
  bpSeasonFilter,
  setBpSeasonFilter,
  avatarItemTypes,
}) => {
  const { t, i18n } = useTranslation();

  const categoryKeys = React.useMemo(() => [
    "avatarItemCollections", "avatarItems", "avatarItemSets", "backgrounds", "bodyPaints",
    "bundles", "calendars", "emojiCollections", "emojis", "loadingScreens",
    "profileIconBorders", "profileIcons", "roleIcons", "roseSkins",
  ], []);

  return (
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
                      .map(key => ({ key, name: t(`itemsSkins.categories.${key}`) }))
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
                <Select value={genderFilter} onValueChange={setGenderFilter}>
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
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('itemsSkins.allTypes')}</SelectItem>
                    {avatarItemTypes
                      .map(type => ({ key: type, name: t(`itemsSkins.avatarTypes.${type}`, type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) }))
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
              <AccordionTrigger disabled={categoryFilter !== 'all' && categoryFilter !== 'avatarItems'}>
                {t('itemsSkins.battlePassSeason')}
              </AccordionTrigger>
              <AccordionContent>
                <Select
                  disabled={categoryFilter !== 'all' && categoryFilter !== 'avatarItems'}
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
  );
};
