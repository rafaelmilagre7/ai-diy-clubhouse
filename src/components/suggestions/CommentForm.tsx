
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
  comment: string;
  isSubmitting: boolean;
  onCommentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CommentForm = ({ comment, isSubmitting, onCommentChange, onSubmit }: CommentFormProps) => {
  return (
    <form onSubmit={onSubmit} className="mb-6">
      <Textarea
        placeholder="Adicione um comentário..."
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        className="mb-2"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !comment.trim()}>
          {isSubmitting ? 'Enviando...' : 'Comentar'}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
