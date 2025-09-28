import { useState } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { SearchForm } from "@/components/SearchForm";
import { PlayerCard } from "@/components/PlayerCard";
import { Pagination } from "@/components/Pagination";
import { GradientButton } from "@/components/ui/gradient-button";
import { Card, CardContent } from "@/components/ui/card";
import { mockPlayerSearch } from "@/data/mockPlayers";
import { SearchResult } from "@/types/Player";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const SearchPlayer = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");

  const handleSearch = async (username: string, page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mockPlayerSearch(username, page) as SearchResult;
      setSearchResult(result);
      setCurrentQuery(username);
    } catch (err) {
      setError("Erro ao buscar jogadores. Tente novamente.");
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

  const resetSearch = () => {
    setSearchResult(null);
    setError(null);
    setCurrentQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        {!searchResult ? (
          /* Search Form */
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-border shadow-elevated">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Buscar Jogador no Wolvesville
                  </h2>
                  <p className="text-muted-foreground">
                    Digite o nome do jogador para ver suas estatísticas e informações
                  </p>
                </div>
                
                <SearchForm onSearch={(username) => handleSearch(username)} isLoading={isLoading} />
                
                {error && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Search Results */
          <div className="space-y-6">
            {/* Back to Search */}
            <div className="flex items-center gap-4">
              <GradientButton variant="outline" onClick={resetSearch}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Nova Busca
              </GradientButton>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Resultados para "{currentQuery}"
                </h2>
                <p className="text-muted-foreground">
                  {searchResult.players.length} jogador(es) encontrado(s)
                </p>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid gap-6">
              {searchResult.players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={searchResult.pagination.currentPage}
              totalPages={searchResult.pagination.totalPages}
              onPageChange={handlePageChange}
              hasNext={!!searchResult.pagination.nextPage}
              hasPrev={!!searchResult.pagination.prevPage}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPlayer;