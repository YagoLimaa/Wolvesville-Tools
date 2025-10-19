import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library, findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { fas, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { IconName } from '@fortawesome/fontawesome-common-types';
import { icons } from 'lucide-react';

// Adiciona todos os ícones sólidos à biblioteca para que possamos usá-los dinamicamente
library.add(fas);

interface CustomFontAwesomeIconProps {
  iconName: string; // ex: "font-awesome-5:tooth:light"
  className?: string;
}

// Mapeamento de nomes de ícones do FontAwesome v5 para v6
const v5tov6: { [key: string]: string } = {
  'atom-alt': 'atom',
  'chart-network': 'project-diagram',
  'eye-evil': 'eye',
  'flask-potion': 'flask-vial',
  'pie': 'chart-pie',
  'cogs': 'gears',
  'dizzy': 'face-dizzy',
  'grin-hearts': 'face-grin-hearts',
  'kiss-wink-heart': 'face-kiss-wink-heart',
  'heart-broken': 'heart-crack',
  'tired': 'face-tired',
  'hot-tub': 'hot-tub-person',
  'wand-magic': 'wand-magic-sparkles',
  'fire-alt': 'fire-flame-curved',
  'thunderstorm': 'cloud-bolt',
  'tint': 'droplet-slash',
  'balance-scale': 'scale-balanced',
  'radiation': 'circle-radiation',
  'angry': 'face-angry',
  'magic': 'wand-magic-sparkles',
  'cocktail': 'martini-glass-citrus',
  'yen-sign': 'yen',
  'map-marked-alt': 'map-location-dot',
  'heartbeat': 'heart-pulse',
  'meh-rolling-eyes': 'face-rolling-eyes',
  'flame': 'fire-flame-simple',
  'money-bill': 'money-bill-1',
  'university': 'building-columns',
  'comment-smile': 'comment-dots',
  'birthday-cake': 'cake-candles',
  'chess-knight-alt': 'chess-knight',
  'chess-rook-alt': 'chess-rook',
  'drumstick': 'drumstick-bite',
};

// Mapeamento de ícones FontAwesome (Pro) para ícones Lucide
const faToLucide: { [key: string]: string } = {
  'axe': 'Axe',
  'campfire': 'Flame',
  'hat-witch': 'MagicWand',
  'bat': 'Bat',
  'turtle': 'Turtle',
  'duck': 'Duck',
  'rabbit': 'Rabbit',
  'sword': 'Swords',
  'swords': 'Swords',
  'wheat': 'Wheat',
  'spider-web': 'Spider',
  'bullseye-arrow': 'Bullseye',
  'mountain': 'Mountain',
  'wine-bottle': 'Wine',
  'axe-battle': 'Axe',
  'scroll-old': 'Scroll',
  'moon-stars': 'MoonStar',
  'helmet-battle': 'Helmet',
  'globe-europe': 'Globe',
  'meat': 'Beef',
  'biking-mountain': 'Bike',
  'stars': 'Star',
  'user-crown': 'Crown',
  'book-dead': 'BookX',
  'popcorn': 'Popcorn',
  'stroopwafel': 'Cookie',
  'candy-cane': 'Candy',
  'candy-corn': 'Candy',
  'dungeon': 'Castle',
  'mandolin': 'Guitar',
  'hand-holding-magic': 'Hand',
  'flask-poison': 'FlaskConical',
  'alien': 'Alien',
  'ufo': 'Rocket',
  'cat-space': 'Cat',
  'planet-ringed': 'Planet',
  'comet': 'Meteor',
  'rocket-launch': 'Rocket',
  'joystick': 'Joystick',
  'radio': 'Radio',
  'tv-retro': 'Tv',
  'game-console-handheld': 'Gamepad2',
  'hurricane': 'Wind',
  'mask': 'Mask',
  'star-shooting': 'Star',
  'user-ninja': 'User',
  'key-skeleton': 'Key',
  'teeth-open': 'Smile',
  'theater-masks': 'Theater',
  'spider-black-widow': 'Spider',
  'squirrel': 'Squirrel',
  'soup': 'Soup',
  'mug-tea': 'Coffee',
  'user-visor': 'User',
  'knife-kitchen': 'Knife',
  'shovel': 'Shovel',
  'pumpkin': 'Carrot',
  'paw-claws': 'PawPrint',
  'wand': 'Wand2',
  'hammer-war': 'Hammer',
  'utensil-knife': 'Knife',
  'scarf': 'Wind',
  'ear-muffs': 'Headphones',
  'fireplace': 'Flame',
  'flower-daffodil': 'Flower',
  'sheep': 'Sheep',
  'elephant': 'Elephant',
  'snake': 'Snake',
  'sunglasses': 'Sunglasses',
  'battery-bolt': 'BatteryCharging',
  'skeleton': 'Skull',
};


// Função para converter o nome da API para um nome de ícone válido
const parseIconName = (name: string): IconName | null => {
  if (!name.startsWith('font-awesome-') && !name.startsWith('streamline-icons')) return null;
  const parts = name.split(':');
  if (parts.length < 2) return null;
  
  let icon = parts[1];

  // Converte nomes de ícones v5 para v6 se existir no mapa
  if (v5tov6[icon]) {
    icon = v5tov6[icon];
  }

  return icon as IconName;
};

export const CustomFontAwesomeIcon = ({ iconName, className }: CustomFontAwesomeIconProps) => {
  const parsedName = parseIconName(iconName);

  if (!parsedName) {
    return <FontAwesomeIcon icon={faQuestionCircle} className={className} />;
  }

  // 1. Tenta encontrar o ícone no FontAwesome Solid
  const faIconDefinition = findIconDefinition({ prefix: 'fas', iconName: parsedName });

  if (faIconDefinition) {
    return <FontAwesomeIcon icon={['fas', parsedName]} className={className} />;
  }

  // 2. Se não encontrar, tenta encontrar um substituto na biblioteca Lucide
  const lucideIconName = faToLucide[parsedName];
  if (lucideIconName) {
    const LucideIcon = icons[lucideIconName as keyof typeof icons];
    if (LucideIcon) {
      return <LucideIcon className={className} />;
    }
  }

  // 3. Se nada funcionar, retorna o ícone de fallback
  return <FontAwesomeIcon icon={faQuestionCircle} className={className} />;
};