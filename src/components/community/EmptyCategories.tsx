
import { MessageSquare } from "lucide-react";

export const EmptyCategories = () => {
  return (
    <div className="text-center py-10">
      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nenhuma categoria encontrada</h3>
      <p className="text-muted-foreground mt-2">As categorias da comunidade aparecerão aqui.</p>
    </div>
  );
};
