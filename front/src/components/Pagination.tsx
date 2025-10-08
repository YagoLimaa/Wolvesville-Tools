import { GradientButton } from "@/components/ui/gradient-button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
}: PaginationProps) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <GradientButton
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        {t('pagination.previous')}
      </GradientButton>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{t('pagination.page')}</span>
        <span className="text-primary font-bold text-lg">{currentPage}</span>
        <span className="text-muted-foreground">{t('pagination.of')}</span>
        <span className="text-foreground font-bold">{totalPages}</span>
      </div>

      <GradientButton
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
      >
        {t('pagination.next')}
        <ChevronRight className="w-4 h-4 ml-2" />
      </GradientButton>
    </div>
  );
};