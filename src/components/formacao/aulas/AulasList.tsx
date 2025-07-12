
import { useState } from "react";
import { LearningLessonWithRelations } from "@/lib/supabase/types/extended";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, FileText, Loader2, Eye } from "lucide-react";
import { AulaDeleteDialog } from "./AulaDeleteDialog";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PublishLessonButton } from "./PublishLessonButton";

interface AulasListProps {
  aulas: LearningLessonWithRelations[];
  loading: boolean;
  onEdit: (aula: LearningLessonWithRelations) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  onRefresh?: () => void;
}

export const AulasList = ({ aulas, loading, onEdit, onDelete, isAdmin, onRefresh }: AulasListProps) => {
  const [aulaParaExcluir, setAulaParaExcluir] = useState<LearningLessonWithRelations | null>(null);
  const [publishingStates, setPublishingStates] = useState<Record<string, boolean>>({});

  // Log de debug para verificar se os dados estão chegando
  console.log("AulasList: Recebendo props:", { 
    aulasCount: aulas?.length || 0, 
    loading, 
    isAdmin, 
    aulas: aulas?.slice(0, 2) // Primeiras 2 aulas para debug
  });

  // Abrir diálogo de confirmação para excluir
  const handleOpenDelete = (aula: LearningLessonWithRelations) => {
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

  // Atualizar estado de publicação local
  const handlePublishChange = (aulaId: string, published: boolean) => {
    setPublishingStates(prevState => ({
      ...prevState,
      [aulaId]: published
    }));
    
    // Atualizar a lista se onRefresh estiver disponível
    if (onRefresh) {
      onRefresh();
    }
  };

  // Determinar se uma aula está publicada (considerando o estado local se disponível)
  const isPublished = (aula: LearningLessonWithRelations) => {
    return aula.id in publishingStates 
      ? publishingStates[aula.id] 
      : !!aula.published;
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
                <Badge variant={isPublished(aula) ? "default" : "outline"}>
                  {isPublished(aula) ? "Publicada" : "Rascunho"}
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
                {aula.estimated_time_minutes && aula.estimated_time_minutes > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {aula.estimated_time_minutes} min
                  </Badge>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <div className="flex justify-between w-full">
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
              </div>
              
              {isAdmin && (
                <div className="w-full">
                  <PublishLessonButton 
                    lessonId={aula.id}
                    isPublished={isPublished(aula)}
                    onPublishChange={(published) => handlePublishChange(aula.id, published)}
                    showPreview={false}
                  />
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
