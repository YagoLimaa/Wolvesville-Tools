
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, ArrowDownUp } from "lucide-react";

interface ClanFiltersProps {
  localSearchTerm: string;
  setLocalSearchTerm: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  locales: { [key: string]: string };
  sortBy: "xp" | "members";
  setSortBy: (value: "xp" | "members") => void;
  joinType: string;
  setJoinType: (value: string) => void;
  sortOrder: "asc" | "desc";
  toggleSortOrder: () => void;
}

export const ClanFilters = ({
  localSearchTerm,
  setLocalSearchTerm,
  language,
  setLanguage,
  locales,
  sortBy,
  setSortBy,
  joinType,
  setJoinType,
  sortOrder,
  toggleSortOrder,
}: ClanFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-4 p-4 bg-card/50 rounded-lg border border-border">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("clanRankings.filter_clans")}
          className="pl-10"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="language-filter">{t('clanRankings.language')}</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language-filter" className="w-[180px]">
              <SelectValue placeholder={t("clanRankings.language")} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(locales).map(([code, name]) => <SelectItem key={code} value={code}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="sort-by-filter">{t('clanSearch.sort_by_placeholder')}</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort-by-filter" className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('clanSearch.sort_by_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xp">{t('clanSearch.sort_by_xp')}</SelectItem>
              <SelectItem value="members">{t('clanSearch.sort_by_members')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="join-type-filter">{t('clanSearch.join_type_placeholder')}</Label>
          <Select value={joinType} onValueChange={setJoinType}>
            <SelectTrigger id="join-type-filter" className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('clanSearch.join_type_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('clanSearch.join_type_all')}</SelectItem>
              <SelectItem value="JOIN_BY_REQUEST">{t('clanSearch.join_type_request')}</SelectItem>
              <SelectItem value="PRIVATE">{t('clanSearch.join_type_private')}</SelectItem>
              <SelectItem value="PUBLIC">{t('clanSearch.join_type_public')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSortOrder}>
          <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};
