import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { ClanCard, Clan } from "@/components/ClanCard";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { debounce } from "@/lib/utils";
import { ClanFilters } from "@/components/ClanFilters";
import { clansApi } from "@/lib/api";
import { useClanFilters, SortBy, SortOrder, JoinType } from "@/hooks/useClanFilters";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";

// Define a type for the object structure when the response is not an array
interface ClanSearchResponse {
  clans: Clan[];
}

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
  const [searchParams, setSearchParams] = useSearchParams();

  // State derived from URL
  const query = searchParams.get("name") || "";
  const language = searchParams.get("lang") || "all";
  const localSearchTerm = searchParams.get("filter") || "";
  const sortBy = (searchParams.get("sortBy") as SortBy) || "xp";
  const joinType = (searchParams.get("join") as JoinType) || "all";
  const sortOrder = (searchParams.get("order") as SortOrder) || "desc";

  useSEO({
    title: query
      ? `Search Clans - ${query} - Wolvesville Tools`
      : "Search Clans - Wolvesville Tools",
    description: query
      ? `Find Wolvesville clans matching ${query}. Filter by language, join type, and sort by XP, level, or members.`
      : "Search and filter Wolvesville clans by language, XP, level, and join type",
    keywords: ["wolvesville", "clans", "search", "filter", query || "clans"],
    url: `https://wolvesville-tools.pages.dev/clan/search${query ? `?name=${encodeURIComponent(query)}` : ''}`,
    schemaMarkup: {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "name": "Wolvesville Clan Search",
      "description": "Search and filter Wolvesville clans",
      "url": "https://wolvesville-tools.pages.dev/clan/search"
    }
  });

  const { sortedResults } = useClanFilters({
    clans: searchResults,
    localSearchTerm,
    joinType,
    sortBy,
    sortOrder,
  });

  const locales = useMemo(() => 
    localesList.reduce((acc, loc) => {
      acc[loc] = t(`locales.${loc}`);
      return acc;
    }, {} as { [key: string]: string }),
  [t]);

  const handleApiSearch = useCallback(async (clanName: string, lang: string) => {
    if (!clanName) {
      setSearchResults(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await clansApi.search(clanName, lang !== 'all' ? lang : undefined);
      if (response.error) throw new Error(response.error);
      
      let results: Clan[] = [];
      if (Array.isArray(response.data)) {
        results = response.data;
      } else if (typeof response.data === 'object' && response.data !== null && 'clans' in response.data) {
        results = (response.data as ClanSearchResponse).clans;
      }

      setSearchResults(results);
    } catch (err) {
      setError(t("common.searchError"));
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const debouncedApiSearch = useMemo(() => debounce(handleApiSearch, 500), [handleApiSearch]);

  useEffect(() => {
    debouncedApiSearch(query, language);
  }, [query, language, debouncedApiSearch]);
  
  const updateSearchParams = (newParams: Record<string, string>) => {
    const currentParams = Object.fromEntries(searchParams);
    const updated = { ...currentParams, ...newParams };
    for (const key in updated) {
      if (!updated[key] || updated[key] === 'all') {
        delete updated[key];
      }
    }
    setSearchParams(updated, { replace: true });
  };
  
  const setQuery = (value: string) => updateSearchParams({ name: value });
  const setLanguage = (value: string) => updateSearchParams({ lang: value });
  const setLocalSearchTerm = (value: string) => updateSearchParams({ filter: value });
  const setSortBy = (value: SortBy) => updateSearchParams({ sortBy: value });
  const setJoinType = (value: JoinType) => updateSearchParams({ join: value });
  const toggleSortOrder = () => updateSearchParams({ order: sortOrder === 'asc' ? 'desc' : 'asc' });

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-28 py-8">
        <div className="space-y-6">
          <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur border-accent/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-center mb-4">{t('clanSearch.search_clan_title')}</h2>
              <div className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('clanSearch.search_clan_placeholder')}
                  aria-label={t('clanSearch.clan_name_label')}
                  className="text-center"
                />
              </div>
            </CardContent>
          </Card>

          <ClanFilters
            localSearchTerm={localSearchTerm}
            setLocalSearchTerm={setLocalSearchTerm}
            language={language}
            setLanguage={setLanguage}
            locales={locales}
            sortBy={sortBy}
            setSortBy={setSortBy}
            joinType={joinType}
            setJoinType={setJoinType}
            sortOrder={sortOrder}
            toggleSortOrder={toggleSortOrder}
          />

          {isLoading && <p className="text-center text-muted-foreground text-lg">{t('clanSearch.searching_clans')}</p>}
          {error && <p className="text-center text-destructive text-lg">{error}</p>}

          {searchResults !== null && (
            <div>
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
