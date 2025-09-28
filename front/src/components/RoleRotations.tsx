import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Zap, AlertTriangle, Info, Clock } from "lucide-react";

// Define a estrutura de uma Role, conforme a API
interface Role {
  id: string;
  name: string;
  imageUrl: string;
}

// Define a estrutura da resposta da nossa API de rotação
interface GameModeRotation {
  gameMode: string; // Usado como chave única
  gameModeName: string;
  roles: Role[];
}

// Função para buscar os dados no nosso backend
const fetchRoleRotations = async (): Promise<GameModeRotation[]> => {
  const response = await fetch("http://localhost:3000/roleRotations");
  if (!response.ok) {
    throw new Error("Não foi possível buscar a rotação de roles.");
  }
  // O backend retorna um array de rotações, então o retornamos diretamente.
  return response.json();
};

// Hook customizado para o contador
const useCountdownToNextWednesday = () => {
  const [countDown, setCountDown] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();

      // Horário de Brasília (UTC-3)
      const targetDayOfWeek = 3; // Quarta-feira (Domingo=0, Segunda=1, ...)
      const targetHour = 21;

      // Ajusta para o fuso horário de Brasília (UTC-3)
      const nowBrasilia = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      
      let daysUntilTarget = (targetDayOfWeek - nowBrasilia.getDay() + 7) % 7;
      
      if (daysUntilTarget === 0 && nowBrasilia.getHours() >= targetHour) {
        daysUntilTarget = 7; // Já passou da hora, mira na próxima semana
      }

      target.setDate(nowBrasilia.getDate() + daysUntilTarget);
      target.setHours(targetHour, 0, 0, 0);

      setCountDown(target.getTime() - nowBrasilia.getTime());
    };

    const interval = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    calculateTimeLeft(); // Calcula na primeira renderização

    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  if (countDown < 0) {
    return "Atualizando...";
  }

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// Mapeamento para traduzir os nomes dos modos de jogo
const gameModeTranslations: { [key: string]: string } = {
  "Quick": "Jogo Rápido",
  "Sandbox": "Sandbox",
  "Ranked League Silver": "Liga Ranqueada: Prata",
  "Ranked League Gold": "Liga Ranqueada: Ouro",
  "Advanced": "Avançado",
  "Assassins convention": "Convenção de Assassinos",
};

export const RoleRotations = () => {
  const { data: rotations, isLoading, isError, error } = useQuery<GameModeRotation[], Error>({
    queryKey: ["roleRotations"],
    queryFn: fetchRoleRotations,
  });

  const timeLeft = useCountdownToNextWednesday();

  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-5 h-5 text-primary" />
            Rotações da Semana
          </CardTitle>
          {timeLeft && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> <span>{timeLeft}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {rotations && rotations.length > 0 && (
          <div className="space-y-6">
            {rotations.map((rotation) => (
              <div key={rotation.gameMode}>
                <h3 className="text-lg font-semibold text-primary">
                  {gameModeTranslations[rotation.gameModeName] || rotation.gameModeName}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {rotation.roles.map((role, index) => (
                    <div key={`${role.id}-${index}`} className="group relative">
                      <img
                        src={role.imageUrl}
                        alt={role.name}
                        className="w-12 h-12 rounded-md bg-secondary border border-border transition-transform group-hover:scale-110"
                      />
                      <div className="absolute bottom-full mb-2 w-max max-w-xs px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {role.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
};