
import { SearchX } from "lucide-react";

interface EmptyTopicsStateProps {
  searchQuery?: string;
}

export const EmptyTopicsState = ({ searchQuery }: EmptyTopicsStateProps) => {
  return (
    <div className="text-center py-10">
      <SearchX className="h-12 w-12 mx-auto text-muted-foreground" />
      {searchQuery ? (
        <>
          <h3 className="text-xl font-medium mt-4">Nenhum tópico encontrado</h3>
          <p className="text-muted-foreground mt-2">
            Não encontramos nenhum tópico para "{searchQuery}"
          </p>
        </>
      ) : (
        <>
          <h3 className="text-xl font-medium mt-4">Nenhum tópico criado</h3>
          <p className="text-muted-foreground mt-2">
            Seja o primeiro a iniciar uma discussão nesta categoria!
          </p>
        </>
      )}
    </div>
  );
};
