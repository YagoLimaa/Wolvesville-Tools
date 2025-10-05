import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BattlePassRewards } from "./BattlePassRewards";
import { BattlePassShop } from "./BattlePassShop";
import { Trophy, Calendar, AlertTriangle } from "lucide-react";

export interface Reward {
  type: string;
  amount: number;
  free: boolean;
  // Adicionando outras propriedades como opcionais
  emojiId?: string;
  avatarItemIdMale?: string;
  avatarItemIdFemale?: string;
  avatarItemId?: string;
  rosePackageId?: string;
  profileIconId?: string;
  bodyPaintId?: string;
  loadingScreenId?: string;
  imageUrl: string; // Adicionando a URL da imagem
}

export interface BattlePassCoinReward {
  battlePassCoins: number;
  free: boolean;
  amount: number;
  level: number;
}

export type BattlePassReward = Reward | BattlePassCoinReward;

export interface BattlePassSeasonData {
  startTime: string;
  number: number;
  durationInDays: number;
  iconUrl: string;
  rewards: BattlePassReward[];
}

const fetchBattlePassSeason = async (): Promise<BattlePassSeasonData> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/battlePass/season`);
  if (!response.ok) {
    throw new Error("Não foi possível buscar os dados do Battle Pass.");
  }
  return response.json();
};

export const BattlePassSeason = () => {
  const { data: season, isLoading, isError, error } = useQuery<BattlePassSeasonData, Error>({
    queryKey: ["battlePassSeason"],
    queryFn: fetchBattlePassSeason,
  });

  const getEndDate = () => {
    if (!season) return null;
    const startDate = new Date(season.startTime);
    const endDate = new Date(startDate.setDate(startDate.getDate() + season.durationInDays));
    const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `Termina em ${daysLeft} dias` : "Terminando hoje";
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="w-5 h-5 text-primary" />
          Battle Pass - Temporada Atual
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-6 w-1/4" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {season && (
          <div className="space-y-6">
            {/* Season Info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Temporada {season.number}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{getEndDate()}</span>
                </div>
              </div>
              <img src={season.iconUrl} alt={`Temporada ${season.number}`} className="w-12 h-12" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <GradientButton variant="primary" className="w-full">
                    Ver Battle Pass Completo
                  </GradientButton>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Recompensas da Temporada {season.number}</DialogTitle>
                  </DialogHeader>
                  <div className="overflow-y-auto pr-4">
                    <BattlePassRewards season={season} />
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <GradientButton variant="outline" className="w-full">Loja do Passe</GradientButton>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Loja da Temporada {season.number}</DialogTitle>
                  </DialogHeader>
                  <div className="overflow-y-auto pr-4">
                    <BattlePassShop />
                  </div>
                </DialogContent>
              </Dialog>
                </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};