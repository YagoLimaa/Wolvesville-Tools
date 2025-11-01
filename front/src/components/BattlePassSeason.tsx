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
  goldPrice: number;
  rewards: BattlePassReward[];
  currencyTotals: {
    GOLD: number;
    SINGLE_ROSE: number;
    SERVER_ROSE: number;
    BATTLE_PASS_COIN: number;
    GEM: number;
  };
  currencyIcons: {
    GOLD: string;
    GEM: string;
    BATTLE_PASS_COIN: string;
    ROSES: {
      SERVER_ROSE: string;
      SINGLE_ROSE: string;
    };
  };
}

type Currency = keyof BattlePassSeasonData['currencyTotals'];

const fetchBattlePassSeason = async (): Promise<BattlePassSeasonData> => {
  const response = await fetch('/api/battlePass/season');
  if (!response.ok) {
    throw new Error("fetch_error");
  }
  return response.json();
};

const getCurrencyTranslationKey = (currency: Currency) => {
  switch (currency) {
    case 'GOLD':
      return 'common.gold';
    case 'SINGLE_ROSE':
      return 'common.single_rose';
    case 'SERVER_ROSE':
      return 'common.server_rose';
    case 'BATTLE_PASS_COIN':
      return 'battlePass.passCoins';
    case 'GEM':
      return 'common.gems';
    default:
      return '';
  }
};

const getCurrencyIcon = (currency: Currency, icons: BattlePassSeasonData['currencyIcons']) => {
  if (!icons) {
    return '/placeholder.svg';
  }
  switch (currency) {
    case 'GOLD':
      return icons.GOLD;
    case 'GEM':
      return icons.GEM;
    case 'BATTLE_PASS_COIN':
      return icons.BATTLE_PASS_COIN;
    case 'SINGLE_ROSE':
      return "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png";
    case 'SERVER_ROSE':
      return "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png";
    default:
      return '/placeholder.svg';
  }
};

export const BattlePassSeason = () => {
  const { t } = useTranslation();
  const { data: season, isLoading, isError } = useQuery<BattlePassSeasonData, Error>({
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
                {season.goldPrice > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">{t('battlePass.season.passCost')}:</h4>
                    <div className="flex items-center gap-1 text-sm text-amber-400">
                      <img src={getCurrencyIcon('GOLD', season.currencyIcons)} alt={t('common.gold')} className="w-4 h-4" />
                      <span className="font-semibold">{season.goldPrice}</span>
                    </div>
                  </div>
                )}
              </div>
              <img src={season.iconUrl} alt={t('battlePass.season.season', { seasonNumber: season.number })} className="w-12 h-12" />
            </div>

            {season.currencyTotals && (
              <div>
                <h4 className="text-md font-semibold mb-2">{t('battlePass.season.totalRewards')}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {Object.entries(season.currencyTotals).map(([currency, total]) => (
                    total > 0 && (
                      <div key={currency} className="flex items-center gap-1">
                        <img src={getCurrencyIcon(currency as Currency, season.currencyIcons)} alt={currency} className="w-4 h-4" />
                        <span className="text-sm font-bold">
                          {t(getCurrencyTranslationKey(currency as Currency))}: {total.toLocaleString()}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

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