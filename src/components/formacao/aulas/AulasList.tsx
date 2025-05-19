
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LearningLesson } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Loader2, MoreVertical, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AulaDeleteDialog } from "./AulaDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface AulasListProps {
  aulas: LearningLesson[];
  loading?: boolean;
  onEdit?: (aula: LearningLesson) => void;
  onDelete?: (aulaId: string) => void;
  isAdmin?: boolean;
  moduloId?: string;
  cursoId?: string;
  onSuccess?: () => void;
}

export const AulasList: React.FC<AulasListProps> = ({
  aulas,
  loading = false,
  onEdit,
  onDelete,
  isAdmin = false,
  moduloId,
  cursoId,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedAulaId, setSelectedAulaId] = React.useState<string | null>(null);

  const handleViewDetails = (aulaId: string) => {
    navigate(`/formacao/aulas/${aulaId}`);
  };

  const handleEdit = (aula: LearningLesson) => {
    if (onEdit) {
      onEdit(aula);
    } else {
      navigate(`/formacao/aulas/${aula.id}/editar`);
    }
  };

  const handleDeleteClick = (aulaId: string) => {
    setSelectedAulaId(aulaId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedAulaId && onDelete) {
      await onDelete(selectedAulaId);
    }
    setDeleteDialogOpen(false);
    setSelectedAulaId(null);
  };

  // Se estiver carregando, mostrar um estado de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Se não houver aulas, mostrar uma mensagem
  if (!aulas || aulas.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            Nenhuma aula cadastrada neste módulo
          </p>
          {isAdmin && (
            <Button variant="outline" onClick={() => navigate(`/formacao/aulas/nova?modulo=${moduloId || ''}`)}>
              Criar primeira aula
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Renderizar lista de aulas
  return (
    <div className="space-y-4">
      {aulas.map((aula) => (
        <Card key={aula.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row w-full">
            <div className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      {aula.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={aula.is_published ? "default" : "secondary"}>
                        {aula.is_published ? "Publicada" : "Rascunho"}
                      </Badge>
                      {aula.duration_minutes && (
                        <span className="text-sm text-muted-foreground">
                          {aula.duration_minutes} min
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(aula.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(aula)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(aula.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {aula.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {aula.description}
                  </p>
                )}

                <div className="flex mt-4 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(aula.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalhes
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(aula)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      ))}

      <AulaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
