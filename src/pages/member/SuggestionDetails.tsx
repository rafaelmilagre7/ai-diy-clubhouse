
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import SuggestionContent from '@/components/suggestions/SuggestionContent';
import { useComments } from '@/hooks/suggestions/useComments';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { DeleteSuggestionDialog } from '@/components/suggestions/details/DeleteSuggestionDialog';
import { SuggestionDetailsHeader } from '@/components/suggestions/details/SuggestionDetailsHeader';
import SuggestionLoadingState from '@/components/suggestions/states/SuggestionLoadingState';
import SuggestionErrorState from '@/components/suggestions/states/SuggestionErrorState';
import { UserVote } from '@/types/suggestionTypes';
import { StatusBadge } from '@/components/suggestions/ui/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, TrendingUp } from 'lucide-react';
import { formatRelativeDate, calculatePopularity } from '@/utils/suggestionUtils';

const SuggestionDetailsPage = () => {
  const { user, isAdmin } = useAuth();
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

  const { 
    comment, 
    setComment, 
    comments, 
    commentsLoading, 
    isSubmitting, 
    handleSubmitComment,
  } = useComments({ suggestionId: suggestion?.id || '' });

  const handleRemoveSuggestion = async () => {
    if (suggestion?.id) {
      try {
        const success = await removeSuggestion(suggestion.id);
        if (success) {
          setDeleteDialogOpen(false);
          toast.success('Sugestão removida com sucesso! 🗑️', {
            description: 'A sugestão foi permanentemente removida do sistema.',
          });
          setTimeout(() => {
            navigate(isAdminView ? '/admin/suggestions' : '/suggestions', { replace: true });
          }, 1000);
        }
      } catch (error) {
        console.error('Erro ao remover sugestão:', error);
        toast.error('Erro ao remover sugestão', {
          description: 'Tente novamente em alguns instantes.',
        });
        setDeleteDialogOpen(false);
      }
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (suggestion?.id) {
      try {
        const success = await updateSuggestionStatus(suggestion.id, status);
        if (success) {
          // Mensagens de sucesso mais informativas
          const statusMessages = {
            'in_development': {
              title: 'Sugestão em Desenvolvimento! 🚀',
              description: 'A equipe iniciou o trabalho nesta funcionalidade.'
            },
            'completed': {
              title: 'Sugestão Implementada! 🎉',
              description: 'Esta funcionalidade já está disponível na plataforma!'
            },
            'under_review': {
              title: 'Sugestão em Análise 🔍',
              description: 'Nossa equipe está avaliando a viabilidade desta sugestão.'
            },
            'declined': {
              title: 'Sugestão Recusada ❌',
              description: 'Infelizmente, esta sugestão não será implementada no momento.'
            }
          };
          
          const message = statusMessages[status as keyof typeof statusMessages];
          if (message) {
            toast.success(message.title, {
              description: message.description,
            });
          }
          
          refetch();
        }
      } catch (error) {
        console.error('Erro ao atualizar status da sugestão:', error);
        toast.error('Erro ao atualizar status', {
          description: 'Não foi possível atualizar o status da sugestão.',
        });
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

  const isOwner = user && user.id === suggestion.user_id;
  const popularity = calculatePopularity(suggestion.upvotes, suggestion.downvotes);

  return (
    <div className="container py-6 space-y-6">
      <SuggestionDetailsHeader
        isAdmin={isAdmin}
        adminActionLoading={adminActionLoading}
        suggestionStatus={suggestion.status}
        suggestionTitle={suggestion.title}
        onUpdateStatus={handleUpdateStatus}
        onOpenDeleteDialog={() => setDeleteDialogOpen(true)}
      />

      {/* Status e Estatísticas da Sugestão */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <StatusBadge status={suggestion.status} size="lg" />
              {suggestion.is_pinned && (
                <div className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                  📌 Sugestão Fixada
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatRelativeDate(suggestion.created_at)}</span>
              </div>
              
              {suggestion.user_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>por {suggestion.user_name}</span>
                </div>
              )}
              
              {popularity > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{popularity}% aprovação</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
        userVote={userVote as UserVote | null}
        voteLoading={voteLoading}
      />

      <DeleteSuggestionDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleRemoveSuggestion}
      />
    </div>
  );
};

export default SuggestionDetailsPage;
