
import React from 'react';
import { MessageCircle } from 'lucide-react';
import CommentForm from '../CommentForm';
import CommentsList from '../CommentsList';

interface CommentsSectionProps {
  comment: string;
  comments: any[];
  isSubmitting: boolean;
  commentsLoading: boolean;
  onCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
}

const CommentsSection = ({
  comment,
  comments,
  isSubmitting,
  commentsLoading,
  onCommentChange,
  onSubmitComment
}: CommentsSectionProps) => {
  return (
    <div className="bg-backgroundLight border border-white/10 rounded-lg p-5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-textPrimary">
        <MessageCircle size={18} className="text-viverblue" />
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
  );
};

export default CommentsSection;
