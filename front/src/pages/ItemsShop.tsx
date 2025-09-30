import { NavigationBar } from "@/components/ui/navigation-bar";
import { ShopActiveOffers } from "@/components/ShopActiveOffers";

const ItemsShop = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8">
        <ShopActiveOffers />
      </main>
    </div>
  );
};

export default ItemsShop;

