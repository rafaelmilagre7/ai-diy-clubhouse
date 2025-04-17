
import { Filter } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="text-center py-8 bg-white rounded-lg border border-dashed">
      <div className="flex flex-col items-center px-4">
        <Filter className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">Nenhuma conquista encontrada</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-md">
          Não encontramos conquistas com esse filtro. Tente selecionar outra categoria ou continue implementando soluções.
        </p>
      </div>
    </div>
  );
};
