
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import SuggestionContent from '@/components/suggestions/SuggestionContent';
import SuggestionHeader from '@/components/suggestions/SuggestionHeader';
import SuggestionLoadingState from '@/components/suggestions/states/SuggestionLoadingState';
import SuggestionErrorState from '@/components/suggestions/states/SuggestionErrorState';
import { useComments } from '@/hooks/suggestions/useComments';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useParams } from 'react-router-dom';

const SuggestionDetailsPage = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const {
    suggestion,
    isLoading,
    error,
    userVote,
    voteLoading,
    handleVote
  } = useSuggestionDetails();

  // Adicionando logs para debug
  useEffect(() => {
    console.log('SuggestionDetailsPage - ID da sugestão:', id);
    console.log('SuggestionDetailsPage - Dados da sugestão:', suggestion);
    console.log('SuggestionDetailsPage - Estado de carregamento:', isLoading);
    console.log('SuggestionDetailsPage - Erro:', error);
  }, [id, suggestion, isLoading, error]);

  const { 
    comment, 
    setComment, 
    comments, 
    commentsLoading, 
    isSubmitting, 
    handleSubmitComment,
    refetchComments
  } = useComments({ suggestionId: suggestion?.id || '' });

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
      <SuggestionHeader />
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
    </div>
  );
};

export default SuggestionDetailsPage;
