import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export const HelpDialog = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" aria-label={t('navigation.help.button')}>
            <HelpCircle className="h-5 w-5" />
            <span className="hidden sm:inline sm:ml-2">{t('navigation.help.button')}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="fixed left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6" /> {t('navigation.help.title')}
            </DialogTitle>
            <DialogDescription>
              {t('navigation.help.description', 'Get help and find contact information.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2 text-base">{t('navigation.help.feature1.title')}</h4>
              <p className="leading-relaxed break-words">{t('navigation.help.feature1.description')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2 text-base">{t('navigation.help.feature2.title')}</h4>
              <p className="leading-relaxed break-words">{t('navigation.help.feature2.description')}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }