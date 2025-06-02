
import React from 'react';
import SuggestionContainer from './content/SuggestionContainer';

interface SuggestionContentProps {
  suggestion: any;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
  voteLoading?: boolean;
  // Props legadas mantidas para compatibilidade mas não utilizadas
  comment?: string;
  comments?: any[];
  isSubmitting?: boolean;
  commentsLoading?: boolean;
  onCommentChange?: (value: string) => void;
  onSubmitComment?: (e: React.FormEvent) => void;
}

const SuggestionContent: React.FC<SuggestionContentProps> = ({
  suggestion,
  onVote,
  voteLoading = false
}) => {
  return (
    <SuggestionContainer
      suggestion={suggestion}
      onVote={onVote}
      voteLoading={voteLoading}
    />
  );
};

export default SuggestionContent;
