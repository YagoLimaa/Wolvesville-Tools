import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { useTranslation } from "react-i18next";

export function WelcomeDialog() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("hasVisited", "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("welcomeDialog.title")}</DialogTitle>
          <div className="border-t border-border mt-2 mb-4"></div>
          <div className="text-base text-muted-foreground">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-lg">{t('welcomeDialog.feature1.title')}</h4>
                <p className="leading-relaxed break-words">{t('welcomeDialog.feature1.description')}</p>
              </div>
              <div className="border-t border-border my-4"></div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-lg">{t('welcomeDialog.feature2.title')}</h4>
                <p className="leading-relaxed break-words">{t('welcomeDialog.feature2.description')}</p>
              </div>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
