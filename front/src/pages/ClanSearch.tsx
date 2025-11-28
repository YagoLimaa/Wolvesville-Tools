import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { SearchForm } from "@/components/SearchForm";
import { ClanCard, Clan } from "@/components/ClanCard";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { debounce } from "@/lib/utils";
import { ClanFilters } from "@/components/ClanFilters";
import { clansApi } from "@/lib/api";
import { useClanFilters } from "@/hooks/useClanFilters";

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    language,
    setLanguage,
    localSearchTerm,
    setLocalSearchTerm,
    sortBy,
    setSortBy,
    joinType,
    setJoinType,
    sortOrder,
    toggleSortOrder,
    sortedResults,
  } = useClanFilters(searchResults);

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
      const response = await clansApi.search(clanName, lang !== 'all' ? lang : undefined);
      if (response.error) {
        throw new Error(response.error);
      }
      let results: Clan[] = Array.isArray(response.data) ? response.data : (response.data?.clans || []);
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
    }
  }, [searchParams]);

  useEffect(() => {
    if (query) {
      debouncedSearch({ clanName: query, lang: language });
    }
  }, [query, language, debouncedSearch]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-28 py-8">
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
