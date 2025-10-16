
import { Link } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Eye } from "lucide-react";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AulaHeaderProps {
  aula: LearningLesson;
  onEditar?: () => void;
  isAdmin: boolean;
  moduloId?: string;
  courseId?: string;
}

export const AulaHeader = ({ 
  aula, 
  onEditar,
  isAdmin,
  moduloId,
  courseId 
}: AulaHeaderProps) => {
  const isPublished = aula.published;

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/formacao/cursos">Cursos</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {moduloId && courseId && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/formacao/cursos/${courseId}`}>Detalhes do Curso</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/formacao/modulos/${moduloId}`}>Módulo</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{aula.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{aula.title}</h1>
            <Badge 
              variant={isPublished ? "default" : "outline"}
              className={cn(
                isPublished ? "bg-green-500 hover:bg-green-600" : "text-amber-500 border-amber-500"
              )}
            >
              {isPublished ? "Publicado" : "Rascunho"}
            </Badge>
          </div>
          {aula.description && (
            <p className="text-muted-foreground mt-2 max-w-3xl">
              {aula.description}
            </p>
          )}
          {courseId && aula.id && (
            <div className="mt-2">
              <Link 
                to={`/learning/course/${courseId}/lesson/${aula.id}`}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Eye className="h-4 w-4 mr-1" />
                Visualizar como aluno
              </Link>
            </div>
          )}
        </div>
        
        {isAdmin && onEditar && (
          <Button onClick={onEditar} className="shrink-0 bg-aurora-primary hover:bg-aurora-primary/90">
            <Edit className="h-4 w-4 mr-2" />
            Editar Aula
          </Button>
        )}
      </div>
    </div>
  );
};
