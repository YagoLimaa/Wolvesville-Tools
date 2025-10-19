import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { SearchForm } from "@/components/SearchForm";
import { PlayerCard } from "@/components/PlayerCard";
import { Pagination } from "@/components/Pagination";
import { GradientButton } from "@/components/ui/gradient-button";
import { Card } from "@/components/ui/card";
import { useItems } from "../components/contexts/ItemsContext";
import { SearchResult } from "@/types/Player";
import { ArrowLeft, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlayersHighscores } from "@/components/PlayersHighscores";

const SearchPlayer = () => {
  const { t } = useTranslation();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoading: isLoadingItems } = useItems();
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const usernameFromUrl = searchParams.get("username");
    if (usernameFromUrl) {
      handleSearch(usernameFromUrl);
    }
  }, [searchParams]);

  const handleSearch = async (username: string, page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search?username=${encodeURIComponent(username)}&page=${page}`);
      if (!response.ok) {
        throw new Error('fetchError');
      }
      const result = await response.json() as SearchResult;

      setSearchResult(result);
      setCurrentQuery(username);
      setSearchParams({ username, page: page.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(t('searchPlayer.searchError'));
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (currentQuery) {
      handleSearch(currentQuery, page);
    }
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        {isLoadingItems && (
          <div className="text-center text-muted-foreground text-lg">
            {t('searchPlayer.loadingItems')}
          </div>
        )}
        {!isLoadingItems && (
          <div className="space-y-8">
            {!searchResult && (
              <>
                <div className="text-center max-w-xl mx-auto">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    {t('searchPlayer.title')}
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground">
                    {t('searchPlayer.subtitle')}
                  </p>
                  <div className="mt-8">
                    <SearchForm 
                      onSearch={handleSearch} 
                      isLoading={isLoading}
                      placeholder={t('searchPlayer.placeholder')}
                      label={t('searchPlayer.label')}
                      buttonText={t('searchPlayer.buttonText')}
                    />
                  </div>
                </div>
                <div className="mt-12">
                  <PlayersHighscores />
                </div>
              </>
            )}

            {searchResult && (
              <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
                <GradientButton variant="outline" onClick={handleGoBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('searchPlayer.goBack')}
                </GradientButton>
              
                <div className="text-center md:text-right">
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('searchPlayer.resultsTitle', { query: currentQuery })}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('searchPlayer.pagination', { currentPage: searchResult.pagination.currentPage, totalPages: searchResult.pagination.totalPages })}
                  </p>
                </div>
              </div>
            )}

            {isLoading && <p className="text-center text-muted-foreground text-lg">{t('searchPlayer.loadingPlayers')}</p>}

            {searchResult && searchResult.players.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {searchResult.players.map((player, index) => (
                  <div
                    key={player.id}
                    className="animate-in fade-in zoom-in-95"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <PlayerCard player={player} />
                  </div>
                ))}
              </div>
            )}

            {searchResult && searchResult.players.length === 0 && !isLoading && (
              <Card className="p-8 text-center bg-secondary">
                <Info className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">{t('searchPlayer.noPlayersFound.title')}</h3>
                <p className="text-muted-foreground">{t('searchPlayer.noPlayersFound.description', { query: currentQuery })}</p>
              </Card>
            )}

            {searchResult && searchResult.pagination.totalPages > 1 && (
              <Pagination
                currentPage={searchResult.pagination.currentPage}
                totalPages={searchResult.pagination.totalPages}
                onPageChange={handlePageChange}
                hasNext={!!searchResult.pagination.nextPage}
                hasPrev={!!searchResult.pagination.prevPage}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPlayer;
