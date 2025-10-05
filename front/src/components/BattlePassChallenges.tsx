import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Target, Clock, AlertTriangle } from "lucide-react";

interface Challenge {
  id: string;
  description: string;
  target: number;
  iconUrl: string;
  startTime: string;
  durationInDays: number;
  rewardRoleIconId?: string;
}

const fetchBattlePassChallenges = async (): Promise<Challenge[]> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/battlePass/challenges`);
  if (!response.ok) {
    throw new Error("Não foi possível buscar os desafios do Battle Pass.");
  }
  return response.json();
};

const getTimeLeft = (startTime: string, durationInDays: number): string => {
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.setDate(startDate.getDate() + durationInDays));
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) return "Expirado";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return `${days}d ${hours}h`;
};

export const BattlePassChallenges = () => {
  const { data: challenges, isLoading, isError, error } = useQuery<Challenge[], Error>({
    queryKey: ["battlePassChallenges"],
    queryFn: fetchBattlePassChallenges,
  });

  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="w-5 h-5 text-primary" />
          Desafios do Passe
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {challenges && (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="p-4 rounded-lg bg-background/50 border border-border flex items-center gap-4">
                <img 
                  src={challenge.iconUrl} 
                  alt="Ícone do Desafio" 
                  className="w-12 h-12"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{challenge.description}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-primary">
                      Objetivo: {challenge.target}
                    </span>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeLeft(challenge.startTime, challenge.durationInDays)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};