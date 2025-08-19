
import { Link } from "react-router-dom";
import { LearningModule } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Loader2, LucideIcon, BookOpen, Plus } from "lucide-react";
import { NovaAulaButton } from "@/components/formacao/aulas/NovaAulaButton";

interface ModulosListProps {
  modulos: LearningModule[];
  loading: boolean;
  onEdit: (modulo: LearningModule) => void;
  onDelete: (moduloId: string) => void;
  isAdmin: boolean;
}

export const ModulosList: React.FC<ModulosListProps> = ({ 
  modulos, 
  loading,
  onEdit,
  onDelete,
  isAdmin
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter className="flex justify-between border-t p-3 bg-gray-50 dark:bg-gray-800">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (modulos.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Nenhum módulo encontrado</h3>
        <p className="text-muted-foreground mb-4">Ainda não existem módulos cadastrados para este curso.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modulos.map((modulo) => (
        <Card key={modulo.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle>{modulo.title}</CardTitle>
            <CardDescription>
              {modulo.description || "Este módulo não possui descrição."}
            </CardDescription>
          </CardHeader>
          
          <CardFooter className="flex flex-col gap-3 border-t p-3 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center w-full">
              <Link to={`/formacao/modulos/${modulo.id}`}>
                <Button variant="secondary" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ver aulas
                </Button>
              </Link>

              {isAdmin && (
                <NovaAulaButton 
                  moduleId={modulo.id} 
                  buttonText="+ Aula"
                  variant="outline"
                  size="sm"
                />
              )}
            </div>

            {isAdmin && (
              <div className="flex justify-center gap-2 w-full">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(modulo)}
                  className="flex-1"
                >
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Editar
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDelete(modulo.id)}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Excluir
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
