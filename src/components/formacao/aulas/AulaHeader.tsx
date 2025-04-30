
import { LearningLesson } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, PencilLine, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface AulaHeaderProps {
  aula: LearningLesson;
  onEditar: () => void;
  isAdmin: boolean;
  moduloId: string;
}

export const AulaHeader = ({ aula, onEditar, isAdmin, moduloId }: AulaHeaderProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/formacao/modulos/${moduloId}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para o módulo
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{aula.title}</h1>
            <Badge variant={aula.published ? "default" : "outline"}>
              {aula.published ? "Publicada" : "Rascunho"}
            </Badge>
            {aula.estimated_time_minutes > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{aula.estimated_time_minutes} minutos</span>
              </div>
            )}
          </div>
          {aula.description && (
            <p className="text-muted-foreground mt-1 max-w-3xl">
              {aula.description}
            </p>
          )}
        </div>
        
        {isAdmin && (
          <Button onClick={onEditar}>
            <PencilLine className="h-4 w-4 mr-2" />
            Editar Aula
          </Button>
        )}
      </div>
    </div>
  );
};
