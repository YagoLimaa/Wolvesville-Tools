import { NavigationBar } from "@/components/ui/navigation-bar";
import { RoleRotations } from "@/components/RoleRotations";
import { BattlePassSeason } from "@/components/BattlePassSeason";
import { BattlePassChallenges } from "@/components/BattlePassChallenges";
import { PlayersHighscores } from "@/components/PlayersHighscores";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Wolvesville Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sua central completa para Wolvesville com tudo que você precisa: busca de jogadores, 
            estatísticas, rotações, battle pass e muito mais!
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            <BattlePassSeason />
            <BattlePassChallenges />
            <PlayersHighscores />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <RoleRotations />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;