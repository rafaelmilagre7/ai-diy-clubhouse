
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import SuggestionContent from '@/components/suggestions/SuggestionContent';
import SuggestionHeader from '@/components/suggestions/SuggestionHeader';
import SuggestionLoadingState from '@/components/suggestions/states/SuggestionLoadingState';
import SuggestionErrorState from '@/components/suggestions/states/SuggestionErrorState';
import { useComments } from '@/hooks/suggestions/useComments';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, Play } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserVote } from '@/types/suggestionTypes';

const SuggestionDetailsPage = () => {
  const { user, isAdmin } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isAdminView = location.pathname.includes('/admin/');
  
  const {
    suggestion,
    isLoading,
    error,
    userVote,
    voteLoading,
    handleVote,
    refetch
  } = useSuggestionDetails();

  const { removeSuggestion, updateSuggestionStatus, loading: adminActionLoading } = useAdminSuggestions();

  // Adicionando logs para debug
  useEffect(() => {
    console.log('SuggestionDetailsPage - ID da sugestão:', id);
    console.log('SuggestionDetailsPage - Dados da sugestão:', suggestion);
    console.log('SuggestionDetailsPage - Estado de carregamento:', isLoading);
    console.log('SuggestionDetailsPage - Erro:', error);
    console.log('SuggestionDetailsPage - O usuário é admin?', isAdmin);
    console.log('SuggestionDetailsPage - Está na visualização de admin?', isAdminView);
    console.log('SuggestionDetailsPage - Localização atual:', location.pathname);
  }, [id, suggestion, isLoading, error, isAdmin, isAdminView, location.pathname]);

  const { 
    comment, 
    setComment, 
    comments, 
    commentsLoading, 
    isSubmitting, 
    handleSubmitComment,
    refetchComments
  } = useComments({ suggestionId: suggestion?.id || '' });

  const handleRemoveSuggestion = async () => {
    if (suggestion?.id) {
      try {
        const success = await removeSuggestion(suggestion.id);
        if (success) {
          // Primeiro fechamos o modal de alerta
          setDeleteDialogOpen(false);
          
          toast.success('Sugestão removida com sucesso');
          
          // Pequeno delay antes de navegar para garantir que o modal foi fechado
          setTimeout(() => {
            // Redireciona para a lista de sugestões apropriada (admin ou membro)
            navigate(isAdminView ? '/admin/suggestions' : '/suggestions', { replace: true });
          }, 100);
        }
      } catch (error) {
        console.error('Erro ao remover sugestão:', error);
        toast.error('Erro ao remover sugestão');
        setDeleteDialogOpen(false);
      }
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (suggestion?.id) {
      try {
        const success = await updateSuggestionStatus(suggestion.id, status);
        if (success) {
          toast.success(`Sugestão marcada como ${status === 'in_development' ? 'Em Desenvolvimento' : status}`);
          refetch();
        }
      } catch (error) {
        console.error('Erro ao atualizar status da sugestão:', error);
        toast.error('Erro ao atualizar status da sugestão');
      }
    }
  };

  if (isLoading) {
    return <SuggestionLoadingState />;
  }

  if (error || !suggestion) {
    const errorMessage = error ? `Erro: ${error.message}` : 'Sugestão não encontrada';
    return <SuggestionErrorState errorMessage={errorMessage} onRetry={() => window.location.reload()} />;
  }

  // Verificar se o usuário é o criador da sugestão
  const isOwner = user && user.id === suggestion.user_id;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <SuggestionHeader />
        
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4 mr-2" />
                Ações de Admin
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => handleUpdateStatus('in_development')}
                disabled={adminActionLoading || suggestion.status === 'in_development'}
              >
                <Play className="mr-2 h-4 w-4" />
                {suggestion.status === 'in_development' 
                  ? 'Já em Desenvolvimento' 
                  : 'Marcar como Em Desenvolvimento'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
                disabled={adminActionLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover Sugestão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <SuggestionContent
        suggestion={suggestion}
        comment={comment}
        comments={comments}
        isSubmitting={isSubmitting}
        commentsLoading={commentsLoading}
        onCommentChange={setComment}
        onSubmitComment={handleSubmitComment}
        onVote={handleVote}
        isOwner={isOwner}
        userVote={userVote as UserVote}
        voteLoading={voteLoading}
      />

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
            <AlertDialogAction onClick={handleRemoveSuggestion} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuggestionDetailsPage;
