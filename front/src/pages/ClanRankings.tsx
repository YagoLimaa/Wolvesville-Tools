import { useState, useEffect, useMemo } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { ClanCard, Clan } from "@/components/ClanCard";
import { Card } from "@/components/ui/card";
import { Info, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Correct list of locales based on game flags
const locales: { [key: string]: string } = {
  "all": "Todos",
  "br": "Brasil",
  "de": "Alemanha",
  "fr": "França",
  "gb": "Reino Unido",
  "th": "Tailândia",
  "vn": "Vietnã",
  "tr": "Turquia",
  "aq": "Antártida",
  "ar": "Argentina",
  "at": "Áustria",
  "au": "Austrália",
  "ax": "Ilhas Aland",
  "az": "Azerbaijão",
  "be": "Bélgica",
  "bg": "Bulgária",
  "bh": "Bahrein",
  "bm": "Bermudas",
  "bn": "Brunei",
  "bs": "Bahamas",
  "bw": "Botsuana",
  "by": "Bielorrússia",
  "ca": "Canadá",
  "cd": "Congo",
  "cf": "República Centro-Africana",
  "ch": "Suíça",
  "ck": "Ilhas Cook",
  "cl": "Chile",
  "cn": "China",
  "co": "Colômbia",
  "cr": "Costa Rica",
  "cy": "Chipre",
  "cz": "República Tcheca",
  "dk": "Dinamarca",
  "do": "República Dominicana",
  "dz": "Argélia",
  "ee": "Estônia",
  "es": "Espanha",
  "eu": "União Europeia",
  "fi": "Finlândia",
  "fj": "Fiji",
  "gn": "Guiné",
  "gr": "Grécia",
  "gt": "Guatemala",
  "hk": "Hong Kong",
  "hr": "Croácia",
  "hu": "Hungria",
  "id": "Indonésia",
  "ie": "Irlanda",
  "il": "Israel",
  "im": "Ilha de Man",
  "in": "Índia",
  "is": "Islândia",
  "it": "Itália",
  "jm": "Jamaica",
  "jp": "Japão",
  "kh": "Camboja",
  "kp": "Coreia do Norte",
  "kr": "Coreia do Sul",
  "kw": "Kuwait",
  "kz": "Cazaquistão",
  "la": "Laos",
  "lr": "Libéria",
  "lt": "Lituânia",
  "lu": "Luxemburgo",
  "ma": "Marrocos",
  "md": "Moldávia",
  "mn": "Mongólia",
  "mx": "México",
  "my": "Malásia",
  "nc": "Nova Caledônia",
  "nl": "Holanda",
  "no": "Noruega",
  "np": "Nepal",
  "nz": "Nova Zelândia",
  "pa": "Panamá",
  "pe": "Peru",
  "ph": "Filipinas",
  "pk": "Paquistão",
  "pl": "Polônia",
  "ps": "Palestina",
  "pt": "Portugal",
  "py": "Paraguai",
  "ro": "Romênia",
  "rs": "Sérvia",
  "ru": "Rússia",
  "se": "Suécia",
  "sg": "Singapura",
  "si": "Eslovênia",
  "sk": "Eslováquia",
  "so": "Somália",
  "sr": "Suriname",
  "sy": "Síria",
  "tw": "Taiwan",
  "ua": "Ucrânia",
  "ug": "Uganda",
  "us": "Estados Unidos",
  "uy": "Uruguai",
  "va": "Vaticano",
  "vi": "Vietnã",
  "ye": "Iêmen",
  "za": "África do Sul",
};

const ClanRankings = () => {
  const [rankings, setRankings] = useState<Clan[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("all");
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const fetchRankings = async (lang: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `/api/clans/search`;
      if (lang !== 'all') {
        url += `?language=${lang.toUpperCase()}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Falha ao buscar dados. A API pode estar offline.");
      }
      const results = await response.json() as Clan[];
      // Sort by XP on the frontend
      results.sort((a, b) => b.xp - a.xp);
      setRankings(results);
    } catch (err) {
      setError("Erro ao buscar rankings. Tente novamente.");
      setRankings(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings(language);
  }, [language]);

  const filteredResults = useMemo(() => {
    if (!rankings) return [];
    
    return rankings.filter(clan => 
      clan.name.toLowerCase().includes(localSearchTerm.toLowerCase())
    );
  }, [rankings, localSearchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Ranking de Clãs</h1>
        <div className="space-y-6">
          {isLoading && <p className="text-center text-muted-foreground text-lg">Buscando rankings...</p>}
          {error && <p className="text-center text-destructive text-lg">{error}</p>}

          {rankings !== null && (
            <div>
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4 p-4 bg-card/50 rounded-lg border border-border">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar clãs..."
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
                </div>
              </div>

              {filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((clan) => <ClanCard key={clan.id} clan={clan} />)}
                </div>
              ) : (
                <Card className="p-8 text-center bg-secondary">
                  <Info className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-semibold">Nenhum clã encontrado</h3>
                  <p className="text-muted-foreground">Não encontramos nenhum clã para os filtros selecionados.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClanRankings;
