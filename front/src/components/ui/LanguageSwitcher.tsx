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
      <span
        className={cn(
          "pointer-events-none absolute flex h-7 w-8 items-center justify-center rounded-full bg-primary shadow-lg ring-0 transition-transform",
          isPt ? 'translate-x-0' : 'translate-x-[38px]'
        )}
      >
        <span className="text-xs font-semibold text-primary-foreground">
          {isPt ? 'PT' : 'EN'}
        </span>
      </span>
      <span className="flex w-full justify-around items-center text-xs font-semibold text-muted-foreground">
        <span>PT</span>
        <span>EN</span>
      </span>
    </button>
  );
};