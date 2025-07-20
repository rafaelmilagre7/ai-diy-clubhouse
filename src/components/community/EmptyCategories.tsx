
import { MessageSquare } from "lucide-react";

export const EmptyCategories = () => {
  return (
    <div className="text-center py-8">
      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">Nenhuma categoria encontrada</h3>
      <p className="text-muted-foreground">
        As categorias da comunidade não estão disponíveis no momento.
      </p>
    </div>
  );
};
