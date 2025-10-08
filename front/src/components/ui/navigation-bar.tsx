import { useState } from "react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Users, Package, ArrowRight, Menu, X, Megaphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SearchInput } from "./search-input";
import wolfLogo from "@/assets/wolf-logo.png";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { AnnouncementsViewer } from "../AnnouncementsViewer";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const NavigationBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

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

          {/* Desktop Search and Navigation */}
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
              </NavigationMenuItem>

              <NavigationMenuItem>
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

              {/* Botão de Anúncios */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(navigationMenuTriggerStyle(), "bg-background/50 hover:bg-accent/80 group")}>
                    <Megaphone className="w-4 h-4 mr-2" />
                    {t('navigation.updates')}
                  </button> 
                </PopoverTrigger>
                <PopoverContent className="w-[450px] max-h-[70vh] overflow-y-auto p-0">
                  <AnnouncementsViewer />
                </PopoverContent>
              </Popover>

              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Abrir menu">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Menu */}
      
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-card/95 backdrop-blur-lg border-t border-border shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search Form */}
            <LanguageSwitcher />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const username = formData.get("username") as string;
                if (username.trim()) {
                  navigate(`/search?username=${encodeURIComponent(username.trim())}`);
                  setIsMobileMenuOpen(false);
                }
              }}
              className="relative"
            >
              <SearchInput
                name="username"
                placeholder={t('navigation.search_placeholder')}
                className="h-10 w-full pr-10"
              />
              <button type="submit" aria-label="Buscar" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Navigation Links */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="clan">
                <AccordionTrigger className="text-base">
                  <Users className="w-4 h-4 mr-2" /> {t('navigation.clan')}
                </AccordionTrigger>
                <AccordionContent className="pl-4">
                  <Link to="/clan/search" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-muted-foreground">{t('navigation.search_clan')}</Link>
                  <Link to="/clan/rankings" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-muted-foreground">{t('navigation.clan_rankings')}</Link>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="items">
                <AccordionTrigger className="text-base">
                  <Package className="w-4 h-4 mr-2" /> {t('navigation.items')}
                </AccordionTrigger>
                <AccordionContent className="pl-4">
                  <Link to="/items/skins" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-muted-foreground">{t('navigation.skins_and_avatars')}</Link>
                  <Link to="/items/shop" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-muted-foreground">{t('navigation.shop')}</Link>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="updates">
                <AccordionTrigger className="text-base">
                  <Megaphone className="w-4 h-4 mr-2" /> {t('navigation.updates')}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border -mx-4">
                    <AnnouncementsViewer />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      )}
    </header>
  );
};