
import { MessageSquare, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyTopicListProps {
  categorySlug: string;
}

export const EmptyTopicList = ({ categorySlug }: EmptyTopicListProps) => {
  return (
    <div className="text-center py-8">
      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">Nenhum tópico encontrado</h3>
      <p className="text-muted-foreground mb-6">
        Seja o primeiro a iniciar uma discussão nesta categoria.
      </p>
      <Button asChild className="flex items-center gap-2">
        <Link to={`/comunidade/novo-topico/${categorySlug}`}>
          <PlusCircle className="h-4 w-4" />
          <span>Criar Tópico</span>
        </Link>
      </Button>
    </div>
  );
};
