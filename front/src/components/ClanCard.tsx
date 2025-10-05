import * as React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, ChevronDown } from "lucide-react";
import { GradientButton } from "./ui/gradient-button";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

// Tipagem para os dados do clã que esperamos receber
export interface ClanMember {
  id: string;
  username: string;
  isCoLeader?: boolean;
  // Corrigido: A API retorna 'equippedAvatar' para os membros detalhados do clã
  equippedAvatar?: {
    url: string;
  };
}

export interface Clan {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  xp: number;
  members: ClanMember[];
}

interface ClanCardProps {
  clan: Clan;
}

// Mapeia os papéis para traduções e ícones
const roleInfo = {
  LEADER: { name: "Líder", icon: "👑" },
  CO_LEADER: { name: "Co-líder", icon: "🛡️" },
  MEMBER: { name: "Membro", icon: "⚔️" },
};

export const ClanCard = ({ clan }: ClanCardProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="bg-card/80 backdrop-blur border-border hover:border-primary transition-all duration-300 hover:shadow-elevated overflow-hidden flex flex-col">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-6 flex flex-col items-center text-center">
          <CardTitle className="text-2xl font-bold text-primary">{clan.name}</CardTitle>
          <p className="text-sm text-muted-foreground italic mt-1 min-h-[40px] flex-grow">"{clan.description}"</p>
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="secondary" className="text-sm">
              <Users className="w-4 h-4 mr-2" />
              {clan.members.length} Membros
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              {clan.xp.toLocaleString()} XP
            </Badge>
          </div>
          <CollapsibleTrigger asChild>
            <GradientButton variant="outline" className="mt-4 w-full">
              Ver Membros <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </GradientButton>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="border-t border-border p-4 bg-background/30">
            <h4 className="font-semibold text-md mb-3 text-center">Membros do Clã</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
              {clan.members
                .sort((a, b) => {
                  const getRoleValue = (m: ClanMember, index: number) => {
                    if (index === 0) return 0; // O primeiro da lista é o Líder
                    if (m.isCoLeader) return 1;
                    return 2; // Todos os outros são membros
                  };
                  return getRoleValue(a, clan.members.indexOf(a)) - getRoleValue(b, clan.members.indexOf(b));
                })
                .map((member, index) => {
                  const roleKey = index === 0 ? 'LEADER' : (member.isCoLeader ? 'CO_LEADER' : 'MEMBER');
                  const role = roleInfo[roleKey];
                  const avatarUrl = member.equippedAvatar?.url || "https://cdn-avatars2.wolvesville.com/ad3466d4-8798-4b9b-a5e7-2ae7d2343c58@2x.png";
                  return (
                    <Link to={`/search?username=${encodeURIComponent(member.username)}`} key={member.id} className="block">
                      <div className="flex items-center gap-2 bg-secondary p-2 rounded-md text-sm hover:bg-primary/20 transition-colors h-full">
                        <img src={avatarUrl} alt={member.username} className="w-8 h-8 rounded-full border-2 border-primary/50" />
                        <div className="overflow-hidden">
                          <p className="font-bold truncate" title={member.username}>{member.username}</p>
                          <p className="text-xs text-muted-foreground"><span className="mr-1">{role.icon}</span>{role.name}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};