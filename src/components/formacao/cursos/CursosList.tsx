
import { LearningCourse } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Book, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Eye, 
  Lock,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { CourseAccessControl } from "@/components/admin/courses/CourseAccessControl";

interface CursosListProps {
  cursos: LearningCourse[];
  loading: boolean;
  onEdit: (curso: LearningCourse) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export function CursosList({ cursos, loading, onEdit, onDelete, isAdmin }: CursosListProps) {
  const [selectedCourse, setSelectedCourse] = useState<LearningCourse | null>(null);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  
  const handleManageAccess = (curso: LearningCourse) => {
    setSelectedCourse(curso);
    setAccessDialogOpen(true);
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-muted w-full"></div>
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-4/5"></div>
            </CardContent>
            <CardFooter>
              <div className="h-8 bg-muted rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!cursos.length) {
    return (
      <Card className="w-full py-8">
        <div className="flex flex-col items-center justify-center text-center p-4">
          <Book className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum curso encontrado</h3>
          <p className="text-muted-foreground mt-2">
            Crie seu primeiro curso clicando no botão "Novo Curso".
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.map((curso) => (
          <Card key={curso.id} className="overflow-hidden flex flex-col">
            {curso.cover_image_url ? (
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={curso.cover_image_url} 
                  alt={curso.title}
                  className="h-full w-full object-cover" 
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-muted flex items-center justify-center">
                <Book className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <CardHeader className="relative">
              <div className="absolute right-4 top-4">
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(curso)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar Curso
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageAccess(curso)}>
                        <Lock className="h-4 w-4 mr-2" />
                        Gerenciar Acesso
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(curso.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              <CardTitle className="line-clamp-2">{curso.title}</CardTitle>
              <CardDescription className="line-clamp-2">{curso.description || "Sem descrição"}</CardDescription>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={curso.published ? "default" : "outline"}>
                  {curso.published ? "Publicado" : "Rascunho"}
                </Badge>
                
                {/* Indicador de acesso */}
                <Badge variant="outline" className="flex items-center gap-1">
                  {curso.is_restricted ? (
                    <>
                      <Lock className="h-3 w-3" />
                      Acesso Restrito
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" />
                      Acesso Livre
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            
            <CardFooter className="flex gap-2 mt-auto">
              <Button asChild variant="outline" className="flex-1">
                <Link to={`/formacao/cursos/${curso.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Link>
              </Button>
              
              <Button onClick={() => onEdit(curso)} className="flex-1">
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedCourse && (
        <CourseAccessControl
          open={accessDialogOpen}
          onOpenChange={setAccessDialogOpen}
          course={selectedCourse}
        />
      )}
    </>
  );
}
