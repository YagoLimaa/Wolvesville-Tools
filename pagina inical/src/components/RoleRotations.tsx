import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from "lucide-react";

const mockRoles = [
  { name: "Lobisomem", type: "evil", timeLeft: "2h 15m", isActive: true },
  { name: "Vidente", type: "good", timeLeft: "45m", isActive: true },
  { name: "Médium", type: "good", timeLeft: "1h 30m", isActive: false },
  { name: "Assassino", type: "evil", timeLeft: "3h 20m", isActive: false },
  { name: "Protetor", type: "good", timeLeft: "50m", isActive: true },
];

export const RoleRotations = () => {
  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="w-5 h-5 text-primary" />
          Rotação de Roles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {mockRoles.map((role, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                role.isActive ? "bg-primary/10 border-primary/30" : "bg-muted/20 border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <Badge 
                  variant={role.type === "evil" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {role.type === "evil" ? "Mal" : "Bem"}
                </Badge>
                <span className="font-medium">{role.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{role.timeLeft}</span>
                {role.isActive && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};