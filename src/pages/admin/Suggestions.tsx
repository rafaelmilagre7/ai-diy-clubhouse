
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { getStatusLabel, getStatusColor } from '@/utils/suggestionUtils';
import { MoreVertical, Trash2, Play, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LoadingScreen from '@/components/common/LoadingScreen';

const AdminSuggestionsPage = () => {
  console.log('Renderizando AdminSuggestionsPage');
  const { suggestions, refetch, isLoading: suggestionsLoading, error } = useSuggestions();
  const { removeSuggestion, updateSuggestionStatus, loading } = useAdminSuggestions();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const navigate = useNavigate();

  // Log para debug
  useEffect(() => {
    console.log('AdminSuggestionsPage montado');
    console.log('Sugestões:', suggestions);
    console.log('Estado de carregamento:', suggestionsLoading);
    console.log('Erro:', error);
    
    return () => {
      console.log('AdminSuggestionsPage desmontado');
    };
  }, [suggestions, suggestionsLoading, error]);

  const handleRemoveSuggestion = async () => {
    if (selectedSuggestion) {
      console.log('Removendo sugestão:', selectedSuggestion);
      const success = await removeSuggestion(selectedSuggestion);
      if (success) {
        toast.success('Sugestão removida com sucesso');
        // Primeiro fechamos o modal
        setDeleteDialogOpen(false);
        
        // Depois atualizamos a lista com um pequeno delay
        setTimeout(() => {
          refetch();
          // Garantir que a interface está responsiva
          document.body.style.pointerEvents = 'auto';
        }, 100);
      } else {
        // Garantir que o modal é fechado mesmo em caso de erro
        setDeleteDialogOpen(false);
        // Garantir que a interface está responsiva
        document.body.style.pointerEvents = 'auto';
      }
    }
  };

  const handleUpdateStatus = async (status: string, suggestionId: string) => {
    try {
      setSelectedSuggestion(suggestionId);
      console.log('Atualizando status da sugestão:', suggestionId, status);
      const success = await updateSuggestionStatus(suggestionId, status);
      if (success) {
        toast.success(`Sugestão marcada como ${getStatusLabel(status)}`);
        refetch();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da sugestão');
    }
  };

  const viewSuggestionDetails = (suggestionId: string) => {
    console.log('Navegando para detalhes da sugestão (admin):', suggestionId);
    navigate(`/admin/suggestions/${suggestionId}`);
  };

  if (suggestionsLoading) {
    return <LoadingScreen message="Carregando sugestões..." />;
  }

  if (error) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Sugestões</h1>
        <div className="p-4 bg-red-50 border border-red-300 rounded-md text-red-700">
          <h3 className="text-lg font-medium">Erro ao carregar sugestões</h3>
          <p className="mt-2">{error.message || 'Ocorreu um erro inesperado ao carregar as sugestões'}</p>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Sugestões</h1>
      
      {suggestions.length === 0 ? (
        <div className="p-8 text-center border rounded-md">
          <h3 className="text-lg font-medium">Nenhuma sugestão encontrada</h3>
          <p className="text-muted-foreground mt-2">
            Não há sugestões registradas no sistema no momento.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Votos Líquidos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suggestions.map((suggestion) => {
              const netVotes = (suggestion.upvotes || 0) - (suggestion.downvotes || 0);
              return (
                <TableRow key={suggestion.id}>
                  <TableCell className="font-medium">{suggestion.title}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(suggestion.status)}>
                      {getStatusLabel(suggestion.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${netVotes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netVotes > 0 ? `+${netVotes}` : netVotes}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => viewSuggestionDetails(suggestion.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {/* Alterar Status */}
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus('under_review', suggestion.id)}
                          disabled={suggestion.status === 'under_review' || loading}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {suggestion.status === 'under_review' ? 'Já em Análise' : 'Marcar como Em Análise'}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus('in_development', suggestion.id)}
                          disabled={suggestion.status === 'in_development' || loading}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {suggestion.status === 'in_development' ? 'Já em Desenvolvimento' : 'Marcar como Em Desenvolvimento'}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus('completed', suggestion.id)}
                          disabled={suggestion.status === 'completed' || loading}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {suggestion.status === 'completed' ? 'Já Implementada' : 'Marcar como Implementada'}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus('declined', suggestion.id)}
                          disabled={suggestion.status === 'declined' || loading}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          {suggestion.status === 'declined' ? 'Já Recusada' : 'Marcar como Recusada'}
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedSuggestion(suggestion.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                          disabled={loading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover Sugestão
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          // Se for fechado manualmente pelo usuário, garantimos que a interação funcione
          if (!open) {
            document.body.style.pointerEvents = 'auto';
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Sugestão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta sugestão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              // Garantir que o foco é restaurado
              setTimeout(() => {
                document.body.style.pointerEvents = 'auto';
              }, 100);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveSuggestion} 
              className="bg-destructive text-destructive-foreground"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSuggestionsPage;
