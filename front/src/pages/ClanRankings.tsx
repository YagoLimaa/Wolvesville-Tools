import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { ClanCard, Clan } from "@/components/ClanCard";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { ClanFilters } from "@/components/ClanFilters";

const ClanRankings = () => {
  const { t } = useTranslation();
  const locales: { [key: string]: string } = t('locales', { returnObjects: true }) as { [key: string]: string };

  const [rankings, setRankings] = useState<Clan[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("all");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"xp" | "members">("xp");
  const [joinType, setJoinType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const fetchRankings = useCallback(async (lang: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `/api/clans/search`;
      if (lang !== 'all') {
        url += `?language=${lang.toUpperCase()}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(t("clanRankings.fetch_error"));
      }
      const results = await response.json() as Clan[];
      setRankings(results);
    } catch (err) {
      setError(t("clanRankings.search_error"));
      setRankings(null);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRankings(language);
  }, [language, fetchRankings]);

  const sortedResults = useMemo(() => {
    if (!rankings) return [];
    
    const filtered = rankings.filter(clan => 
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
  }, [rankings, localSearchTerm, joinType, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">{t("clanRankings.title")}</h1>
        <div className="space-y-6">
          {isLoading && <p className="text-center text-muted-foreground text-lg">{t("clanRankings.loading")}</p>}
          {error && <p className="text-center text-destructive text-lg">{error}</p>}

          {rankings !== null && (
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

              {sortedResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedResults.map((clan) => <ClanCard key={clan.id} clan={clan} />)}
                </div>
              ) : (
                <Card className="p-8 text-center bg-secondary">
                  <Info className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-semibold">{t("clanRankings.no_clans_found")}</h3>
                  <p className="text-muted-foreground">{t("clanRankings.no_clans_found_description")}</p>
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