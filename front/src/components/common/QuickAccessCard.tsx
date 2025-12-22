import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuickAccessCardProps {
  to: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

export const QuickAccessCard = ({ to, icon: Icon, titleKey, descKey }: QuickAccessCardProps) => {
  const { t } = useTranslation();
  
  return (
    <Link to={to}>
      <Card className="hover:border-primary transition-colors">
        <CardHeader className="flex-row items-center gap-4">
          <Icon className="w-8 h-8 text-primary" />
          <div>
            <CardTitle>{t(titleKey)}</CardTitle>
            <CardDescription>{t(descKey)}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
};
