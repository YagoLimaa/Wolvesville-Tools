import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RolesProvider } from "./components/contexts/RolesContext";
import { ItemsProvider } from "./components/contexts/ItemsContext";
import Index from "./pages/Index";
import SearchPlayer from "./pages/SearchPlayer";
import ItemsShop from "./pages/ItemsShop";
import ItemsSkins from "./pages/ItemsSkins";
import ClanSearch from "./pages/ClanSearch";
import ClanRankings from "./pages/ClanRankings";
import ClanInfo from "./pages/ClanInfo";
import NotFound from "./pages/NotFound";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Footer } from "./components/ui/Footer";
import { useEffect } from "react";
import mixpanel from "mixpanel-browser";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    mixpanel.track("Site Visited");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RolesProvider>
        <ItemsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/search" element={<SearchPlayer />} />
                    <Route path="/items/shop" element={<ItemsShop />} />
                    <Route path="/clan/search" element={<ClanSearch />} />
                    <Route path="/clan/rankings" element={<ClanRankings />} />
                    <Route path="/clan/:id" element={<ClanInfo />} />
                    <Route path="/items/skins" element={<ItemsSkins />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ItemsProvider>
      </RolesProvider>
    </QueryClientProvider>
  );
};

export default App;

