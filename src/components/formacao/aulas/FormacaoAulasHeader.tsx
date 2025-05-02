
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface FormacaoAulasHeaderProps {
  titulo?: string;
  breadcrumb?: boolean;
  onNovaAula?: () => void;
}

export const FormacaoAulasHeader = ({ 
  titulo = "Gerenciamento de Aulas",
  breadcrumb = false,
  onNovaAula
}: FormacaoAulasHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        {breadcrumb ? (
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <a href="/formacao/aulas" className="hover:underline">
              Aulas
            </a>
            <span className="mx-2">/</span>
            <span>{titulo}</span>
          </div>
        ) : null}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{titulo}</h1>
      </div>
      
      {onNovaAula && (
        <Button onClick={onNovaAula} className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      )}
    </div>
  );
};
