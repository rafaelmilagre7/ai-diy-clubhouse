
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useCommentsData } from '@/hooks/suggestions/useCommentsData';
import { useCommentForm } from '@/hooks/suggestions/useCommentForm';
import SuggestionContent from '@/components/suggestions/SuggestionContent';
import SuggestionLoadingState from '@/components/suggestions/states/SuggestionLoadingState';
import SuggestionErrorState from '@/components/suggestions/states/SuggestionErrorState';
import { useAuth } from '@/contexts/auth';

const SuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const {
    suggestion,
    isLoading,
    error,
    voteLoading,
    handleVote,
    refetch
  } = useSuggestionDetails();

  const {
    comments,
    isLoading: commentsLoading
  } = useCommentsData('suggestion', id);

  const {
    comment,
    isSubmitting,
    handleCommentChange,
    handleSubmitComment
  } = useCommentForm('suggestion', id);

  if (isLoading) {
    return <SuggestionLoadingState />;
  }

  if (error || !suggestion) {
    return <SuggestionErrorState errorMessage={error?.message} onRetry={refetch} />;
  }

  const isOwner = user?.id === suggestion.user_id;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SuggestionContent
        suggestion={suggestion}
        comment={comment}
        comments={comments}
        isSubmitting={isSubmitting}
        commentsLoading={commentsLoading}
        onCommentChange={handleCommentChange}
        onSubmitComment={handleSubmitComment}
        onVote={handleVote}
        isOwner={isOwner}
        voteLoading={voteLoading}
      />
    </div>
  );
};

export default SuggestionDetails;
