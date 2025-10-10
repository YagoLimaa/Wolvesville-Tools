import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card/80 backdrop-blur border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p className="text-sm">
          {t("footer.unofficial_notice")}
        </p>
        <p className="text-xs mt-2">
          {t("footer.api_disclaimer", {
            link: (
              <a
                href="https://api-docs.wolvesville.com/#/tos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Wolvesville API
              </a>
            ),
          })}
        </p>
      </div>
    </footer>
  );
};
