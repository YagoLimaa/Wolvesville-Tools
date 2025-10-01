import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { IconName } from '@fortawesome/fontawesome-common-types';

// Adiciona todos os ícones sólidos à biblioteca para que possamos usá-los dinamicamente
library.add(fas);

interface CustomFontAwesomeIconProps {
  iconName: string; // ex: "font-awesome-5:tooth:light"
  className?: string;
}

// Função para converter o nome da API para um nome de ícone válido
const parseIconName = (name: string): IconName | null => {
  if (!name.startsWith('font-awesome-')) return null;
  const parts = name.split(':');
  if (parts.length < 2) return null;
  
  // Converte "tooth" para "tooth" (camelCase não é necessário para ícones sólidos)
  const icon = parts[1];
  return icon as IconName;
};

export const CustomFontAwesomeIcon = ({ iconName, className }: CustomFontAwesomeIconProps) => {
  const parsedName = parseIconName(iconName);

  if (!parsedName) {
    // Retorna um ícone de fallback se o nome for inválido
    return <FontAwesomeIcon icon={faQuestionCircle} className={className} />;
  }

  return <FontAwesomeIcon icon={['fas', parsedName]} className={className} />;
};
