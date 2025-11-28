import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { GradientButton } from "./gradient-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTrophy } from "@fortawesome/free-solid-svg-icons";

export function WelcomeDialog() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const welcomeDialogShownTime = localStorage.getItem("welcomeDialogShownTime");
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000;

    if (welcomeDialogShownTime) {
      const shownTime = parseInt(welcomeDialogShownTime, 10);
      if (now - shownTime > oneHour) {
        setIsOpen(true);
        localStorage.setItem("welcomeDialogShownTime", now.toString());
      }
    } else {
      setIsOpen(true);
      localStorage.setItem("welcomeDialogShownTime", now.toString());
    }
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm md:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{t("welcomeDialog.title")}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <DialogDescription className="mb-6">{t('welcomeDialog.description', "Explore as novidades e recursos que preparamos para você:")}</DialogDescription>
          <div className="space-y-6">
            <div>
              <GradientButton className="w-full justify-start text-base py-4 sm:text-lg sm:py-6" onClick={() => handleNavigate('/search')}>
                <FontAwesomeIcon icon={faStar} className="mr-4" />
                {t('welcomeDialog.feature1.title')}
              </GradientButton>
              <div className="bg-muted/50 p-3 rounded-md mt-2 ml-4">
                <p className="text-sm sm:text-base">
                  {t('welcomeDialog.feature1.description')}
                </p>
              </div>
            </div>
            <div>
              <GradientButton className="w-full justify-start text-base py-4 sm:text-lg sm:py-6" onClick={() => handleNavigate('/items/skins')}>
                <FontAwesomeIcon icon={faTrophy} className="mr-4" />
                {t('welcomeDialog.feature2.title')}
              </GradientButton>
              <div className="bg-muted/50 p-3 rounded-md mt-2 ml-4">
                <p className="text-sm sm:text-base">
                  {t('welcomeDialog.feature2.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>{t("playerCard.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}