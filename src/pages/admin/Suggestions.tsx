
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { 
  MoreVertical, 
  Trash2, 
  Play, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
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

  // Função para configuração de status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: 'Nova',
          icon: AlertCircle,
          className: 'bg-aurora-primary/10 text-aurora-primary border-aurora-primary/20',
          dotColor: 'bg-aurora-primary'
        };
      case 'under_review':
        return {
          label: 'Em Análise',
          icon: Clock,
          className: 'bg-status-warning/10 text-status-warning border-status-warning/20',
          dotColor: 'bg-status-warning'
        };
      case 'in_development':
        return {
          label: 'Em Desenvolvimento',
          icon: Clock,
          className: 'bg-status-warning/10 text-status-warning border-status-warning/20',
          dotColor: 'bg-status-warning'
        };
      case 'completed':
        return {
          label: 'Implementada',
          icon: CheckCircle,
          className: 'bg-operational/10 text-operational border-operational/20',
          dotColor: 'bg-operational'
        };
      case 'declined':
        return {
          label: 'Recusada',
          icon: XCircle,
          className: 'bg-status-error/10 text-status-error border-status-error/20',
          dotColor: 'bg-status-error'
        };
      default:
        return {
          label: getStatusLabel(status),
          icon: AlertCircle,
          className: getStatusColor(status),
          dotColor: 'bg-muted-foreground'
        };
    }
  };

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
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gerenciar Sugestões</h1>
        <p className="text-muted-foreground">
          Gerencie e acompanhe as sugestões da comunidade
        </p>
      </div>
      
      {suggestions.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma sugestão encontrada
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Não há sugestões registradas no sistema no momento. As sugestões aparecerão aqui quando forem criadas pela comunidade.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-foreground font-semibold">Título</TableHead>
                  <TableHead className="text-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-foreground font-semibold">Votos Líquidos</TableHead>
                  <TableHead className="text-right text-foreground font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion) => {
                  const netVotes = (suggestion.upvotes || 0) - (suggestion.downvotes || 0);
                  const statusConfig = getStatusConfig(suggestion.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <TableRow key={suggestion.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded-full ${statusConfig.dotColor.replace('bg-', 'bg-opacity-20 bg-')} flex-shrink-0`}>
                            <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
                          </div>
                          <span>{suggestion.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          netVotes > 0 ? 'text-green-600 dark:text-green-400' : 
                          netVotes < 0 ? 'text-red-600 dark:text-red-400' : 
                          'text-muted-foreground'
                        }`}>
                          {netVotes > 0 ? `+${netVotes}` : netVotes}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem 
                              onClick={() => viewSuggestionDetails(suggestion.id)}
                              className="text-foreground hover:bg-muted"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-border" />
                            
                            {/* Alterar Status */}
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus('under_review', suggestion.id)}
                              disabled={suggestion.status === 'under_review' || loading}
                              className="text-foreground hover:bg-muted"
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {suggestion.status === 'under_review' ? 'Já em Análise' : 'Marcar como Em Análise'}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus('in_development', suggestion.id)}
                              disabled={suggestion.status === 'in_development' || loading}
                              className="text-foreground hover:bg-muted"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              {suggestion.status === 'in_development' ? 'Já em Desenvolvimento' : 'Marcar como Em Desenvolvimento'}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus('completed', suggestion.id)}
                              disabled={suggestion.status === 'completed' || loading}
                              className="text-foreground hover:bg-muted"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {suggestion.status === 'completed' ? 'Já Implementada' : 'Marcar como Implementada'}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus('declined', suggestion.id)}
                              disabled={suggestion.status === 'declined' || loading}
                              className="text-foreground hover:bg-muted"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              {suggestion.status === 'declined' ? 'Já Recusada' : 'Marcar como Recusada'}
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-border" />
                            
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedSuggestion(suggestion.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive hover:bg-destructive/10 focus:text-destructive"
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
          </CardContent>
        </Card>
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
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remover Sugestão</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja remover esta sugestão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteDialogOpen(false);
                // Garantir que o foco é restaurado
                setTimeout(() => {
                  document.body.style.pointerEvents = 'auto';
                }, 100);
              }}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveSuggestion} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
