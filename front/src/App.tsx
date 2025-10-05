import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ItemsProvider } from "./components/contexts/ItemsContext";
import Index from "./pages/Index";
import SearchPlayer from "./pages/SearchPlayer";
import ItemsShop from "./pages/ItemsShop";
import ItemsSkins from "./pages/ItemsSkins";
import ClanSearch from "./pages/ClanSearch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ItemsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchPlayer />} />
          <Route path="/items/shop" element={<ItemsShop />} />
            <Route path="/clan/search" element={<ClanSearch />} />
            <Route path="/items/skins" element={<ItemsSkins />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ItemsProvider>
  </QueryClientProvider>
);

export default App;
