
import { LearningCourse } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface CursoHeaderProps {
  curso: LearningCourse;
  onNovoModulo: () => void;
  onEditarCurso?: () => void;
  isAdmin: boolean;
}

export const CursoHeader = ({ curso, onNovoModulo, onEditarCurso, isAdmin }: CursoHeaderProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/formacao/cursos">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{curso.title}</h1>
            <Badge variant={curso.published ? "default" : "outline"}>
              {curso.published ? "Publicado" : "Rascunho"}
            </Badge>
          </div>
          {curso.description && (
            <p className="text-muted-foreground mt-1 max-w-3xl">
              {curso.description}
            </p>
          )}
        </div>
        
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            {onEditarCurso && (
              <Button variant="outline" onClick={onEditarCurso}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Curso
              </Button>
            )}
            <Button onClick={onNovoModulo}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Módulo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
