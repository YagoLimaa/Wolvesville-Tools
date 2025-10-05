import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
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
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${apiUrl}/battlePass/shop`);
  if (!response.ok) {
    throw new Error("Não foi possível buscar os dados da loja do Battle Pass.");
  }
  return response.json();
};

export const BattlePassShop = () => {
  const { data, isLoading, isError, error } = useQuery<BattlePassShopData, Error>({
    queryKey: ["battlePassShop"],
    queryFn: fetchBattlePassShop,
  });
  const { itemsById, isLoading: isLoadingItems } = useItems();

  if (isLoading || isLoadingItems) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.rewards.length === 0) {
    return <p>Nenhum item na loja do passe para exibir.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {data.rewards.map((reward) => {
        let itemInfo = null;
        let imageUrl = "https://via.placeholder.com/100"; // Placeholder
        let itemName = "Item";

        if (reward.avatarItemId) {
          const item = itemsById.get(reward.avatarItemId);
          if (item) {
            itemInfo = item;
            imageUrl = item.imageUrl;
            itemName = item.name;
          }
        } else if (reward.type === "ROLE_CARD_ABILITY_EXCHANGE_VOUCHER") {
          imageUrl = `https://www.wolvesville.com/static/media/role_card_ability_exchange_voucher.4a1cb8b754a6807e78da.png`;
          itemName = "Voucher de Troca";
        } else if (reward.type === "GOLD") {
          imageUrl = `https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png`;
          itemName = "Ouro";
        }

        return (
          <div
            key={reward.id}
            className="relative overflow-hidden rounded-md border-2 border-transparent group"
          >
            <div className="aspect-square w-full">
              <div className="relative h-full w-full">
                <div className="flex h-full w-full flex-col items-center justify-center bg-gray-800/50 p-1">
                  {/* Imagem de fundo */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />

                  {/* Imagem principal */}
                  <img
                    alt={itemName}
                    draggable="false"
                    src={imageUrl}
                    className="relative z-10 h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Nome do item */}
                  <div className="absolute top-2 left-2 right-2 z-20 bg-black/60 px-2 py-1 text-center text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                    <p className="truncate">{itemName}</p>
                  </div>

                  {/* Custo */}
                  <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                    <img 
                      src={`https://cdn2.wolvesville.com/battlePass/coins/bp44_single@2x.png`} 
                      alt="Moeda do Passe" 
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