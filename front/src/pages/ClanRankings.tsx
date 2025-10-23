import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { ClanCard, Clan } from "@/components/ClanCard";
import { Card } from "@/components/ui/card";
import { Info, ArrowDownUp, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
                  <Button variant="ghost" size="icon" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                    <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

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