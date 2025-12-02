import { useState } from "react";
import { Link } from "react-router-dom";
import wolfLogo from "@/assets/wolf-logo.png";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";

export const NavigationBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="bg-card/80 backdrop-blur border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-28">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={wolfLogo} alt="Wolvesville" className="w-10 h-10" />
            <span className="hidden sm:inline md:hidden lg:inline text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Wolvesville Tools
            </span>
          </Link>

          {isMobile ? (
            <MobileNavigation isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          ) : (
            <DesktopNavigation />
          )}
        </div>
      </div>
    </header>
  );
};