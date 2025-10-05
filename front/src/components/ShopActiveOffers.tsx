import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag, Gem, AlertTriangle, X } from "lucide-react";
import { useItems, Item } from "./contexts/ItemsContext";

// Interface atualizada para corresponder à resposta real da API
interface Offer {
  type: string;
  expireDate: string;
  promoImageUrl: string;
  costInGems?: number;
  // Adicionando outras propriedades como opcionais
  avatarItemIds?: string[];
  avatarItemSetIds?: (
    | {
        id: string;
        avatarItemIds?: string[];
      }
    | string
  )[];
  advancedRoleCardOfferId?: string;
  avatarItemsCollectionId?: string;
  emojisCollectionId?: string;
}

const fetchShopOffers = async (): Promise<Offer[]> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/shop/activeOffers`);
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

// Mapeamento para as descrições das ofertas
const offerTypeDescriptions: { [key: string]: string } = {
  AVATAR_ITEMS_SET: "Conjuntos de roupas disponíveis por tempo limitado.",
  ADVANCED_ROLE_CARD: "Pacotes para desbloquear e aprimorar funções avançadas.",
  TAROT_OUTFITS: "Coleções de roupas místicas baseadas nas cartas de Tarô.",
  ZODIAC_ANIMAL_OUTFITS: "Trajes especiais inspirados nos animais do Zodíaco.",
  EMOJIS: "Pacotes de emojis exclusivos para usar no jogo.",
  AVATAR_ITEMS: "Pacotes de itens de avatar para customizar seu personagem."
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

// Hook customizado para o contador de tempo restante
const useCountdownToNextWednesday = (): { timeLeftFormatted: string; isEndingSoon: boolean } => {
  const [timeLeft, setTimeLeft] = React.useState(0);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(now);
      const currentDay = now.getDay(); // Domingo = 0, Quarta = 3
      const targetDay = 3; // Quarta-feira

      let daysToAdd = targetDay - currentDay;
      // Se já passou da quarta-feira desta semana, ou se é quarta-feira mas já passou das 21h
      if (daysToAdd < 0 || (daysToAdd === 0 && now.getHours() >= 21)) {
        daysToAdd += 7; // Mira na próxima semana
      }

      target.setDate(now.getDate() + daysToAdd);
      // Define o horário para 21:00 (9 PM) do horário local do navegador
      target.setHours(21, 0, 0, 0);

      setTimeLeft(target.getTime() - now.getTime());
    };

    calculateTimeLeft(); // Calcula na primeira renderização
    const interval = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft <= 0) {
    return { timeLeftFormatted: "Expirado", isEndingSoon: true };
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const isEndingSoon = timeLeft < 2 * 60 * 60 * 1000; // Menos de 2 horas

  return { timeLeftFormatted: `${days}d ${hours}h ${minutes}m ${seconds}s}`, isEndingSoon };
};

// Hook customizado para o contador de tempo restante até o próximo mês
const useCountdownToNextMonth = (): { timeLeftFormatted: string; isEndingSoon: boolean } => {
  const [timeLeft, setTimeLeft] = React.useState(0);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Define o alvo como o primeiro dia do próximo mês, à meia-noite
      const target = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
      setTimeLeft(target.getTime() - now.getTime());
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft <= 0) {
    return { timeLeftFormatted: "Expirado", isEndingSoon: true };
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const isEndingSoon = timeLeft < 2 * 60 * 60 * 1000; // Menos de 2 horas

  return { timeLeftFormatted: `${days}d ${hours}h ${minutes}m ${seconds}s}`, isEndingSoon };
};

export const ShopActiveOffers = () => {
  const { data: offers, isLoading, isError, error } = useQuery<Offer[], Error>({
    queryKey: ["shopOffers"],
    queryFn: fetchShopOffers,
  });
  const [selectedOffer, setSelectedOffer] = React.useState<Offer | null>(null);
  const { itemsById } = useItems();

  // Agrupa as ofertas pelo tipo
  const groupedOffers = React.useMemo(() => {
    if (!offers) return {};
    return offers.reduce((acc, offer) => {
      (acc[offer.type] = acc[offer.type] || []).push(offer);
      return acc;
    }, {} as Record<string, Offer[]>);
  }, [offers]);

  // Encontra as peças de uma coleção selecionada
  const collectionPieces = React.useMemo(() => {
    if (!selectedOffer) return [];

    const allItemIds: string[] = [];

    // Lógica para Roupas (Sets de Avatar, Tarô, Zodíaco, etc.)
    if (selectedOffer.avatarItemSetIds && selectedOffer.avatarItemSetIds.length > 0) {
      const setIds = selectedOffer.avatarItemSetIds;
      const idsFromSets = setIds.flatMap(setId => {
        const itemSet = itemsById.get(typeof setId === 'string' ? setId : setId.id);
        return (itemSet?.avatarItemIds as string[] | undefined) || [];
      });
      allItemIds.push(...idsFromSets);
    }

    // Lógica para Itens de Avatar individuais (que vêm de uma coleção)
    if (selectedOffer.avatarItemIds && selectedOffer.avatarItemIds.length > 0) {
      allItemIds.push(...selectedOffer.avatarItemIds);
    } else if (selectedOffer.avatarItemsCollectionId) {
      const collectionItem = itemsById.get(selectedOffer.avatarItemsCollectionId);
      const idsFromCollection = (collectionItem?.avatarItemIds as string[] | undefined) || [];
      allItemIds.push(...idsFromCollection);
    }

    // Lógica para Funções Avançadas (Role Icons)
    if (selectedOffer.advancedRoleCardOfferId) {
      console.log("--- Debug: Oferta de Função Avançada ---");
      // 1. Pega o ID da oferta de função avançada.
      const offerId = selectedOffer.advancedRoleCardOfferId;
      console.log("1. ID da Oferta (advancedRoleCardOfferId):", offerId);

      // 2. Busca o item de oferta correspondente, que contém o ID do conjunto de avatar.
      const offerItem = itemsById.get(offerId);
      console.log("2. Item da Oferta encontrado no mapa 'itemsById':", offerItem);

      if (offerItem) {
        // 3. Usa o avatarItemSetId de dentro do item de oferta para encontrar o conjunto real.
        const targetSetId = offerItem.avatarItemSetId as string; // Este é o ID do conjunto que queremos
        console.log("3. ID do Conjunto de Avatar (avatarItemSetId) encontrado no item da oferta:", targetSetId);

        // Busca o item, mas garante que ele seja da categoria 'avatarItemSets'
        const itemSet = itemsById.get(targetSetId);
        console.log("4. Conjunto de Itens (itemSet) encontrado no mapa 'itemsById':", itemSet);

        // A verificação crucial: o item encontrado DEVE ser da categoria 'avatarItemSets'
        if (itemSet && itemSet.category === 'avatarItemSets') {

        const idsFromSet = (itemSet?.avatarItemIds as string[] | undefined) || [];
        allItemIds.push(...idsFromSet);
        }
      }
    }

    // Lógica para Coleções de Emojis
    if (selectedOffer.emojisCollectionId) {
      const collectionId = selectedOffer.emojisCollectionId;
      const collectionItem = itemsById.get(collectionId);
      const emojiIds = (collectionItem?.emojis as { id: string }[] | undefined)?.map(emoji => emoji.id) || [];
      allItemIds.push(...emojiIds);
    }

    // Usamos um Set para remover duplicatas, caso um item apareça em mais de uma categoria da oferta
    const uniqueItemIds = [...new Set(allItemIds)];

    return uniqueItemIds
      .map(itemId => itemsById.get(itemId))
      .filter((item): item is NonNullable<typeof item> => !!item);
  }, [selectedOffer, itemsById]);

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
                  {offerGroup.map((offer) => {
                    const Countdown = ({ offerType }: { offerType: string }) => {
                      // Define quais tipos de oferta usam o contador mensal
                      const monthlyResetTypes = ['ZODIAC_ANIMAL_OUTFITS','TAROT_OUTFITS','ADVANCED_ROLE_CARD','AVATAR_ITEMS_SET','ADVANCED_ROLE_CARD','AVATAR_ITEMS']; // Apenas 'AVATAR_ITEMS' (bundles) usam o reset mensal.
                      const useMonthlyCountdown = monthlyResetTypes.includes(offerType);
                      
                      // Hooks devem ser chamados incondicionalmente no topo do componente.
                      const monthlyTimeLeft = useCountdownToNextMonth();
                      const weeklyTimeLeft = useCountdownToNextWednesday();
                      // A lógica condicional é aplicada ao resultado dos hooks.
                      const timeLeft = useMonthlyCountdown ? monthlyTimeLeft : weeklyTimeLeft;

                      return (
                        <div className={`absolute top-2 right-2 px-2 py-1 bg-black/60 text-xs rounded-full font-semibold ${timeLeft.isEndingSoon ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                          {timeLeft.timeLeftFormatted}
                        </div>
                      );
                    };
                    return (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            key={offer.promoImageUrl}
                            onClick={() => setSelectedOffer(offer)}
                            className="relative group overflow-hidden rounded-lg border border-border hover:border-primary transition-colors duration-300 text-left w-full"
                          >
                            <img src={offer.promoImageUrl} alt={offer.type} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <Countdown offerType={offer.type} />
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
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{offerTypeDescriptions[offer.type] || "Clique para ver os detalhes."}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal para exibir os itens da oferta */}
        <Dialog open={!!selectedOffer} onOpenChange={(isOpen) => !isOpen && setSelectedOffer(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            {selectedOffer && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl font-bold">
                    {getOfferNameFromUrl(selectedOffer.promoImageUrl)}
                  </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto pr-4 -mr-4">
                  {collectionPieces.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {collectionPieces.map(piece => piece && (
                        <div key={piece.id} className="relative group aspect-square flex flex-col items-center justify-center p-2 rounded-lg bg-secondary/50 border border-border">
                          <img src={piece.imageUrl} alt={piece.name} className="w-full h-full object-contain" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-md">
                            <p className="text-xs font-semibold text-white truncate">{piece.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">Não foi possível encontrar os detalhes dos itens deste pacote.</p>
                  )}
                </div>
                {selectedOffer.costInGems && (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      <Gem className="w-5 h-5 mr-2" /> {selectedOffer.costInGems}
                    </Badge>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};