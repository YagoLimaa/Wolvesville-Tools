import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { Zap, AlertTriangle, Clock } from "lucide-react"; 
import { useRoles } from "@/components/contexts/RolesContext";

interface GameModeRotation {
  gameMode: string; // Usado como chave única
  gameModeName: string;
  roles: { id: string }[]; // A API agora retorna apenas o ID da role
}

const fetchRoleRotations = async (): Promise<GameModeRotation[]> => {
  const response = await fetch('/api/roleRotations');
  if (!response.ok) {
    throw new Error("fetch_error");
  }
  return response.json();
};

const useCountdownToNextWednesday = () => {
  const { t } = useTranslation();
  const [countDown, setCountDown] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDayOfWeek = 3; // Quarta-feira (Domingo=0, Segunda=1, ...)
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

    const interval = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    calculateTimeLeft();

    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  if (countDown < 0) {
    return t('common.updating');
  }

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export const RoleRotations = () => {
  const { t } = useTranslation();
  const { data: rotations, isLoading: isLoadingRotations, isError: isErrorRotations, error: errorRotations } = useQuery<GameModeRotation[], Error>({
    queryKey: ["roleRotations"],
    queryFn: fetchRoleRotations,
  });
  const timeLeft = useCountdownToNextWednesday();
  const { rolesById, isLoading: isLoadingRoles } = useRoles();

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
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {isErrorRotations && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{t('roleRotations.fetchError')}</AlertDescription>
          </Alert>
        )}

        {rotations && rotations.length > 0 && (
          <div className="space-y-6">
            {rotations.map((rotation) => (
              <div key={rotation.gameMode}> 
                <h3 className="text-lg font-semibold text-primary">
                  {t(`roleRotations.gameModes.${rotation.gameModeName}`, { defaultValue: rotation.gameModeName })}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {rotation.roles.map((role, index) => {
                    const fullRoleInfo = rolesById.get(role.id);
                    if (!fullRoleInfo) return null; // Não renderiza se a role não for encontrada

                    return (
                      <div key={`${role.id}-${index}`} className="group relative">
                        <img
                          src={fullRoleInfo.imageUrl}
                          alt={fullRoleInfo.name}
                          className="w-12 h-12 rounded-md bg-secondary border border-border transition-transform group-hover:scale-110"
                        />
                        <div className="absolute bottom-full mb-2 w-max max-w-xs px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {fullRoleInfo.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
};