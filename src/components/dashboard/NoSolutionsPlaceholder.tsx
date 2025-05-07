
import { BookOpen, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const NoSolutionsPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-3">
        <BookOpen className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-medium">Nenhuma solução encontrada</h3>
      <p className="mb-6 max-w-md text-muted-foreground">
        Você ainda não tem soluções disponíveis. Explore nossas soluções para começar a implementar IA no seu negócio.
      </p>
      <Button asChild>
        <Link to="/solutions">
          <PlusCircle className="mr-2 h-4 w-4" />
          Explorar soluções
        </Link>
      </Button>
    </div>
  );
};
