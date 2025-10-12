import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BattlePassRewards } from "./BattlePassRewards";
import { useTranslation } from "react-i18next";
import { BattlePassShop } from "./BattlePassShop";
import { Trophy, Calendar, AlertTriangle } from "lucide-react";

export interface Reward {
  type: string;
  amount: number;
  free: boolean;
  emojiId?: string;
  avatarItemIdMale?: string;
  avatarItemIdFemale?: string;
  avatarItemId?: string;
  rosePackageId?: string;
  profileIconId?: string;
  bodyPaintId?: string;
  loadingScreenId?: string;
  imageUrl: string;
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
  const response = await fetch('/api/battlePass/season');
  if (!response.ok) {
    throw new Error("fetch_error");
  }
  return response.json();
};

export const BattlePassSeason = () => {
  const { t } = useTranslation();
  const { data: season, isLoading, isError, error } = useQuery<BattlePassSeasonData, Error>({
    queryKey: ["battlePassSeason"],
    queryFn: fetchBattlePassSeason,
  });

  const getEndDate = (season: BattlePassSeasonData | undefined) => {
    if (!season) return null;
    const startDate = new Date(season.startTime);
    const endDate = new Date(startDate.setDate(startDate.getDate() + season.durationInDays));
    const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? t('battlePass.season.endsIn', { daysLeft }) : t('battlePass.season.endingToday');
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="w-5 h-5 text-primary" />
          {t('battlePass.season.title')}
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
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{t('battlePass.fetchError')}</AlertDescription>
          </Alert>
        )}

        {season && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('battlePass.season.season', { seasonNumber: season.number })}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{getEndDate(season)}</span>
                </div>
              </div>
              <img src={season.iconUrl} alt={t('battlePass.season.season', { seasonNumber: season.number })} className="w-12 h-12" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <GradientButton variant="primary" className="w-full">
                    {t('battlePass.rewards.viewButton')}
                  </GradientButton>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col pr-6">
                  <DialogHeader>
                    <DialogTitle>{t('battlePass.rewards.dialogTitle', { seasonNumber: season.number })}</DialogTitle>
                  </DialogHeader>
                  <div className="overflow-y-auto -mr-6">
                    <BattlePassRewards season={season} />
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <GradientButton variant="outline" className="w-full">{t('battlePass.shop.title')}</GradientButton>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col pr-6">
                  <DialogHeader>
                    <DialogTitle>{t('battlePass.shop.dialogTitle', { seasonNumber: season.number })}</DialogTitle>
                  </DialogHeader>
                  <div className="overflow-y-auto -mr-6">
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