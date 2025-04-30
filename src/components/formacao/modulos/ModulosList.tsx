
import { LearningModule } from "@/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText, Loader2, BookOpen } from "lucide-react";
import { useState } from "react";
import { ModuloDeleteDialog } from "./ModuloDeleteDialog";
import { Link } from "react-router-dom";

interface ModulosListProps {
  modulos: LearningModule[];
  loading: boolean;
  onEdit: (modulo: LearningModule) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export const ModulosList = ({ modulos, loading, onEdit, onDelete, isAdmin }: ModulosListProps) => {
  const [moduloParaExcluir, setModuloParaExcluir] = useState<LearningModule | null>(null);

  // Abrir diálogo de confirmação para excluir
  const handleOpenDelete = (modulo: LearningModule) => {
    setModuloParaExcluir(modulo);
  };

  // Confirmar exclusão
  const handleConfirmDelete = () => {
    if (moduloParaExcluir) {
      onDelete(moduloParaExcluir.id);
      setModuloParaExcluir(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (modulos.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-background">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum módulo disponível</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          Este curso ainda não possui módulos cadastrados.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {modulos.map((modulo, index) => (
          <Card key={modulo.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Módulo {index + 1}</div>
                  <CardTitle>{modulo.title}</CardTitle>
                </div>
                {modulo.published ? (
                  <div className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Publicado
                  </div>
                ) : (
                  <div className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    Rascunho
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-muted-foreground">
                {modulo.description || "Sem descrição disponível"}
              </p>
            </CardContent>
            
            <CardFooter className="gap-2 justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/formacao/modulos/${modulo.id}`}>
                  <BookOpen className="h-4 w-4 mr-1" />
                  Ver Aulas
                </Link>
              </Button>
              
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(modulo)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenDelete(modulo)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <ModuloDeleteDialog 
        open={!!moduloParaExcluir} 
        onOpenChange={() => setModuloParaExcluir(null)}
        onConfirm={handleConfirmDelete}
        modulo={moduloParaExcluir}
      />
    </>
  );
};
