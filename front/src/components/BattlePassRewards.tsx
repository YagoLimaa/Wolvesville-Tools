import * as React from "react";
import { BattlePassSeasonData, BattlePassReward } from "./BattlePassSeason";
import { Lock, HelpCircle } from "lucide-react";
import { useItems, Item } from "./contexts/ItemsContext";
import { useTranslation } from "react-i18next";
import { CustomFontAwesomeIcon } from "./ui/font-awesome-icon";

interface BattlePassRewardsProps {
  season: BattlePassSeasonData;
}

const getRewardInfo = (reward: BattlePassReward, itemsById: Map<string, Item>, seasonNumber: number, t: (key: string) => string): { imageUrl: string, name: string } => {
  const placeholder = { imageUrl: "https://via.placeholder.com/100", name: "Item Desconhecido" };

  if (!('type' in reward)) {
    return placeholder;
  }

  let itemId: string | undefined;
  switch (reward.type) {
    case "AVATAR_ITEM":
      itemId = reward.avatarItemId || reward.avatarItemIdMale || reward.avatarItemIdFemale;
      break;
    case "EMOJI":
      itemId = reward.emojiId;
      break;
    case "PROFILE_ICON":
      itemId = reward.profileIconId;
      break; 
    case "BODY_PAINT":
      itemId = reward.bodyPaintId;
      break;
    case "LOADING_SCREEN":
      itemId = reward.loadingScreenId;
      break;
    case "ROSE_PACKAGE":
      return { imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", name: t('common.roses') };
    case "GEM":
      return { imageUrl: "https://www.wolvesville.com/static/media/gem.439d7650def0b35d6a66.png", name: t('common.gems') };
    case "GOLD":
      return { imageUrl: "https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png", name: t('common.gold') };
    case "BATTLE_PASS_COIN":
      return { imageUrl: `https://cdn2.wolvesville.com/battlePass/coins/bp${seasonNumber}_single@2x.png`, name: t('battlePass.passCoins') };
    case "RANDOM_PROFILE_ICON":
      break; 
    default:
      if (reward.imageUrl) {
        return { imageUrl: reward.imageUrl, name: reward.type || t('common.item') };
      }
      return placeholder;
  }

  if (itemId) {
    const item = itemsById.get(itemId);
    return item ? { imageUrl: item.imageUrl, name: item.name } : placeholder;
  }

  return placeholder;
};

export const BattlePassRewards = ({ season }: BattlePassRewardsProps) => {
  const { itemsById } = useItems();
  const { t } = useTranslation();

  if (!season || !season.rewards) {
    return <p>{t('battlePass.rewards.noRewards')}</p>;
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
      {season.rewards.map((reward, index) => {
        const level = ("level" in reward && reward.level) ? reward.level : index + 1;
        const { imageUrl, name } = getRewardInfo(reward, itemsById, season.number, t);
        const isRandomIcon = "type" in reward && reward.type === "RANDOM_PROFILE_ICON";

        return (
          <div
            key={level}
            className={`relative overflow-hidden rounded-md border-2 ${
              "free" in reward && reward.free ? "border-yellow-500/80" : "border-transparent"
            }`}
          >
            <div className="aspect-square w-full">
              <div className="relative h-full w-full">
                <div className="flex h-full w-full flex-col items-center justify-center bg-gray-800/50 p-1">
                  {isRandomIcon ? (
                    <div className="relative z-10 flex h-full w-full items-center justify-center">
                      <HelpCircle className="h-1/2 w-1/2 text-white/80" />
                    </div>
                  ) : name && name.startsWith("font-awesome-") ? (
                    <div className="relative z-10 flex h-full w-full items-center justify-center">
                      <CustomFontAwesomeIcon iconName={name} className="h-1/2 w-1/2 text-white/80" />
                    </div>
                  ) : (
                    <>
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm group-hover:blur-none transition-all"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                      />
                      <img
                        alt={name}
                        draggable="false"
                        src={imageUrl}
                        className="relative z-10 h-full w-full object-contain p-2"
                      />
                    </>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/60 py-0.5 text-center text-xs font-semibold text-white">
                    {t('battlePass.rewards.level', { level })}
                  </div>

                  {"free" in reward && !reward.free && (
                    <div className="absolute right-1.5 top-1.5 z-20 text-white/70">
                      <Lock className="h-3 w-3" />
                    </div>
                  )}

                  {"amount" in reward && reward.amount > 1 && (
                    <div className="absolute left-1.5 top-1 z-20 text-base font-extrabold text-white" style={{ textShadow: "1px 1px 3px black" }}>
                      {reward.amount}x
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};