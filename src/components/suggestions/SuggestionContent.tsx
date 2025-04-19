
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SuggestionTitle from './content/SuggestionTitle';
import SuggestionDescription from './content/SuggestionDescription';
import SuggestionVoting from './SuggestionVoting';
import CommentsSection from './content/CommentsSection';

interface SuggestionContentProps {
  suggestion: {
    id: string;
    title: string;
    description: string;
    status: 'new' | 'under_review' | 'approved' | 'in_development' | 'implemented' | 'rejected';
    created_at: string;
    category?: { name: string };
    upvotes: number;
    downvotes: number;
    user_id?: string;
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

const statusMap = {
  new: { label: 'Nova', color: 'bg-blue-500' },
  under_review: { label: 'Em análise', color: 'bg-orange-500' },
  approved: { label: 'Aprovada', color: 'bg-green-500' },
  in_development: { label: 'Em desenvolvimento', color: 'bg-purple-500' },
  implemented: { label: 'Implementada', color: 'bg-emerald-500' },
  rejected: { label: 'Rejeitada', color: 'bg-red-500' },
};

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
  const status = statusMap[suggestion.status] || { label: 'Desconhecido', color: 'bg-gray-500' };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <SuggestionTitle
            title={suggestion.title}
            category={suggestion.category}
            createdAt={suggestion.created_at}
            isOwner={isOwner}
          />
          <Badge className={`${status.color} text-white`}>{status.label}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <SuggestionDescription description={suggestion.description} />

        <SuggestionVoting
          suggestion={suggestion}
          userVote={userVote}
          voteLoading={voteLoading}
          onVote={onVote}
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
