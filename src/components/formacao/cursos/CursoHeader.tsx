
import { LearningCourse } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit, PlusCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CursoHeaderProps {
  curso: LearningCourse;
  onNovoModulo: () => void;
  onEditarCurso?: () => void;
  isAdmin: boolean;
}

export const CursoHeader = ({ curso, onNovoModulo, onEditarCurso, isAdmin }: CursoHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/formacao/cursos">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{curso.title}</h1>
            <Badge 
              variant={curso.published ? "default" : "outline"}
              className={cn(
                curso.published ? "bg-green-500 hover:bg-green-600" : "text-amber-500 border-amber-500"
              )}
            >
              {curso.published ? "Publicado" : "Rascunho"}
            </Badge>
          </div>
          {curso.description && (
            <p className="text-muted-foreground mt-2 max-w-3xl">
              {curso.description}
            </p>
          )}
          
          <div className="mt-2">
            <Link 
              to={`/learning/course/${curso.id}`} 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Visualizar como aluno
            </Link>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            {onEditarCurso && (
              <Button variant="outline" onClick={onEditarCurso} className="whitespace-nowrap">
                <Edit className="h-4 w-4 mr-2" />
                Editar Curso
              </Button>
            )}
            <Button onClick={onNovoModulo} className="whitespace-nowrap bg-viverblue hover:bg-viverblue/90">
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Módulo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
