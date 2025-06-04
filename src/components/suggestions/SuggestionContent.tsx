
import React from 'react';
import SuggestionContainer from './content/SuggestionContainer';
import { UserVote } from '@/types/suggestionTypes';

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
  };
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
  isOwner?: boolean;
  userVote?: UserVote | null;
  voteLoading?: boolean;
}

const SuggestionContent = ({
  suggestion,
  onVote,
  isOwner = false,
  userVote,
  voteLoading = false
}: SuggestionContentProps) => {
  return (
    <SuggestionContainer
      suggestion={suggestion}
      onVote={onVote}
      isOwner={isOwner}
      userVote={userVote}
      voteLoading={voteLoading}
    />
  );
};

export default SuggestionContent;
