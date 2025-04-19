
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SuggestionVoting from './SuggestionVoting';
import CommentForm from './CommentForm';
import CommentsList from './CommentsList';

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
  isOwner = false
}: SuggestionContentProps) => {
  const status = statusMap[suggestion.status] || { label: 'Desconhecido', color: 'bg-gray-500' };
  const formattedDate = format(new Date(suggestion.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-2xl">{suggestion.title}</CardTitle>
            <CardDescription>
              {suggestion.category?.name && (
                <Badge variant="outline" className="mr-2">{suggestion.category.name}</Badge>
              )}
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar size={14} />
                {formattedDate}
              </span>
              {isOwner && (
                <Badge variant="secondary" className="ml-2">Sua sugestão</Badge>
              )}
            </CardDescription>
          </div>
          <Badge className={`${status.color} text-white`}>{status.label}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="prose max-w-none dark:prose-invert">
          <p className="whitespace-pre-line">{suggestion.description}</p>
        </div>

        <SuggestionVoting
          suggestion={suggestion}
          onVote={onVote}
        />

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageCircle size={18} />
            Comentários ({comments.length})
          </h3>

          <CommentForm
            comment={comment}
            isSubmitting={isSubmitting}
            onCommentChange={onCommentChange}
            onSubmit={onSubmitComment}
          />

          <CommentsList
            comments={comments}
            isLoading={commentsLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionContent;
