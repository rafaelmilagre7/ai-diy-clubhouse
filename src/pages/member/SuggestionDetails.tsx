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
import { UserVote, Suggestion } from '@/types/suggestionTypes';

// Função helper para garantir que category seja sempre um objeto
const normalizeSuggestionCategory = (suggestion: Suggestion | null) => {
  if (!suggestion) return null;
  
  const normalizedSuggestion = { ...suggestion };
  
  if (typeof normalizedSuggestion.category === 'string') {
    normalizedSuggestion.category = { name: normalizedSuggestion.category };
  } else if (!normalizedSuggestion.category && normalizedSuggestion.category_id) {
    normalizedSuggestion.category = { name: '' };
  }
  
  return normalizedSuggestion;
};

const SuggestionDetailsPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isAdminView = location.pathname.includes('/admin/');

  const {
    suggestion: rawSuggestion,
    isLoading,
    error,
    userVote,
    voteLoading,
    handleVote,
    refetch
  } = useSuggestionDetails();

  // Normalize suggestion data before using
  const suggestion = normalizeSuggestionCategory(rawSuggestion);

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
          toast.success('Sugestão removida com sucesso');
          setTimeout(() => {
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

  const isOwner = user && user.id === suggestion.user_id;

  return (
    <div className="container py-6 space-y-6">
      <SuggestionDetailsHeader
        isAdmin={isAdmin}
        adminActionLoading={adminActionLoading}
        suggestionStatus={suggestion.status}
        onUpdateStatus={handleUpdateStatus}
        onOpenDeleteDialog={() => setDeleteDialogOpen(true)}
      />

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
        userVote={userVote}
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
