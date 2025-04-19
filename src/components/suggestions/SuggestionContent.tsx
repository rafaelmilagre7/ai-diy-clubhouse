
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import SuggestionTitle from './content/SuggestionTitle';
import SuggestionDescription from './content/SuggestionDescription';
import SuggestionVoting from './SuggestionVoting';
import CommentsSection from './content/CommentsSection';

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
  comment: string;
  comments: any[];
  isSubmitting: boolean;
  commentsLoading: boolean;
  onCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
  isOwner?: boolean;
  userVote?: { id: string; vote_type: 'upvote' | 'downvote' } | null;
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
  userVote,
  voteLoading = false
}: SuggestionContentProps) => {
  // Calcular o saldo de votos
  const voteBalance = suggestion.upvotes - suggestion.downvotes;

  // Garantir que possamos exibir dados de category vindos de diferentes estruturas de dados
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

        <CommentsSection
          comment={comment}
          comments={comments}
          isSubmitting={isSubmitting}
          commentsLoading={commentsLoading}
          onCommentChange={onCommentChange}
          onSubmitComment={onSubmitComment}
        />
      </CardContent>
    </Card>
  );
};

export default SuggestionContent;
