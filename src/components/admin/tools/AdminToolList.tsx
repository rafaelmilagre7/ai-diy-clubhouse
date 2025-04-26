import { useState } from 'react';
import { Tool } from '@/types/toolTypes';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, ExternalLink, Plus } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAdminTools } from '@/hooks/useAdminTools';
import { AdminToolsFilters } from './AdminToolsFilters';

interface AdminToolListProps {
  tools: Tool[];
  refreshTrigger?: number;
}

export const AdminToolList = ({ tools: initialTools, refreshTrigger }: AdminToolListProps) => {
  const { 
    tools, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery 
  } = useAdminTools(initialTools);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Ferramenta excluída",
        description: "A ferramenta foi excluída com sucesso.",
      });
      
      // Recarregar a página para atualizar a lista
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao excluir ferramenta:", error);
      toast({
        title: "Erro ao excluir ferramenta",
        description: error.message || "Ocorreu um erro ao excluir a ferramenta.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (tools.length === 0) {
    return (
      <div className="text-center py-12 space-y-6">
        <p className="text-muted-foreground">Nenhuma ferramenta encontrada.</p>
        <Link to="/admin/tools/new">
          <Button className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar ferramenta
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminToolsFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.id} className="flex flex-col h-full border overflow-hidden">
            <CardHeader className="pb-3 pt-6 px-6 flex-row items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
                {tool.logo_url ? (
                  <img 
                    src={tool.logo_url} 
                    alt={tool.name} 
                    className="h-full w-full object-contain" 
                  />
                ) : (
                  <div className="text-xl font-bold text-[#0ABAB5]">
                    {tool.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{tool.name}</h3>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5]">
                    {tool.category}
                  </Badge>
                  {!tool.status && (
                    <Badge variant="outline" className="bg-gray-100 text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 flex-1">
              <p className="text-muted-foreground line-clamp-3 text-sm">
                {tool.description}
              </p>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-2 flex justify-between">
              <div className="flex gap-2">
                <Link to={`/admin/tools/${tool.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a ferramenta "{tool.name}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(tool.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <a href={tool.official_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="text-[#0ABAB5]">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
