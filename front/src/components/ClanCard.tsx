import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// As tipagens são mantidas para compatibilidade com a página de busca que busca esses dados
export interface ClanMember {
  id: string;
  username: string;
  isCoLeader?: boolean;
  equippedAvatar?: {
    url: string;
  };
}

export interface Clan {
  id: string;
  name: string;
  description: string;
  xp: number;
  memberCount: number;
  members: ClanMember[]; 
}

interface ClanCardProps {
  clan: Clan;
}

export const ClanCard = ({ clan }: ClanCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="h-fit w-full">
      <Card className="bg-card/80 backdrop-blur border-border hover:border-primary transition-all duration-300 hover:shadow-elevated overflow-hidden flex flex-col p-6 text-center">
        <Link to={`/clan/${clan.id}`} className="group">
          <CardTitle className="text-2xl font-bold text-primary group-hover:underline">
            {clan.name}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground italic mt-1 min-h-[40px] flex-grow">
          "{clan.description}"
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Badge variant="secondary" className="text-sm">
            <Users className="w-4 h-4 mr-2" />
            {t("clanCard.members", { count: clan.memberCount })}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Star className="w-4 h-4 mr-2 text-yellow-400" />
            {clan.xp.toLocaleString()} {t("common.xp")}
          </Badge>
        </div>
      </Card>
    </div>
  );
};