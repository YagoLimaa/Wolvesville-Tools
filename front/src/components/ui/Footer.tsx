import { useTranslation, Trans } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card/80 backdrop-blur border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground sm:px-6 lg:px-28">
        <p className="text-sm">
          {t("footer.unofficial_notice")}{" "}
          <Trans
            i18nKey="footer.tos_notice"
            components={{
              tosLink: (
                <a
                  href="https://api-docs.wolvesville.com/#/tos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                />
              ),
            }}
          />
        </p>
        <p className="text-xs mt-2">
          <Trans
            i18nKey="footer.api_disclaimer"
            components={{
              yagodLink: (
                <a
                  href="https://wolvesville-tools.pages.dev/search?username=Yagod&page=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                />
              ),
            }}
          />
        </p>
      </div>
    </footer>
  );
};
