
import { Link } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit } from "lucide-react";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

interface AulaHeaderProps {
  aula: LearningLesson;
  onEditar?: () => void;
  isAdmin: boolean;
  moduloId?: string;
}

export const AulaHeader = ({ 
  aula, 
  onEditar,
  isAdmin,
  moduloId 
}: AulaHeaderProps) => {
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
          {moduloId && (
            <>
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
            <Badge variant={aula.published ? "default" : "outline"}>
              {aula.published ? "Publicado" : "Rascunho"}
            </Badge>
          </div>
          {aula.description && (
            <p className="text-muted-foreground mt-1 max-w-3xl">
              {aula.description}
            </p>
          )}
        </div>
        
        {isAdmin && onEditar && (
          <Button onClick={onEditar} className="shrink-0">
            <Edit className="h-4 w-4 mr-2" />
            Editar Aula
          </Button>
        )}
      </div>
    </div>
  );
};
