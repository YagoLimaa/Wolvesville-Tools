import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { SearchForm } from "@/components/SearchForm";
import { ClanCard, Clan } from "@/components/ClanCard";
import { Card, CardContent } from "@/components/ui/card";
import { Info, ArrowDownUp, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const locales: { [key: string]: string } = {
  "ar": "Árabe", "az": "Azeri", "bg": "Búlgaro", "bs": "Bósnio", "by": "Bielorrusso",
  "ca": "Catalão", "cs": "Tcheco", "da": "Dinamarquês", "de-at": "Alemão (Áustria)",
  "de": "Alemão", "el": "Grego", "en": "Inglês", "es": "Espanhol", "et": "Estoniano",
  "fa": "Persa", "fi": "Finlandês", "fil": "Filipino", "fr": "Francês", "he": "Hebraico",
  "hi": "Hindi", "hr": "Croata", "hu": "Húngaro", "id": "Indonésio", "in": "Indonésio",
  "it": "Italiano", "ja": "Japonês", "ka": "Georgiano", "ko": "Coreano", "lo": "Laosiano",
  "lt": "Lituano", "ms": "Malaio", "nl": "Holandês", "pl": "Polonês", "pt-br": "Português (Brasil)",
  "pt": "Português", "ro": "Romeno", "ru": "Russo", "sk": "Eslovaco", "sl": "Esloveno",
  "sq": "Albanês", "sr-cyr": "Sérvio (Cirílico)", "sr": "Sérvio", "sv": "Sueco",
  "th": "Tailandês", "tr": "Turco", "uk": "Ucraniano", "vi": "Vietnamita",
  "zh-cn": "Chinês (Simplificado)", "zh-tw": "Chinês (Tradicional)"
};

const ClanSearch = () => {
  const [searchResults, setSearchResults] = useState<Clan[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [sortBy, setSortBy] = useState<"xp" | "members">("xp");
  const [language, setLanguage] = useState("pt-br");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const clanNameFromUrl = searchParams.get("name");
    if (clanNameFromUrl) {
      handleSearch(clanNameFromUrl);
    }
  }, []);

  const handleSearch = async (clanName: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(clanName);
    navigate(`/clan/search?name=${encodeURIComponent(clanName)}`);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/clans/search?name=${encodeURIComponent(clanName)}&language=${language.toUpperCase()}`);
      if (!response.ok) {
        throw new Error("Falha ao buscar dados. A API pode estar offline.");
      }
      const results = await response.json() as Clan[];
      setSearchResults(results);
    } catch (err) {
      setError("Erro ao buscar clãs. Tente novamente.");
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedResults = useMemo(() => {
    if (!searchResults) return [];
    
    const filtered = searchResults.filter(clan => 
      clan.name.toLowerCase().includes(localSearchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'xp') return b.xp - a.xp;
      return b.members.length - a.members.length;
    });
  }, [searchResults, sortBy, localSearchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur border-accent/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-center mb-4">Buscar Clã</h2>
              <SearchForm 
                onSearch={handleSearch} 
                isLoading={isLoading} 
                placeholder="Digite o nome do clã..."
                label="Nome do Clã:"
                buttonText="Buscar Clã"
              />
            </CardContent>
          </Card>

          {isLoading && <p className="text-center text-muted-foreground text-lg">Buscando clãs...</p>}
          {error && <p className="text-center text-destructive text-lg">{error}</p>}

          {searchResults && searchResults.length > 0 && (
            <div>
              {sortedResults.length > 0 ? (
                <>
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-4 p-4 bg-card/50 rounded-lg border border-border">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Filtrar resultados..."
                        className="pl-10"
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Idioma" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(locales).map(([code, name]) => <SelectItem key={code} value={code}>{name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as "xp" | "members")}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Ordenar por" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="xp">Mais XP</SelectItem>
                            <SelectItem value="members">Mais Membros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{sortedResults.map((clan) => <ClanCard key={clan.id} clan={clan} />)}</div>
                </>
              ) : searchResults.length > 0 ? (
                <Card className="p-8 text-center bg-secondary">
                  <Info className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-semibold">Nenhum clã corresponde ao filtro</h3>
                  <p className="text-muted-foreground">Tente limpar o campo "Filtrar resultados".</p>
                </Card>
              ) : searchResults.length === 0 && (
                <Card className="p-8 text-center bg-secondary">
                  <Info className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-semibold">Nenhum clã encontrado</h3>
                  <p className="text-muted-foreground">Não encontramos nenhum clã com o nome "{currentQuery}".</p>
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