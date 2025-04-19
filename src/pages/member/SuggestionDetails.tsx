
import React from 'react';
import { useAuth } from '@/contexts/auth';
import SuggestionContent from '@/components/suggestions/SuggestionContent';
import SuggestionHeader from '@/components/suggestions/SuggestionHeader';
import SuggestionLoadingState from '@/components/suggestions/states/SuggestionLoadingState';
import SuggestionErrorState from '@/components/suggestions/states/SuggestionErrorState';
import { useComments } from '@/hooks/suggestions/useComments';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';

const SuggestionDetailsPage = () => {
  const { user } = useAuth();
  const {
    suggestion,
    isLoading,
    error,
    userVote,
    voteLoading,
    handleVote
  } = useSuggestionDetails();

  const { 
    comment, 
    setComment, 
    comments, 
    commentsLoading, 
    isSubmitting, 
    handleSubmitComment 
  } = useComments({ suggestionId: suggestion?.id || '' });

  if (isLoading) {
    return <SuggestionLoadingState />;
  }

  if (error || !suggestion) {
    return <SuggestionErrorState />;
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
