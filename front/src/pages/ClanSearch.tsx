import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { SearchForm } from "@/components/SearchForm";
import { ClanCard, Clan } from "@/components/ClanCard";
import { Card, CardContent } from "@/components/ui/card";
import { Info, ArrowDownUp, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { debounce } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const localesList = [
  "all", "br", "de", "fr", "gb", "th", "vn", "tr", "aq", "ar", "at", "au", 
  "ax", "az", "be", "bg", "bh", "bm", "bn", "bs", "bw", "by", "ca", "cd", 
  "cf", "ch", "ck", "cl", "cn", "co", "cr", "cy", "cz", "dk", "do", "dz", 
  "ee", "es", "eu", "fi", "fj", "gn", "gr", "gt", "hk", "hr", "hu", "id", 
  "ie", "il", "im", "in", "is", "it", "jm", "jp", "kh", "kp", "kr", "kw", 
  "kz", "la", "lr", "lt", "lu", "ma", "md", "mn", "mx", "my", "nc", "nl", 
  "no", "np", "nz", "pa", "pe", "ph", "pk", "pl", "ps", "pt", "py", "ro", 
  "rs", "ru", "se", "sg", "si", "sk", "so", "sr", "sy", "tw", "ua", "ug", 
  "us", "uy", "va", "vi", "ye", "za"
];

const ClanSearch = () => {
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState<Clan[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"xp" | "members">("xp");
  const [language, setLanguage] = useState("all");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [joinType, setJoinType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const locales = useMemo(() => 
    localesList.reduce((acc, loc) => {
      acc[loc] = t(`locales.${loc}`);
      return acc;
    }, {} as { [key: string]: string }),
  [t]);

  const handleSearch = useCallback(async (options: { clanName: string; lang: string; }) => {
    const { clanName, lang } = options;
    if (!clanName) return;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set('name', clanName);
    if (lang !== 'all') params.set('language', lang.toUpperCase());
    
    navigate(`/clan/search?${params.toString()}`);

    try {
      const response = await fetch(`/api/clans/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error(t("common.fetchError"));
      }
      const results = await response.json() as Clan[];
      setSearchResults(results);
    } catch (err) {
      setError(t("common.searchError"));
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, t]);

  const debouncedSearch = useMemo(() => {
    return debounce((options: Parameters<typeof handleSearch>[0]) => {
      handleSearch(options);
    }, 500);
  }, [handleSearch]);

  useEffect(() => {
    const clanNameFromUrl = searchParams.get("name");
    if (clanNameFromUrl) {
      setQuery(clanNameFromUrl);
      // The search itself is triggered by the effect below
    }
  }, [searchParams]);

  useEffect(() => {
    if (query) {
      debouncedSearch({ clanName: query, lang: language });
    }
  }, [query, language, debouncedSearch]);

  const sortedResults = useMemo(() => {
    if (!searchResults) return [];
    
    const filtered = searchResults.filter(clan => 
      clan.name.toLowerCase().includes(localSearchTerm.toLowerCase())
    ).filter(clan => 
      joinType === 'all' || clan.joinType === joinType
    );

    return filtered.sort((a, b) => {
      const aValue = sortBy === 'xp' ? a.xp : a.memberCount;
      const bValue = sortBy === 'xp' ? b.xp : b.memberCount;

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [searchResults, sortBy, localSearchTerm, joinType, sortOrder]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur border-accent/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-center mb-4">{t('clanSearch.search_clan_title')}</h2>
              <SearchForm 
                onSearch={setQuery} 
                isLoading={isLoading} 
                placeholder={t('clanSearch.search_clan_placeholder')}
                label={t('clanSearch.clan_name_label')}
                buttonText={t('clanSearch.search_clan_button')}
              />
            </CardContent>
          </Card>

          {isLoading && <p className="text-center text-muted-foreground text-lg">{t('clanSearch.searching_clans')}</p>}
          {error && <p className="text-center text-destructive text-lg">{error}</p>}

          {searchResults !== null && (
            <div>
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4 p-4 bg-card/50 rounded-lg border border-border">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('clanSearch.filter_results')}
                    className="pl-10"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="language-filter">{t('clanSearch.language_placeholder')}</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language-filter" className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t('clanSearch.language_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(locales).map(([code, name]) => <SelectItem key={code} value={code}>{name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sort-by-filter">{t('clanSearch.sort_by_placeholder')}</Label>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as "xp" | "members")}>
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

              {searchResults.length > 0 ? (
                sortedResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedResults.map((clan) => <ClanCard key={clan.id} clan={clan} />)}
                  </div>
                ) : (
                  <Card className="p-8 text-center bg-secondary">
                    <Info className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="text-xl font-semibold">{t('clanSearch.no_clan_filter_match_title')}</h3>
                    <p  className="text-muted-foreground">{t('clanSearch.no_clan_filter_match_description')}</p>
                  </Card>
                )
              ) : (
                <Card className="p-8 text-center bg-secondary">
                  <Info className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-semibold">{t('clanSearch.no_clan_found_title')}</h3>
                  <p className="text-muted-foreground">{t('clanSearch.no_clan_found_description', { query })}</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClanSearch;