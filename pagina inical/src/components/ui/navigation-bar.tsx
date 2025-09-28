import { useState } from "react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Search, Users, Package } from "lucide-react";
import { Link } from "react-router-dom";
import wolfLogo from "@/assets/wolf-logo.png";

export const NavigationBar = () => {
  return (
    <header className="bg-card/80 backdrop-blur border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={wolfLogo} alt="Wolvesville" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Wolvesville Tools
            </span>
          </Link>

          {/* Navigation */}
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-background/50 hover:bg-accent/80">
                  <Search className="w-4 h-4 mr-2" />
                  Procurar Player
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-80">
                    <NavigationMenuLink asChild>
                      <Link
                        to="/search"
                        className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Search className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">Buscar Jogador</div>
                            <div className="text-sm text-muted-foreground">
                              Encontre estatísticas de qualquer jogador
                            </div>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-background/50 hover:bg-accent/80">
                  <Users className="w-4 h-4 mr-2" />
                  Clã
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-80">
                    <div className="space-y-2">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/clan/search"
                          className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="font-medium">Buscar Clã</div>
                          <div className="text-sm text-muted-foreground">
                            Encontre informações sobre clãs
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/clan/rankings"
                          className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="font-medium">Rankings de Clãs</div>
                          <div className="text-sm text-muted-foreground">
                            Veja os melhores clãs
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-background/50 hover:bg-accent/80">
                  <Package className="w-4 h-4 mr-2" />
                  Itens
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-80">
                    <div className="space-y-2">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/items/skins"
                          className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="font-medium">Skins & Avatares</div>
                          <div className="text-sm text-muted-foreground">
                            Todas as skins disponíveis
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/items/combinations"
                          className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="font-medium">Combinações</div>
                          <div className="text-sm text-muted-foreground">
                            Combine skins e avatares
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/items/shop"
                          className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="font-medium">Loja</div>
                          <div className="text-sm text-muted-foreground">
                            Ofertas ativas e itens
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};