
import React from 'react';
import SuggestionContainer from './content/SuggestionContainer';

interface SuggestionContentProps {
  suggestion: any;
  comment: string;
  comments: any[];
  isSubmitting: boolean;
  commentsLoading: boolean;
  onCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
  voteLoading?: boolean;
}

const SuggestionContent: React.FC<SuggestionContentProps> = (props) => {
  return <SuggestionContainer {...props} />;
};

export default SuggestionContent;
