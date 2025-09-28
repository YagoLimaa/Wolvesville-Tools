import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Clock } from "lucide-react";

const mockChallenges = [
  {
    title: "Vença 5 partidas como Villager",
    progress: 3,
    total: 5,
    xp: 500,
    difficulty: "Fácil",
    timeLeft: "2d 5h"
  },
  {
    title: "Elimine 3 jogadores como Werewolf",
    progress: 1,
    total: 3,
    xp: 750,
    difficulty: "Médio",
    timeLeft: "1d 12h"
  },
  {
    title: "Use poder especial 10 vezes",
    progress: 7,
    total: 10,
    xp: 300,
    difficulty: "Fácil",
    timeLeft: "3d 8h"
  },
  {
    title: "Sobreviva até o final 3 vezes",
    progress: 2,
    total: 3,
    xp: 1000,
    difficulty: "Difícil",
    timeLeft: "4d 2h"
  }
];

export const BattlePassChallenges = () => {
  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="w-5 h-5 text-primary" />
          Desafios Diários
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockChallenges.map((challenge, index) => (
            <div key={index} className="p-4 rounded-lg bg-background/50 border border-border space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{challenge.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge 
                      variant={
                        challenge.difficulty === "Fácil" ? "secondary" :
                        challenge.difficulty === "Médio" ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {challenge.difficulty}
                    </Badge>
                    <span className="text-sm text-primary font-medium">+{challenge.xp} XP</span>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {challenge.timeLeft}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progresso</span>
                  <span>{challenge.progress}/{challenge.total}</span>
                </div>
                <Progress 
                  value={(challenge.progress / challenge.total) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};