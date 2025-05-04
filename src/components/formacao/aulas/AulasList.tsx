import { useState } from "react";
import { LearningLesson } from "@/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, FileText, Loader2, Eye } from "lucide-react";
import { AulaDeleteDialog } from "./AulaDeleteDialog";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AulasListProps {
  aulas: LearningLesson[];
  loading: boolean;
  onEdit: (aula: LearningLesson) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  onRefresh?: () => void;  // Nova prop adicionada
}

export const AulasList = ({ aulas, loading, onEdit, onDelete, isAdmin, onRefresh }: AulasListProps) => {
  const [aulaParaExcluir, setAulaParaExcluir] = useState<LearningLesson | null>(null);

  // Abrir diálogo de confirmação para excluir
  const handleOpenDelete = (aula: LearningLesson) => {
    setAulaParaExcluir(aula);
  };

  // Confirmar exclusão
  const handleConfirmDelete = () => {
    if (aulaParaExcluir) {
      onDelete(aulaParaExcluir.id);
      setAulaParaExcluir(null);
      // Chamar onRefresh se estiver definido
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (aulas.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-background">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhuma aula disponível</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          Este módulo ainda não possui aulas cadastradas.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {aulas.map((aula) => (
          <Card key={aula.id} className="overflow-hidden">
            {aula.cover_image_url ? (
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={aula.cover_image_url} 
                  alt={aula.title} 
                  className="h-full w-full object-cover transition-all hover:scale-105" 
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-muted flex items-center justify-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-2">{aula.title}</CardTitle>
                <Badge variant={aula.published ? "default" : "outline"}>
                  {aula.published ? "Publicada" : "Rascunho"}
                </Badge>
              </div>
              {aula.description && (
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {aula.description}
                </p>
              )}
            </CardHeader>

            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <p>{format(new Date(aula.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                {aula.estimated_time_minutes > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {aula.estimated_time_minutes} min
                  </Badge>
                )}
              </div>
            </CardContent>

            <CardFooter className="gap-2 flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/formacao/aulas/${aula.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar
                </Link>
              </Button>
              
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(aula)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenDelete(aula)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <AulaDeleteDialog 
        open={!!aulaParaExcluir} 
        onOpenChange={() => setAulaParaExcluir(null)}
        onConfirm={handleConfirmDelete}
        aula={aulaParaExcluir}
      />
    </>
  );
};
