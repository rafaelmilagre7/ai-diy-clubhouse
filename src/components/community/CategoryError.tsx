
import { CircleAlert, MessageSquare } from "lucide-react";

interface CategoryErrorProps {
  onRetry?: () => void;
}

export const CategoryError = ({ onRetry }: CategoryErrorProps) => {
  return (
    <div className="text-center py-8">
      <CircleAlert className="h-12 w-12 mx-auto text-destructive mb-4" />
      <h3 className="text-xl font-medium mb-2">Erro ao carregar categorias</h3>
      <p className="text-muted-foreground">Não foi possível carregar as categorias da comunidade.</p>
    </div>
  );
};
