import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { Player } from "@/types/Player";
import { useTranslation } from "react-i18next";
import { Users, Trophy, Clock, Heart, Eye, EyeOff, X } from "lucide-react";
import { useItems } from "./contexts/ItemsContext";
import { Link } from "react-router-dom";

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard = ({ player }: PlayerCardProps) => {
  const { t } = useTranslation();
  const [showAvatars, setShowAvatars] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const { itemsById } = useItems();

  const getBadgeImage = (badgeId: string) => {
    const badgeItem = itemsById.get(badgeId);
    return badgeItem?.imageUrl || "https://via.placeholder.com/48";
  };

  const hasPublicGameStats =
    Object.values(player.gameStats).some((value) => value !== -1);

  const hasRosesStats =
    player.receivedRosesCount !== -1 || player.sentRosesCount !== -1;

  const playTimeHours = Math.floor(player.gameStats.totalPlayTimeInMinutes / 60);
  const playTimeMinutes = player.gameStats.totalPlayTimeInMinutes % 60;

  return (
    <Card className="bg-card border-border hover:border-primary transition-all duration-300 hover:shadow-elevated">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <img
              src={player.equippedAvatar.url}
              alt={`Avatar de ${player.username}`}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary shadow-glow-primary object-cover flex-shrink-0"
            />
            <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold">
              {player.level === -1 ? '?' : t('playerCard.level')} {player.level}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-foreground mb-2 break-words">
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
                  className="w-12 h-12 rounded-md"
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

      <CardContent className="space-y-4">
        {hasPublicGameStats && (
          <div className="bg-secondary rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-3 text-wolf-cyan">
              <Trophy className="inline w-5 h-5 mr-2" />
              {t('playerCard.gameStats')}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
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

        {hasRosesStats && (
          <div className="bg-secondary rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-3 text-wolf-pink text-center">
              <span className="text-2xl inline-block mr-2">🌹</span>
              {t('playerCard.roses')}
            </h4>
            <div className="flex justify-center items-center text-center gap-10">
              {player.receivedRosesCount !== -1 && <span className="text-muted-foreground">{t('playerCard.received')} <strong className="text-wolf-pink text-lg ml-2">{player.receivedRosesCount}</strong></span>}
              {player.sentRosesCount !== -1 && <span className="text-muted-foreground">{t('playerCard.sent')} <strong className="text-wolf-orange text-lg ml-2">{player.sentRosesCount}</strong></span>}
            </div>
          </div>
        )}

        <div className="bg-secondary rounded-lg p-4">
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
          <div className="flex flex-wrap justify-center gap-4 bg-secondary rounded-lg p-4">
            {player.avatars && Array.isArray(player.avatars) && player.avatars.map((avatar, index) => (
              avatar && avatar.url && (
                <img
                  key={index}
                  src={avatar.url}
                  alt="Avatar"
                  className="w-32 h-32 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer object-cover"
                  onClick={() => setSelectedAvatar(avatar.url)}
                  title={t('playerCard.clickToZoom')}
                />
              )
            ))}
          </div>
        )}
      </CardContent>

      {selectedAvatar && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedAvatar(null)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()} // Impede que o clique na imagem feche o modal
          >
            <img
              src={selectedAvatar}
              alt="Avatar em destaque"
              className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain rounded-lg border-2 border-primary shadow-glow-primary"
            />
            <button
              onClick={() => setSelectedAvatar(null)}
              className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-2 shadow-lg hover:bg-destructive/80 transition-colors"
              aria-label={t('playerCard.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};