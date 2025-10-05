import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { SearchForm } from "@/components/SearchForm";
import { PlayerCard } from "@/components/PlayerCard";
import { Pagination } from "@/components/Pagination";
import { GradientButton } from "@/components/ui/gradient-button";
import { Card, CardContent } from "@/components/ui/card";
import { useItems } from "../components/contexts/ItemsContext";
import { SearchResult } from "@/types/Player";
import { ArrowLeft, Info } from "lucide-react";

const SearchPlayer = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoading: isLoadingItems } = useItems();
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Efeito para buscar automaticamente se houver um 'username' na URL
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
        throw new Error("Falha ao buscar dados. A API do Wolvesville pode estar offline ou o backend não está rodando.");
      }
      const result = await response.json() as SearchResult;

      setSearchResult(result);
      setCurrentQuery(username);
      setSearchParams({ username, page: page.toString() }); // Atualiza a URL com a busca atual
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo
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

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        {isLoadingItems && (
          <div className="text-center text-muted-foreground text-lg">
            Carregando dados de itens...
          </div>
        )}
        {!isLoadingItems && (
          <div className="space-y-6">
            {/* Se não houver resultados, mostra o formulário de busca */}
            {!searchResult && (
              <Card className="max-w-md mx-auto bg-card/50 backdrop-blur border-accent/20">
                <CardContent className="p-6">
                  <SearchForm 
                    onSearch={handleSearch} 
                    isLoading={isLoading}
                    placeholder="Digite o nome do jogador..."
                    label="Nome do Jogador:"
                    buttonText="Buscar Jogador"
                  />
                </CardContent>
              </Card>
            )}

            {/* Se houver resultados, mostra o cabeçalho e o botão de voltar */}
            {searchResult && (
              <div className="flex items-center justify-between gap-4">
              <GradientButton variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </GradientButton>
              
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-foreground">
                    Resultados para "{currentQuery}"
                  </h2>
                  <p className="text-muted-foreground">
                    Página {searchResult.pagination.currentPage} de {searchResult.pagination.totalPages}
                  </p>
                </div>
            </div>
            )}
            {isLoading && <p className="text-center text-muted-foreground text-lg">Buscando jogadores...</p>}

            {searchResult && searchResult.players.length > 0 && (
              <>
                {/* Players Grid */}
                <div className="grid gap-6">
                  {searchResult.players.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              </>
            )}

            {searchResult && searchResult.players.length === 0 && !isLoading && (
              <Card className="p-8 text-center bg-secondary">
                <Info className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">Nenhum jogador encontrado</h3>
                <p className="text-muted-foreground">Não encontramos ninguém com o nome "{currentQuery}". Verifique a ortografia e tente novamente.</p>
              </Card>
            )}

            {/* Pagination - Only show if there are results and more than one page */}
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