import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag, Clock, Gem, AlertTriangle } from "lucide-react";

// Interface atualizada para corresponder à resposta real da API
interface Offer {
  type: string;
  expireDate: string;
  promoImageUrl: string;
  costInGems?: number;
  // Adicionando outras propriedades como opcionais
  avatarItemSetIds?: string[];
  advancedRoleCardOfferId?: string;
  emojisCollectionId?: string;
}

const fetchShopOffers = async (): Promise<Offer[]> => {
  const response = await fetch("http://localhost:3000/shop/activeOffers");
  if (!response.ok) {
    throw new Error("Não foi possível buscar as ofertas da loja.");
  }
  return response.json();
};

// Mapeamento para traduzir os nomes dos tipos de oferta
const offerTypeTranslations: { [key: string]: string } = {
  AVATAR_ITEMS_SET: "Roupas limitadas",
  ADVANCED_ROLE_CARD: "Funções avançadas",
  TAROT_OUTFITS: "Roupas de Tarô",
  ZODIAC_ANIMAL_OUTFITS: "Roupas do Zodíaco",
  EMOJIS: "Emojis",
};

// Função para extrair e formatar o nome da oferta a partir da URL da imagem
const getOfferNameFromUrl = (url: string): string => {
  try {
    const filename = url.split('/').pop()?.split('.')[0] ?? '';
    return filename.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  } catch {
    return "Oferta";
  }
};

export const ShopActiveOffers = () => {
  const { data: offers, isLoading, isError, error } = useQuery<Offer[], Error>({
    queryKey: ["shopOffers"],
    queryFn: fetchShopOffers,
  });

  // Agrupa as ofertas pelo tipo
  const groupedOffers = React.useMemo(() => {
    if (!offers) return {};
    return offers.reduce((acc, offer) => {
      (acc[offer.type] = acc[offer.type] || []).push(offer);
      return acc;
    }, {} as Record<string, Offer[]>);
  }, [offers]);

  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Ofertas da Loja
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {offers && (
          <div className="space-y-6">
            {Object.entries(groupedOffers).map(([type, offerGroup]) => (
              <div key={type}>
                <h3 className="text-lg font-semibold text-primary mb-3">
                  {offerTypeTranslations[type] || type}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {offerGroup.map((offer, index) => (
                    <div key={`${offer.type}-${index}`} className="relative group overflow-hidden rounded-lg border border-border">
                      <img src={offer.promoImageUrl} alt={offer.type} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      {offer.costInGems && (
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            <Gem className="w-3 h-3 mr-1" />
                            {offer.costInGems}
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        {getOfferNameFromUrl(offer.promoImageUrl)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};