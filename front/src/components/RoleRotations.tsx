import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { Zap, AlertTriangle, Clock } from "lucide-react";
import { useRoles, type Role } from "@/components/contexts/RolesContext";
import { rolesApi } from "@/lib/api";

// --- Tipos de Dados ---

interface RoleInfo {
  id: string;
  probability?: number;
}

interface StandardGameModeRotation {
  gameMode: string;
  gameModeName: string;
  roles: RoleInfo[];
  setups?: undefined;
}

interface SandboxGameModeRotation {
  gameMode: 'sandbox';
  gameModeName: string;
  roles?: undefined;
  setups: {
    probability: number;
    roles: RoleInfo[][];
  }[];
}

type GameModeRotation = StandardGameModeRotation | SandboxGameModeRotation;

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// --- Funções de Fetch e Hooks ---

const fetchRoleRotations = async (): Promise<GameModeRotation[]> => {
  const response = await rolesApi.getRotations();
  if (response.error) {
    throw new Error(response.error);
  }
  return (Array.isArray(response.data) ? response.data : []) as GameModeRotation[];
};

const useCountdownToNextWednesday = () => {
  const { t } = useTranslation();
  const [countDown, setCountDown] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDayOfWeek = 3; // Quarta-feira
      const targetHour = 17;
      const target = new Date(now);
      const currentDay = now.getDay();
      let daysToAdd = (targetDayOfWeek - currentDay + 7) % 7;
      if (daysToAdd === 0 && now.getHours() >= targetHour) {
        daysToAdd = 7;
      }
      target.setDate(now.getDate() + daysToAdd);
      target.setHours(targetHour, 0, 0, 0);
      setCountDown(target.getTime() - now.getTime());
    };
    const interval = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(interval);
  }, []);

  if (countDown < 0) return t('common.updating');
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// --- Componentes de UI ---

const RoleIcon = ({ role, showProbability }: { role: Role & { probability?: number }, showProbability: boolean }) => (
  <div className="group relative">
    <img
      src={role.imageUrl}
      alt={role.name}
      className="w-12 h-12 rounded-md bg-secondary border border-border transition-transform group-hover:scale-110"
    />
    {showProbability && role.probability === 50 && (
      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center" style={{ fontSize: '0.6rem' }}>
        {`${Math.round(role.probability)}%`}
      </div>
    )}
    <div className="absolute bottom-full mb-2 w-max max-w-xs px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {role.name}
    </div>
  </div>
);

// --- Componente Principal ---

export const RoleRotations = () => {
  const { t } = useTranslation();
  const { data: rotations, isLoading: isLoadingRotations, isError: isErrorRotations } = useQuery<GameModeRotation[], Error>({
    queryKey: ["roleRotations"],
    queryFn: fetchRoleRotations,
  });
  const timeLeft = useCountdownToNextWednesday();
  const { rolesById, isLoading: isLoadingRoles } = useRoles();

  const processedRotations = useMemo(() => {
    if (!rotations) return [];

    const rotationMap = new Map<string, GameModeRotation>();

    for (const rotation of rotations) {
      const existing = rotationMap.get(rotation.gameMode);
      if (existing) {
        if (existing.roles && rotation.roles) {
          existing.roles.push(...rotation.roles);
        }
        if (existing.setups && rotation.setups) {
          existing.setups.push(...rotation.setups);
        }
      } else {
        rotationMap.set(rotation.gameMode, JSON.parse(JSON.stringify(rotation)));
      }
    }

    return Array.from(rotationMap.values());
  }, [rotations]);

  const renderStandardRoles = (roles: RoleInfo[]) => {
    const roleInfos = roles.map(r => {
      const fullRole = rolesById.get(r.id);
      return fullRole ? { ...fullRole, probability: r.probability } : null;
    }).filter(isDefined);

    const villagers = roleInfos.filter(r => r.team === 'VILLAGER' || r.team === 'RANDOM_VILLAGER');
    const werewolves = roleInfos.filter(r => r.team === 'WEREWOLF' || r.team === 'RANDOM_WEREWOLF');
    const solo = roleInfos.filter(r => !['VILLAGER', 'RANDOM_VILLAGER', 'WEREWOLF', 'RANDOM_WEREWOLF'].includes(r.team));
    const sortedRoles = [...villagers, ...werewolves, ...solo];

    return sortedRoles.map((role, index) => <RoleIcon key={`${role.id}-${index}`} role={role} showProbability={!!role.probability} />);
  };

  const renderSandboxSetups = (setups: SandboxGameModeRotation['setups']) => (
    <div className="space-y-4 mt-2">
      {setups.map((setup, setupIndex) => (
        <div key={setupIndex} className="p-3 bg-background/50 rounded-lg">
          <h4 className="font-semibold text-muted-foreground mb-2">{t('roleRotations.setup', {
            chance: Math.round(setup.probability)
          })}</h4>
          <div className="flex flex-wrap gap-2">
            {setup.roles.map((choice, choiceIndex) => {
              const fullChoiceInfo = choice.map(roleInfo => {
                const fullRole = rolesById.get(roleInfo.id);
                return fullRole ? { ...fullRole, probability: roleInfo.probability } : null;
              }).filter(isDefined);

              if (fullChoiceInfo.length === 0) return null;

              if (fullChoiceInfo.length > 1) {
                return (
                  <div key={choiceIndex} className="flex gap-1 border border-dashed border-primary/50 rounded-md p-1">
                    {fullChoiceInfo.map((role, index) => <RoleIcon key={`${role.id}-${index}`} role={role} showProbability={true} />)}
                  </div>
                );
              } else {
                return <RoleIcon key={`${fullChoiceInfo[0].id}-${choiceIndex}`} role={fullChoiceInfo[0]} showProbability={false} />;
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-5 h-5 text-primary" />
            {t('roleRotations.title')}
          </CardTitle>
          {timeLeft && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> <span>{timeLeft}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {(isLoadingRotations || isLoadingRoles) && (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <div className="flex gap-2">
                  {[...Array(10)].map((_, j) => <Skeleton key={j} className="h-12 w-12 rounded-md" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {isErrorRotations && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{t('roleRotations.fetchError')}</AlertDescription>
          </Alert>
        )}

        {processedRotations && rolesById.size > 0 && (
          <div className="space-y-6">
            {processedRotations.map((rotation, index) => (
              <div key={`${rotation.gameMode}-${index}`}>
                <h3 className="text-lg font-semibold text-primary">
                  {t(`roleRotations.gameModes.${rotation.gameMode}`, { defaultValue: rotation.gameModeName })}
                </h3>
                {rotation.setups ? renderSandboxSetups(rotation.setups) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {renderStandardRoles(rotation.roles)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
