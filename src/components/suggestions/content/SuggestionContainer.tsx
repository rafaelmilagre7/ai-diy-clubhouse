
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { UserVote } from '@/types/suggestionTypes';
import SuggestionTitle from './SuggestionTitle';
import SuggestionDescription from './SuggestionDescription';
import SuggestionVoting from '../SuggestionVoting';

interface SuggestionContainerProps {
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

const SuggestionContainer = ({
  suggestion,
  onVote,
  isOwner = false,
  userVote,
  voteLoading = false
}: SuggestionContainerProps) => {
  const voteBalance = suggestion.upvotes - suggestion.downvotes;
  const categoryName = suggestion.category?.name || '';

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <SuggestionTitle
            title={suggestion.title}
            category={{ name: categoryName }}
            createdAt={suggestion.created_at}
            isOwner={isOwner}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <SuggestionDescription description={suggestion.description} />

        <SuggestionVoting
          suggestion={suggestion}
          userVote={userVote}
          voteLoading={voteLoading}
          onVote={onVote}
          voteBalance={voteBalance}
        />
      </CardContent>
    </Card>
  );
};

export default SuggestionContainer;
