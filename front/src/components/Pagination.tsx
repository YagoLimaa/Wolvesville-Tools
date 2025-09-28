import { GradientButton } from "@/components/ui/gradient-button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <GradientButton
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Anterior
      </GradientButton>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Página</span>
        <span className="text-primary font-bold text-lg">{currentPage}</span>
        <span className="text-muted-foreground">de</span>
        <span className="text-foreground font-bold">{totalPages}</span>
      </div>

      <GradientButton
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
      >
        Próxima
        <ChevronRight className="w-4 h-4 ml-2" />
      </GradientButton>
    </div>
  );
};