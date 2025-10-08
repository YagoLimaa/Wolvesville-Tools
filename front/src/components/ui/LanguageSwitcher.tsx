import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isPt = i18n.language.startsWith('pt');

  const toggleLanguage = () => {
    const newLang = isPt ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative inline-flex h-8 w-[74px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-background/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Mudar idioma para ${isPt ? 'Inglês' : 'Português'}`}
      type="button"
    >
      {/* Fundo que desliza */}
      <span
        className={cn(
          "pointer-events-none absolute h-7 w-8 rounded-full bg-primary shadow-lg ring-0 transition-transform",
          isPt ? 'translate-x-0' : 'translate-x-[38px]'
        )}
      />
      {/* Labels PT e EN */}
      <span className="absolute flex w-full justify-around items-center text-xs font-semibold">
        <span className={cn("transition-colors", isPt ? "text-primary-foreground" : "text-muted-foreground")}>
          PT
        </span>
        <span className={cn("transition-colors", !isPt ? "text-primary-foreground" : "text-muted-foreground")}>
          EN
        </span>
      </span>
    </button>
  );
};