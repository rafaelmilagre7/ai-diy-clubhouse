
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface FormacaoAulasHeaderProps {
  onNovaAula?: () => void;
  moduloId?: string;
  titulo?: string;
  breadcrumb?: boolean;
}

export const FormacaoAulasHeader = ({ 
  onNovaAula, 
  moduloId, 
  titulo = "Aulas",
  breadcrumb = false
}: FormacaoAulasHeaderProps) => {
  return (
    <div className="flex flex-col space-y-4">
      {breadcrumb && moduloId && (
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/formacao/modulos/${moduloId}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para o Módulo
            </Link>
          </Button>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{titulo}</h2>
          <p className="text-muted-foreground">
            Gerencie as aulas disponíveis na plataforma
          </p>
        </div>
        {onNovaAula && (
          <Button onClick={onNovaAula}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Aula
          </Button>
        )}
      </div>
    </div>
  );
};
