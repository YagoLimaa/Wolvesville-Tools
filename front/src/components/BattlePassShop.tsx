import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
  const response = await fetch("http://localhost:3000/battlePass/shop");
  if (!response.ok) {
    throw new Error("Não foi possível buscar os dados da loja do Battle Pass.");
  }
  return response.json();
};

// Mapa para traduzir os IDs dos itens de avatar para as URLs de imagem corretas.
const avatarItemUrlMap: Record<string, string> = {
  "QBW": "https://cdn2.wolvesville.com/avatarItems/bp44-bpc-gravestone-krasue.store@2x.png",
  "99e": "https://cdn2.wolvesville.com/avatarItems/bp44-bpc-hair-krasue.store@2x.png",
  "e9g": "https://cdn2.wolvesville.com/avatarItems/bp44-bpc-eyes-krasue.store@2x.png",
  "X1J": "https://cdn2.wolvesville.com/avatarItems/bp44-bpc-shirt-krasue.store@2x.png",
  "M31": "https://cdn2.wolvesville.com/avatarItems/bp44-bpc-back-krasue.store@3x.png",
};

const getShopRewardImageUrl = (reward: BattlePassShopReward): string => {
    const baseCdnUrl = "https://cdn2.wolvesville.com";
  
    switch (reward.type) {
      case "AVATAR_ITEM":
        // Usa o mapa para obter a URL correta. Se não encontrar, usa um placeholder.
        if (reward.avatarItemId && avatarItemUrlMap[reward.avatarItemId]) {
          return avatarItemUrlMap[reward.avatarItemId];
        }
        // Fallback caso um novo item apareça e não esteja no mapa
        return "https://via.placeholder.com/100";
      case "ROLE_CARD_ABILITY_EXCHANGE_VOUCHER":
        return `https://www.wolvesville.com/static/media/role_card_ability_exchange_voucher.4a1cb8b754a6807e78da.png`;
      case "GOLD":
        return `https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png`;
      default:
        // Fallback para qualquer outro tipo de recompensa não mapeado
        return "https://via.placeholder.com/100";
    }
};

export const BattlePassShop = () => {
  const { data, isLoading, isError, error } = useQuery<BattlePassShopData, Error>({
    queryKey: ["battlePassShop"],
    queryFn: fetchBattlePassShop,
  });

  if (isLoading) {
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
        const imageUrl = getShopRewardImageUrl(reward);
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
                    alt={reward.type}
                    draggable="false"
                    src={imageUrl}
                    className="relative z-10 h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                  />

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