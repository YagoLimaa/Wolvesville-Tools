import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { Player } from "@/types/Player";
import { useTranslation } from "react-i18next";
import { Users, Trophy, Clock, Eye, EyeOff, Loader2, Star, Info } from "lucide-react";
import { useItems, Item } from "./contexts/ItemsContext";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRoles, Role } from "./contexts/RolesContext";
import { Progress } from "@/components/ui/progress";
import { avatarsApi } from "@/lib/api";

const getHighResUrl = (url: string | undefined, resolution: '2x' | '3x' = '3x'): string => {
  if (!url) return "";
  if (url.includes('wolvesville.com/static/media') || url.includes('via.placeholder.com') || url.match(/@\dx\./)) {
    return url;
  }
  const extensions = ['.png', '.jpg', '.jpeg'];
  for (const ext of extensions) {
    if (url.endsWith(ext)) {
      return url.slice(0, -ext.length) + `@${resolution}` + ext;
    }
  }
  return url;
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
          <DialogDescription>
            {t('playerCard.achievementsDescription', "Here are the player's achievements, sorted by level.")}
          </DialogDescription>
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
                <img src={getHighResUrl(role.imageUrl)} alt={t(`roles.${role.name}`)} className="w-10 h-10 md:w-12 md:h-12 rounded-md" />
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
  onAvatarClick: (avatar: { url: string; index: number }) => void;
}

export const PlayerCard = ({ player, onAvatarClick }: PlayerCardProps) => {
  const { t } = useTranslation();
  const [showAvatars, setShowAvatars] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const { itemsById } = useItems();
  const { rolesById } = useRoles();

  const getBadgeImage = (badgeId: string) => {
    const badgeItem = itemsById.get(badgeId);
    return getHighResUrl(badgeItem?.imageUrl) || "https://via.placeholder.com/48";
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
              <div
                role="img"
                aria-label={`Avatar de ${player.username}`}
                style={{
                  backgroundImage: `url(${getHighResUrl(player.equippedAvatar.url)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary shadow-glow-primary flex-shrink-0"
              />
              <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold">
                {player.level === -1 ? '?' : `${t('playerCard.level')} ${player.level}`}
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
            <p className="text-center text-sm text-muted-foreground mt-3">
                {t('playerCard.clickToInspectDescription')}
              </p>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary p-2 md:grid-cols-5 md:gap-4 md:p-4">
                {player.avatars && Array.isArray(player.avatars) && player.avatars.map((avatar, index) => (
                  avatar && avatar.url && (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => onAvatarClick({ url: avatar.url, index })}
                      title={t('playerCard.clickToInspect')}
                    >
                      
                      <div
                        role="img"
                        aria-label="Avatar"
                        style={{
                          backgroundImage: `url(${getHighResUrl(avatar.url)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                        className="w-full aspect-[123/128] rounded-lg border border-border transition-colors group-hover:border-primary"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity rounded-lg">
                        <Info className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        achievements={player.gameStats.achievements}
        rolesById={rolesById}
      />
    </>
  );
};