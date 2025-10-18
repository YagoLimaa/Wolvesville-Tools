import { Link } from "react-router-dom";
import { BattlePassChallenges } from "@/components/BattlePassChallenges";
import { BattlePassSeason } from "@/components/BattlePassSeason";
import { PlayersHighscores } from "@/components/PlayersHighscores";
import { RoleRotations } from "@/components/RoleRotations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Shirt, Swords, Users, Store } from "lucide-react";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 py-8 space-y-12">
        <div className="text-center space-y-4 py-12">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-fade-in-down">
            {t("navigation.home_title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up">
            {t("navigation.home_description")}
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/search">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="flex-row items-center gap-4">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>{t("navigation.search_player")}</CardTitle>
                  <CardDescription>{t("navigation.search_player_desc")}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/clan/rankings">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="flex-row items-center gap-4">
                <Swords className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>{t("navigation.clan_rankings")}</CardTitle>
                  <CardDescription>{t("navigation.clan_rankings_description")}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/items/shop">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="flex-row items-center gap-4">
                <Store className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>{t("navigation.shop")}</CardTitle>
                  <CardDescription>{t("navigation.shop_description")}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/items/skins"> 
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="flex-row items-center gap-4">
                <Shirt className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>{t("navigation.skins_and_avatars")}</CardTitle>
                  <CardDescription>{t("navigation.skins_and_avatars_description")}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{t("battlePass.season.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <BattlePassSeason />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("battlePass.challenges.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <BattlePassChallenges />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{t("roleRotations.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <RoleRotations />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("playersHighscores.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <PlayersHighscores />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;