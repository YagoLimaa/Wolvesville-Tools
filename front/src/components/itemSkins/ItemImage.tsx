import * as React from "react";
import { Item } from "@/components/contexts/ItemsContext";
import { CustomFontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import { AnimatedEmoji } from "./AnimatedEmoji";
import { getHighResUrl } from "@/lib/itemUtils";

export const ItemImage = ({ item, onImageError, isHovered, categoryFilter }: { item: Item; onImageError: (id: string) => void; isHovered: boolean; categoryFilter?: string; }) => {
  const [imageSrc, setImageSrc] = React.useState(getHighResUrl(item.imageUrl) || '');
  const [hasError, setHasError] = React.useState(false);
  const [animationFailed, setAnimationFailed] = React.useState(false);

  React.useEffect(() => {
    setImageSrc(getHighResUrl(item.imageUrl) || '');
    setHasError(false);
    setAnimationFailed(false);
  }, [item.id, item.imageUrl, categoryFilter]);

  const shouldAnimate = item.urlAnimation && (item.category !== 'emojis' || categoryFilter !== 'emojis' || isHovered);

  if (shouldAnimate && !animationFailed) {
    return <AnimatedEmoji urlAnimation={item.urlAnimation} onError={() => setAnimationFailed(true)} />;
  }

  if (item.category === 'profileIcons' && item.name?.startsWith('font-awesome-')) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CustomFontAwesomeIcon iconName={item.name} className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    );
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      onImageError(item.id);
    }

    const baseCdn = "https://cdn2.wolvesville.com";
    let fallbackUrl = '';

    switch (item.category) {
      case "avatarItems":
        fallbackUrl = `${baseCdn}/avatarItems/${item.id}.store@3x.png`;
        break;
      case "bodyPaints":
        fallbackUrl = `${baseCdn}/bodyPaints/${item.id}.store@3x.png`;
        break;
    }

    if (fallbackUrl && fallbackUrl !== imageSrc) {
      setImageSrc(fallbackUrl);
    } else {
      const FALLBACK_IMAGE_URL = "https://cdn-avatars2.wolvesville.com/ad3466d4-8798-4b9b-a5e7-2ae7d2343c58@3x.png";
      if (imageSrc !== FALLBACK_IMAGE_URL) {
        setImageSrc(FALLBACK_IMAGE_URL);
      }
    }
  };

  const isFallback = imageSrc?.includes("ad3466d4-8798-4b9b-a5e7-2ae7d2343c58");

  return (
    <img src={imageSrc} alt={item.name || item.id} className={`w-full h-full object-contain ${isFallback ? 'bg-black/20 rounded-md p-2' : ''}`} onError={handleError} />
  );
};
