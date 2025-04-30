
import { useState } from "react";
import { LearningCourse } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, FileText, Loader2, Shield, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CursoDeleteDialog } from "./CursoDeleteDialog";
import { Link } from "react-router-dom";

interface CursosListProps {
  cursos: LearningCourse[];
  loading: boolean;
  onEdit: (curso: LearningCourse) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export const CursosList = ({ cursos, loading, onEdit, onDelete, isAdmin }: CursosListProps) => {
  const [cursoParaExcluir, setCursoParaExcluir] = useState<LearningCourse | null>(null);

  // Abrir diálogo de confirmação para excluir
  const handleOpenDelete = (curso: LearningCourse) => {
    setCursoParaExcluir(curso);
  };

  // Confirmar exclusão
  const handleConfirmDelete = () => {
    if (cursoParaExcluir) {
      onDelete(cursoParaExcluir.id);
      setCursoParaExcluir(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cursos.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-background">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum curso disponível</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          Você ainda não possui nenhum curso cadastrado.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <Card key={curso.id} className="overflow-hidden">
            {curso.cover_image_url ? (
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={curso.cover_image_url} 
                  alt={curso.title} 
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
                <CardTitle className="line-clamp-2">{curso.title}</CardTitle>
                <Badge variant={curso.published ? "default" : "outline"}>
                  {curso.published ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {curso.description || "Sem descrição"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Última atualização: {format(new Date(curso.updated_at), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
            </CardContent>

            <CardFooter className="gap-2 flex justify-between">
              <div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/formacao/cursos/${curso.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Link>
                </Button>
              </div>
              
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(curso)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenDelete(curso)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <CursoDeleteDialog 
        open={!!cursoParaExcluir} 
        onOpenChange={() => setCursoParaExcluir(null)}
        onConfirm={handleConfirmDelete}
        curso={cursoParaExcluir}
      />
    </>
  );
};
