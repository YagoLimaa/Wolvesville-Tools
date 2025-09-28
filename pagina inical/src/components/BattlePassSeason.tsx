import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { Trophy, Star, Calendar } from "lucide-react";

export const BattlePassSeason = () => {
  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="w-5 h-5 text-primary" />
          Battle Pass - Temporada Atual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Season Info */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Temporada Lunar</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Termina em 15 dias</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            Nível 42
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da Temporada</span>
            <span>8,450 / 10,000 XP</span>
          </div>
          <Progress value={84.5} className="h-2" />
        </div>

        {/* Rewards Preview */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Próximas Recompensas
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg border border-primary/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary/30 rounded-full mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Nível {43 + i}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <GradientButton variant="primary" className="w-full">
          Ver Battle Pass Completo
        </GradientButton>
      </CardContent>
    </Card>
  );
};