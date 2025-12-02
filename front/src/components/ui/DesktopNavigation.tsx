import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Users, Package, ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SearchInput } from "./search-input";
import { AnnouncementsViewer } from "../AnnouncementsViewer";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ChangelogViewer } from "../ChangelogViewer";
import { HelpDialog } from "./HelpDialog";

export const DesktopNavigation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="hidden md:flex items-center gap-4">
      {/* Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const username = formData.get("username") as string;
          if (username.trim()) navigate(`/search?username=${encodeURIComponent(username.trim())}`);
        }}
        className="relative"
      >
        <SearchInput
          name="username"
          placeholder={t('navigation.search_placeholder')}
          className="h-10 w-48 lg:w-64 pr-10"
        />
        <button type="submit" aria-label="Buscar" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      
      {/* Navigation Menu */}
      <LanguageSwitcher />
      <HelpDialog />
      <NavigationMenu>
        <NavigationMenuList className="gap-2">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-background/50 hover:bg-accent/80">
            <Users className="w-4 h-4 mr-2" />
            {t('navigation.clan')}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 w-80">
              <div className="space-y-2">
                <NavigationMenuLink asChild>
                  <Link
                    to="/clan/search"
                    className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="font-medium">{t('navigation.search_clan')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('navigation.search_clan_description')}
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link
                    to="/clan/rankings"
                    className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="font-medium">{t('navigation.clan_rankings')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('navigation.clan_rankings_description')}
                    </div>
                  </Link>
                </NavigationMenuLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>              <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-background/50 hover:bg-accent/80">
            <Package className="w-4 h-4 mr-2" />
            {t('navigation.items')}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 w-80">
              <div className="space-y-2">
                <NavigationMenuLink asChild>
                  <Link
                    to="/items/skins"
                    className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="font-medium">{t('navigation.skins_and_avatars')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('navigation.skins_and_avatars_description')}
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link
                    to="/items/shop"
                    className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="font-medium">{t('navigation.shop')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('navigation.shop_description')}
                    </div>
                  </Link>
                </NavigationMenuLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Botão de Eventos */}
        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(navigationMenuTriggerStyle(), "bg-background/50 hover:bg-accent/80 group")}>
              <CalendarDays className="w-4 h-4 mr-2" />
              {t('navigation.events')}
            </button> 
          </PopoverTrigger>
          <PopoverContent className="w-[450px] max-h-[70vh] overflow-y-auto p-0 custom-scrollbar">
            <AnnouncementsViewer />
          </PopoverContent>
        </Popover>

        {/* Botão de Updates */}
        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(navigationMenuTriggerStyle(), "bg-background/50 hover:bg-accent/80 group")}>
              <Newspaper className="w-4 h-4 mr-2" />
              {t('navigation.updates')}
            </button> 
          </PopoverTrigger>
          <PopoverContent className="w-[450px] max-h-[70vh] overflow-y-auto p-0 custom-scrollbar">
            <ChangelogViewer />
          </PopoverContent>
        </Popover>

        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}