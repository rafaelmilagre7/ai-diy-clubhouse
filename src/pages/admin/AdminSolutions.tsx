
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Edit, BarChart2, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminSolutions = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [solutionToDelete, setSolutionToDelete] = useState<string | null>(null);

  // Buscar soluções ao carregar a página
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        console.log("Fetching solutions...");
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar soluções:', error);
          throw error;
        }

        console.log("Solutions fetched:", data ? data.length : 0);
        setSolutions(data || []);
      } catch (error: any) {
        console.error('Erro ao buscar soluções:', error.message);
        toast({
          title: 'Erro ao carregar soluções',
          description: 'Não foi possível carregar a lista de soluções.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [toast]);

  // Função para confirmar exclusão
  const handleDeleteConfirm = async () => {
    if (!solutionToDelete) return;

    try {
      const { error } = await supabase
        .from('solutions')
        .delete()
        .eq('id', solutionToDelete);

      if (error) {
        throw error;
      }

      // Remover a solução da lista local
      setSolutions(solutions.filter(solution => solution.id !== solutionToDelete));
      
      toast({
        title: 'Solução excluída',
        description: 'A solução foi excluída com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao excluir solução:', error.message);
      toast({
        title: 'Erro ao excluir solução',
        description: 'Não foi possível excluir a solução.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSolutionToDelete(null);
    }
  };

  // Funções para obter cor baseada na dificuldade
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para traduzir a dificuldade
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'advanced': return 'Avançado';
      default: return difficulty;
    }
  };

  // Função para traduzir a categoria
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'revenue': return 'Aumento de Receita';
      case 'operational': return 'Otimização Operacional';
      case 'strategy': return 'Gestão Estratégica';
      default: return category;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Soluções</h1>
          <p className="text-muted-foreground">
            Gerencie todas as soluções disponíveis na plataforma.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/solutions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Solução
          </Link>
        </Button>
      </div>
      
      <div className="border rounded-lg">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Carregando soluções...</p>
          </div>
        ) : solutions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Nenhuma solução encontrada.</p>
            <p className="text-muted-foreground mt-2">Crie uma nova solução para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solutions.map((solution) => (
                  <TableRow key={solution.id}>
                    <TableCell className="font-medium">{solution.title}</TableCell>
                    <TableCell>{getCategoryText(solution.category)}</TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(solution.difficulty)}>
                        {getDifficultyText(solution.difficulty)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {solution.published ? (
                        <Badge className="bg-green-100 text-green-800">Publicada</Badge>
                      ) : (
                        <Badge variant="outline">Rascunho</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(solution.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log("Navigating to solution view:", solution.id);
                            navigate(`/solution/${solution.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log("Navigating to solution edit:", solution.id);
                            navigate(`/admin/solution/${solution.id}`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log("Navigating to solution metrics:", solution.id);
                            navigate(`/admin/metrics/${solution.id}`);
                          }}
                        >
                          <BarChart2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSolutionToDelete(solution.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto irá excluir permanentemente a solução
              e todos os dados associados a ela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSolutions;
