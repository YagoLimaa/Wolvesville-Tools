import * as React from "react";
import { BattlePassSeasonData } from "./BattlePassSeason";
import { Lock, HelpCircle } from "lucide-react";

interface BattlePassRewardsProps {
  season: BattlePassSeasonData;
}

// Dados estáticos extraídos do HTML fornecido.
// As imagens locais foram substituídas por placeholders ou equivalentes do CDN.
const staticRewards = [
    { level: 1, free: true, imageUrl: "https://www.wolvesville.com/static/media/emoji_bp44koala.7ab746d0d8b507dd0769.png", amount: 1 }, // Correct
    { level: 2, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-stardeer-shirt-male.store@2x.png", amount: 1 },
    { level: 3, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", amount: 5 }, // Correct
    { level: 4, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-stardeer-eyes-male.store@2x.png", amount: 1 },
    { level: 5, free: true, imageUrl: "https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png", amount: 165 },
    { level: 6, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-stardeer-front-female.store@2x.png", amount: 1 },
    { level: 7, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png", amount: 1 },
    { level: 8, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-stardeer-back.store@2x.png", amount: 1 },
    { level: 9, free: true, imageUrl: "https://www.wolvesville.com/static/media/gem.439d7650def0b35d6a66.png", amount: 40 },
    { level: 10, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-stardeer-hair-male.store@2x.png", amount: 1 },
    { level: 11, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", amount: 5 },
    { level: 12, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-stardeer-hat-female.store@2x.png", amount: 1 },
    { level: 13, free: true, imageUrl: "https://cdn2.wolvesville.com/profileIcons/p_random.png", amount: 1 }, // Corrected
    { level: 14, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-stardeer-mask-male.store@2x.png", amount: 1 },
    { level: 15, free: true, imageUrl: "https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png", amount: 165 },
    { level: 16, free: false, imageUrl: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png", amount: 1 },
    { level: 17, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-stardeer-mouth-male.store@2x.png", amount: 1 },
    { level: 18, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", amount: 5 },
    { level: 19, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-stardeer-gravestone.store@2x.png", amount: 1 },
    { level: 20, free: true, imageUrl: "https://www.wolvesville.com/static/media/emoji_bp44fox.4115ecd0da7c0c2bf681.png", amount: 1 },
    { level: 21, free: false, imageUrl: "https://cdn2.wolvesville.com/bodyPaints/bp44-zombie.store@3x.png", amount: 1 },
    { level: 22, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-racoon-shirt-male.store@2x.png", amount: 1 },
    { level: 23, free: true, imageUrl: `https://cdn2.wolvesville.com/battlePass/coins/bp${44}_single@2x.png`, amount: 150 },
    { level: 24, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-racoon-eyes-male.store@2x.png", amount: 1 },
    { level: 25, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png", amount: 1 },
    { level: 26, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-racoon-front-male.store@2x.png", amount: 1 },
    { level: 27, free: true, imageUrl: "https://www.wolvesville.com/static/media/gem.439d7650def0b35d6a66.png", amount: 40 },
    { level: 28, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", amount: 5 },
    { level: 29, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-racoon-back.store@2x.png", amount: 1 },
    { level: 30, free: true, imageUrl: "https://cdn2.wolvesville.com/profileIcons/p_random.png", amount: 1 }, // Corrected
    { level: 31, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-racoon-hair-male.store@2x.png", amount: 1 },
    { level: 32, free: false, imageUrl: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png", amount: 1 },
    { level: 33, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-racoon-hat-female.store@2x.png", amount: 1 },
    { level: 34, free: true, imageUrl: "https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png", amount: 165 },
    { level: 35, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-racoon-mask-male.store@2x.png", amount: 1 },
    { level: 36, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", amount: 5 },
    { level: 37, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-racoon-mouth-male.store@2x.png", amount: 1 },
    { level: 38, free: true, imageUrl: "https://www.wolvesville.com/static/media/gem.439d7650def0b35d6a66.png", amount: 40 },
    { level: 39, free: false, imageUrl: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png", amount: 1 },
    { level: 40, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-racoon-gravestone.store@2x.png", amount: 1 },
    { level: 41, free: true, imageUrl: "https://www.wolvesville.com/static/media/emoji_bp44bat.f641b9f1d6e24bc29d0b.png", amount: 1 },
    { level: 42, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-bpc-gravestone-special.store@2x.png", amount: 1 },
    { level: 43, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-losthowl-shirt-male.store@2x.png", amount: 1 },
    { level: 44, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", amount: 5 },
    { level: 45, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-losthowl-eyes-male.store@2x.png", amount: 1 },
    { level: 46, free: true, imageUrl: `https://cdn2.wolvesville.com/battlePass/coins/bp${44}_single@2x.png`, amount: 150 },
    { level: 47, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-losthowl-front-male.store@2x.png", amount: 1 },
    { level: 48, free: false, imageUrl: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png", amount: 1 },
    { level: 49, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-losthowl-glasses-male.store@2x.png", amount: 1 },
    { level: 50, free: true, imageUrl: "https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png", amount: 165 },
    { level: 51, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-losthowl-back-male.store@2x.png", amount: 1 },
    { level: 52, free: true, imageUrl: "https://cdn2.wolvesville.com/profileIcons/p_random.png", amount: 1 }, // Corrected
    { level: 53, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-losthowl-hair-male.store@2x.png", amount: 1 },
    { level: 54, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-losthowl-hat-male.store@2x.png", amount: 1 },
    { level: 55, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", amount: 5 },
    { level: 56, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-losthowl-mask-male.store@2x.png", amount: 1 },
    { level: 57, free: true, imageUrl: "https://www.wolvesville.com/static/media/gem.439d7650def0b35d6a66.png", amount: 40 },
    { level: 58, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-losthowl-mouth-male.store@2x.png", amount: 1 },
    { level: 59, free: false, imageUrl: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png", amount: 1 },
    { level: 60, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-losthowl-gravestone.store@2x.png", amount: 1 },
    { level: 61, free: true, imageUrl: "https://www.wolvesville.com/static/media/emoji_bp44lion.ac41a14dbebaa55bc8ad.png", amount: 1 },
    { level: 62, free: false, imageUrl: "https://cdn2.wolvesville.com/loadingScreens/loading-bp44-1_store.wide@3x.png", amount: 1 },
    { level: 63, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-hereafter-shirt-male.store@2x.png", amount: 1 },
    { level: 64, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", amount: 5 },
    { level: 65, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-hereafter-eyes-male.store@2x.png", amount: 1 },
    { level: 66, free: true, imageUrl: `https://cdn2.wolvesville.com/battlePass/coins/bp${44}_single@2x.png`, amount: 150 },
    { level: 67, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-hereafter-front-male.store@2x.png", amount: 1 },
    { level: 68, free: false, imageUrl: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png", amount: 1 },
    { level: 69, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-hereafter-glasses-male.store@2x.png", amount: 1 },
    { level: 70, free: true, imageUrl: "https://cdn2.wolvesville.com/profileIcons/p_random.png", amount: 1 }, // Corrected
    { level: 71, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-hereafter-back-male.store@2x.png", amount: 1 },
    { level: 72, free: true, imageUrl: "https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png", amount: 165 },
    { level: 73, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-hereafter-hair-male.store@2x.png", amount: 1 },
    { level: 74, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", amount: 5 },
    { level: 75, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-hereafter-hat-female.store@2x.png", amount: 1 },
    { level: 76, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-hereafter-mask-male.store@2x.png", amount: 1 },
    { level: 77, free: true, imageUrl: "https://www.wolvesville.com/static/media/gem.439d7650def0b35d6a66.png", amount: 40 },
    { level: 78, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-hereafter-mouth-male.store@2x.png", amount: 1 },
    { level: 79, free: false, imageUrl: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png", amount: 1 },
    { level: 80, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-hereafter-gravestone.store@2x.png", amount: 1 },
    { level: 81, free: false, imageUrl: "https://cdn2.wolvesville.com/bodyPaints/bp44-vampire.store@3x.png", amount: 1 },
    { level: 82, free: true, imageUrl: "https://www.wolvesville.com/static/media/emoji_bp44mouse.ccfd234b54abdffc82d4.png", amount: 1 },
    { level: 83, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-demonblossom-shirt-male.store@2x.png", amount: 1 },
    { level: 84, free: true, imageUrl: `https://cdn2.wolvesville.com/battlePass/coins/bp${44}_single@2x.png`, amount: 150 },
    { level: 85, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-demonblossom-eyes-male.store@2x.png", amount: 1 },
    { level: 86, free: true, imageUrl: "https://www.wolvesville.com/static/media/rose_inventory_single.eb6af861d48bff85f73a.png", amount: 5 },
    { level: 87, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-demonblossom-front-male.store@2x.png", amount: 1 },
    { level: 88, free: true, imageUrl: "https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png", amount: 165 },
    { level: 89, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-demonblossom-glasses-male.store@2x.png", amount: 1 },
    { level: 90, free: true, imageUrl: "https://cdn2.wolvesville.com/profileIcons/p_random.png", amount: 1 }, // Corrected
    { level: 91, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-demonblossom-back-male.store@2x.png", amount: 1 },
    { level: 92, free: false, imageUrl: "https://www.wolvesville.com/static/media/rose_large_sticker_server.985a27229b8e6ccdc63e.png", amount: 1 },
    { level: 93, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-demonblossom-hair-male.store@2x.png", amount: 1 },
    { level: 94, free: true, imageUrl: "https://www.wolvesville.com/static/media/gem.439d7650def0b35d6a66.png", amount: 40 },
    { level: 95, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-demonblossom-hat-male.store@2x.png", amount: 1 },
    { level: 96, free: true, imageUrl: "https://www.wolvesville.com/static/media/silver_coin.7b12538367a6d2cfa2c0.png", amount: 165 },
    { level: 97, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-demonblossom-mouth-male.store@2x.png", amount: 1 },
    { level: 98, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-demonblossom-gravestone.store@2x.png", amount: 1 },
    { level: 99, free: false, imageUrl: "https://cdn2.wolvesville.com/loadingScreens/loading-bp44-2_store.wide@3x.png", amount: 1 },
    { level: 100, free: false, imageUrl: "https://cdn2.wolvesville.com/avatarItems/bp44-bpc-back-wings.store@2x.png", amount: 1 },
];

export const BattlePassRewards = ({ season }: BattlePassRewardsProps) => {
  if (!season || !season.rewards) {
    return <p>Nenhuma recompensa para exibir.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {staticRewards.map((reward) => { 
        const isRandomIcon = reward.imageUrl.includes("p_random.png");
        return (
          <div
            key={reward.level}
            className={`relative overflow-hidden rounded-md border-2 ${
              reward.free ? "border-yellow-500/80" : "border-transparent"
            }`}
          >
            <div className="aspect-square w-full">
              <div className="relative h-full w-full">
                <div className="flex h-full w-full flex-col items-center justify-center bg-gray-800/50 p-1">
                  {isRandomIcon ? (
                    // Renderiza um ícone para os prêmios de "Ícone Aleatório"
                    <div className="relative z-10 flex h-full w-full items-center justify-center">
                      <HelpCircle className="h-1/2 w-1/2 text-white/80" />
                    </div>
                  ) : (
                    // Renderiza a imagem para os outros prêmios
                    <>
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
                        style={{ backgroundImage: `url(${reward.imageUrl})` }}
                      />
                      <img
                        alt={`Recompensa Nível ${reward.level}`}
                        draggable="false"
                        src={reward.imageUrl}
                        className="relative z-10 h-full w-full object-contain p-2"
                      />
                    </>
                  )}

                  {/* Nível */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/60 py-0.5 text-center text-xs font-semibold text-white">
                    Nível {reward.level}
                  </div>

                  {/* Cadeado para itens pagos */}
                  {!reward.free && (
                    <div className="absolute right-1.5 top-1.5 z-20 text-white/70">
                      <Lock className="h-3 w-3" />
                    </div>
                  )}

                  {/* Quantidade */}
                  {reward.amount > 1 && (
                    <div className="absolute left-1.5 top-1 z-20 text-lg font-extrabold text-white" style={{ textShadow: "1px 1px 2px black" }}>
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