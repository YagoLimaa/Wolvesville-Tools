import { Item } from "@/components/contexts/ItemsContext";
export const getHighResUrl = (
  url: string | undefined,
  resolution: '2x' | '3x' = '3x'
): string => {
  if (!url) return "";

  if (
    url.includes('wolvesville.com/static/media') ||
    url.includes('via.placeholder.com') ||
    url.match(/@\dx\./)
  ) {
    return url;
  }
  
  const extensions = ['.png', '.jpg', '.jpeg'];
  for (const ext of extensions) {
    if (url.endsWith(ext)) {
      return url.slice(0, -ext.length) + `@${resolution}` + ext;
    }
  }
  return url;
};

export const getSpecialItemImageUrl = (itemName: string | undefined): string | null => {
  if (!itemName) return null;
  
  const specialImages: Record<string, string> = {
    'Golden Wheel': 'https://www.wolvesville.com/static/media/wheel_of_fortune2.5bc3c3e74f636f0dba3f.png',
    'Wheel Of Fortune': 'https://www.wolvesville.com/static/media/wheel_of_fortune.6cc428f5de217c526190.png',
    'Daily Reward': 'https://www.wolvesville.com/static/media/daily_reward.web.ebe06948b4678ea75d6a.png',
  };
  
  return Object.entries(specialImages).find(([key]) => itemName.includes(key))?.[1] || null;
};

export const getInspectorImageUrl = (item: Item): string => {
  const specialUrl = getSpecialItemImageUrl(item.name);
  return specialUrl || getHighResUrl(item.imageUrl);
};
