import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { Player } from "@/types/Player";
import { Users, Trophy, Clock, Heart, Eye, EyeOff, X } from "lucide-react";

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard = ({ player }: PlayerCardProps) => {
  const [showAvatars, setShowAvatars] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const getBadgeImage = (badgeId: string) => {
    // Constrói a URL para buscar a imagem da badge do nosso próprio backend,
    // que está servindo os arquivos da pasta 'public'.
    return `http://localhost:3000/images/badges/${badgeId}.png`;
  };

  // Verifica se há alguma estatística de jogo pública para exibir o card
  const hasPublicGameStats =
    Object.values(player.gameStats).some((value) => value !== -1);

  // Verifica se há dados sobre rosas para exibir o card
  const hasRosesStats =
    player.receivedRosesCount !== -1 || player.sentRosesCount !== -1;

  // Formata o tempo de jogo para horas e minutos
  const playTimeHours = Math.floor(player.gameStats.totalPlayTimeInMinutes / 60);
  const playTimeMinutes = player.gameStats.totalPlayTimeInMinutes % 60;

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
              {player.level === -1 ? '?' : player.level}
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
                <Badge variant="outline" className="border-wolf-green text-wolf-green text-sm px-3 py-1">
                  <Users className="w-4 h-4 mr-2" />
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
        {/* Game Stats */}
        {hasPublicGameStats && (
          <div className="bg-secondary rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-3 text-wolf-cyan">
              <Trophy className="inline w-5 h-5 mr-2" />
              Estatísticas de Jogo
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {player.gameStats.totalWinCount !== -1 && (
                <div>
                  <span className="text-muted-foreground">Vitórias:</span>
                  <span className="ml-2 text-wolf-green font-bold">
                    {player.gameStats.totalWinCount}
                  </span>
                </div>
              )}
              {player.gameStats.totalLoseCount !== -1 && (
                <div>
                  <span className="text-muted-foreground">Derrotas:</span>
                  <span className="ml-2 text-destructive font-bold">
                    {player.gameStats.totalLoseCount}
                  </span>
                </div>
              )}
              {player.gameStats.totalTieCount !== -1 && (
                <div>
                  <span className="text-muted-foreground">Empates:</span>
                  <span className="ml-2 text-wolf-orange font-bold">
                    {player.gameStats.totalTieCount}
                  </span>
                </div>
              )}
              {player.gameStats.villageWinCount !== -1 && (
                <div>
                  <span className="text-muted-foreground">Vila:</span>
                  <span className="ml-2 text-wolf-cyan font-bold">
                    {player.gameStats.villageWinCount}
                  </span>
                </div>
              )}
              {player.gameStats.werewolfWinCount !== -1 && (
                <div>
                  <span className="text-muted-foreground">Lobisomem:</span>
                  <span className="ml-2 text-wolf-purple font-bold">
                    {player.gameStats.werewolfWinCount}
                  </span>
                </div>
              )}
              {player.gameStats.totalPlayTimeInMinutes !== -1 && (
                <div>
                  <span className="text-muted-foreground">
                    <Clock className="inline w-3 h-3 mr-1" />
                    Tempo:
                  </span>
                  <span className="ml-2 text-foreground font-bold">
                    {playTimeHours}h {playTimeMinutes}m
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roses */}
        {hasRosesStats && (
          <div className="bg-secondary rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-3 text-wolf-pink text-center">
              <span className="text-2xl inline-block mr-2">🌹</span>
              Rosas
            </h4>
            <div className="flex justify-center items-center text-center gap-10">
              {player.receivedRosesCount !== -1 && <span className="text-muted-foreground">Recebidas: <strong className="text-wolf-pink text-lg ml-2">{player.receivedRosesCount}</strong></span>}
              {player.sentRosesCount !== -1 && <span className="text-muted-foreground">Enviadas: <strong className="text-wolf-orange text-lg ml-2">{player.sentRosesCount}</strong></span>}
            </div>
          </div>
        )}

        {/* Personal Message */}
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-muted-foreground italic text-center">
            {player.personalMessage
              ? `"${player.personalMessage}"`
              : "Nenhuma bio para ser exibida"}
          </p>
        </div>

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
          <div className="flex flex-wrap justify-center gap-4 bg-secondary rounded-lg p-4">
            {player.avatars.map((avatar, index) => (
              <img
                key={index}
                src={avatar.url}
                alt="Avatar"
                className="w-32 h-32 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer object-cover"
                onClick={() => setSelectedAvatar(avatar.url)}
                title="Clique para ampliar"
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Avatar Modal */}
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
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};