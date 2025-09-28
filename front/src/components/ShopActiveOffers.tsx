import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { ShoppingBag, Clock, Gem } from "lucide-react";

const mockOffers = [
  {
    title: "Pacote Starter",
    originalPrice: 499,
    salePrice: 199,
    discount: 60,
    timeLeft: "2h 45m",
    items: ["1000 Gems", "5 Avatares", "Skin Especial"],
    isLimitedTime: true
  },
  {
    title: "Avatar Místico",
    originalPrice: 299,
    salePrice: 199,
    discount: 33,
    timeLeft: "1d 5h",
    items: ["Avatar Exclusivo", "Efeito Especial"],
    isLimitedTime: false
  },
  {
    title: "Mega Pack Gems",
    originalPrice: 999,
    salePrice: 699,
    discount: 30,
    timeLeft: "3d 12h",
    items: ["5000 Gems", "Bônus de 1000"],
    isLimitedTime: true
  }
];

export const ShopActiveOffers = () => {
  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Ofertas Ativas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockOffers.map((offer, index) => (
            <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{offer.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {offer.isLimitedTime && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        Tempo Limitado
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                      -{offer.discount}%
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {offer.originalPrice}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {offer.salePrice}
                    </span>
                    <Gem className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {offer.timeLeft}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Inclui:</div>
                <div className="flex flex-wrap gap-1">
                  {offer.items.map((item, itemIndex) => (
                    <Badge key={itemIndex} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <GradientButton variant="primary" size="sm" className="w-full mt-3">
                Comprar Agora
              </GradientButton>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};