
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface CategoryErrorProps {
  onRetry: () => void;
}

export const CategoryError = ({ onRetry }: CategoryErrorProps) => {
  return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Erro ao carregar categorias</h3>
      <p className="text-muted-foreground mb-4">
        Não foi possível carregar as categorias do fórum.
      </p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar Novamente
      </Button>
    </div>
  );
};
