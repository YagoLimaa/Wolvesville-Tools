import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown } from "lucide-react";

const mockHighscores = [
  { rank: 1, username: "WolfMaster", level: 89, wins: 1247, icon: Crown, color: "text-yellow-500" },
  { rank: 2, username: "MoonHunter", level: 85, wins: 1189, icon: Trophy, color: "text-gray-400" },
  { rank: 3, username: "NightStalker", level: 82, wins: 1156, icon: Medal, color: "text-amber-600" },
  { rank: 4, username: "ShadowWolf", level: 78, wins: 1098, icon: Award, color: "text-blue-500" },
  { rank: 5, username: "LunarBeast", level: 76, wins: 1067, icon: Award, color: "text-blue-500" },
  { rank: 6, username: "AlphaWolf", level: 74, wins: 1023, icon: Award, color: "text-blue-500" },
  { rank: 7, username: "PackLeader", level: 72, wins: 998, icon: Award, color: "text-blue-500" },
  { rank: 8, username: "WildHowl", level: 70, wins: 967, icon: Award, color: "text-blue-500" },
];

export const PlayersHighscores = () => {
  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="w-5 h-5 text-primary" />
          Top Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockHighscores.map((player, index) => {
            const Icon = player.icon;
            return (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-accent/20 ${
                  player.rank <= 3 ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30" : "bg-background/50 border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${player.color}`} />
                    <span className="font-bold text-lg min-w-[20px]">#{player.rank}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {player.username.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{player.username}</div>
                      <div className="text-sm text-muted-foreground">
                        Level {player.level}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-primary">{player.wins}</div>
                  <div className="text-xs text-muted-foreground">vitórias</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};