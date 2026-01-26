import { NavigationBar } from "@/components/ui/navigation-bar";
import { ShopActiveOffers } from "@/components/ShopActiveOffers";
import { useSEO } from "@/hooks/useSEO";

const ItemsShop = () => {
  useSEO({
    title: "Wolvesville Shop - Active Offers & Items",
    description: "View all active shop offers, rotating items, and limited-time deals in Wolvesville",
    keywords: ["wolvesville", "shop", "offers", "items", "deals", "limited-time"],
    url: "https://wolvesville-tools.pages.dev/items/shop",
    schemaMarkup: {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Wolvesville Shop",
      "description": "View all active shop offers and items in Wolvesville",
      "url": "https://wolvesville-tools.pages.dev/items/shop"
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-28 py-8">
        <ShopActiveOffers />
      </main>
    </div>
  );
};

export default ItemsShop;

