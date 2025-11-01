import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useItems } from "./contexts/ItemsContext";

interface BattlePassShopReward {
  id: string;
  type: string;
  amount: number;
  avatarItemId?: string;
  costInBattlePassCoins: number;
}

interface BattlePassShopData {
  rewards: BattlePassShopReward[];
}

const fetchBattlePassShop = async (): Promise<BattlePassShopData> => {
  const response = await fetch('/api/battlePass/shop');
  if (!response.ok) {
    throw new Error("fetch_error");
  }
  return response.json();
};

export const BattlePassShop = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useQuery<BattlePassShopData, Error>({
    queryKey: ["battlePassShop"],
    queryFn: fetchBattlePassShop,
  });
  const { itemsById, isLoading: isLoadingItems } = useItems();

  if (isLoading || isLoadingItems) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('common.error')}</AlertTitle>
        <AlertDescription>{t('battlePass.shop.fetchError')}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.rewards.length === 0) {
    return <p>{t('battlePass.shop.noItems')}</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {data.rewards.map((reward) => {
        let itemInfo = null;
        let imageUrl = "data:image/svg+xml;charset=UTF-8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-help-circle\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"></path><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"></line></svg>";
        let itemName = t('common.item');

        if (reward.avatarItemId) {
          const item = itemsById.get(reward.avatarItemId);
          if (item) {
            itemInfo = item;
            imageUrl = item.imageUrl;
            itemName = item.name;
          }
        } else if (reward.type === "ROLE_CARD_ABILITY_EXCHANGE_VOUCHER") {
          imageUrl = `https://www.wolvesville.com/static/media/role_card_ability_exchange_voucher.4a1cb8b754a6807e78da.png`;
          itemName = t('battlePass.shop.exchangeVoucher');
        } else if (reward.type === "GOLD") {
          imageUrl = `https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png`;
          itemName = t('common.gold');
        }

        return (
          <div
            key={reward.id}
            className="relative overflow-hidden rounded-md border-2 border-transparent group"
          >
            <div className="aspect-square w-full">
              <div className="relative h-full w-full">
                <div className="flex h-full w-full flex-col items-center justify-center bg-gray-800/50 p-1">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />

                  <img
                    alt={itemName}
                    draggable="false"
                    src={imageUrl}
                    className="relative z-10 h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                  />

                  <div className="absolute top-2 left-2 right-2 z-20 bg-black/60 px-2 py-1 text-center text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                    <p className="truncate">{itemName}</p>
                  </div>

                  <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                    <img 
                      src={`https://cdn2.wolvesville.com/battlePass/coins/bp44_single@2x.png`}
                      alt={t('battlePass.coinAlt')}
                      className="w-4 h-4"
                    />
                    <span>{reward.costInBattlePassCoins}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};