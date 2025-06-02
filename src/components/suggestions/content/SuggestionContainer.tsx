
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '../ui/StatusBadge';
import SuggestionVoting from '../SuggestionVoting';
import CommentsSection from './CommentsSection';
import { formatRelativeDate } from '@/utils/suggestionUtils';
import { Calendar, User, Eye } from 'lucide-react';

interface SuggestionContainerProps {
  suggestion: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    upvotes: number;
    downvotes: number;
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

const SuggestionContainer = ({
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
}: SuggestionContainerProps) => {
  const authorInitials = suggestion.user_name
    ? suggestion.user_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div className="space-y-6">
      {/* Main Content Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <StatusBadge status={suggestion.status} />
                {isOwner && (
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    Sua sugestão
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold leading-tight mb-4">
                {suggestion.title}
              </h1>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3 pt-3 border-t">
            <Avatar className="h-10 w-10 ring-2 ring-background">
              <AvatarImage src={suggestion.user_avatar} />
              <AvatarFallback className="text-sm font-medium">{authorInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{suggestion.user_name || 'Usuário'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatRelativeDate(suggestion.created_at)}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {suggestion.description}
            </p>
          </div>

          {/* Voting Section */}
          <SuggestionVoting
            suggestion={suggestion}
            voteLoading={voteLoading}
            onVote={onVote}
          />
        </CardContent>
      </Card>

      {/* Comments Section */}
      <CommentsSection
        comment={comment}
        comments={comments}
        isSubmitting={isSubmitting}
        commentsLoading={commentsLoading}
        onCommentChange={onCommentChange}
        onSubmitComment={onSubmitComment}
      />
    </div>
  );
};

export default SuggestionContainer;
