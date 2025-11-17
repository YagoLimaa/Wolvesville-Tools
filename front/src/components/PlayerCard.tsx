import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { Player } from "@/types/Player";
import { useTranslation } from "react-i18next";
import { Users, Trophy, Clock, Eye, EyeOff, Loader2, Star, Info } from "lucide-react";
import { useItems, Item } from "./contexts/ItemsContext";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRoles, Role } from "./contexts/RolesContext";
import { Progress } from "@/components/ui/progress";

const getSharedAvatarIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/([a-f0-9-]+)\.png/);
  return match ? match[1] : null;
};

interface AvatarInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: { url: string; index: number } | null;
  playerId: string;
}

const AvatarInspectorModal = ({ isOpen, onClose, avatar, playerId }: AvatarInspectorModalProps) => {
  const { t } = useTranslation();
  const { itemsById, allItems } = useItems();
  const [inspectorData, setInspectorData] = useState<Item[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectorError, setInspectorError] = useState<string | null>(null);
  const [selectedItemForSet, setSelectedItemForSet] = useState<Item | null>(null);

  const getInspectorImageUrl = (item: Item) => {
    if (item.name && item.name.includes('Golden Wheel')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune2.5bc3c3e74f636f0dba3f.png';
    } else if (item.name && item.name.includes('Wheel Of Fortune')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune.6cc428f5de217c526190.png';
    } else if (item.name && item.name.includes('Daily Reward')) {
      return 'https://www.wolvesville.com/static/media/daily_reward.web.ebe06948b4678ea75d6a.png';
    }
    return item.imageUrl;
  };

  const getPopupImageUrl = (item: Item) => {
    if (item.name && item.name.includes('Golden Wheel')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune2.5bc3c3e74f636f0dba3f.png';
    } else if (item.name && item.name.includes('Wheel Of Fortune')) {
      return 'https://www.wolvesville.com/static/media/wheel_of_fortune.6cc428f5de217c526190.png';
    } else if (item.name && item.name.includes('Daily Reward')) {
      return 'https://www.wolvesville.com/static/media/daily_reward.web.ebe06948b4678ea75d6a.png';
    }
    if ((item.event === 'BATTLE_PASS' || (item.imageUrl && item.imageUrl.includes('/bp')))) {
      const match = item.imageUrl.match(/\/bp(\d+)/);
      if (match) {
        const bpNumber = match[1];
        return `https://cdn.wolvesville.com/battlePass/icons/bp${bpNumber}.png`;
      }
    }
    return item.imageUrl;
  };

  const getPopupTitle = (item: Item) => {
    if ((item.event === 'BATTLE_PASS' || (item.imageUrl && item.imageUrl.includes('/bp')))) {
      const match = item.imageUrl.match(/\/bp(\d+)/);
      if (match) {
        const bpNumber = match[1];
        return `BP${bpNumber} - ${item.name}`;
      }
    }
    if (item.name && item.name.includes('Golden Wheel')) {
      return 'Rose Wheel';
    }
    return item.name;
  };

  useEffect(() => {
    if (isOpen && avatar) {
      const fetchAvatarItems = async () => {
        setIsInspecting(true);
        setInspectorError(null);
        setInspectorData([]);

        try {
          const sharedIdResponse = await fetch(`/api/avatars/sharedAvatarId/${playerId}/${avatar.index}`);
          if (!sharedIdResponse.ok) throw new Error("Failed to fetch shared avatar ID");
          const sharedAvatarId = await sharedIdResponse.text();

          if (!sharedAvatarId) throw new Error("Invalid shared avatar ID received");

          const response = await fetch(`/api/avatars/${sharedAvatarId}`);
          if (!response.ok) throw new Error(t('playerCard.fetchAvatarError'));
          const data = await response.json();
          
          const itemIds = Object.values(data.items).filter(id => typeof id === 'string') as string[];
          const items = itemIds.map(id => itemsById.get(id)).filter((item): item is Item => !!item);
          setInspectorData(items);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setInspectorError(err.message);
            } else {
                setInspectorError(t('playerCard.genericAvatarError'));
            }
        } finally {
          setIsInspecting(false);
        }
      };

      fetchAvatarItems();
    }
  }, [isOpen, avatar, playerId, itemsById, t]);

  const findParentSet = (item: Item): Item | null => {
    if (!allItems) return null;
    if (item.parentSetId) {
      const parent = itemsById.get(item.parentSetId);
      if (parent) return parent;
    }
    const collectionCategories = ['avatarItemSets', 'avatarItemCollections', 'bundles', 'calendars'];
    const reverseSearchableCategories = ['avatarItems', 'emojis', 'roseSkins', 'roleIcons', 'loadingScreens', 'bodyPaints', 'backgrounds', 'profileIconBorders'];

    if (reverseSearchableCategories.includes(item.category)) {
      const parent = allItems.find(
        set => (collectionCategories.includes(set.category)) && 
               (set.avatarItemIds?.includes(item.id) || 
                set.rewards?.some(r => r.avatarItemId === item.id || r.emojiId === item.id) || 
                set.items?.some(i => (i as { avatarItemId?: string }).avatarItemId === item.id))
      );
      if (parent) return parent;
    }
    return null;
  };

  const parentSet = selectedItemForSet ? findParentSet(selectedItemForSet) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('playerCard.avatarInspectorTitle')}</DialogTitle>
        </DialogHeader>
        <div className="min-h-[400px]">
          {isInspecting ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : inspectorError ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive">{inspectorError}</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="order-2 md:order-1 md:w-2/3">
                <h4 className="font-semibold mb-4">{t('playerCard.avatarComposition')}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto pr-2">
                  {inspectorData.map(item => (
                    <Card 
                      key={item.id}
                      className={`overflow-hidden ${findParentSet(item) ? 'cursor-pointer hover:border-primary' : ''}`}
                      onClick={() => findParentSet(item) && setSelectedItemForSet(item)}
                    >
                      <CardContent className="p-2 flex flex-col items-center text-center">
                        <img src={getInspectorImageUrl(item)} alt={item.name} className="w-10 h-10 sm:w-16 sm:h-16 object-contain" />
                        <p className="text-xs mt-2 font-semibold leading-tight">{item.name || item.id}</p>
                        {item.rarity && <Badge variant="secondary" className="mt-1 text-xs">{t(`itemsSkins.${item.rarity}`)}</Badge>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2 md:w-1/3">
                <h4 className="font-semibold mb-4 text-center">{t('playerCard.fullAvatar')}</h4>
                {avatar && <img src={avatar.url} alt="Full Avatar" className="rounded-lg mx-auto md:w-full" />}
              </div>
            </div>
          )}
        </div>

        <Dialog open={!!parentSet} onOpenChange={(open) => !open && setSelectedItemForSet(null)}>
          {parentSet && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('playerCard.setDetailsTitle')}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center text-center gap-2 mt-4">
                <p className="text-sm text-muted-foreground">{t('playerCard.itemBelongsTo')}</p>
                <img src={getPopupImageUrl(parentSet)} alt={parentSet.name} className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-lg border p-2"/>
                <p className="font-bold text-lg">{getPopupTitle(parentSet)}</p>
              </div>
            </DialogContent>
          )}
        </Dialog>

      </DialogContent>
    </Dialog>
  );
};

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Player['gameStats']['achievements'];
  rolesById: Map<string, Role>;
}

const AchievementsModal = ({ isOpen, onClose, achievements, rolesById }: AchievementsModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] w-[90vw] sm:w-full sm:max-w-2xl overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{t('playerCard.achievements')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mt-4">
          {[...achievements].sort((a, b) => b.level - a.level).map((achievement) => {
            const role = rolesById.get(achievement.roleId);
            if (!role) return null;
            const progress = (achievement.points / achievement.pointsNextLevel) * 100;
            const isMaxLevel = achievement.level === 9;

            const getProgressColor = (pointsNextLevel: number, level: number) => {
                if (level === 9) return 'bg-yellow-400';
                if (pointsNextLevel <= 150) return 'bg-green-500';
                if (pointsNextLevel <= 350) return 'bg-yellow-500';
                return 'bg-gray-500';
            };

            return (
              <div key={achievement.roleId} className={`flex items-center gap-1 md:gap-2 p-1 md:p-2 rounded-lg bg-background border ${isMaxLevel ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-transparent'}`}>
                <img src={role.imageUrl} alt={t(`roles.${role.name}`)} className="w-10 h-10 md:w-12 md:h-12 rounded-md" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-foreground text-sm md:text-base">{t(`roles.${role.name}`)}</p>
                    <p className={`text-sm md:text-base font-bold ${isMaxLevel ? 'text-yellow-400' : 'text-wolf-cyan'}`}>Lvl {achievement.level}</p>
                  </div>
                  {!isMaxLevel ? (
                    <>
                      <Progress value={progress} className="h-2 mt-2" indicatorClassName={getProgressColor(achievement.pointsNextLevel, achievement.level)} />
                      <p className="text-xs text-muted-foreground mt-1 text-right">{achievement.points} / {achievement.pointsNextLevel}</p>
                    </>
                  ) : (
                    <p className="text-xs text-yellow-400 mt-1 text-right font-medium">{t('playerCard.maxLevel')}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard = ({ player }: PlayerCardProps) => {
  const { t } = useTranslation();
  const [showAvatars, setShowAvatars] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [inspectingAvatar, setInspectingAvatar] = useState<{ url: string; index: number } | null>(null);
  const { itemsById } = useItems();
  const { rolesById } = useRoles();

  const getBadgeImage = (badgeId: string) => {
    const badgeItem = itemsById.get(badgeId);
    return badgeItem?.imageUrl || "https://via.placeholder.com/48";
  };

  const hasPublicGameStats =
    Object.values(player.gameStats).some((value) => value !== -1);

  const playTimeHours = Math.floor(player.gameStats.totalPlayTimeInMinutes / 60);
  const playTimeMinutes = player.gameStats.totalPlayTimeInMinutes % 60;

  return (
    <>
      <Card className="bg-card border-border hover:border-primary transition-all duration-300 hover:shadow-elevated">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2">
              <img
                src={player.equippedAvatar.url}
                alt={`Avatar de ${player.username}`}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-primary shadow-glow-primary object-cover flex-shrink-0"
              />
              <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold">
                {player.level === -1 ? '?' : t('playerCard.level')} {player.level}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground mb-2 break-words">
                {player.username}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary" className="bg-wolf-purple text-primary-foreground">
                  {player.status}
                </Badge>
                {player.clan && (
                  <Link to={`/clan/${player.clan.id}`}>
                    <Badge variant="outline" className="border-wolf-green text-wolf-green text-sm px-3 py-1 hover:bg-wolf-green/10 transition-colors">
                      <Users className="w-4 h-4 mr-2" />
                      {player.clan.name}
                    </Badge>
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {player.badgeIds.slice(0, 5).map((badgeId, index) => (
                  <img
                    key={index}
                    src={getBadgeImage(badgeId)}
                    alt="Badge"
                    className="w-10 h-10 rounded-md"
                  />
                ))}
                {player.badgeIds.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{player.badgeIds.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {hasPublicGameStats && (
            <div className="bg-secondary rounded-lg p-3">
              <h4 className="text-lg font-semibold mb-3 text-wolf-cyan">
                <Trophy className="inline w-5 h-5 mr-2" />
                {t('playerCard.gameStats')}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {player.gameStats.totalWinCount !== -1 && (
                  <div>
                    <span className="text-muted-foreground">{t('playerCard.wins')}</span>
                    <span className="ml-2 text-wolf-green font-bold">
                      {player.gameStats.totalWinCount}
                    </span>
                  </div>
                )}
                {player.gameStats.totalLoseCount !== -1 && (
                  <div>
                    <span className="text-muted-foreground">{t('playerCard.losses')}</span>
                    <span className="ml-2 text-destructive font-bold">
                      {player.gameStats.totalLoseCount}
                    </span>
                  </div>
                )}
                {player.gameStats.totalTieCount !== -1 && (
                  <div>
                    <span className="text-muted-foreground">{t('playerCard.ties')}</span>
                    <span className="ml-2 text-wolf-orange font-bold">
                      {player.gameStats.totalTieCount}
                    </span>
                  </div>
                )}
                {player.gameStats.villageWinCount !== -1 && (
                  <div>
                    <span className="text-muted-foreground">{t('playerCard.village')}</span>
                    <span className="ml-2 text-wolf-cyan font-bold">
                      {player.gameStats.villageWinCount}
                    </span>
                  </div>
                )}
                {player.gameStats.werewolfWinCount !== -1 && (
                  <div>
                    <span className="text-muted-foreground">{t('playerCard.werewolf')}</span>
                    <span className="ml-2 text-wolf-purple font-bold">
                      {player.gameStats.werewolfWinCount}
                    </span>
                  </div>
                )}
                {player.gameStats.totalPlayTimeInMinutes !== -1 && (
                  <div>
                    <span className="text-muted-foreground">
                      <Clock className="inline w-3 h-3 mr-1" />
                      {t('playerCard.playTime')}
                    </span>
                    <span className="ml-2 text-foreground font-bold">
                      {t('playerCard.playTimeValue', { hours: playTimeHours, minutes: playTimeMinutes })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {player.gameStats.achievements && player.gameStats.achievements.length > 0 && (
            <div className="bg-secondary rounded-lg p-3 cursor-pointer hover:bg-secondary/90" onClick={() => setIsAchievementsModalOpen(true)}>
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-wolf-cyan">
                  <Star className="inline w-5 h-5 mr-2" />
                  {t('playerCard.achievements')}
                </h4>
                <span className="text-sm text-muted-foreground">{t('playerCard.clickToSee')}</span>
              </div>
            </div>
          )}

          <div className="bg-secondary rounded-lg p-3">
            <p className="text-muted-foreground italic text-center">
              {player.personalMessage
                ? `"${player.personalMessage}"`
                : t('playerCard.noBio')}
            </p>
          </div>

          <GradientButton
            variant="outline"
            onClick={() => setShowAvatars(!showAvatars)}
            className="w-full"
          >
            {showAvatars ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                {t('playerCard.hideAvatars')}
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                {t('playerCard.showAllAvatars', { count: player.avatars.length })}
              </>
            )}
          </GradientButton>

          {showAvatars && (
            <>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary p-2 md:grid-cols-5 md:gap-4 md:p-4">
                {player.avatars && Array.isArray(player.avatars) && player.avatars.map((avatar, index) => (
                  avatar && avatar.url && (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => setInspectingAvatar({ url: avatar.url, index })}
                      title={t('playerCard.clickToInspect')}
                    >
                      <img
                        src={avatar.url}
                        alt="Avatar"
                        className="w-full aspect-[123/128] rounded-lg border border-border object-cover transition-colors group-hover:border-primary"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity rounded-lg">
                        <Info className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                {t('playerCard.clickToInspectDescription')}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <AvatarInspectorModal 
        isOpen={!!inspectingAvatar}
        onClose={() => setInspectingAvatar(null)}
        avatar={inspectingAvatar}
        playerId={player.id}
      />

      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        achievements={player.gameStats.achievements}
        rolesById={rolesById}
      />
    </>
  );
};