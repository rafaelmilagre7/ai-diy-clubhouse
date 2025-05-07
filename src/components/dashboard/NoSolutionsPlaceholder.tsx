
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const NoSolutionsPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10 text-muted-foreground"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">Nenhuma solução disponível</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Parece que não há soluções disponíveis no momento.
        Tente selecionar outra categoria ou volte mais tarde.
      </p>
      <Link to="/solutions">
        <Button variant="default" className="bg-viverblue hover:bg-viverblue/90">
          Explorar todas as soluções
        </Button>
      </Link>
    </div>
  );
};
