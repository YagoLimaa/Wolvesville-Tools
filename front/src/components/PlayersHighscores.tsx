import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { Trophy, Medal, Award, Crown, AlertTriangle } from "lucide-react";

interface HighscorePlayer {
  playerId: string;
  username: string;
  xp: number;
  oldRank: number;
  // Level pode não estar presente, então o tornamos opcional
  level?: number;
  equippedAvatar?: {
    url: string;
  };
}

const fetchHighscores = async (): Promise<HighscorePlayer[]> => {
  const response = await fetch('/api/players/highscores?limit=10');
  if (!response.ok) {
    throw new Error("fetch_error");
  }
  return response.json();
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return { Icon: Crown, color: "text-yellow-500" };
  if (rank === 2) return { Icon: Trophy, color: "text-gray-400" };
  if (rank === 3) return { Icon: Medal, color: "text-amber-600" };
  return { Icon: Award, color: "text-blue-500" };
};

export const PlayersHighscores = () => {
  const { t } = useTranslation();
  const { data: players, isLoading, isError, error } = useQuery<HighscorePlayer[], Error>({
    queryKey: ["playerHighscores"],
    queryFn: fetchHighscores,
  });

  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="w-5 h-5 text-primary" />
          {t('playersHighscores.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )}
        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{t('playersHighscores.fetchError')}</AlertDescription>
          </Alert>
        )}
        {players && (
          <div>
            <div className="space-y-3">
              {players.slice(0, 10).map((player, index) => {
                const rank = player.oldRank + 1;
                const { Icon, color } = getRankIcon(rank);
                return (
                  <Link
                    key={player.playerId}
                    to={`/search?username=${encodeURIComponent(player.username)}`}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:border-primary hover:shadow-glow-primary hover:scale-[1.02] ${
                      rank <= 3 ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30" : "bg-background/50 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <span className="font-bold text-lg min-w-[20px]">#{rank}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {player.equippedAvatar ? (
                          <img src={player.equippedAvatar.url} alt={player.username} className="w-10 h-10 rounded-full border-2 border-primary/50" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {player.username.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{player.username}</div>
                          {player.level && (
                            <div className="text-sm text-muted-foreground">
                              {t('common.level', { level: player.level })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-primary">{player.xp.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{t('common.xp')}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};