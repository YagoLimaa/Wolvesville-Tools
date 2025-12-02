import { Users, Package, ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SearchInput } from "./search-input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { AnnouncementsViewer } from "../AnnouncementsViewer";
import { useTranslation } from "react-i18next";
import { ChangelogViewer } from "../ChangelogViewer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HelpDialog } from "./HelpDialog";

interface MobileNavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const MobileNavigation = ({ isMobileMenuOpen, setIsMobileMenuOpen }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLinkClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="md:hidden flex items-center gap-2">
        <LanguageSwitcher />
        <HelpDialog />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Abrir menu">
          {isMobileMenuOpen ? (
            <span className="text-2xl">&times;</span>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-card/95 backdrop-blur-lg border-t border-border shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const username = formData.get("username") as string;
                if (username.trim()) {
                  handleLinkClick(`/search?username=${encodeURIComponent(username.trim())}`);
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
            </Accordion>
            <Sheet>
              <SheetTrigger className="flex items-center text-base font-medium py-4 w-full">
                <CalendarDays className="w-4 h-4 mr-2" /> {t('navigation.events')}
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] overflow-y-auto custom-scrollbar p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>{t('navigation.events')}</SheetTitle>
                </SheetHeader>
                <AnnouncementsViewer />
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger className="flex items-center text-base font-medium py-4 w-full">
                <Newspaper className="w-4 h-4 mr-2" /> {t('navigation.updates')}
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] overflow-y-auto custom-scrollbar p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>{t('navigation.updates')}</SheetTitle>
                </SheetHeader>
                <ChangelogViewer />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}
    </>
  );
};