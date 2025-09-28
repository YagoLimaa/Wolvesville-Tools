import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { Player } from "@/types/Player";
import { Users, Trophy, Clock, Heart, Eye, EyeOff } from "lucide-react";

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard = ({ player }: PlayerCardProps) => {
  const [showAvatars, setShowAvatars] = useState(false);

  const getBadgeImage = (badgeId: string) => {
    // Mock badge images - in real app would map to actual badge URLs
    return `https://via.placeholder.com/50x50/8B5CF6/FFFFFF?text=${badgeId}`;
  };

  return (
    <Card className="bg-card border-border hover:border-primary transition-all duration-300 hover:shadow-elevated">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={player.equippedAvatar.url}
              alt={`Avatar de ${player.username}`}
              className="w-20 h-20 rounded-full border-2 border-primary shadow-glow-primary"
            />
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold">
              {player.level}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {player.username}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary" className="bg-wolf-purple text-primary-foreground">
                {player.status}
              </Badge>
              {player.clan && (
                <Badge variant="outline" className="border-wolf-green text-wolf-green">
                  <Users className="w-3 h-3 mr-1" />
                  {player.clan.name}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {player.badgeIds.slice(0, 5).map((badgeId, index) => (
                <img
                  key={index}
                  src={getBadgeImage(badgeId)}
                  alt="Badge"
                  className="w-8 h-8 rounded-md"
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
        {/* Game Stats */}
        <div className="bg-secondary rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3 text-wolf-cyan">
            <Trophy className="inline w-5 h-5 mr-2" />
            Estatísticas de Jogo
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Vitórias:</span>
              <span className="ml-2 text-wolf-green font-bold">
                {player.gameStats.totalWinCount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Derrotas:</span>
              <span className="ml-2 text-destructive font-bold">
                {player.gameStats.totalLoseCount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Empates:</span>
              <span className="ml-2 text-wolf-orange font-bold">
                {player.gameStats.totalTieCount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Vila:</span>
              <span className="ml-2 text-wolf-cyan font-bold">
                {player.gameStats.villageWinCount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Lobisomem:</span>
              <span className="ml-2 text-wolf-purple font-bold">
                {player.gameStats.werewolfWinCount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">
                <Clock className="inline w-3 h-3 mr-1" />
                Tempo:
              </span>
              <span className="ml-2 text-foreground font-bold">
                {Math.floor(player.gameStats.totalPlayTimeInMinutes / 60)}h
              </span>
            </div>
          </div>
        </div>

        {/* Roses */}
        <div className="flex justify-between items-center bg-secondary rounded-lg p-4">
          <div className="text-center">
            <Heart className="w-5 h-5 mx-auto text-wolf-pink mb-1" />
            <div className="text-sm text-muted-foreground">Recebidas</div>
            <div className="text-xl font-bold text-wolf-pink">
              {player.receivedRosesCount}
            </div>
          </div>
          <div className="text-center">
            <Heart className="w-5 h-5 mx-auto text-wolf-orange mb-1" />
            <div className="text-sm text-muted-foreground">Enviadas</div>
            <div className="text-xl font-bold text-wolf-orange">
              {player.sentRosesCount}
            </div>
          </div>
        </div>

        {/* Personal Message */}
        {player.personalMessage && (
          <div className="bg-secondary rounded-lg p-4">
            <p className="text-muted-foreground italic text-center">
              "{player.personalMessage}"
            </p>
          </div>
        )}

        {/* Avatar Gallery Toggle */}
        <GradientButton
          variant="outline"
          onClick={() => setShowAvatars(!showAvatars)}
          className="w-full"
        >
          {showAvatars ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Ocultar Avatares
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Ver Todos os Avatares ({player.avatars.length})
            </>
          )}
        </GradientButton>

        {/* Avatar Gallery */}
        {showAvatars && (
          <div className="grid grid-cols-6 gap-2 bg-secondary rounded-lg p-4">
            {player.avatars.map((avatar, index) => (
              <img
                key={index}
                src={avatar.url}
                alt="Avatar"
                className="w-12 h-12 rounded-lg border border-border hover:border-primary transition-colors"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};