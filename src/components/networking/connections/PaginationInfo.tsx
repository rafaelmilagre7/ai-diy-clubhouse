import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PaginationInfoProps {
  currentPage: number;
  hasMore: boolean;
  totalDisplayed: number;
  totalCount?: number;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
  isFetching?: boolean;
}

/**
 * ✅ UPGRADE VISUAL: Indicador de paginação premium
 * - Visual moderno com status de loading
 * - Informação clara de página atual
 * - Botões de navegação acessíveis
 */
export const PaginationInfo = ({
  currentPage,
  hasMore,
  totalDisplayed,
  totalCount,
  onPrevious,
  onNext,
  isLoading,
  isFetching
}: PaginationInfoProps) => {
  const pageNumber = currentPage + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4",
        "p-4 rounded-xl",
        "bg-surface-elevated/50 backdrop-blur-sm border border-border/50"
      )}
    >
      {/* Info de Página */}
      <div className="flex items-center gap-3">
        {isFetching && (
          <Loader2 className="w-4 h-4 text-aurora animate-spin" />
        )}
        <div className="text-sm text-muted-foreground">
          Página <span className="font-semibold text-foreground">{pageNumber}</span>
          {totalCount && (
            <>
              {' • '}
              <span className="font-semibold text-foreground">{totalDisplayed}</span>
              {' de '}
              <span className="font-semibold text-foreground">{totalCount}</span>
              {' membros'}
            </>
          )}
        </div>
      </div>

      {/* Botões de Navegação */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentPage === 0 || isLoading || isFetching}
          className={cn(
            "gap-2",
            "hover:bg-aurora/10 hover:border-aurora/40",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasMore || isLoading || isFetching}
          className={cn(
            "gap-2",
            "hover:bg-aurora/10 hover:border-aurora/40",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
