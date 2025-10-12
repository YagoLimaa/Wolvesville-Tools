import { NavigationBar } from "@/components/ui/navigation-bar";
import { RoleRotations } from "@/components/RoleRotations";
import { BattlePassSeason } from "@/components/BattlePassSeason";
import { BattlePassChallenges } from "@/components/BattlePassChallenges";
import { PlayersHighscores } from "@/components/PlayersHighscores";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="px-4 pt-8 space-y-8">
        <div className="text-center space-y-4 py-12">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('navigation.home_title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('navigation.home_description')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col gap-8 lg:w-1/2">
            <BattlePassSeason />
            <BattlePassChallenges />
            <PlayersHighscores />
          </div>

          <div className="flex flex-col gap-8 lg:w-1/2">
            <RoleRotations />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;