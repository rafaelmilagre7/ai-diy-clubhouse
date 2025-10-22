
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import SuggestionContent from '@/components/suggestions/SuggestionContent';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { DeleteSuggestionDialog } from '@/components/suggestions/details/DeleteSuggestionDialog';
import { SuggestionDetailsHeader } from '@/components/suggestions/details/SuggestionDetailsHeader';
import SuggestionLoadingState from '@/components/suggestions/states/SuggestionLoadingState';
import SuggestionErrorState from '@/components/suggestions/states/SuggestionErrorState';
import { UserVote } from '@/types/suggestionTypes';

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <SuggestionDetailsHeader
          isAdmin={isAdmin}
          adminActionLoading={adminActionLoading}
          suggestionStatus={suggestion.status}
          onUpdateStatus={handleUpdateStatus}
          onOpenDeleteDialog={() => {
            console.log('🗑️ [SUGGESTION-DETAILS] Tentando abrir dialog de delete:', {
              isAdmin,
              adminActionLoading,
              suggestionId: suggestion.id
            });
            setDeleteDialogOpen(true);
          }}
        />

        <SuggestionContent
          suggestion={suggestion}
          onVote={handleVote}
          isOwner={isOwner}
          userVote={userVote as UserVote | null}
          voteLoading={voteLoading}
        />

        {/* Dialog de exclusão apenas para admins */}
        {isAdmin && (
          <DeleteSuggestionDialog
            isOpen={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirmDelete={handleRemoveSuggestion}
          />
        )}
      </div>
    </div>
  );
};

export default SuggestionDetailsPage;
