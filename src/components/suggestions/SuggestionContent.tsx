
import React from 'react';
import SuggestionContainer from './content/SuggestionContainer';

interface SuggestionContentProps {
  suggestion: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    category?: { name: string };
    category_id?: string;
    upvotes: number;
    downvotes: number;
    user_id?: string;
    user_name?: string;
    user_avatar?: string;
    user_vote_type?: 'upvote' | 'downvote' | null;
  };
  comment: string;
  comments: any[];
  isSubmitting: boolean;
  commentsLoading: boolean;
  onCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
  isOwner?: boolean;
  voteLoading?: boolean;
}

const SuggestionContent = ({
  suggestion,
  comment,
  comments,
  isSubmitting,
  commentsLoading,
  onCommentChange,
  onSubmitComment,
  onVote,
  isOwner = false,
  voteLoading = false
}: SuggestionContentProps) => {
  return (
    <SuggestionContainer
      suggestion={suggestion}
      comment={comment}
      comments={comments}
      isSubmitting={isSubmitting}
      commentsLoading={commentsLoading}
      onCommentChange={onCommentChange}
      onSubmitComment={onSubmitComment}
      onVote={onVote}
      isOwner={isOwner}
      voteLoading={voteLoading}
    />
  );
};

export default SuggestionContent;
